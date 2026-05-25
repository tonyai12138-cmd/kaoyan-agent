import faqData from "../data/faq.json";
import questionData from "../data/questionTemplates.json";
import schoolsData from "../data/schools.json";
import {
  factDisclaimer,
  knowledgeStatusDefinitions,
  normalizeChatMode,
  promptKnowledge,
  toServerMode,
} from "../data/prompts";

const factSearchPattern =
  /学校|院校|某校|专业|考试科目|招生人数|推免|分数线|复试线|参考书|录取比例/;
const sourceLabels = {
  faq: "FAQ",
  school: "院校专业",
  template: "题型模板",
  prompt: "规则提示",
};

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

function statusLabel(status) {
  return knowledgeStatusDefinitions[status]?.label ?? "待核验";
}

function modeBonus(entry, mode) {
  return entry.modes.includes(mode) ? 2 : 0;
}

function sourceBonus(entry, query, mode) {
  if (mode === "question" && entry.source === "template") {
    return 4;
  }
  if (mode === "source" && ["faq", "prompt"].includes(entry.source)) {
    return 3;
  }
  if (mode === "school" && entry.source === "school") {
    return 3;
  }
  if (factSearchPattern.test(query) && entry.source === "school") {
    return 2;
  }
  if (/分数线|复试线|招生人数|参考书|录取比例/.test(query) && entry.source === "faq") {
    return 4;
  }
  return 0;
}

function scoreEntry(entry, query, mode) {
  const searchable = normalizeText(entry.searchable);
  const normalizedQuery = normalizeText(query);
  let hits = 0;

  if (searchable.includes(normalizedQuery)) {
    hits += 4;
  }

  entry.keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedQuery.includes(normalizedKeyword)) {
      hits += 2;
    }
  });

  if (!hits) {
    return 0;
  }

  return Math.min(10, hits + modeBonus(entry, mode) + sourceBonus(entry, query, mode));
}

function createSchoolItems() {
  return schoolsData.schools.map((school) => {
    const subjectNames = school.examSubjects
      .map((subject) => subject.subjectName)
      .join("、");
    const status = school.dataStatus ?? "pending";
    const content = [
      `数据状态：${status}（${statusLabel(status)}）`,
      `样例方向：${school.major} / ${school.researchDirection}`,
      `地区：${school.region}；学位类型：${school.degreeType}；数学要求：${school.mathRequired}`,
      `考试科目：${subjectNames || "待核验"}`,
      status === "verified"
        ? "引用前仍应核对来源日期与适用年份。"
        : "该条目仅作演示或待核验记录，不可作为报考事实结论。",
    ].join("；");

    return {
      source: "school",
      title: `${school.school} · ${school.major}`,
      content,
      modes: ["school", "source"],
      keywords: school.keywords ?? [],
      searchable: [
        school.school,
        school.region,
        school.city,
        school.college,
        school.major,
        school.majorCode,
        school.degreeType,
        school.mathRequired,
        subjectNames,
        ...(school.keywords ?? []),
        school.notes,
      ].join(" "),
      sourceType: school.source?.sourceType ?? "pending",
      dataStatus: status,
      sourceLabel: school.source?.sourceName,
      sourceUrl: school.source?.sourceUrl,
      disclaimer: school.disclaimer ?? factDisclaimer,
    };
  });
}

function createFaqItems() {
  return faqData.items.map((item) => ({
    source: "faq",
    title: item.question,
    content: item.answer,
    modes: item.applicableModes ?? [],
    keywords: item.keywords ?? [],
    searchable: [
      item.question,
      item.answer,
      item.category,
      ...(item.keywords ?? []),
      ...(item.applicableModes ?? []),
    ].join(" "),
    sourceType: item.sourceType ?? "methodology",
    dataStatus: item.dataStatus ?? "demo",
    sourceLabel: item.category,
    disclaimer: item.disclaimer ?? factDisclaimer,
  }));
}

function createTemplateItems() {
  return (questionData.templates ?? []).map((template) => ({
    source: "template",
    title: template.sampleQuestion,
    content: `题型：${template.questionType}；主题：${template.subjectArea} / ${template.scenario}；答题结构：${template.answerStructure.join(" -> ")}；可用理论：${template.usefulTheories.join("、")}。`,
    modes: template.applicableModes ?? ["question"],
    keywords: template.keywords ?? [],
    searchable: [
      template.sampleQuestion,
      template.questionType,
      template.subjectArea,
      template.scenario,
      ...(template.usefulTheories ?? []),
      ...(template.keywords ?? []),
    ].join(" "),
    sourceType: template.sourceType ?? "methodology",
    dataStatus: template.dataStatus ?? "demo",
    sourceLabel: "经管类与数字营销题型模板库",
    disclaimer: template.disclaimer ?? questionData.disclaimer,
  }));
}

function createPromptItems() {
  return promptKnowledge.map((item) => ({
    source: "prompt",
    title: item.title,
    content: item.content,
    modes: [toServerMode(item.mode)],
    keywords: item.keywords ?? [],
    searchable: [item.title, item.content, ...(item.keywords ?? [])].join(" "),
    sourceType: item.sourceType ?? "methodology",
    dataStatus: item.dataStatus ?? "demo",
    sourceLabel: "研途智伴 Agent 回答规则",
    disclaimer: factDisclaimer,
  }));
}

function createIndex() {
  return [
    ...createSchoolItems(),
    ...createFaqItems(),
    ...createTemplateItems(),
    ...createPromptItems(),
  ];
}

export function retrieveKnowledge(message, mode = "school") {
  const query = String(message ?? "").trim();
  const serverMode = toServerMode(normalizeChatMode(mode));

  if (!query) {
    return [];
  }

  return createIndex()
    .map((entry) => ({
      ...entry,
      score: scoreEntry(entry, query, serverMode),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        sourceLabels[left.source].localeCompare(sourceLabels[right.source], "zh-CN") ||
        left.title.localeCompare(right.title, "zh-CN"),
    )
    .slice(0, 5)
    .map(
      ({
        source,
        title,
        content,
        score,
        sourceType,
        dataStatus,
        disclaimer,
        sourceLabel,
        sourceUrl,
      }) => ({
        source,
        title,
        content,
        score,
        sourceType,
        dataStatus,
        disclaimer,
        sourceLabel,
        sourceUrl,
      }),
    );
}
