import faqData from "../data/faq.json";
import schoolsData from "../data/schools.json";
import { demoDisclaimer, buildTasks } from "../data/mockData";
import { fallbackReply } from "../data/prompts";

const urgentTerms = ["自杀", "自伤", "不想活", "结束生命"];

const requiredProfileFields = [
  "universityTier",
  "major",
  "grade",
  "isCrossExam",
  "targetDirection",
  "region",
  "degreePreference",
  "acceptsAdjustment",
  "riskPreference",
  "englishLevel",
  "mathLevel",
  "professionalLevel",
  "weeklyHours",
  "monthsRemaining",
  "biggestConcern",
];

const riskRank = {
  低风险: 1,
  中风险: 2,
  较高风险: 3,
};

function text(value) {
  return String(value ?? "").trim();
}

export function parseStudyTime(profile = {}) {
  const weeklyHoursText = text(profile.weeklyHours);
  const monthsText = text(profile.monthsRemaining);
  const weeklyMatch = weeklyHoursText.match(/\d+(?:\.\d+)?/);
  const monthsMatch = monthsText.match(/\d+(?:\.\d+)?/);
  const weeklyHours = weeklyMatch ? Number(weeklyMatch[0]) : 0;
  let monthsRemaining = monthsMatch ? Number(monthsMatch[0]) : 0;
  let timeBand = "unknown";

  if (/3\s*个?月?\s*(以?内|以下)|不足\s*3|少于\s*3/.test(monthsText)) {
    monthsRemaining = 2;
    timeBand = "sprint";
  } else if (/3\s*[-~至到]\s*6/.test(monthsText)) {
    monthsRemaining = 4;
    timeBand = "reinforce";
  } else if (/6\s*个?月?\s*(以上|以外)|超过\s*6/.test(monthsText)) {
    monthsRemaining = 7;
    timeBand = "foundation";
  } else if (monthsRemaining > 0 && monthsRemaining < 3) {
    timeBand = "sprint";
  } else if (monthsRemaining <= 6 && monthsRemaining > 0) {
    timeBand = "reinforce";
  } else if (monthsRemaining <= 10 && monthsRemaining > 0) {
    timeBand = "foundation";
  } else if (monthsRemaining > 10) {
    timeBand = "prepare";
  }

  return {
    weeklyHoursValue: weeklyHours,
    monthsRemainingValue: monthsRemaining,
    timeBand,
    weeklyHoursLabel: weeklyHoursText ? `${weeklyHoursText} 小时/周` : "待补充",
    monthsRemainingLabel: monthsText
      ? /个月/.test(monthsText)
        ? monthsText
        : `${monthsText} 个月`
      : "待补充",
  };
}

export function normalizeProfile(profile = {}) {
  const safeProfile = profile ?? {};
  const rawRiskPreference = text(safeProfile.riskPreference);
  const normalizedRiskPreference =
    rawRiskPreference === "冲刺名校"
      ? "冲刺优先"
      : rawRiskPreference === "均衡选择"
        ? "稳妥优先"
        : rawRiskPreference || "稳妥优先";
  const crossExamValue = text(safeProfile.isCrossExam);
  const targetDirection = text(safeProfile.targetDirection);
  const mathLevel = text(safeProfile.mathLevel);
  const time = parseStudyTime(safeProfile);

  return {
    ...safeProfile,
    normalizedRiskPreference,
    isCrossExamValue: safeProfile.isCrossExam === true || /^(是|true|跨考|有)$/.test(crossExamValue),
    needsMath: /数学|示例含数学/.test(targetDirection),
    mathIsWeak: /(基础薄弱|较弱|基础待强化|薄弱|待强化)/.test(mathLevel),
    professionalIsWeak: /(基础薄弱|较弱|基础待强化|薄弱|待强化)/.test(
      text(safeProfile.professionalLevel),
    ),
    ...time,
  };
}

export function hasCompletedDiagnosis(profile = {}) {
  return requiredProfileFields.every((field) => text(profile[field]));
}

