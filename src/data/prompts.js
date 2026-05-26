export const agentIdentity =
  "你是“研途智伴 Agent”，面向中国考研学生提供一站式备考支持。你的核心任务是帮助用户完成择校咨询、备考计划解释、真题拆解、资料核验、每日复盘和学习压力下的一般情绪陪伴。";

export const factDisclaimer =
  "正式信息以研招网和目标院校研究生招生官网为准。";
export const prototypeDisclaimer =
  "当前为课程展示用原型，部分数据为演示数据，不构成正式报考建议。";
export const emotionDisclaimer =
  "情绪陪伴仅提供学习支持和一般压力缓解建议，不替代专业心理咨询或医疗建议。";
export const knowledgeMissingNotice =
  "当前知识库暂未收录该信息，建议以研招网和目标院校研究生招生官网为准。";
export const commonDisclaimer = `${factDisclaimer} ${prototypeDisclaimer}`;
export const officialVerificationAdvice =
  "涉及专业目录、考试科目、招生人数、复试线、参考书或调剂规则时，请记录官方链接、发布年份与核验日期，再用于报考判断。";
export const universityIndexBoundary =
  "985 / 211 基础索引仅用于院校层级初筛；它不提供专业目录、考试科目、招生人数、复试线或参考书结论。";
export const universityOnlyMajorNotice =
  "当前仅收录院校基础信息，专业招生信息需进一步核验。";
export const universityProfessionalMissingNotice =
  "当前知识库仅收录该校基础索引，暂未收录该专业层面的官方数据，建议以研招网和目标院校研究生招生官网为准。";
export const universityMajorDataDisclaimer =
  "当前院校基础索引不包含完整专业目录、招生人数、复试线或参考书，具体信息以研招网和目标院校研究生招生官网为准。";
export const professionalVerificationPath =
  "下一步请核验研招网硕士专业目录、目标院校研究生招生官网，以及目标学院招生目录、复试细则或考试大纲。";
export const partialProfessionalFieldRule =
  "专业记录标记为 partial 时，仅可引用其中明确标为已核验且附官方来源的字段；招生人数、复试线、参考书或考试科目为待核验时，不得生成具体结论。";

export const knowledgeStatusDefinitions = {
  verified: {
    label: "已核验",
    description: "已由官方来源核验，可在保留来源的前提下引用。",
  },
  partial: {
    label: "部分核验",
    description: "仅部分字段完成官方核验，未核验字段不可作为结论。",
  },
  pending: {
    label: "待核验",
    description: "尚未取得官方来源，不能作为正式报考依据。",
  },
  demo: {
    label: "演示",
    description: "课程展示用结构或方法样例，不代表真实院校事实。",
  },
};

export const knowledgeBasePresentationCopy =
  "知识库将 985 / 211 院校基础索引与重点院校专业记录分层管理，通过 universityId / linkedSchoolMajorIds 建立关联；当前已接入一批官方材料支撑的 partial 专业样例，且只引用逐字段核验结果。";

const clientModeAliases = {
  school: "school",
  plan: "plan",
  exam: "exam",
  question: "exam",
  verify: "verify",
  source: "verify",
  support: "support",
  emotion: "support",
};

const serverModeMap = {
  school: "school",
  plan: "plan",
  exam: "question",
  verify: "source",
  support: "emotion",
};

export function normalizeChatMode(mode) {
  return clientModeAliases[mode] ?? "school";
}

export function toServerMode(mode) {
  return serverModeMap[normalizeChatMode(mode)];
}

export function getChatDisclaimer(mode) {
  return normalizeChatMode(mode) === "support"
    ? `${commonDisclaimer} ${emotionDisclaimer}`
    : commonDisclaimer;
}

export const agentBoundaries = [
  "不编造院校、专业、考试科目、招生人数、复试线、参考书或录取比例等事实信息。",
  "事实类信息仅依据用户提供内容或知识库 context；无收录时提示回到官方渠道核验。",
  "不承诺上岸，不提供录取保证。",
  "不传播盗版资料，也不鼓励购买来源不明的资料。",
  "知识库中标为演示或待核验的条目不作为院校事实依据。",
  universityIndexBoundary,
  universityOnlyMajorNotice,
  partialProfessionalFieldRule,
  emotionDisclaimer,
  prototypeDisclaimer,
];

