import faqData from "../data/faq.json";
import questionData from "../data/questionTemplates.json";
import schoolsData from "../data/schools.json";
import universitiesData from "../data/universities.json";
import {
  factDisclaimer,
  knowledgeStatusDefinitions,
  normalizeChatMode,
  promptKnowledge,
  queryIntentDefinitions,
  ragLexicon,
  schoolAliasMap,
  toServerMode,
} from "../data/prompts";
import {
  buildUniversityMajorSummary,
  expandSchoolAliases,
  findMajorKnowledgeByUniversity,
  findUniversityBySchoolName,
  getUniversityMajorStatus,
} from "./knowledgeLinks";

const sourceLabels = {
  university: "院校基础索引",
  faq: "方法 FAQ",
  school: "专业层级数据",
  template: "答题模板",
  prompt: "规则提示",
};

const allowedSourcesByIntent = {
  university_level: ["university", "prompt", "faq"],
  major_level: ["school", "university", "prompt"],
  method_faq: ["faq", "prompt"],
  question_analysis: ["template", "faq", "prompt"],
  source_verification: ["faq", "prompt", "school"],
  emotional_support: ["faq", "prompt"],
};

const sourceBoostByIntent = {
  university_level: { university: 34, prompt: 6, faq: 4 },
  major_level: { school: 38, prompt: 6, university: 4 },
  method_faq: { faq: 30, prompt: 8 },
  question_analysis: { template: 36, faq: 5, prompt: 6 },
  source_verification: { faq: 30, prompt: 27, school: 7 },
  emotional_support: { faq: 30, prompt: 28 },
};

const modeSourceBoost = {
  school: { university: 5, school: 5, faq: 2 },
  plan: { faq: 5, prompt: 5 },
  question: { template: 14, prompt: 4 },
  source: { faq: 12, prompt: 12, school: 2 },
  emotion: { faq: 12, prompt: 12 },
};

const statusBoost = {
  verified: 5,
  partial: 4,
  pending: 1,
  demo: 0,
};

const relevantPromptIdsByIntent = {
  university_level: ["university-index-boundary"],
  major_level: ["university-major-link-boundary", "source-boundary"],
  method_faq: ["planning-rule"],
  question_analysis: ["exam-framework"],
  source_verification: ["source-boundary", "university-major-link-boundary"],
  emotional_support: ["support-boundary"],
};

const fieldPatterns = {
  examSubjects: /考什么|初试|考试科目|科目/u,
  plannedEnrollment: /招生人数|招生名额|招生计划|计划数/u,
  recommendedExemption: /推免|推荐免试/u,
  scoreLines: /复试线|分数线|历年线/u,
  referenceBooks: /参考书|书目|教材/u,
  examOutline: /考试大纲|大纲/u,
  reExamSubjects: /复试科目|复试考什么/u,
  mathRequired: /是否考数学|考数学|数学/u,
};

function normalizeText(value) {
  return String(value ?? "").toLowerCase().replace(/\s+/gu, "");
}

function statusLabel(status) {
  return knowledgeStatusDefinitions[status]?.label ?? "待核验";
}

function containsAny(query, terms) {
  const normalizedQuery = normalizeText(query);
  return terms.some((term) => normalizedQuery.includes(normalizeText(term)));
}

function countMatches(query, terms) {
  const normalizedQuery = normalizeText(query);
  return terms.reduce(
    (score, term) => score + (normalizedQuery.includes(normalizeText(term)) ? 1 : 0),
    0,
  );
}

function namedAlias(message, schoolName) {
  if (String(message ?? "").includes(schoolName)) {
    return undefined;
  }

  return (schoolAliasMap[schoolName] ?? []).find((alias) =>
    String(message ?? "").includes(alias),
  );
}

function isCitableProfessionalField(field) {
  return (
    field &&
    ["verified", "partial"].includes(field.status) &&
    Boolean(field.sourceUrl) &&
    !["暂未收录", "待核验", "官方暂未指定 / 暂未收录"].includes(field.value ?? field.name)
  );
}

