import faqData from "../data/faq.json";
import questionData from "../data/questionTemplates.json";
import schoolsData from "../data/schools.json";
import {
  commonDisclaimer,
  normalizeChatMode,
  promptKnowledge,
} from "../data/prompts";

const strategyKeywords = {
  "east-business": ["冲刺", "挑战", "目标"],
  "south-finance": ["稳妥", "匹配", "适合"],
  "river-commerce": ["保底", "备选", "控制风险"],
};

function createIndex() {
  const faqItems = faqData.items.map((item) => ({
    source: "faq",
    title: item.question,
    content: item.answer,
    modes: item.modes ?? [],
    keywords: item.keywords ?? [],
    sourceLabel: item.sourceLabel,
    sourceUrl: item.sourceUrl,
    disclaimer: item.disclaimer ?? commonDisclaimer,
  }));

  const schoolItems = schoolsData.schools.map((school) => ({
    source: "school",
    title: `演示策略样例：${school.tag}`,
    content:
      "该条目仅用于说明策略档位的产品交互，不代表真实学校、分数、招生名额或录取结论。",
    modes: ["school"],
    keywords: strategyKeywords[school.id] ?? ["择校", "目标"],
    disclaimer: commonDisclaimer,
  }));

  const templateItems = questionData.modes.flatMap((group) =>
    group.templates.map((template) => ({
      source: "template",
      title: template.message,
      content: `可在“${group.label}”模式继续追问：${template.message}`,
      modes: [group.id],
      keywords: template.keywords ?? [],
      disclaimer: commonDisclaimer,
    })),
  );

  const promptItems = promptKnowledge.map((item) => ({
    source: "prompt",
    title: item.title,
    content: item.content,
    modes: [item.mode],
    keywords: item.keywords ?? [],
    disclaimer: commonDisclaimer,
  }));

  return [...faqItems, ...schoolItems, ...templateItems, ...promptItems];
}

function scoreEntry(entry, query, mode) {
  const matchingKeywords = entry.keywords.filter((keyword) =>
    query.includes(keyword.toLowerCase()),
  );

  if (matchingKeywords.length === 0) {
    return 0;
  }

  const modeBonus = entry.modes.includes(mode) ? 1 : 0;
  return Math.min(5, matchingKeywords.length * 2 + modeBonus);
}

export function retrieveKnowledge(message, mode = "school") {
  const query = String(message ?? "").trim().toLowerCase();
  const normalizedMode = normalizeChatMode(mode);

  if (!query) {
    return [];
  }

  return createIndex()
    .map((entry) => ({
      ...entry,
      score: scoreEntry(entry, query, normalizedMode),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "zh-CN"))
    .slice(0, 5)
    .map(
      ({
        source,
        title,
        content,
        score,
        disclaimer,
        sourceLabel,
        sourceUrl,
      }) => ({
        source,
        title,
        content,
        score,
        disclaimer,
        sourceLabel,
        sourceUrl,
      }),
    );
}
