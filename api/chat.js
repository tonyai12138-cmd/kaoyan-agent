const factDisclaimer =
  "正式信息以研招网和目标院校研究生招生官网为准。";
const prototypeDisclaimer =
  "当前为课程展示用原型，部分数据为演示数据，不构成正式报考建议。";
const emotionDisclaimer =
  "情绪陪伴仅提供学习支持和一般压力缓解建议，不替代专业心理咨询或医疗建议。";
const knowledgeMissingNotice =
  "当前知识库暂未收录该信息，建议以研招网和目标院校研究生招生官网为准。";
const commonDisclaimer = `${factDisclaimer} ${prototypeDisclaimer}`;
const defaultModel = "deepseek-v4-flash";
const deepseekEndpoint = "https://api.deepseek.com/chat/completions";
const factQuestionPattern =
  /某校|院校|学校|专业|考试科目|招生人数|招生名额|复试线|分数线|参考书|录取比例/;

// Keep these aliases and system rules synchronized with src/data/prompts.js.
// The Vercel function maintains its own copy so its server-only deployment stays isolated.
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

const systemPrompt = `你是“研途智伴 Agent”，面向中国考研学生提供一站式备考支持。你的核心任务是帮助用户完成择校咨询、备考计划解释、真题拆解、资料核验、每日复盘和学习压力下的一般情绪陪伴。

能力范围：
1. 择校咨询；
2. 备考计划解释；
3. 真题拆解；
4. 资料核验；
5. 每日复盘；
6. 情绪陪伴。

回答边界：
1. 不编造院校、专业、考试科目、招生人数、复试线、参考书、录取比例等事实信息；
2. 涉及院校事实信息时，必须优先依据用户提供的信息或知识库 context；仅当 context 明确给出该事实值和来源时才可转述，不得从演示策略样例推断真实信息；
3. 如果 context 没有收录用户询问的事实信息，必须原样说明：“当前知识库暂未收录该信息，建议以研招网和目标院校研究生招生官网为准。”；
4. 不承诺上岸，不提供录取保证；
5. 不传播盗版资料，不鼓励购买来源不明的资料；
6. 情绪陪伴只提供学习支持和一般压力缓解建议，不替代专业心理咨询或医疗建议；
7. 用户提到严重焦虑、失眠或自伤想法时，建议其联系可信任的人、学校心理中心或专业机构；存在紧急危险时建议及时寻求紧急援助；
8. 当前项目为课程展示原型，涉及演示数据时必须明确说明，不构成正式报考建议；
9. 回答要具体、可执行、结构化，优先使用 Markdown 小标题、列表或表格，避免过长段落。

根据 mode 使用固定输出结构：
school：初步判断、主要依据、风险提醒、下一步核验动作；
plan：当前任务重点、为什么这样安排、今天最优先的 3 件事、如何复盘，并在最后追加下一步行动；
question：题目考点、答题框架、可用理论、案例方向、常见失分点、示范开头、建议背诵结构，并在最后追加下一步行动；
source：哪些信息必须核验、优先核验渠道、资料风险提醒、建议建立资料清单，并在最后追加下一步行动；
emotion：先承认当前压力、将问题拆成可执行小任务、今日最低完成版本、复盘与调整建议、专业支持边界，并在最后追加下一步行动。

通用事实免责声明：${factDisclaimer}
课程原型免责声明：${prototypeDisclaimer}
情绪支持免责声明：${emotionDisclaimer}`;

function normalizeMode(mode) {
  return modeAliases[mode] ?? "school";
}