function getStage(profile) {
  if (profile.timeBand === "sprint") return "冲刺调整期";
  if (profile.timeBand === "reinforce") return "强化推进期";
  if (profile.timeBand === "foundation") return "基础建立期";
  return "启动准备期";
}

export function createDiagnosis(profile) {
  const normalized = normalizeProfile(profile);
  const {
    weeklyHoursValue: weeklyHours,
    monthsRemainingValue: monthsRemaining,
    isCrossExamValue,
    needsMath,
    mathIsWeak,
    normalizedRiskPreference,
  } = normalized;
  const stage = getStage(normalized);
  const risks = [];

  if (needsMath && mathIsWeak) {
    risks.push(
      "数学基础风险：你选择的演示方向包含数学要求，当前基础较弱，需优先核验目标科目并安排基础补强。",
    );
  }

  if (isCrossExamValue) {
    risks.push(
      "专业课信息差：跨考需要提前核验考试范围、参考资料和专业课答题方式。",
    );
  }

  if (weeklyHours > 0 && weeklyHours < 15) {
    risks.push(
      "时间投入不足：当前每周可用学习时间偏低，建议压缩目标范围并保障高优先级任务。",
    );
  }

  if (normalized.timeBand === "sprint") {
    risks.push(
      "冲刺调整期：距离考试不足 3 个月，应以真题复盘、薄弱项修补和稳定执行为主。",
    );
  }

  const strategy =
    normalizedRiskPreference === "上岸优先"
      ? "推荐策略：你选择了上岸优先，建议优先核验稳妥型目标，并保留接受调剂的可行方案。"
      : normalizedRiskPreference === "冲刺优先"
        ? "推荐策略：你选择了冲刺优先，可以积极比较挑战目标，但必须同步设置稳妥备选并持续复核风险。"
        : "推荐策略：建议比较主目标与备选方向，在可执行的计划基础上逐步收敛选择。";

  if (risks.length === 0) {
    risks.push(
      weeklyHours >= 24
        ? "当前时间投入较充足，仍需通过阶段任务检验计划可持续性。"
        : "当前风险需结合目标院校正式科目和后续执行表现持续复核。",
    );
  }

  return {
    summary: `你目前为${profile.grade || "本科阶段"}、${profile.universityTier || "待补充院校背景"}的${profile.major || "待补充专业"}学生，意向方向为${profile.targetDirection || profile.degreePreference || "待确认"}，目标地区为${profile.region || "待确认"}。当前诊断状态：${stage}。`,
    strengths: [
      `当前最大困扰：${profile.biggestConcern || "待进一步确认"}`,
      `${weeklyHours || "待确认"} 小时/周、剩余 ${monthsRemaining || "待确认"} 个月的信息可用于调整行动节奏`,
    ],
    risks,
    suggestion: `${strategy} 建议先比较 2 至 3 个演示目标，再依据正式信息选择主目标。`,
    stage,
    recommendationStyle: normalizedRiskPreference,
    isDemo: true,
    disclaimer: demoDisclaimer,
  };
}

