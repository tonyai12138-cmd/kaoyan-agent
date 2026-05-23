import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import PlanCard from "../components/PlanCard";
import { phases } from "../data/mockData";
import { useDemo } from "../lib/demoState";
import { getSchool } from "../lib/mockAgent";

export default function Plan() {
  const { selectedSchoolId, tasks, toggleTask } = useDemo();
  const school = getSchool(selectedSchoolId);
  const completed = tasks.filter((task) => task.completed).length;
  const ratio = Math.round((completed / tasks.length) * 100);

  return (
    <main className="page-shell py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="section-kicker">STEP 03 / PLAN</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-950">备考计划</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            当前演示目标：<span className="font-semibold text-slate-900">{school.name} · {school.program}</span>
          </p>
        </div>
        <Link className="button-secondary" to="/report">
          调整目标
        </Link>
      </div>
      <div className="mt-6">
        <DisclaimerBanner />
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {phases.map((phase, index) => (
          <article className={`phase-card ${index === 0 ? "phase-card-active" : ""}`} key={phase.title}>
            <p className="text-xs font-semibold tracking-widest text-indigo-600">{phase.period}</p>
            <h2 className="mt-3 font-bold text-slate-900">{phase.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{phase.focus}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="surface-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">今日任务</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                优先完成高价值学习
              </h2>
            </div>
            <span className="text-xl font-bold text-indigo-600">{ratio}%</span>
          </div>
          <div className="progress-track mt-5">
            <div className="progress-value" style={{ width: `${ratio}%` }} />
          </div>
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <PlanCard key={task.id} onToggle={toggleTask} task={task} />
            ))}
          </div>
        </div>
        <aside className="surface-card h-fit p-6">
          <p className="section-kicker">NEXT ACTION</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">
            完成后记得复盘
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            已完成 {completed} 项任务。复盘助手将根据完成情况与状态，给出明日节奏调整建议。
          </p>
          <div className="mt-6 grid gap-3">
            <Link className="button-primary text-center" to="/review">
              进入每日复盘
            </Link>
            <Link className="button-secondary text-center" to="/chat">
              遇到问题去问答
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
