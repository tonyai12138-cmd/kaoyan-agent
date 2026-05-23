import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FeatureCard from "../components/FeatureCard";
import { dashboardStats } from "../data/mockData";

const coreValues = [
  {
    label: "信息整合",
    icon: "汇",
    description:
      "把分散在研招网、院校官网、经验帖和备考资料中的信息集中整理，减少检索和比对成本。",
  },
  {
    label: "行动规划",
    icon: "策",
    description:
      "把“我很焦虑”转化成今日任务、本周任务和阶段计划，让备考从想法落到行动。",
  },
  {
    label: "长期陪伴",
    icon: "伴",
    description:
      "从决定考研到考研当天，持续支持复盘、调整和冲刺，帮助学生维持备考节奏。",
  },
];

const productModules = [
  {
    number: "01",
    title: "考研画像诊断",
    description: "识别专业基础、学习时间与目标偏好，形成个人备考起点。",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    number: "02",
    title: "择校定位报告",
    description: "结构化比较演示目标，展示适配依据、风险提示与查证入口。",
    accent: "from-indigo-400 to-violet-500",
  },
  {
    number: "03",
    title: "备考计划生成",
    description: "将阶段目标拆解为今日行动，支持任务完成率和复盘联动。",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    number: "04",
    title: "知识库问答",
    description: "围绕流程与资料问题即时答疑，回答中同步呈现信息边界。",
    accent: "from-sky-400 to-cyan-500",
  },
  {
    number: "05",
    title: "真题拆解",
    description: "按题型与能力维度组织分析路径，为后续能力升级预留空间。",
    accent: "from-violet-400 to-fuchsia-500",
  },
  {
    number: "06",
    title: "每日复盘",
    description: "记录任务、状态和卡点，输出次日三项以内行动建议。",
    accent: "from-emerald-400 to-teal-500",
  },
];

const examJourney = [
  { title: "决定考研", detail: "梳理诉求" },
  { title: "填写画像", detail: "诊断基础" },
  { title: "生成报告", detail: "定位目标" },
  { title: "制定计划", detail: "拆解行动" },
  { title: "每日复盘", detail: "动态调整" },
  { title: "考前冲刺", detail: "稳定节奏" },
];

const boundaryRules = [
  "不编造院校数据",
  "不承诺上岸",
  "正式信息以研招网和目标院校官网为准",
  "情绪陪伴不替代专业心理咨询",
  "不上传或传播盗版资料",
];

const todayTasks = [
  { title: "英语阅读训练", status: "已完成" },
  { title: "目标院校信息核验", status: "进行中" },
  { title: "专业课框架整理", status: "待开始" },
];

export default function Home() {
  return (
    <main>
      <section className="page-shell home-hero grid gap-12 pb-16 pt-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:pb-24 lg:pt-18">
        <div>
          <p className="hero-pill">AI AGENT · 一站式考研全过程服务</p>
          <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.1rem]">
            <span className="block lg:whitespace-nowrap">
              从决定考研到走进考场，
            </span>
            <span className="gradient-text mt-2">
              <span className="block">一个 Agent 陪你完成</span>
              <span className="block">全过程备考</span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            不用东找西找，一站式完成择校定位、备考规划、资料问答、真题拆解、每日复盘与考前冲刺陪伴。
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link className="button-primary px-7 py-3.5" to="/diagnosis">
              开始考研诊断
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
            <Link className="button-secondary px-7 py-3.5" to="/chat">
              进入智能问答
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-slate-500">
            <span className="hero-tag">经管类专业优先</span>
            <span className="hero-tag">全流程可演示</span>
            <span className="hero-tag">本地 Mock 体验</span>
          </div>
          <div className="mt-7 max-w-2xl">
            <DisclaimerBanner />
          </div>
        </div>

        <div className="relative lg:pl-5">
          <div className="hero-glow" />
          <div className="hero-console surface-card relative overflow-hidden p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <span className="agent-orb">AI</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    研途智伴 Agent
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-emerald-600">
                    <span className="pulse-dot" />
                    正在陪伴你的备考路径
                  </p>
                </div>
              </div>
              <span className="badge">DEMO</span>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-100">
              <p className="text-xs font-medium text-indigo-100">
                一站式路径已生成
              </p>
              <p className="mt-2 text-xl font-bold">从定位到执行，共 6 个节点</p>
              <div className="mt-5 flex items-center gap-1.5">
                {examJourney.map((step, index) => (
                  <span
                    className={`h-1.5 flex-1 rounded-full ${
                      index < 3 ? "bg-white" : "bg-white/30"
                    }`}
                    key={step.title}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-indigo-100">当前：制定计划阶段</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {dashboardStats.map((item) => (
                <div className="stat-card" key={item.label}>
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">今日行动建议</p>
                <span className="text-xs font-medium text-indigo-600">查看计划</span>
              </div>
              <div className="space-y-2.5">
                {todayTasks.map((task, index) => (
                  <div className="task-preview bg-white p-3" key={task.title}>
                    <span
                      className={`task-check ${
                        index === 0 ? "task-check-active" : ""
                      }`}
                    />
                    <span className="flex-1 text-xs font-medium text-slate-700 sm:text-sm">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-slate-400">{task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="text-center">
          <p className="section-kicker">WHY YANTU AGENT</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-slate-950 sm:text-4xl">
            把复杂的备考决策，变成持续可执行的路线
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            面向信息筛选困难、择校焦虑和计划容易失控的学生，将信息、行动与陪伴放进同一个工作台。
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {coreValues.map((value) => (
            <article className="value-card" key={value.label}>
              <span className="value-icon">{value.icon}</span>
              <h3 className="mt-6 text-xl font-bold text-slate-950">{value.label}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">CORE MODULES</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
              六大核心模块，覆盖备考全过程
            </h2>
          </div>
          <Link className="text-sm font-semibold text-indigo-600" to="/diagnosis">
            从画像诊断开始体验 →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {productModules.map((module) => (
            <FeatureCard key={module.title} {...module} />
          ))}
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="surface-card overflow-hidden p-7 md:p-10">
          <div className="max-w-3xl">
            <p className="section-kicker">FULL JOURNEY</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
              从决定考研，到考前冲刺的完整服务链路
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              不只是回答一次问题，而是在每一个关键阶段提供下一步入口。
            </p>
          </div>
          <ol className="journey-flow mt-10">
            {examJourney.map((step, index) => (
              <li className="journey-flow-card" key={step.title}>
                <div className="flex items-center gap-3">
                  <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="hidden text-indigo-300 lg:block" aria-hidden="true">
                    {index < examJourney.length - 1 ? "→" : ""}
                  </span>
                </div>
                <p className="mt-5 text-base font-bold text-slate-900">{step.title}</p>
                <p className="mt-2 text-xs text-slate-500">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-shell pb-20 pt-12 lg:pb-24 lg:pt-16">
        <div className="boundary-panel grid gap-8 p-7 md:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="section-kicker">TRUST & BOUNDARIES</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950">
              智能陪伴有温度，
              <span className="gradient-text mt-1">产品边界要清晰</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              研途智伴 Agent 提供信息整理与行动支持，不替代正式招生信息查询或专业服务。
            </p>
            <Link className="button-secondary mt-7" to="/about">
              查看项目说明
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {boundaryRules.map((rule, index) => (
              <li
                className={`boundary-rule ${index === 2 ? "sm:col-span-2" : ""}`}
                key={rule}
              >
                <span className="boundary-check">✓</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