function createRecommendations(profile) {
  const preferredId =
    profile.normalizedRiskPreference === "冲刺优先"
      ? "sprint"
      : profile.normalizedRiskPreference === "上岸优先"
        ? "balanced"
        : profile.mathIsWeak || profile.professionalIsWeak || profile.timeBand === "sprint"
          ? "balanced"
          : "balanced";

  return [
    {
      id: "sprint",
      tier: "冲刺档",
      tag: "提高目标上限",
      sampleDirection: `${profile.targetDirection}中培养方向高度匹配、经正式信息核验后可承接的挑战型项目`,
      why: "适合希望尝试更高目标，且愿意为薄弱项投入额外时间的备考路径。",
      risk: profile.mathIsWeak && profile.needsMath
        ? "数学补强压力突出，冲刺前需先通过基础测试和科目核验。"
        : "目标要求和竞争信息仍需逐项核验，不能仅凭偏好确定。",
      condition: "完成考试科目核验、基础测评与每周时间预算后，再决定是否作为主目标。",
      verification: "在研招网与目标院校官网建立冲刺候选清单，并记录正式依据。",
      planTargetId: "east-business",
      recommended: preferredId === "sprint",
    },
    {
      id: "balanced",
      tier: "稳妥档",
      tag: "匹配当前基础",
      sampleDirection: `${profile.targetDirection}中科目结构和备考节奏与当前基础较匹配的项目`,
      why:
        profile.normalizedRiskPreference === "上岸优先"
          ? "更符合你优先控制风险的选择偏好，便于集中投入关键任务。"
          : "能在目标质量与执行可行性之间维持平衡，适合作为主验证方向。",
      risk: "需要警惕因“看起来合适”而跳过正式目录、考试科目和培养方向核验。",
      condition: "用相同口径比较候选项目的考试要求、复试安排与个人准备负担。",
      verification: "筛选 2 至 3 个候选项目，逐项标记官网信息是否已经核验。",
      planTargetId: "south-finance",
      recommended: preferredId === "balanced",
    },
    {
      id: "backup",
      tier: "保底档",
      tag: "控制选择风险",
      sampleDirection: `${profile.targetDirection}中准备路径更集中、可作为备选核验的项目方向`,
      why: "适合时间进一步收紧、基础补强不及预期，或希望保留调整空间时使用。",
      risk: "保底不等于必然录取，过度降档也可能造成方向不匹配与投入浪费。",
      condition: "仅在完成正式信息核验并确认自身接受培养方向后，作为备选方案。",
      verification: "核验培养方向、调剂政策与考试科目，不以标签替代真实决策。",
      planTargetId: "river-commerce",
      recommended: preferredId === "backup",
    },
  ];
}

function createRiskRadar(profile) {
  const risks = [];
  const addRisk = (name, level, reason, action) => risks.push({ name, level, reason, action });

  if (profile.needsMath && profile.mathIsWeak) {
    addRisk(
      "数学基础风险",
      "较高风险",
      "目标方向可能涉及数学，而你填写的数学基础仍偏薄弱。",
      "先核验目标项目考试科目，再将数学基础训练列为近期固定任务。",
    );
  }
  if (profile.isCrossExamValue) {
    addRisk(
      "专业课信息差",
      "中风险",
      "跨考意味着你需要额外理解专业课范围、答题方式和资料来源。",
      "优先查看正式专业目录与考试大纲，并建立来源清单。",
    );
  }
  if (profile.weeklyHoursValue > 0 && profile.weeklyHoursValue < 15) {
    addRisk(
      "时间投入不足",
      "较高风险",
      "当前每周可用学习时长较低，难以同时维持过多目标和补强任务。",
      "压缩候选范围，将一周时间优先投入基础薄弱项和官方信息核验。",
    );
  }
  if (text(profile.region) && profile.region !== "不限地区") {
    addRisk(
      "地区竞争强度",
      "中风险",
      `你已指定${profile.region}，候选项目的竞争与资源差异需要进一步核验。`,
      "使用同一口径对比候选院校官网公开信息，不提前下结论。",
    );
  }
  if (
    profile.normalizedRiskPreference === "冲刺优先" &&
    (profile.mathIsWeak ||
      profile.professionalIsWeak ||
      profile.timeBand === "sprint" ||
      profile.weeklyHoursValue < 15)
  ) {
    addRisk(
      "目标过高风险",
      "较高风险",
      "冲刺倾向与当前时间或基础约束同时存在，目标上探可能挤压基本盘。",
      "保留一项稳妥验证方向，并设置一周后的复核节点。",
    );
  }
  addRisk(
    "资料核验风险",
    profile.biggestConcern === "资料" ? "中风险" : "低风险",
    profile.biggestConcern === "资料"
      ? "你当前最困扰的是资料选择，非官方资料可能造成判断偏差。"
      : "择校与考试资料会更新，演示建议不能替代正式来源确认。",
    "院校、科目与招考信息只以研招网和目标院校官网核验结果为依据。",
  );
  if (profile.biggestConcern === "焦虑" || profile.biggestConcern === "执行") {
    addRisk(
      "情绪与执行风险",
      profile.timeBand === "sprint" ? "较高风险" : "中风险",
      `你填写的主要困扰为${profile.biggestConcern}，持续压力可能影响任务完成节奏。`,
      "将每日目标压缩为可完成的最小任务，并在复盘页记录状态变化。",
    );
  }

  return risks;
}

