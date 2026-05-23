import faqData from "../data/faq.json";
import schoolsData from "../data/schools.json";
import { demoDisclaimer, buildTasks } from "../data/mockData";
import { fallbackReply } from "../data/prompts";

const urgentTerms = ["自杀", "自伤", "不想活", "结束生命"];

export function createDiagnosis(profile) {
  const weeklyHours = Number(profile.weeklyHours) || 0;
  const monthsRemaining = Number(profile.monthsRemaining) || 0;
  const isCrossExam = profile.isCrossExam === "是";
  const needsMath = profile.targetDirection?.includes("示例含数学");
  const mathIsWeak = profile.mathLevel === "基础薄弱";
  const stage =
    monthsRemaining > 0 && monthsRemaining < 3
      ? "冲刺调整期"
      : monthsRemaining > 0 && monthsRemaining <= 6
        ? "强化推进期"
        : "定位规划期";
  const risks = [];

  if (needsMath && mathIsWeak) {
    risks.push(
      "数学基础风险：你选择的演示方向包含数学要求，当前基础较弱，需优先核验目标科目并安排基础补强。",
    );
  }

  if (isCrossExam) {
    risks.push(
      "专业课信息差：跨考需要提前核验考试范围、参考资料和专业课答题方式。",
    );
  }

  if (weeklyHours > 0 && weeklyHours < 15) {
    risks.push(
      "时间投入不足：当前每周可用学习时间偏低，建议压缩目标范围并保障高优先级任务。",
    );
  }

  if (monthsRemaining > 0 && monthsRemaining < 3) {
    risks.push(
      "冲刺调整期：距离考试不足 3 个月，应以真题复盘、薄弱项修补和稳定执行为主。",
    );
  }

  const strategy =
    profile.riskPreference === "上岸优先"
      ? "推荐策略：你选择了上岸优先，建议优先核验稳妥型目标，并保留接受调剂的可行方案。"
      : profile.riskPreference === "冲刺优先" || profile.riskPreference === "冲刺名校"
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
    summary: `你目前为${profile.grade || "本科阶段"}、${profile.universityTier || "待补充院校背景"}的${profile.major}学生，意向方向为${profile.targetDirection || profile.degreePreference}，目标地区为${profile.region}。当前诊断状态：${stage}。`,
    strengths: [
      `当前最大困扰：${profile.biggestConcern || "待进一步确认"}`,
      `${weeklyHours || "待确认"} 小时/周、剩余 ${monthsRemaining || "待确认"} 个月的信息可用于调整行动节奏`,
    ],
    risks,
    suggestion: `${strategy} 建议先比较 2 至 3 个演示目标，再依据正式信息选择主目标。`,
    stage,
    recommendationStyle: profile.riskPreference || "待确认",
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