function citableList(items, formatter) {
  return (items ?? [])
    .filter(isCitableProfessionalField)
    .map(formatter)
    .join("、");
}

function detectRequestedField(query) {
  return (
    Object.entries(fieldPatterns).find(([, pattern]) => pattern.test(query))?.[0] ??
    null
  );
}

function requestedFieldDetails(school, requestedField) {
  if (!requestedField) {
    return null;
  }

  const labels = {
    examSubjects: "初试科目",
    plannedEnrollment: "招生人数",
    recommendedExemption: "推免人数",
    scoreLines: "复试线",
    referenceBooks: "参考书",
    examOutline: "考试大纲",
    reExamSubjects: "复试科目",
    mathRequired: "数学要求",
  };
  let fields = [];

  if (requestedField === "mathRequired") {
    const confirmedSubjects = (school.examSubjects ?? []).filter(
      isCitableProfessionalField,
    );
    return {
      requestedField,
      requestedFieldLabel: labels[requestedField],
      requestedFieldStatus:
        confirmedSubjects.length && school.mathRequired !== "待核验"
          ? "available"
          : "pending",
    };
  }

  if (["examSubjects", "scoreLines", "referenceBooks", "reExamSubjects"].includes(requestedField)) {
    fields = school[requestedField] ?? [];
  } else {
    fields = [school[requestedField]];
  }

  return {
    requestedField,
    requestedFieldLabel: labels[requestedField],
    requestedFieldStatus: fields.some(isCitableProfessionalField)
      ? "available"
      : "pending",
  };
}

export function detectQueryIntent(message, mode = "school") {
  const query = expandSchoolAliases(message);
  const activeMode = toServerMode(normalizeChatMode(mode));
  const namedUniversity = findUniversityBySchoolName(query);
  const hasMajorCode = /\b(?:02|05|12)\w*\d\w*\b/iu.test(query);
  const directMajorFact =
    hasMajorCode ||
    (containsAny(query, ragLexicon.majorLevel) &&
      (Boolean(namedUniversity) ||
        /某校|某专业/u.test(query) ||
        containsAny(query, ragLexicon.managementMajors)));
  const verificationQuestion =
    containsAny(query, ragLexicon.sourceVerification) &&
    /以哪里为准|哪里看|哪里查|在哪里|如何判断|靠不靠谱|能不能信|核验|来源|官网|研招网/u.test(
      query,
    );

  if (containsAny(query, ragLexicon.emotionalSupport)) {
    return "emotional_support";
  }

  if (
    activeMode === "question" ||
    (containsAny(query, ragLexicon.questionAnalysis) &&
      /分析|论述|简答|案例|材料|框架|模型|如何影响|怎么写|拆解/u.test(query))
  ) {
    return "question_analysis";
  }

  if (
    directMajorFact &&
    !(/以哪里为准|哪里看|哪里查|在哪里查|靠不靠谱|能不能信/u.test(query))
  ) {
    return "major_level";
  }

  if (
    /985|211|双一流|院校层次|学校层次|属于什么层次/u.test(query) ||
    (Boolean(namedUniversity) && /是不是|层次/u.test(query)) ||
    (containsAny(query, ragLexicon.universityLevel) &&
      /哪些|有哪些|候选池|初筛/u.test(query))
  ) {
    return "university_level";
  }

  if (verificationQuestion || activeMode === "source") {
    return "source_verification";
  }

  if (containsAny(query, ragLexicon.methodFaq) || activeMode === "plan") {
    return "method_faq";
  }

  if (activeMode === "emotion") {
    return "emotional_support";
  }

  return "method_faq";
}

function queryTerms(query) {
  const dictionaries = Object.values(ragLexicon).flat();
  const terms = dictionaries.filter((term) =>
    normalizeText(query).includes(normalizeText(term)),
  );
  const codes = String(query).match(/[A-Za-z]*\d[A-Za-z0-9]*/gu) ?? [];
  const names = universitiesData.universities
    .map((university) => university.school)
    .filter((school) => String(query).includes(school));

  return [...new Set([...terms, ...codes, ...names])];
}