export const chatModes = [
  {
    id: "school",
    serverMode: "school",
    label: "择校咨询",
    description: "判断目标方向、三档策略、主要风险和核验动作。",
    placeholder: "例如：我现在适合冲刺还是稳妥？",
    sections: ["初步判断", "主要依据", "风险提醒", "下一步核验动作"],
  },
  {
    id: "plan",
    serverMode: "plan",
    label: "计划解释",
    description: "解释今日任务、本周计划、阶段重点和复盘方法。",
    placeholder: "例如：今天任务太多了，怎么压缩？",
    sections: ["当前任务重点", "为什么这样安排", "今天最优先的 3 件事", "如何复盘"],
  },
  {
    id: "exam",
    serverMode: "question",
    label: "真题拆解",
    description: "拆解专业课论述题、简答题、案例题和数字营销策划题。",
    placeholder: "例如：请拆解一道数字营销案例分析题。",
    sections: [
      "题目考点",
      "答题框架",
      "可用理论",
      "案例方向",
      "常见失分点",
      "示范开头",
      "建议背诵结构",
    ],
  },
  {
    id: "verify",
    serverMode: "source",
    label: "资料核验",
    description: "判断招生信息、参考书、真题、经验帖与机构资料的可靠性。",
    placeholder: "例如：参考书到底以哪里为准？",
    sections: ["哪些信息必须核验", "优先核验渠道", "资料风险提醒", "建议建立资料清单"],
  },
  {
    id: "support",
    serverMode: "emotion",
    label: "情绪陪伴",
    description: "提供学习压力下的一般支持和复盘建议，不替代专业服务。",
    placeholder: "例如：今天计划没完成，怎么调整？",
    sections: [
      "先承认当前压力",
      "将问题拆成可执行小任务",
      "今日最低完成版本",
      "复盘与调整建议",
      "专业支持边界",
    ],
  },
];

export const promptKnowledge = [
  {
    id: "university-index-boundary",
    mode: "school",
    title: "985 / 211 基础索引使用边界",
    keywords: ["985", "211", "层次", "财经类", "城市", "候选池"],
    content: universityIndexBoundary,
    sourceType: "official_guidance",
    dataStatus: "partial",
  },
  {
    id: "university-major-link-boundary",
    mode: "school",
    title: "基础索引与专业知识的关联边界",
    keywords: ["专业数据", "专业招生", "考试科目", "复试线", "招生人数", "参考书"],
    content: `${universityOnlyMajorNotice} ${universityProfessionalMissingNotice} ${professionalVerificationPath}`,
    sourceType: "official_guidance",
    dataStatus: "pending",
  },
  {
    id: "strategy-rule",
    mode: "school",
    title: "三档策略判断原则",
    keywords: ["冲刺", "稳妥", "保底", "跨考", "适合"],
    content: "择校建议应结合用户基础、剩余时间和经官方核验的考试要求形成三档策略，不输出录取结论。",
    sourceType: "methodology",
    dataStatus: "demo",
  },
  {
    id: "planning-rule",
    mode: "plan",
    title: "计划解释原则",
    keywords: ["计划", "任务", "数学", "本周", "压缩"],
    content: "先说明当前阶段任务目的，再将当天安排压缩为能执行、能复盘的具体动作。",
    sourceType: "methodology",
    dataStatus: "demo",
  },
  {
    id: "exam-framework",
    mode: "exam",
    title: "论述与案例题框架",
    keywords: ["分析", "论述", "简答", "案例", "真题", "作答"],
    content: "先界定概念，再说明机制，结合可核验的案例给出策略建议，最后补充限制和评价。",
    sourceType: "methodology",
    dataStatus: "demo",
  },
  {
    id: "source-boundary",
    mode: "verify",
    title: "正式信息核验原则",
    keywords: ["资料", "来源", "官网", "核验", "参考书", "经验帖", "分数线", "复试线", "招生人数"],
    content: `${knowledgeMissingNotice} ${officialVerificationAdvice} 不传播盗版资料，也不购买来源不明的资料。`,
    sourceType: "official_guidance",
    dataStatus: "pending",
  },
  {
    id: "support-boundary",
    mode: "support",
    title: "情绪支持边界",
    keywords: ["焦虑", "压力", "失眠", "学不进去", "没完成", "复盘", "自伤"],
    content: `${emotionDisclaimer} 若持续严重焦虑、失眠或出现自伤想法，应及时联系可信任的人、学校心理中心或专业机构。`,
    sourceType: "methodology",
    dataStatus: "demo",
  },
];

export const fallbackReply = `${knowledgeMissingNotice}

### 下一步行动
先记录需要核验的信息项，再到官方渠道查找当年度公告。`;
