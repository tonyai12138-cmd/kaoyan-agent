import faqData from "../data/faq.json";
import schoolsData from "../data/schools.json";
import { demoDisclaimer, buildTasks } from "../data/mockData";
import {
  emotionDisclaimer,
  factDisclaimer,
  fallbackReply,
  knowledgeMissingNotice,
} from "../data/prompts";

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
      verification: `建立冲刺候选清单，并记录正式依据。${factDisclaimer}`,
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
    factDisclaimer,
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
    `核验考试科目、目录与最新公告。${factDisclaimer}`,
    "整理可获得的真题来源与高频薄弱模块，删除低优先级资料。",
    "完成一次英语、数学或专业课的限时小测，确定最急需补强项。",
    "把每日任务压缩为三项以内，并锁定固定复盘时间。",
    "依据核验结果确定主目标和备选验证方向，避免频繁切换。",
    "复核一周完成度，调整冲刺、稳妥与保底策略。",
  ];
  const standardActions = [
    "确认目标专业是否可能涉及数学，并列出三档候选标准。",
    `核验考试科目与专业目录。${factDisclaimer}`,
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
      ? `资料建议：先建立来源清单，只有经过官方核验的信息才进入决策表。${factDisclaimer}`
      : normalized.biggestConcern === "焦虑" || normalized.biggestConcern === "执行"
        ? `执行建议：将明日目标缩减为三项以内的可完成动作。${emotionDisclaimer}`
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

const planStrategies = {
  "east-business": { id: "sprint", label: "冲刺档" },
  "south-finance": { id: "balanced", label: "稳妥档" },
  "river-commerce": { id: "backup", label: "保底档" },
};

function createTodayTasks(profile, strategy) {
  const isCompact =
    profile.biggestConcern === "执行" ||
    profile.biggestConcern === "焦虑" ||
    profile.weeklyHoursValue < 15;
  const isSprint = profile.timeBand === "sprint";
  const tasks = [];
  const addTask = (id, title, subject, duration, purpose, priority = "高") => {
    tasks.push({ id, title, subject, duration, purpose, priority, completed: false });
  };

  addTask(
    "plan-task-verification",
    profile.biggestConcern === "资料"
      ? "建立官方资料核验清单"
      : isSprint
        ? "核验目标科目与冲刺边界"
        : "核验目标考试科目与候选方向",
    "择校核验",
    isCompact ? "20 分钟" : "30 分钟",
    profile.biggestConcern === "资料"
      ? "只保留可追溯来源，减少无效资料切换。"
      : "让后续学习任务建立在已核验的信息上。",
  );

  addTask(
    "plan-task-english",
    profile.englishLevel === "基础薄弱"
      ? "英语核心词汇与长难句拆解"
      : isSprint
        ? "英语阅读限时训练与错项回看"
        : "英语阅读精练与生词整理",
    "英语",
    isCompact ? "35 分钟" : isSprint ? "50 分钟" : "60 分钟",
    profile.englishLevel === "基础薄弱"
      ? "先补可持续的阅读基础，避免直接堆叠难题。"
      : "保持稳定输入，并用复盘提升答题准确性。",
  );

  if (profile.needsMath) {
    addTask(
      "plan-task-math",
      profile.mathIsWeak
        ? "数学基础定义与例题回补"
        : isSprint
          ? "数学真题错题归类"
          : "数学核心题型巩固",
      "数学",
      isCompact ? "35 分钟" : profile.mathIsWeak ? "60 分钟" : "50 分钟",
      profile.mathIsWeak
        ? "从基础薄弱项开始补强，不直接进入高难冲刺。"
        : "巩固高频方法，并识别下一轮重点。",
    );
  }

  addTask(
    "plan-task-professional",
    profile.professionalIsWeak || profile.isCrossExamValue
      ? "专业课框架与资料目录整理"
      : isSprint
        ? "专业课高频背诵与真题回忆"
        : "专业课核心章节结构梳理",
    "专业课",
    isCompact ? "40 分钟" : isSprint ? "70 分钟" : "75 分钟",
    profile.professionalIsWeak || profile.isCrossExamValue
      ? "先建立知识框架并核验学习范围，缩小信息差。"
      : "把知识点转化为可回忆、可输出的答题素材。",
  );

  addTask(
    "plan-task-politics",
    isSprint ? "政治高频考点速记" : "政治基础要点积累",
    "政治",
    isCompact ? "20 分钟" : "30 分钟",
    isSprint ? "用短时背诵保持得分点覆盖。" : "以低负担方式持续积累公共课基础。",
    "中",
  );

  addTask(
    "plan-task-review",
    profile.biggestConcern === "焦虑"
      ? "睡前低压力复盘与情绪记录"
      : profile.biggestConcern === "执行"
        ? "记录完成动作与明日第一步"
        : "记录今日卡点与明日安排",
    "复盘",
    "15 分钟",
    profile.biggestConcern === "焦虑"
      ? "用事实记录代替自我否定，降低明日启动压力。"
      : "让计划根据真实完成情况持续调整。",
    "中",
  );

  if (strategy.id === "sprint") {
    return tasks.map((task) =>
      task.id === "plan-task-professional"
        ? {
            ...task,
            priority: "高",
            duration: isCompact ? task.duration : isSprint ? "80 分钟" : "90 分钟",
            purpose: `${task.purpose} 冲刺档需用输出结果检验目标承接能力。`,
          }
        : task.id === "plan-task-verification"
          ? { ...task, purpose: `${task.purpose} 同时保留稳妥备选作为复核基线。` }
        : task,
    );
  }

  if (strategy.id === "backup") {
    return tasks.map((task) =>
      task.id === "plan-task-verification"
        ? {
            ...task,
            title: "复核稳妥方向的科目与可执行性",
            purpose: "确认备选方向真实匹配个人意愿，不因控制风险而盲目降档。",
          }
        : task.id === "plan-task-professional"
          ? {
              ...task,
              title: "专业课基础框架稳固",
              purpose: "用更集中的范围提高执行稳定性，并保留后续调整空间。",
            }
          : task,
    );
  }

  return tasks;
}

function createWeeklyPlan(profile, strategy) {
  const isSprint = profile.timeBand === "sprint";
  const centralSubject = profile.needsMath
    ? profile.mathIsWeak
      ? "数学基础补弱"
      : "数学核心题型"
    : "专业课框架加深";
  const weeklyPlan = isSprint
    ? [
        {
          day: "周一",
          theme: "冲刺范围收敛",
          tasks: ["核验考试科目", "列出高频薄弱点", "压缩任务清单"],
          review: "是否删掉了低价值任务",
        },
        {
          day: "周二",
          theme: "限时训练日",
          tasks: ["英语限时训练", centralSubject, "整理错因"],
          review: "限时中的失分类型",
        },
        {
          day: "周三",
          theme: "专业课回忆日",
          tasks: ["高频主题背诵", "真题提纲输出", "错漏补记"],
          review: "能否脱稿写出框架",
        },
        {
          day: "周四",
          theme: "公共课稳分日",
          tasks: ["英语错题回看", "政治速记", centralSubject],
          review: "重复错误是否减少",
        },
        {
          day: "周五",
          theme: "真题整合日",
          tasks: ["真题片段练习", "背诵抽测", "核对薄弱项"],
          review: "下次训练只改哪一点",
        },
        {
          day: "周六",
          theme: "模拟节奏日",
          tasks: ["限时组合训练", "整理错题", "稳定作息"],
          review: "时间分配是否失衡",
        },
        {
          day: "周日",
          theme: "复盘调整日",
          tasks: ["核算完成率", "更新下周重点", "安排休息"],
          review: "计划是否需要继续压缩",
        },
      ]
    : [
        {
          day: "周一",
          theme: "目标核验日",
          tasks: ["核验考试科目", "建立候选信息表", "安排本周时段"],
          review: "哪些信息仍待官网确认",
        },
        {
          day: "周二",
          theme: "英语基础日",
          tasks: ["阅读精练", "生词回顾", "长难句拆解"],
          review: "重复出现的阅读障碍",
        },
        {
          day: "周三",
          theme: "核心补强日",
          tasks: [centralSubject, "整理例题或框架", "记录疑问"],
          review: "基础漏洞是否被定位",
        },
        {
          day: "周四",
          theme: "专业课搭建日",
          tasks: ["章节框架", "资料目录核验", "输出小结"],
          review: "能否讲清章节逻辑",
        },
        {
          day: "周五",
          theme: "公共课积累日",
          tasks: ["英语回顾", "政治要点", "本周错题整理"],
          review: "哪些任务适合固定化",
        },
        {
          day: "周六",
          theme: "综合训练日",
          tasks: ["基础小测", "专业课回忆", "补做薄弱任务"],
          review: "完成质量而非任务数量",
        },
        {
          day: "周日",
          theme: "复盘规划日",
          tasks: ["统计完成率", "调整下周时长", "预留休息"],
          review: "节奏是否可以持续",
        },
      ];

  if (profile.biggestConcern === "资料") {
    weeklyPlan[0].tasks = ["核验官网目录", "整理来源清单", "删除不可追溯资料"];
    weeklyPlan[0].review = "保留的信息是否都有正式来源";
  }
  if (profile.biggestConcern === "焦虑" || profile.biggestConcern === "执行") {
    weeklyPlan[6].tasks = ["统计最小任务", "安排下周第一步", "主动休息"];
    weeklyPlan[6].review = "下一周是否足够轻量可执行";
  }
  if (strategy.id === "sprint") {
    weeklyPlan[5].theme = "冲刺验证日";
    weeklyPlan[5].tasks = ["限时输出训练", "核算薄弱差距", "对照稳妥备选"];
    weeklyPlan[5].review = "冲刺目标是否仍可执行";
  }
  if (strategy.id === "backup") {
    weeklyPlan[5].theme = "稳妥适配日";
    weeklyPlan[5].tasks = ["复核培养方向", "完成基础小测", "确认接受程度"];
    weeklyPlan[5].review = "是否避免了过度降档";
  }

  return weeklyPlan;
}

function createStageFocus(stage, profile) {
  const focusMap = {
    启动准备期: ["明确专业方向", "核验考试科目", "建立候选院校池", "了解合规资料与真题来源"],
    基础建立期: [
      "英语基础",
      profile.needsMath ? "数学基础" : "专业课基础深化",
      "专业课第一轮框架",
      "每周复盘",
    ],
    强化推进期: ["真题训练", "专业课背诵", "错题复盘", "目标方向收敛"],
    冲刺调整期: ["高频考点", "真题限时训练", "背诵压缩", "作息稳定", "模拟训练"],
  };

  return focusMap[stage] ?? focusMap.启动准备期;
}

function createTimeAllocation(profile, strategy) {
  const allocations = [
    { subject: "英语", weight: 25, reason: "持续输入与阅读训练" },
    { subject: "专业课", weight: 35, reason: "形成主干知识与输出能力" },
    { subject: "政治", weight: 15, reason: "稳定积累公共课内容" },
    { subject: "择校核验", weight: 10, reason: "保持信息来源准确" },
  ];

  if (profile.needsMath) {
    allocations.splice(1, 0, {
      subject: "数学",
      weight: 25,
      reason: profile.mathIsWeak ? "基础补弱优先" : "保持题型训练",
    });
  }

  const changeWeight = (subject, delta) => {
    const item = allocations.find((allocation) => allocation.subject === subject);
    if (item) item.weight += delta;
  };

  if (profile.needsMath && profile.mathIsWeak) changeWeight("数学", 12);
  if (profile.isCrossExamValue || profile.professionalIsWeak) changeWeight("专业课", 10);
  if (profile.englishLevel === "基础薄弱") changeWeight("英语", 8);
  if (profile.timeBand === "sprint") {
    changeWeight("择校核验", -5);
    changeWeight("专业课", 6);
    changeWeight(profile.needsMath ? "数学" : "英语", 5);
  }
  if (strategy.id === "sprint") {
    changeWeight("专业课", 6);
    changeWeight(profile.needsMath ? "数学" : "英语", 5);
  }
  if (strategy.id === "backup") {
    changeWeight("择校核验", 5);
    changeWeight("专业课", 4);
  }
  if (profile.biggestConcern === "资料") {
    const sourceAllocation = allocations.find((item) => item.subject === "择校核验");
    sourceAllocation.weight = Math.max(sourceAllocation.weight, 14);
    sourceAllocation.reason = "筛选并核验资料来源";
  }

  const total = allocations.reduce((sum, item) => sum + item.weight, 0);
  const normalized = allocations.map((item) => ({
    ...item,
    percentage: Math.round((item.weight / total) * 100),
  }));
  const offset =
    100 - normalized.reduce((sum, item) => sum + item.percentage, 0);
  const highest = normalized.reduce((result, item) =>
    item.percentage > result.percentage ? item : result,
  );
  highest.percentage += offset;

  return normalized;
}

export function createStudyPlan(profile = {}, selectedSchoolId, strategySelectionSource) {
  if (!hasCompletedDiagnosis(profile)) {
    return {
      status: "incomplete",
      isExample: true,
      isDemo: true,
      disclaimer: demoDisclaimer,
    };
  }

  const normalized = normalizeProfile(profile);
  const report = createPositioningReport(profile);
  const recommended = report.recommendations.find((item) => item.recommended);
  const manuallySelected = strategySelectionSource === "manual";
  const selected = manuallySelected
    ? report.recommendations.find((item) => item.planTargetId === selectedSchoolId) ??
      recommended
    : recommended;
  const strategy = planStrategies[selected.planTargetId];
  const stage = getStage(normalized);
  const stageReminderBase =
    stage === "冲刺调整期"
      ? "当前更适合压缩目标、聚焦真题与高频任务，并保持作息稳定。"
      : stage === "强化推进期"
        ? "当前适合将基础训练转为专题输出，并用每周复盘收敛重点。"
        : stage === "基础建立期"
          ? "当前适合稳定搭建基础与专业课框架，避免频繁切换资料。"
          : "当前适合先核验方向与考试科目，再建立可持续的学习节奏。";
  const strategyReminder =
    strategy.id === "sprint"
      ? "冲刺档应同步保留稳妥复核线，避免只上探不校准。"
      : strategy.id === "backup"
        ? "保底档仍需核验方向适配，避免为了稳妥而过度降档。"
        : "稳妥档优先保障节奏持续，并在完成度稳定后再调整目标。";

  return {
    status: "ready",
    stage,
    strategyId: strategy.id,
    planTargetId: selected.planTargetId,
    strategyLabel: strategy.label,
    strategySourceLabel: manuallySelected ? "用户选定策略" : "AI 推荐策略",
    stageReminder: `${stageReminderBase} ${strategyReminder}`,
    countdownLabel:
      normalized.monthsRemainingValue > 0
        ? `距考试约 ${normalized.monthsRemainingValue} 个月`
        : "待补充考试时间",
    todayTasks: createTodayTasks(normalized, strategy),
    weeklyPlan: createWeeklyPlan(normalized, strategy),
    stageFocus: createStageFocus(stage, normalized),
    timeAllocation: createTimeAllocation(normalized, strategy),
    reviewTemplate: [
      "今天完成了什么？",
      "哪个任务卡住了？",
      "明天最重要的一件事是什么？",
      "情绪状态如何？",
      "是否需要调整计划？",
    ],
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

  const faq = findFaq(message);
  const targetPrefix = profile?.major
    ? `结合你填写的${profile.major}背景，`
    : "";

  if (
    faq?.id === "subjects" ||
    /某校|院校|学校.*(?:分数线|招生|科目|参考书)|分数线|招生人数|复试线|录取比例/.test(
      message,
    )
  ) {
    return {
      answer: `${targetPrefix}${knowledgeMissingNotice}\n\n### 下一步行动\n请到官方页面核验对应年度信息，并记录网页来源与发布日期。`,
      citations: faq?.sourceLabel ? [faq.sourceLabel] : [],
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