function fieldScore(values, query, terms, weight) {
  return (values ?? []).reduce((score, value) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
      return score;
    }

    let nextScore = score;
    if (normalizeText(query).includes(normalizedValue)) {
      nextScore += weight * 2;
    }
    terms.forEach((term) => {
      if (normalizedValue.includes(normalizeText(term))) {
        nextScore += weight;
      }
    });
    return nextScore;
  }, 0);
}

function scoreEntry(entry, query, terms, intent, mode, namedUniversity) {
  let lexicalScore = 0;

  Object.entries(entry.weightedFields).forEach(([weight, values]) => {
    lexicalScore += fieldScore(values, query, terms, Number(weight));
  });
  let score = lexicalScore;
  score += sourceBoostByIntent[intent]?.[entry.source] ?? 0;
  score += modeSourceBoost[mode]?.[entry.source] ?? 0;
  score += statusBoost[entry.dataStatus] ?? 0;

  if (entry.modes.includes(mode)) {
    score += 4;
  }

  if (
    entry.source === "school" &&
    namedUniversity &&
    entry.universityId === namedUniversity.id
  ) {
    score += 22;
    if (
      containsAny(query, entry.relatedAreas ?? []) ||
      normalizeText(query).includes(normalizeText(entry.major))
    ) {
      score += 18;
    }
  }

  if (
    entry.source === "university" &&
    namedUniversity &&
    entry.school === namedUniversity.school
  ) {
    score += 22;
  }

  return { lexicalScore, score };
}

function createUniversityItems() {
  return universitiesData.universities.map((university) => {
    const tierTags = [
      university.is985 ? "985" : null,
      university.is211 ? "211" : null,
    ].filter(Boolean);
    const status = university.dataStatus ?? "pending";
    const relatedMajors = findMajorKnowledgeByUniversity(university.id);
    const majorStatus = getUniversityMajorStatus(university);
    const candidatePreview = (university.candidateMajorAreas ?? [])
      .slice(0, 3)
      .map((candidate) => `${candidate.area}（${candidate.status}）`)
      .join("、");
    const content = [
      `学校：${university.school}；城市索引：${university.city}；层级标签：${tierTags.join(" / ") || "待核验"}`,
      `类型标签：${university.schoolType.join(" / ")}；数据状态：${status}（${statusLabel(status)}）`,
      `专业关联状态：${majorStatus.label}；候选核验方向：${candidatePreview || "待补充"}`,
      buildUniversityMajorSummary(university, relatedMajors),
    ].join("；");

    return {
      source: "university",
      title: university.school,
      school: university.school,
      province: university.province,
      city: university.city,
      schoolTypes: university.schoolType,
      is985: university.is985,
      is211: university.is211,
      hasMajorKnowledge: university.hasMajorKnowledge,
      majorDataStatus: university.majorDataStatus,
      content,
      modes: ["school", "source"],
      keywords: university.searchKeywords ?? [],
      weightedFields: {
        12: [university.school],
        8: [university.city, university.province],
        7: [
          university.is985 ? "985" : "非985",
          university.is211 ? "211" : "非211",
          university.isDoubleFirstClass,
          ...(university.schoolType ?? []),
          ...(university.relatedFields ?? []),
          ...(university.searchKeywords ?? []),
        ],
        2: [university.supervisingDepartment, university.notes],
      },
      sourceType: university.source?.sourceType ?? "pending",
      dataStatus: status,
      sourceLabel: university.source?.sourceName,
      sourceUrl: university.source?.sourceUrl,
      disclaimer: university.disclaimer ?? factDisclaimer,
    };
  });
}