function responseDisclaimer(mode) {
  return mode === "emotion"
    ? `${commonDisclaimer} ${emotionDisclaimer}`
    : commonDisclaimer;
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

function contextSnippets(context) {
  return Array.isArray(context?.knowledgeSnippets)
    ? context.knowledgeSnippets.slice(0, 5)
    : [];
}

function formatSnippetBasis(context) {
  const snippets = contextSnippets(context);

  if (!snippets.length) {
    return knowledgeMissingNotice;
  }

  return snippets
    .slice(0, 2)
    .map((snippet) => `- **${snippet.title}**：${snippet.content}`)
    .join("\n");
}

function buildContextMessage({ message, profile, context, mode }) {
  const factsGuard = factQuestionPattern.test(message)
    ? `用户正在询问事实类信息。若 context 未明确提供所问事实的值和来源，必须回复：${knowledgeMissingNotice}`
    : "对于可能涉及事实的信息，仅依据 context 或用户提供内容回答，不进行推断补编。";

  return [
    `当前 mode：${mode}`,
    `用户画像与当前计划状态：${safeContext(profile, 2400)}`,
    `知识库与任务 context：${safeContext(context)}`,
    `知识库片段数量：${contextSnippets(context).length}`,
    factsGuard,
  ].join("\n");
}

function formatAnswerSections(sections) {
  return sections
    .map((section) => `### ${section.title}\n${section.content}`)
    .join("\n\n");
}

function buildMockAnswer(message, mode, context) {
  const basis = factQuestionPattern.test(message)
    ? knowledgeMissingNotice
    : formatSnippetBasis(context);

  const answers = {
    school: [
      {
        title: "初步判断",
        content: "我可以帮助你梳理冲刺、稳妥与保底三档策略，但不将策略转述为录取结论。",
      },
      {
        title: "主要依据",
        content: `你的提问是“${message}”。\n\n${basis}`,
      },
      {
        title: "风险提醒",
        content: "任何目标都需核验当年度正式信息；不承诺上岸，也不提供录取保证。",
      },
      {
        title: "下一步核验动作",
        content: "到研招网和目标院校研究生招生官网核验专业目录、考试科目与公告，并记录来源链接和发布日期。",
      },
    ],
    plan: [
      {
        title: "当前任务重点",
        content: "先把备考目标拆成今天能够完成的小任务，保持执行与复盘闭环。",
      },
      {
        title: "为什么这样安排",
        content: "本地演示回答会依据画像、剩余时间和薄弱科目说明调整方法，不替代你的真实执行反馈。",
      },
      {
        title: "今天最优先的 3 件事",
        content: "1. 完成一项基础学习任务。\n2. 核验一项正式报考信息。\n3. 记录今日卡点。",
      },
      {
        title: "如何复盘",
        content: "记录完成情况、阻碍和明天的第一项任务。",
      },
      {
        title: "下一步行动",
        content: "从第一项任务开始执行，并在结束时记录实际用时。",
      },
    ],
    question: [
      { title: "题目考点", content: "识别题目核心概念、作用机制和应用情境。" },
      { title: "答题框架", content: "概念界定 -> 机制分析 -> 案例应用 -> 策略建议 -> 边界总结。" },
      { title: "可用理论", content: "消费者行为、品牌关系或数字营销效果评估等基础框架。" },
      { title: "案例方向", content: "使用能够准确说明来源的公开案例，不编造品牌事实或数据。" },
      { title: "常见失分点", content: "只堆概念、未回应题干、案例与理论脱节。" },
      { title: "示范开头", content: "数字营销问题的分析，应从目标受众、互动机制与结果评估三个层次展开。" },
      { title: "建议背诵结构", content: "定义 1 句 + 机制 3 点 + 应用 2 点 + 边界 1 点。" },
      { title: "下一步行动", content: "按以上结构写一版短答，再逐项检查是否回应题干。" },
    ],
    source: [
      { title: "哪些信息必须核验", content: "院校、专业、考试科目、招生人数、复试线、参考书和录取比例。" },
      { title: "优先核验渠道", content: `${knowledgeMissingNotice}\n\n${formatSnippetBasis(context)}` },
      { title: "资料风险提醒", content: "经验帖和机构资料仅作线索；不传播盗版资料，也不购买来源不明的资料。" },
      { title: "建议建立资料清单", content: "记录信息项、官方链接、发布日期与核验状态。" },
      { title: "下一步行动", content: "选择一项待核验信息，到官方页面查证并记录出处。" },
    ],
    emotion: [
      { title: "先承认当前压力", content: "备考中的焦虑和疲惫值得认真对待，不需要用一次进度波动否定自己。" },
      { title: "将问题拆成可执行小任务", content: "先完成一个 20 分钟以内的低压力任务，再决定是否继续。" },
      { title: "今日最低完成版本", content: "完成一次轻量学习并写下明天最重要的一件事。" },
      { title: "复盘与调整建议", content: "记录今天完成的一步和卡点，明天只保留最重要的一项任务。" },
      { title: "专业支持边界", content: "若持续严重焦虑、失眠或出现自伤想法，请联系可信任的人、学校心理中心或专业机构；紧急情况下及时寻求紧急援助。" },
      { title: "下一步行动", content: "选择一项 20 分钟任务开始，结束后记录此刻状态是否变化。" },
    ],
  };

  return formatAnswerSections(answers[mode] ?? answers.school);
}

function mockResponse({ message, mode, context, fallbackReason }) {
  return {
    answer: buildMockAnswer(message, mode, context),
    isMock: true,
    source: "local-mock",
    fallbackReason,
    disclaimer: responseDisclaimer(mode),
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json(
      mockResponse({
        message: "请使用 POST 请求发送问题。",
        mode: "school",
        context: {},
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
        context: body.context,
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
        context: body.context,
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
              message,
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
      disclaimer: responseDisclaimer(mode),
    });
  } catch {
    return response.status(200).json(
      mockResponse({
        message,
        mode,
        context: body.context,
        fallbackReason: "api_error",
      }),
    );
  }
}
