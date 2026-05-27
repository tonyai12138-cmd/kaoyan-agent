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
  universityIndexBoundary,
  universityOnlyMajorNotice,
  universityProfessionalMissingNotice,
  professionalVerificationPath,
} from "../data/prompts";
import {
  createPositioningReport,
  createStudyPlan,
  hasCompletedDiagnosis,
  normalizeProfile,
} from "./mockAgent";

const urgentTerms = ["自杀", "自伤", "不想活", "结束生命"];
const factQuestionPattern =
  /某校|院校|学校|大学|高校|985|211|双一流|层次|专业|考什么|初试|复试|考试科目|招生人数|招生名额|复试线|分数线|参考书|录取比例/;
const professionalFactPattern =
  /专业|专业数据|专业目录|招生专业|考什么|初试|复试|考试科目|招生人数|招生名额|复试线|分数线|参考书|录取比例/;
const universityLevelPattern =
  /985|211|双一流|层次|财经类|哪些.*大学|哪些.*学校|高校/;
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

function formatBulletItems(items, fallback) {
  if (!Array.isArray(items) || !items.length) {
    return `- ${fallback}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function createQuestionAnalysisSections(message, snippets) {
  const template = snippets.find((snippet) => snippet.source === "template");

  if (template) {
    return [
      {
        title: "题目考点",
        content: `本题可按**${template.subjectArea} / ${template.scenario}**场景拆解，题型参考为**${template.questionType}**。核心是围绕题目关键词建立概念、机制与应用之间的连接。`,
      },
      {
        title: "答题框架",
        content: formatBulletItems(template.answerStructure, "概念界定 -> 机制分析 -> 应用评价"),
      },
      {
        title: "可用理论",
        content: formatBulletItems(template.usefulTheories, "消费者行为与数字营销基础理论"),
      },
      {
        title: "案例方向",
        content: `${formatBulletItems(template.caseDirections, "选择可核验的公开数字营销场景")}\n\n案例只用于说明机制，不虚构品牌效果数据。`,
      },
      {
        title: "常见失分点",
        content: formatBulletItems(template.commonMistakes, "只堆概念而没有回应题干"),
      },
      {
        title: "示范开头",
        content: `> ${template.sampleOpening}`,
      },
      {
        title: "建议背诵结构",
        content: formatBulletItems(
          template.memorizationStructure,
          "界定概念 -> 解释机制 -> 联系案例 -> 总结边界",
        ),
      },
      {
        title: "下一步行动",
        content: `用上述结构完成一版 300 至 500 字作答，并逐项圈出题干关键词是否已回应。\n\n模板仅用于学习参考，具体考试要求以目标院校专业课要求为准。`,
      },
    ];
  }

  return [
    {
      title: "题目考点",
      content: `围绕“${message}”识别核心概念、作用机制和需要评价的营销结果。`,
    },
    {
      title: "答题框架",
      content: "- 概念界定\n- 机制分析\n- 场景应用\n- 风险或局限\n- 管理启示",
    },
    {
      title: "可用理论",
      content: "- STP 与消费者决策过程\n- 顾客旅程或关系营销\n- 整合营销传播",
    },
    {
      title: "案例方向",
      content: "- 选择能够说明来源的公开数字营销场景\n- 只用案例解释机制，不虚构数据结论",
    },
    {
      title: "常见失分点",
      content: "- 复述题干不展开机制\n- 策略与问题脱节\n- 缺少风险评价",
    },
    {
      title: "示范开头",
      content: "> 数字营销问题的分析，应从目标受众、互动机制与效果评价三个层次展开，并结合题干场景说明策略适用边界。",
    },
    {
      title: "建议背诵结构",
      content: "- 界定概念\n- 写出机制\n- 联系场景\n- 评价风险\n- 总结启示",
    },
    {
      title: "下一步行动",
      content: "补充完整题干后再生成更精确拆解。模板仅用于学习参考，具体考试要求以目标院校专业课要求为准。",
    },
  ];
}

function factBasisForQuestion(message, snippets, queryIntent) {
  if (queryIntent === "major_level" || professionalFactPattern.test(message)) {
    const usableProfessionalFacts = snippets.filter(
      (snippet) =>
        snippet.source === "school" &&
        ["verified", "partial"].includes(
          snippet.professionalDataLevel ?? snippet.dataStatus,
        ) &&
        ["official", "school_official"].includes(snippet.sourceType),
    );
    const unverifiedProfessionalItems = snippets.filter(
      (snippet) =>
        snippet.source === "school" &&
        ["demo", "pending"].includes(
          snippet.professionalDataLevel ?? snippet.dataStatus,
        ),
    );
    const baseIndexItem = snippets.find(
      (snippet) => snippet.source === "university",
    );

    if (usableProfessionalFacts.length) {
      const pendingRequestedField = usableProfessionalFacts.find(
        (snippet) => snippet.requestedFieldStatus === "pending",
      );
      const fieldGuard = pendingRequestedField
        ? `本次询问的${pendingRequestedField.requestedFieldLabel}在已匹配专业记录中仍为待核验，不能输出具体值。`
        : "仅可引用以上片段中明确写为“已核验”且不为“暂未收录 / 待核验”的字段。";
      return `${formatRetrievedBasis(usableProfessionalFacts)}\n\n${fieldGuard} 未核验的招生人数、复试线、参考书或考试科目不得生成具体结论。${factDisclaimer} ${professionalVerificationPath}`;
    }

    if (baseIndexItem) {
      return `${universityProfessionalMissingNotice}\n\n- 已识别院校基础索引：**${baseIndexItem.title}**（${baseIndexItem.dataStatus} / ${baseIndexItem.sourceType}）。${universityOnlyMajorNotice}\n\n${professionalVerificationPath}`;
    }

    if (unverifiedProfessionalItems.length) {
      return `${formatRetrievedBasis(unverifiedProfessionalItems)}\n\n检索到的专业片段为演示或待核验数据，不能转述为官方招生事实。${knowledgeMissingNotice} ${professionalVerificationPath}`;
    }

    return `${knowledgeMissingNotice}\n\n${professionalVerificationPath}`;
  }

  if (
    (queryIntent === "university_level" || universityLevelPattern.test(message)) &&
    !professionalFactPattern.test(message)
  ) {
    const universityIndexItems = snippets.filter(
      (snippet) =>
        snippet.source === "university" &&
        snippet.sourceType === "official_index" &&
        ["verified", "partial"].includes(snippet.dataStatus),
    );

    if (universityIndexItems.length) {
      return `${formatRetrievedBasis(universityIndexItems)}\n\n${universityIndexBoundary} ${factDisclaimer}`;
    }
  }

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
  const queryIntent = context.queryIntent;

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
          ? `风险偏好为${normalized.normalizedRiskPreference}，当前最大困扰为${profile.biggestConcern}；阶段计划来源为${plan.strategySourceLabel}。\n\n${factBasisForQuestion(message, snippets, queryIntent)}`
          : factBasisForQuestion(message, snippets, queryIntent),
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
    answer = formatAnswerSections(createQuestionAnalysisSections(message, snippets));
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
    queryIntent,
    disclaimer: getChatDisclaimer(activeMode),
    isMock: true,
    identity: agentIdentity,
  };
}