function createSchoolItems(query) {
  const requestedField = detectRequestedField(query);

  return schoolsData.schools.map((school) => {
    const subjectNames = (school.examSubjects ?? [])
      .map((subject) => subject.subjectName)
      .join("、");
    const confirmedSubjects = citableList(
      school.examSubjects,
      (subject) => `${subject.subjectCode} ${subject.subjectName}`,
    );
    const confirmedScoreLines = citableList(
      school.scoreLines,
      (line) => `${line.year}年 ${line.value}`,
    );
    const confirmedBooks = citableList(
      school.referenceBooks,
      (book) => book.name,
    );
    const enrollment = isCitableProfessionalField(school.plannedEnrollment)
      ? school.plannedEnrollment.value
      : "暂未收录 / 待核验";
    const status = school.dataStatus ?? "pending";
    const professionalDataLevel = school.professionalDataLevel ?? status;
    const content = [
      `学校与专业：${school.school} / ${school.major}（${school.majorCode}）`,
      `数据状态：${status}（${statusLabel(status)}）；专业数据完整度：${professionalDataLevel}（${statusLabel(professionalDataLevel)}）`,
      `方向：${school.researchDirection}；学位类型：${school.degreeType}；数学要求：${school.mathRequired}`,
      `已核验初试科目：${confirmedSubjects || "暂未收录 / 待核验"}`,
      `已核验招生计划：${enrollment}；已核验复试线：${confirmedScoreLines || "暂未收录 / 待核验"}`,
      `已核验参考书：${confirmedBooks || "暂未收录 / 待核验"}`,
      professionalDataLevel === "partial"
        ? "该记录仅能引用以上已明确核验的字段；其余字段仍需到官方来源核验。"
        : "该条目为演示或待核验记录，不可作为报考事实结论。",
    ].join("；");

    return {
      source: "school",
      title: `${school.school} · ${school.major}`,
      school: school.school,
      major: school.major,
      relatedAreas: school.relatedAreas ?? [],
      universityId: school.universityId,
      universityTags: school.universityTags ?? [],
      professionalDataLevel,
      content,
      modes: ["school", "source"],
      keywords: school.keywords ?? [],
      weightedFields: {
        13: [school.school, school.major, school.majorCode],
        9: [
          school.college,
          subjectNames,
          ...(school.relatedAreas ?? []),
          ...(school.keywords ?? []),
        ],
        5: [school.region, school.city, school.degreeType, school.mathRequired],
        2: [school.source?.sourceName, school.notes],
      },
      sourceType: school.source?.sourceType ?? "pending",
      dataStatus: status,
      sourceLabel: school.source?.sourceName,
      sourceUrl: school.source?.sourceUrl,
      additionalSources: school.additionalSources ?? [],
      confirmedFields: {
        examSubjects: confirmedSubjects,
        plannedEnrollment: enrollment,
        scoreLines: confirmedScoreLines,
        referenceBooks: confirmedBooks,
      },
      ...requestedFieldDetails(school, requestedField),
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
    weightedFields: {
      12: [item.question],
      8: [...(item.keywords ?? []), item.category, ...(item.applicableModes ?? [])],
      3: [item.answer],
    },
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
    weightedFields: {
      12: [template.sampleQuestion, template.scenario, ...(template.keywords ?? [])],
      8: [template.questionType, template.subjectArea, ...(template.usefulTheories ?? [])],
      3: [...(template.commonMistakes ?? []), template.sampleOpening],
    },
    sourceType: template.sourceType ?? "methodology",
    dataStatus: template.dataStatus ?? "demo",
    sourceLabel: "经管类与数字营销题型模板库",
    disclaimer: template.disclaimer ?? questionData.disclaimer,
  }));
}

function createPromptItems() {
  return promptKnowledge.map((item) => ({
    id: item.id,
    source: "prompt",
    title: item.title,
    content: item.content,
    modes: [toServerMode(item.mode)],
    weightedFields: {
      10: [item.title, ...(item.keywords ?? [])],
      4: [item.content],
    },
    sourceType: item.sourceType ?? "methodology",
    dataStatus: item.dataStatus ?? "demo",
    sourceLabel: "研途智伴 Agent 回答规则",
    disclaimer: factDisclaimer,
  }));
}

function createIndex(query) {
  return [
    ...createUniversityItems(),
    ...createSchoolItems(query),
    ...createFaqItems(),
    ...createTemplateItems(),
    ...createPromptItems(),
  ];
}

