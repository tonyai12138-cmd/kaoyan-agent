import {
  agentIdentity,
  chatModes,
  commonDisclaimer,
  emotionDisclaimer,
  factDisclaimer,
  getChatDisclaimer,
  knowledgeMissingNotice,
  normalizeChatMode,
  officialVerificationAdvice,
} from "../data/prompts";
import {
  createPositioningReport,
  createStudyPlan,
  hasCompletedDiagnosis,
  normalizeProfile,
} from "./mockAgent";

const urgentTerms = ["自杀", "自伤", "不想活", "结束生命"];
const factQuestionPattern =
  /某校|院校|学校|专业|考试科目|招生人数|招生名额|复试线|分数线|参考书|录取比例/;
const chatModeLabels = Object.fromEntries(
  chatModes.map((mode) => [mode.id, mode.label]),
);

function formatAnswerSections(sections) {
  return sections
    .map((section) => `### ${section.title}\n${section.content}`)
    .join("\n\n");
}

function formatPriorityTasks(tasks) {
  if (!tasks.length) {
    return "1. 完成画像诊断并生成计划后，再拆解到具体时长。\n2. 确认本周可学习时间。\n3. 记录当前最影响执行的卡点。";
  }

  return tasks
    .slice(0, 3)
    .map((task, index) => `${index + 1}. ${task.title}（${task.duration}）`)
    .join("\n");
}

function formatRetrievedBasis(snippets) {
  if (!snippets.length) {
    return knowledgeMissingNotice;
  }

  return snippets
    .slice(0, 2)
    .map(
      (snippet) =>
        `- **${snippet.title}**（${snippet.dataStatus ?? "pending"} / ${snippet.sourceType ?? "pending"}）：${snippet.content}`,
    )
    .join("\n");
}

function factBasisForQuestion(message, snippets) {
  if (factQuestionPattern.test(message)) {
    const verifiedFacts = snippets.filter(
      (snippet) =>
        snippet.source === "school" &&
        snippet.dataStatus === "verified" &&
        snippet.sourceType === "official",
    );

    if (!verifiedFacts.length) {
      return `${knowledgeMissingNotice}\n\n检索到的演示或待核验片段仅用于提供查证路径，不能转述为院校事实。${officialVerificationAdvice}`;
    }

    return `${formatRetrievedBasis(verifiedFacts)}\n\n${factDisclaimer} ${officialVerificationAdvice}`;
  }

  return formatRetrievedBasis(snippets);
}

export function createChatWelcome({ profile = {}, context = {} }) {
  if (!hasCompletedDiagnosis(profile)) {
    return {
      id: "welcome",
      role: "assistant",
      modeLabel: "导览",
      content:
        "你好，我是**研途智伴 Agent**。完成画像诊断后，我可以结合你的阶段、策略和今日任务，提供贯穿择校、计划、真题、资料核验与复盘的一站式备考支持。",
      disclaimer: commonDisclaimer,
      isMock: true,
    };
  }

  const plan = createStudyPlan(
    profile,
    context.selectedSchoolId,
    context.strategySelectionSource,
  );
  const concern = profile.biggestConcern || "当前任务执行";

  return {
    id: "welcome",
    role: "assistant",
    modeLabel: "导览",
    content: `你好，我是**研途智伴 Agent**。你当前处于**${plan.stage}**，主要困扰是“${concern}”。我可以围绕${plan.strategySourceLabel}的${plan.strategyLabel}计划，继续支持任务解释、资料核验、真题拆解和每日复盘。`,
    disclaimer: commonDisclaimer,
    isMock: true,
  };
}

