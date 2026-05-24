const disclaimer = "演示数据，正式信息以研招网和目标院校官网为准";
const defaultModel = "deepseek-v4-flash";
const deepseekEndpoint = "https://api.deepseek.com/chat/completions";

const modeAliases = {
  school: "school",
  plan: "plan",
  exam: "question",
  question: "question",
  verify: "source",
  source: "source",
  support: "emotion",
  emotion: "emotion",
};

const systemPrompt = `你是“研途智伴 Agent”，面向中国考研学生提供一站式备考支持。

能力范围：
1. 择校咨询；
2. 备考计划解释；
3. 真题拆解；
4. 资料核验；
5. 每日复盘；
6. 情绪陪伴。

回答边界：
1. 涉及院校、专业、考试科目、招生人数、复试线、参考书等事实信息时，必须依据用户提供的信息或知识库 context；
2. 如果 context 没有相关信息，必须说明“当前知识库暂未收录，建议以研招网和目标院校研究生招生官网为准”；
3. 不编造院校数据；
4. 不承诺上岸；
5. 不提供录取保证；
6. 不传播盗版资料；
7. 情绪陪伴不替代心理咨询；
8. 回答要具体、可执行、结构化；
9. 每次回答最后给出一个下一步行动。

根据 mode 调整回答结构：
school：初步判断、主要依据、风险提醒、下一步核验动作；
plan：当前任务重点、为什么这样安排、今天最优先的 3 件事、如何复盘；
question：题目考点、答题框架、可用理论、案例方向、常见失分点、示范开头、背诵结构；
source：必须核验的信息、优先核验渠道、资料风险提醒、资料清单建议；
emotion：承认压力、拆小任务、今日最低完成版本、专业支持边界。`;

function normalizeMode(mode) {
  return modeAliases[mode] ?? "school";
}

function parseBody(body) {
  if (typeof body !== "string") {
    return body ?? {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function safeContext(value, maxLength = 5000) {
  try {
    return JSON.stringify(value ?? null).slice(0, maxLength);
  } catch {
    return "null";
  }
}

function conversationHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (item) =>
        (item?.role === "user" || item?.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim(),
    )
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000),
    }));
}

function buildContextMessage({ profile, context, mode }) {
  return [
    `当前 mode：${mode}`,
    `用户画像与当前计划状态：${safeContext(profile, 2400)}`,
    `知识库与任务 context：${safeContext(context)}`,
    "仅根据以上内容回答事实类问题；没有依据时必须明确说明需要回到官方渠道核验。",
  ].join("\n");
}

function buildMockAnswer(message, mode) {
  const nextStep = "下一步行动：选择一个最小任务完成，并将需要核验的信息记录到清单中。";
  const answers = {
    school: `初步判断\n当前为本地演示回答，我可以帮助你梳理冲刺、稳妥与保底三档选择逻辑。\n\n主要依据\n你的提问是“${message}”。具体院校事实需要结合画像和已核验的官方 context。\n\n风险提醒\n当前知识库暂未收录，建议以研招网和目标院校研究生招生官网为准；不承诺录取结果。\n\n下一步核验动作\n先核验目标专业目录、考试科目与院校当年公告。\n\n${nextStep}`,
    plan: `当前任务重点\n先把备考目标拆成今日可完成的小任务，保持执行和复盘闭环。\n\n为什么这样安排\n当前为本地演示回答，任务应依据画像、剩余时间和薄弱科目进一步调整。\n\n今天最优先的 3 件事\n1. 完成一项基础学习任务；\n2. 核验一项正式报考信息；\n3. 记录今日卡点。\n\n如何复盘\n记录完成情况、阻碍和明天的第一项任务。\n\n${nextStep}`,
    question: `题目考点\n识别题目核心概念、作用机制和应用情境。\n\n答题框架\n概念界定 -> 机制分析 -> 案例应用 -> 策略建议 -> 边界总结。\n\n可用理论\n可选用消费者行为、品牌关系或数字营销效果评估等基础框架。\n\n案例方向\n采用你能够准确说明来源的公开案例，不编造品牌数据。\n\n常见失分点\n只堆概念、未回应题干、案例与理论脱节。\n\n示范开头\n数字营销问题的分析，应从目标受众、互动机制与结果评估三个层次展开。\n\n背诵结构\n定义 1 句 + 机制 3 点 + 应用 2 点 + 边界 1 点。\n\n${nextStep}`,
    source: `必须核验的信息\n院校专业目录、考试科目、招生安排、复试线与参考资料说明。\n\n优先核验渠道\n研招网与目标院校研究生招生官网。\n\n资料风险提醒\n经验帖只作线索，不传播盗版资料；当前知识库暂未收录，建议以研招网和目标院校研究生招生官网为准。\n\n资料清单建议\n记录信息项、官方链接、发布日期和核验状态。\n\n${nextStep}`,
    emotion: `承认压力\n备考中的焦虑和疲惫值得认真对待，不需要用一次进度波动否定自己。\n\n拆小任务\n先完成一个 20 分钟以内的低压力任务，再决定是否继续。\n\n今日最低完成版本\n完成一次轻量学习并写下明天最重要的一件事。\n\n专业支持边界\n情绪陪伴不替代心理咨询；若持续严重焦虑、失眠或出现自伤想法，请及时寻求专业支持或紧急帮助。\n\n${nextStep}`,
  };

  return answers[mode] ?? answers.school;
}

function mockResponse({ message, mode, fallbackReason }) {
  return {
    answer: buildMockAnswer(message, mode),
    isMock: true,
    source: "local-mock",
    fallbackReason,
    disclaimer,
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json(
      mockResponse({
        message: "请使用 POST 请求发送问题。",
        mode: "school",
        fallbackReason: "invalid_request",
      }),
    );
  }

  const body = parseBody(request.body);
  const message =
    typeof body.message === "string" ? body.message.trim() : "";
  const mode = normalizeMode(body.mode);

  if (!message) {
    return response.status(400).json(
      mockResponse({
        message: "请输入需要咨询的问题。",
        mode,
        fallbackReason: "invalid_request",
      }),
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL?.trim() || defaultModel;

  if (!apiKey) {
    return response.status(200).json(
      mockResponse({
        message,
        mode,
        fallbackReason: "missing_api_key",
      }),
    );
  }

  try {
    const upstream = await fetch(deepseekEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "system",
            content: buildContextMessage({
              profile: body.profile,
              context: body.context,
              mode,
            }),
          },
          ...conversationHistory(body.history),
          { role: "user", content: message },
        ],
      }),
    });

    if (!upstream.ok) {
      throw new Error(`DeepSeek request failed: ${upstream.status}`);
    }

    const result = await upstream.json();
    const answer = result?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error("DeepSeek response missing answer");
    }

    return response.status(200).json({
      answer,
      isMock: false,
      model: result.model || model,
      source: "deepseek",
      disclaimer,
    });
  } catch {
    return response.status(200).json(
      mockResponse({
        message,
        mode,
        fallbackReason: "api_error",
      }),
    );
  }
}