function selectIntentCandidates(entries, intent, namedUniversity) {
  const allowedSources = allowedSourcesByIntent[intent] ?? Object.keys(sourceLabels);
  const allowed = entries.filter(
    (entry) =>
      allowedSources.includes(entry.source) &&
      (entry.source !== "prompt" ||
        relevantPromptIdsByIntent[intent]?.includes(entry.id)),
  );

  if (intent === "university_level") {
    const universityEntries = allowed.filter(
      (entry) => entry.source === "university" && entry.lexicalScore > 0,
    );
    return universityEntries.length ? universityEntries : allowed;
  }

  if (intent === "question_analysis") {
    const templateEntries = allowed.filter(
      (entry) => entry.source === "template" && entry.lexicalScore > 0,
    );
    return templateEntries.length ? templateEntries : allowed;
  }

  if (intent !== "major_level") {
    return allowed;
  }

  const schoolEntries = allowed.filter(
    (entry) =>
      entry.source === "school" &&
      (!namedUniversity || entry.universityId === namedUniversity.id) &&
      entry.score > 0,
  );

  if (schoolEntries.length) {
    if (namedUniversity) {
      const topicalEntries = schoolEntries.filter((entry) =>
        [entry.major, ...(entry.relatedAreas ?? [])].some((area) =>
          normalizeText(entry.query).includes(normalizeText(area)),
        ),
      );
      const relevantEntries = topicalEntries.length
        ? topicalEntries
        : schoolEntries;

      return [
        ...relevantEntries,
        ...allowed.filter((entry) => entry.source === "prompt"),
      ];
    }

    return allowed.filter(
      (entry) => entry.source === "school" || entry.source === "prompt",
    );
  }

  if (namedUniversity) {
    return allowed.filter(
      (entry) =>
        entry.source === "prompt" ||
        (entry.source === "university" && entry.school === namedUniversity.school),
    );
  }

  return allowed;
}

export function retrieveKnowledge(message, mode = "school") {
  const rawQuery = String(message ?? "").trim();

  if (!rawQuery) {
    return [];
  }

  const query = expandSchoolAliases(rawQuery);
  const serverMode = toServerMode(normalizeChatMode(mode));
  const queryIntent = detectQueryIntent(query, mode);
  const namedUniversity = findUniversityBySchoolName(query);
  const terms = queryTerms(query);
  const scored = createIndex(query).map((entry) => ({
    ...entry,
    query,
    ...scoreEntry(entry, query, terms, queryIntent, serverMode, namedUniversity),
  }));

  return selectIntentCandidates(scored, queryIntent, namedUniversity)
    .filter((entry) => entry.score > 0 && entry.lexicalScore > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        sourceLabels[left.source].localeCompare(sourceLabels[right.source], "zh-CN") ||
        left.title.localeCompare(right.title, "zh-CN"),
    )
    .slice(0, 5)
    .map((entry) => ({
      source: entry.source,
      title: entry.title,
      content: entry.content,
      score: entry.score,
      queryIntent,
      queryIntentLabel: queryIntentDefinitions[queryIntent]?.label,
      sourceType: entry.sourceType,
      dataStatus: entry.dataStatus,
      disclaimer: entry.disclaimer,
      sourceLabel: entry.sourceLabel,
      sourceUrl: entry.sourceUrl,
      school: entry.school,
      city: entry.city,
      is985: entry.is985,
      is211: entry.is211,
      hasMajorKnowledge: entry.hasMajorKnowledge,
      majorDataStatus: entry.majorDataStatus,
      major: entry.major,
      universityId: entry.universityId,
      universityTags: entry.universityTags,
      professionalDataLevel: entry.professionalDataLevel,
      confirmedFields: entry.confirmedFields,
      requestedField: entry.requestedField,
      requestedFieldLabel: entry.requestedFieldLabel,
      requestedFieldStatus: entry.requestedFieldStatus,
      additionalSources: entry.additionalSources,
      matchedAlias: entry.school ? namedAlias(rawQuery, entry.school) : undefined,
    }));
}
