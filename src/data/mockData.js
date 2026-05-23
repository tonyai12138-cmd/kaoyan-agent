export const demoDisclaimer =
  "演示数据，正式信息以研招网和目标院校官网为准";

export const featureCards = [
  {
    title: "画像诊断",
    description: "梳理基础、时间与风险偏好，明确下一步方向。",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    title: "择校报告",
    description: "用结构化演示数据对比目标，清晰展示判断依据。",
    accent: "from-indigo-400 to-violet-500",
  },
  {
    title: "动态计划",
    description: "将长期目标变为今天可以完成的学习任务。",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    title: "智能问答",
    description: "通过本地 mock 回答体验未来知识库交互方式。",
    accent: "from-sky-400 to-indigo-500",
  },
];

export const journeySteps = [
  "填写个人画像",
  "生成择校报告",
  "选择目标方向",
  "执行备考计划",
  "每日复盘调整",
];

export const dashboardStats = [
  { label: "目标阶段", value: "基础巩固期" },
  { label: "今日建议时长", value: "3.5 小时" },
  { label: "演示任务", value: "4 项" },
];

export const phases = [
  { title: "基础期", period: "5 - 7 月", focus: "教材框架与英语习惯" },
  { title: "强化期", period: "8 - 9 月", focus: "重点章节与专题训练" },
  { title: "真题期", period: "10 - 11 月", focus: "限时答题与复盘" },
  { title: "冲刺期", period: "12 月", focus: "错题回顾与状态调整" },
];

export const moodOptions = ["平稳", "有动力", "焦虑", "疲惫", "挫败"];

export const demoProfile = {
  major: "市场营销",
  region: "华东地区",
  degreePreference: "学硕优先",
  englishLevel: "中等",
  mathLevel: "基础待强化",
  weeklyHours: "24",
  riskPreference: "均衡选择",
};

export function buildTasks(schoolId) {
  const subject =
    schoolId === "river-commerce" ? "营销案例分析" : "管理学综合";

  return [
    {
      id: "task-1",
      title: "英语阅读精练与生词整理",
      subject: "英语",
      duration: "60 分钟",
      priority: "高",
      completed: false,
    },
    {
      id: "task-2",
      title: "核心章节知识图谱梳理",
      subject,
      duration: "90 分钟",
      priority: "高",
      completed: false,
    },
    {
      id: "task-3",
      title: "数学基础例题复盘",
      subject: "数学/综合能力",
      duration: "45 分钟",
      priority: "中",
      completed: false,
    },
    {
      id: "task-4",
      title: "记录今日卡点与明日安排",
      subject: "复盘",
      duration: "15 分钟",
      priority: "中",
      completed: false,
    },
  ];
}
