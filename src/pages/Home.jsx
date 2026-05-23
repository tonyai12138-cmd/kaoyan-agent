import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FeatureCard from "../components/FeatureCard";
import { dashboardStats, featureCards, journeySteps } from "../data/mockData";

export default function Home() {
  return (
    <main>
      <section className="page-shell grid gap-10 pb-16 pt-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:pt-20">
        <div>
          <p className="section-kicker">SMART EXAM COMPANION</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            让考研目标
            <span className="gradient-text">从焦虑变成路径</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            面向经管类与市场营销相关学生的一站式智能备考体验平台。
            从画像诊断、目标比较到每日复盘，让每一步有依据、可执行。
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link className="button-primary" to="/diagnosis">
              开始画像诊断
            </Link>
            <Link className="button-secondary" to="/chat">
              体验智能问答
            </Link>
          </div>
          <div className="mt-8 max-w-xl">
            <DisclaimerBanner />
          </div>
        </div>
        <div className="relative">
          <div className="hero-glow" />
          <div className="surface-card relative p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">小研的备考工作台</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  今日行动建议
                </p>
              </div>
              <span className="badge badge-success">演示模式</span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {dashboardStats.map((item) => (
                <div className="stat-card" key={item.label}>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-2 font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-3">
              {["英语阅读训练", "管理学章节梳理", "每日复盘记录"].map(
                (task, index) => (
                  <div className="task-preview" key={task}>
                    <span className={`task-check ${index === 0 ? "task-check-active" : ""}`} />
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {task}
                    </span>
                    <span className="text-xs text-slate-400">
                      {index === 0 ? "已完成" : "待开始"}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell py-14">
        <div className="max-w-2xl">
          <p className="section-kicker">CORE FEATURES</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-950">
            一条能完整演示的备考主链路
          </h2>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
      <section className="page-shell py-14">
        <div className="surface-card p-7 md:p-10">
          <div className="grid gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="section-kicker">JOURNEY</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-950">
                从选择到执行
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                首版将最影响体验的五个动作串联起来，适合课堂中直接演示完整流程。
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-5">
              {journeySteps.map((step, index) => (
                <li className="journey-step" key={step}>
                  <span className="step-number">{index + 1}</span>
                  <span className="mt-3 block text-sm font-medium text-slate-700">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
