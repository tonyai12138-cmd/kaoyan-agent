export const agentBoundaries = [
  "不编造院校数据，涉及招生与考试信息必须提示用户核验官方来源。",
  "不承诺上岸或提供录取保证。",
  "正式信息以研招网和目标院校官网为准。",
  "情绪陪伴不替代专业心理咨询。",
  "不上传或传播盗版资料。",
  "当前为课程展示用 mock 演示版。",
];

export const chatModes = [
  {
    id: "school",
    label: "择校咨询",
    description: "判断目标方向、风险与三档策略。",
    placeholder: "例如：我现在适合冲刺还是稳妥？",
  },
  {
    id: "plan",
    label: "计划解释",
    description: "解释今日任务、本周计划和阶段重点。",
    placeholder: "例如：今天任务太多了，怎么压缩？",
  },
  {
    id: "exam",
    label: "真题拆解",
    description: "拆解专业课论述题、案例题和营销策划题。",
    placeholder: "例如：请拆解一道数字营销案例分析题。",
  },
  {
    id: "verify",
    label: "资料核验",
    description: "提醒核验研招网、院校官网和资料来源。",
    placeholder: "例如：参考书到底以哪里为准？",
  },
  {
    id: "support",
    label: "情绪陪伴",
    description: "提供一般支持和复盘建议，不替代心理咨询。",
    placeholder: "例如：今天计划没完成，怎么调整？",
  },
];

export const promptKnowledge = [
  {
    id: "strategy-rule",
    mode: "school",
    title: "三档策略判断原则",
    keywords: ["冲刺", "稳妥", "保底", "跨考", "适合"],
    content: "择校建议应结合用户基础、剩余时间和核验过的考试要求形成三档策略，不输出录取结论。",
  },
  {
    id: "planning-rule",
    mode: "plan",
    title: "计划解释原则",
    keywords: ["计划", "任务", "数学", "本周", "压缩"],
    content: "先说明当前阶段任务目的，再将当天安排压缩为能执行、能复盘的具体动作。",
  },
  {
    id: "exam-framework",
    mode: "exam",
    title: "论述与案例题框架",
    keywords: ["分析", "论述", "简答", "案例", "真题", "作答"],
    content: "先界定概念，再说明机制，结合案例给出策略建议，最后补充限制和评价。",
  },
  {
    id: "source-boundary",
    mode: "verify",
    title: "正式信息核验原则",
    keywords: ["资料", "来源", "官网", "核验", "参考书", "经验帖"],
    content: "院校、专业、考试科目、招生安排和参考资料必须回到研招网与目标院校官网核验。",
  },
  {
    id: "support-boundary",
    mode: "support",
    title: "情绪支持边界",
    keywords: ["焦虑", "压力", "失眠", "学不进去", "没完成", "复盘"],
    content: "可以先缩小今日任务；持续严重焦虑、失眠或自伤想法需要及时寻求专业支持。",
  },
];

export const fallbackReply =
  "这个问题暂未覆盖在演示知识库中。你可以换一个更具体的提问方式；正式招考信息请查阅研招网和目标院校官网。";