export function answerChatQuestion({
  message,
  profile = {},
  context = {},
  mode = "school",
  snippets = [],
}) {
  const activeMode = normalizeChatMode(mode);
  const modeLabel = chatModeLabels[activeMode] ?? chatModeLabels.school;

  if (urgentTerms.some((term) => message.includes(term))) {
    return {
      answer: formatAnswerSections([
        {
          title: "先承认当前压力",
          content: "听到你正在承受很大的压力。备考任务可以暂停，你此刻的安全最重要。",
        },
        {
          title: "将问题拆成可执行小任务",
          content: "现在先不要求自己继续完成学习任务，先移动到安全、有人陪伴或便于获得支持的环境。",
        },
        {
          title: "今日最低完成版本",
          content: "今天的最低任务是保障安全并获得现实中的支持，学习计划可以之后再调整。",
        },
        {
          title: "复盘与调整建议",
          content: "等安全和状态稳定后，再与可信任的人一起评估是否需要暂停或减轻备考任务。",
        },
        {
          title: "专业支持边界",
          content:
            "若你有自伤想法或紧急危险，请立即联系可信任的人、学校心理中心、专业机构或当地紧急援助服务。",
        },
        {
          title: "下一步行动",
          content: "现在就给一位可信任的人发消息或打电话，明确告诉对方你需要陪伴和帮助。",
        },
      ]),
      mode: "support",
      modeLabel: chatModeLabels.support,
      snippets: [],
      citations: [],
      disclaimer: `${commonDisclaimer} ${emotionDisclaimer}`,
      isMock: true,
      safety: "urgent",
    };
  }

  const completed = hasCompletedDiagnosis(profile);
  const plan = completed
    ? createStudyPlan(
        profile,
        context.selectedSchoolId,
        context.strategySelectionSource,
      )
    : null;
  const report = completed ? createPositioningReport(profile) : null;
  const normalized = completed ? normalizeProfile(profile) : null;
  const currentTasks =
    Array.isArray(context.tasks) && context.tasks.length
      ? context.tasks
      : plan?.todayTasks ?? [];
  let answer;

  if (activeMode === "school") {
    const riskSummary = report?.risks
      .slice(0, 2)
      .map((risk) => `${risk.name}（${risk.level}）`)
      .join("；");
    answer = formatAnswerSections([
      {
        title: "初步判断",
        content: completed
          ? `你目前处于${report.stage}，综合定位为“${report.positioningTag}”。当前可先以${plan.strategyLabel}作为验证路径，而非录取结论。`
          : "你还没有完成画像诊断，当前只能提供通用判断框架，无法给出个人策略结论。",
      },
      {
        title: "主要依据",
        content: completed
          ? `风险偏好为${normalized.normalizedRiskPreference}，当前最大困扰为${profile.biggestConcern}；阶段计划来源为${plan.strategySourceLabel}。\n\n${factBasisForQuestion(message, snippets)}`
          : factBasisForQuestion(message, snippets),
      },
      {
        title: "风险提醒",
        content:
          riskSummary ||
          "任何择校方向都必须核验正式目录、考试要求与招生公告；不承诺上岸，也不提供录取保证。",
      },
      {
        title: "下一步核验动作",
        content:
          "在研招网和目标院校研究生招生官网核验专业目录、考试科目与当年度公告，并将来源链接和发布日期记录进候选清单。",
      },
    ]);
  } else if (activeMode === "plan") {
    answer = formatAnswerSections([
      {
        title: "当前任务重点",
        content: completed
          ? `${plan.stage}应围绕${plan.strategyLabel}推进，优先处理可验证、可完成的高优先级任务。`
          : "完成画像与策略选择后，才能把阶段重点拆解成个人今日任务。",
      },
      {
        title: "为什么这样安排",
        content: completed
          ? plan.stageReminder
          : "计划需要依据剩余时间、薄弱科目与执行压力控制任务负担。",
      },
      {
        title: "今天最优先的 3 件事",
        content: formatPriorityTasks(currentTasks),
      },
      {
        title: "如何复盘",
        content: "晚间只记录完成情况、卡点与明天第一件事；若任务过重，优先缩小范围再调整节奏。",
      },
      {
        title: "下一步行动",
        content: "先完成列表中的第一项任务，并在复盘页记录是否按建议时长完成。",
      },
    ]);
  } else if (activeMode === "exam") {
    const hasQuestionSignal = /分析|论述|简答|案例|真题|如何作答|拆解/.test(message);
    answer = formatAnswerSections([
      {
        title: "题目考点",
        content: hasQuestionSignal
          ? "识别核心概念、作用机制与可评价的营销结果，先回应题目要求再扩展论述。"
          : "请补充具体题干；在此之前可先按概念、机制、案例与评价四层准备。",
      },
      {
        title: "答题框架",
        content: "概念界定 -> 机制分析 -> 情境或案例应用 -> 对策建议 -> 边界与结论。",
      },
      {
        title: "可用理论",
        content: "消费者参与、品牌社群价值共创、顾客关系与忠诚度形成路径等基础框架。",
      },
      {
        title: "案例方向",
        content: "只使用合法公开且能够准确说明来源的数字营销场景，避免编造品牌事实和数据。",
      },
      {
        title: "常见失分点",
        content: "只堆概念、不回应题干；案例没有机制连接；策略缺少适用条件与效果评价。",
      },
      {
        title: "示范开头",
        content:
          "品牌社群并非单向传播渠道，而是消费者互动、身份认同与价值共创的关系场域，其对忠诚度的作用需要从参与机制与体验结果展开分析。",
      },
      {
        title: "建议背诵结构",
        content: "定义 1 句 + 机制 3 点 + 案例对应 2 点 + 策略与边界各 1 点。",
      },
      {
        title: "下一步行动",
        content: "用以上七段结构写一版 300 字答案，再对照题干删去没有回应题意的内容。",
      },
    ]);
  } else if (activeMode === "verify") {
    answer = formatAnswerSections([
      {
        title: "哪些信息必须核验",
        content: "院校、专业、考试科目、招生人数、复试线、参考书与录取比例等事实信息均需核验。",
      },
      {
        title: "优先核验渠道",
        content: `${knowledgeMissingNotice}\n\n${formatRetrievedBasis(snippets)}`,
      },
      {
        title: "资料风险提醒",
        content: "经验帖与机构资料只能作为检索线索，不能替代官方信息；不传播盗版资料，也不购买来源不明的资料。",
      },
      {
        title: "建议建立资料清单",
        content: "按“信息项、来源页面、发布日期、已核验/待核验、待解决问题”五列记录，避免版本混用。",
      },
      {
        title: "下一步行动",
        content: "先选择一项最影响决策的信息，在官方页面查到来源后将链接和发布日期写入清单。",
      },
    ]);
  } else {
    answer = formatAnswerSections([
      {
        title: "先承认当前压力",
        content: "在长期备考中感到焦虑、疲惫或因未完成计划而自责，都值得被认真看见；一次进度波动不定义整个过程。",
      },
      {
        title: "将问题拆成可执行小任务",
        content: "先选择一项 20 至 30 分钟可完成的任务，完成后再决定是否继续，不把今天变成补债日。",
      },
      {
        title: "今日最低完成版本",
        content: completed
          ? `完成“${currentTasks[0]?.title ?? "记录今日状态"}”，再做 10 分钟复盘并按时休息。`
          : "完成一次 20 分钟轻量学习并记录卡点，之后再补充画像生成适配计划。",
      },
      {
        title: "复盘与调整建议",
        content: "只记录完成的一步、一个阻碍和明天第一项任务；若压力持续偏高，将任务量主动下调。",
      },
      {
        title: "专业支持边界",
        content:
          "若持续严重焦虑、失眠或出现自伤想法，请联系可信任的人、学校心理中心或专业机构；紧急情况下及时寻求紧急援助。",
      },
      {
        title: "下一步行动",
        content: "现在选定一个不超过 20 分钟的任务，完成后在每日复盘中记录状态变化。",
      },
    ]);
  }

  return {
    answer,
    mode: activeMode,
    modeLabel,
    snippets,
    citations: snippets.slice(0, 2).map((snippet) => snippet.title),
    disclaimer: getChatDisclaimer(activeMode),
    isMock: true,
    identity: agentIdentity,
  };
}
