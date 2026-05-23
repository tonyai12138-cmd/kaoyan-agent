import faqData from "../data/faq.json";
import schoolsData from "../data/schools.json";
import { demoDisclaimer, buildTasks } from "../data/mockData";
import { fallbackReply } from "../data/prompts";

const urgentTerms = ["自杀", "自伤", "不想活", "结束生命"];

export function createDiagnosis(profile) {
  const weeklyHours = Number(profile.weeklyHours) || 0;
  const timeAssessment =
    weeklyHours >= 24
      ? "可投入时间较充足，适合建立稳定的多科推进节奏。"
      : "可投入时间较紧，需要优先保证核心科目任务可持续完成。";

  const riskAssessment =
    profile.riskPreference === "冲刺名校"
      ? "你倾向挑战型目标，建议同时保留可核验的备选方向。"
      : "你的目标取向较稳健，适合先运行两周计划再细化定位。";

  return {
    summary: `你目前以${profile.major}背景准备${profile.degreePreference}方向，意向区域为${profile.region}。`,
    strengths: [
      "专业背景与经管类备考方向具有衔接基础",
      `${weeklyHours || "待确认"} 小时/周的时间信息可用于生成任务`,
    ],
    risks: [timeAssessment, riskAssessment],
    suggestion:
      "建议先比较 2 至 3 个演示目标，并根据初试科目匹配情况选择一项主目标。",
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