function createSevenDayActions(profile) {
  const sprintActions = [
    "确认目标方向是否考数学，并立即收敛为三档候选标准。",
    "到研招网和目标院校官网核验考试科目、目录与最新公告。",
    "整理可获得的真题来源与高频薄弱模块，删除低优先级资料。",
    "完成一次英语、数学或专业课的限时小测，确定最急需补强项。",
    "把每日任务压缩为三项以内，并锁定固定复盘时间。",
    "依据核验结果确定主目标和备选验证方向，避免频繁切换。",
    "复核一周完成度，调整冲刺、稳妥与保底策略。",
  ];
  const standardActions = [
    "确认目标专业是否可能涉及数学，并列出三档候选标准。",
    "到研招网和目标院校官网核验考试科目与专业目录。",
    "建立候选信息表，记录公开依据与仍待核验的问题。",
    "确定专业课学习范围与合规资料来源清单。",
    "制定第一版每周学习时间表，明确基础补强任务。",
    "完成英语与专业课基础小测，记录真实短板。",
    "根据风险结果重新调整冲刺、稳妥与保底三档。",
  ];
  const actions = [...(profile.timeBand === "sprint" ? sprintActions : standardActions)];

  if (profile.biggestConcern === "资料") {
    actions[0] = "建立资料核验清单：仅保留研招网、院校官网与可追溯来源。";
    actions[2] = "整理资料来源、更新时间与适用科目，剔除无法核验的内容。";
  }
  if (profile.biggestConcern === "焦虑" || profile.biggestConcern === "执行") {
    actions[4] = "设置一个固定学习时段与三项以内最小任务，降低启动压力。";
    actions[6] = "完成每日复盘，依据真实完成情况而非情绪调整目标档位。";
  }

  return actions.map((action, index) => ({ day: `Day ${index + 1}`, action }));
}

export function createPositioningReport(profile = {}) {
  if (!hasCompletedDiagnosis(profile)) {
    return {
      status: "incomplete",
      isExample: true,
      isDemo: true,
      disclaimer: demoDisclaimer,
    };
  }

  const normalized = normalizeProfile(profile);
  const risks = createRiskRadar(normalized);
  const riskLevel = risks.reduce(
    (highest, risk) => (riskRank[risk.level] > riskRank[highest] ? risk.level : highest),
    "低风险",
  );
  const hasFoundationConstraint =
    (normalized.needsMath && normalized.mathIsWeak) ||
    normalized.weeklyHoursValue < 15 ||
    normalized.timeBand === "sprint";
  const positioningTag =
    normalized.normalizedRiskPreference === "上岸优先"
      ? "建议稳妥"
      : hasFoundationConstraint
        ? "先补基础"
        : normalized.normalizedRiskPreference === "冲刺优先"
          ? "适合冲刺"
          : "稳中求进";
  const supportAdvice =
    normalized.biggestConcern === "资料"
      ? "资料建议：先建立来源清单，只有研招网与目标院校官网核验过的信息才进入决策表。"
      : normalized.biggestConcern === "焦虑" || normalized.biggestConcern === "执行"
        ? "执行建议：将明日目标缩减为三项以内的可完成动作；情绪陪伴不替代专业心理咨询。"
        : "行动建议：用官方信息完成候选核验后，再将主目标同步至备考计划。";

  return {
    status: "ready",
    stage: getStage(normalized),
    positioningTag,
    riskLevel,
    profileFacts: [
      { label: "本科背景", value: profile.universityTier || "待补充" },
      { label: "本科专业", value: profile.major || "待补充" },
      { label: "是否跨考", value: profile.isCrossExam || "待补充" },
      { label: "目标专业方向", value: profile.targetDirection || "待补充" },
      { label: "目标地区", value: profile.region || "待补充" },
      { label: "培养类型偏好", value: profile.degreePreference || "待补充" },
      { label: "英语基础", value: profile.englishLevel || "待补充" },
      { label: "数学基础", value: profile.mathLevel || "待补充" },
      { label: "专业课基础", value: profile.professionalLevel || "待补充" },
      { label: "每周学习时长", value: normalized.weeklyHoursLabel },
      { label: "距离考试", value: normalized.monthsRemainingLabel },
      { label: "当前最大困扰", value: profile.biggestConcern || "待补充" },
    ],
    recommendations: createRecommendations(normalized),
    risks,
    sevenDayActions: createSevenDayActions(normalized),
    supportAdvice,
    isDemo: true,
    disclaimer: demoDisclaimer,
  };
}

export function getSchool(schoolId) {
  return (
    schoolsData.schools.find((school) => school.id === schoolId) ??
    schoolsData.schools[1]
  );
}

export function createTasksForSchool(schoolId) {
  return buildTasks(getSchool(schoolId).id);
}

function findFaq(message) {
  return faqData.items.find((item) =>
    item.keywords.some((keyword) => message.includes(keyword)),
  );
}

export function answerQuestion({ message, profile, context }) {
  if (urgentTerms.some((term) => message.includes(term))) {
    return {
      answer:
        "听到你正在承受很大的压力。此刻请先联系信任的亲友、学校心理支持渠道，或在存在紧急危险时联系当地紧急援助服务。备考任务可以暂停，你的安全最重要。",
      citations: [],
      isMock: true,
      safety: "urgent",
    };
  }

  const school = getSchool(context?.selectedSchoolId);
  const faq = findFaq(message);
  const targetPrefix = profile?.major
    ? `结合你填写的${profile.major}背景，`
    : "";

  if (faq?.id === "subjects") {
    return {
      answer: `${targetPrefix}${school.name}的${school.program}在演示卡片中列出的科目为：${school.subjects.join("、")}。请把该信息作为界面体验样例，而不是报考依据。`,
      citations: [faq.sourceLabel, `${school.name} - ${school.program}演示卡`],
      disclaimer: demoDisclaimer,
      isMock: true,
    };
  }

  if (faq) {
    return {
      answer: `${targetPrefix}${faq.answer}`,
      citations: [faq.sourceLabel],
      disclaimer: faq.disclaimer,
      isMock: true,
    };
  }

  return {
    answer: fallbackReply,
    citations: [],
    disclaimer: demoDisclaimer,
    isMock: true,
  };
}

export function createReview({ tasks, mood, challenge, tomorrowMinutes }) {
  const completedCount = tasks.filter((task) => task.completed).length;
  const ratio = Math.round((completedCount / tasks.length) * 100);
  const pace =
    ratio >= 75
      ? "今天的核心节奏保持得不错，可以在不增加负担的前提下延续。"
      : "今天存在未完成任务，明天优先保留关键任务并减少切换成本。";

  const moodText =
    mood === "焦虑" || mood === "挫败"
      ? "你已识别到压力状态，先将目标缩小到能完成的一步是有效调整。"
      : "你的状态记录将帮助后续计划更贴近真实节奏。";

  return {
    summary: `今日完成 ${completedCount}/${tasks.length} 项任务（${ratio}%）。${pace}`,
    support: moodText,
    actions: [
      "优先完成一项最高优先级任务，再决定是否追加内容。",
      challenge
        ? `针对“${challenge.slice(0, 22)}”记录一个具体解决动作。`
        : "记录一个今天最影响效率的卡点。",
      `按明日可用 ${tomorrowMinutes || "180"} 分钟重新安排任务时长。`,
    ],
    isMock: true,
    disclaimer: demoDisclaimer,
  };
}
