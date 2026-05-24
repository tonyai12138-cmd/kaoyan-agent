import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import PlanCard from "../components/PlanCard";
import { useDemo } from "../lib/demoState";
import { createStudyPlan } from "../lib/mockAgent";

const exampleModules = [
  "今日任务将按科目和时长拆解",
  "本周计划会给出每日主题与复盘重点",
  "阶段重点和时间分配将随画像变化",
];

function EmptyPlan() {
  return (
    <main className="page-shell py-12 md:py-16">
      <section className="plan-empty-state mx-auto max-w-5xl p-7 md:p-11">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <span className="plan-status-pill">示例 · 未生成个人计划</span>
            <p className="section-kicker mt-7">AI STUDY PLANNER · STEP 03</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              你的 AI 备考计划
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              你还没有完成考研画像诊断。填写画像并获得定位策略后，才能生成更准确的个性化计划。
            </p>
            <Link className="button-primary mt-8" to="/diagnosis">
              先完成画像诊断
            </Link>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-bold text-slate-950">示例计划将包含</p>
            <div className="mt-5 space-y-3">
              {exampleModules.map((item, index) => (
                <p className="plan-preview-item" key={item}>
                  <span className="profile-section-number">{index + 1}</span>
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-5 text-xs leading-6 text-slate-500">
              当前仅展示结构预览，不代表你的任务安排或时间分配。
            </p>
          </div>
        </div>
      </section>
      <div className="mx-auto mt-8 max-w-5xl">
        <DisclaimerBanner />
      </div>
    </main>
  );
}

export default function Plan() {
  const {
    profile,
    selectedSchoolId,
    strategySelectionSource,
    tasks,
    toggleTask,
  } = useDemo();
  const plan = createStudyPlan(
    profile,
    selectedSchoolId,
    strategySelectionSource,
  );

  if (plan.status === "incomplete") {
    return <EmptyPlan />;
  }

  const completed = tasks.filter((task) => task.completed).length;
  const ratio = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <main className="page-shell pb-20 pt-10 md:pb-24 md:pt-14">
      <section className="plan-hero p-7 md:p-10">
        <span className="plan-status-pill">AI GENERATED PLAN · 个性化拆解完成</span>
        <div className="mt-7 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="section-kicker">STEP 03 / STUDY PLANNER</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              你的 AI 备考计划
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              基于你的考研画像、定位报告和当前阶段，将目标拆解为今日任务、本周安排和阶段重点。
            </p>
          </div>
          <Link className="button-secondary" to="/report">
            返回定位报告
          </Link>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <article className="plan-metric-card">
            <p className="text-xs font-semibold text-slate-500">当前备考阶段</p>
            <p className="mt-3 text-xl font-bold text-slate-950">{plan.stage}</p>
            <p className="mt-2 text-xs text-slate-500">{plan.countdownLabel}</p>
          </article>
          <article className="plan-metric-card">
            <p className="text-xs font-semibold text-slate-500">当前策略档位</p>
            <p className="mt-3 text-xl font-bold text-slate-950">{plan.strategyLabel}</p>
            <span className="badge mt-3">{plan.strategySourceLabel}</span>
          </article>
          <article className="plan-metric-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">今日任务完成率</p>
              <p className="text-xl font-bold text-indigo-600">{ratio}%</p>
            </div>
            <div className="progress-track mt-4">
              <div className="progress-value" style={{ width: `${ratio}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              已完成 {completed}/{tasks.length} 项任务
            </p>
          </article>
        </div>
        <div className="plan-reminder mt-6">
          <span className="agent-orb">AI</span>
          <div>
            <p className="text-sm font-bold text-slate-950">阶段提醒</p>
            <p className="mt-1 text-sm leading-7 text-slate-600">{plan.stageReminder}</p>
          </div>
        </div>
      </section>

      <section className="surface-card mt-8 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">TODAY TASKS</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">今日任务</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              每项任务都标注模块、建议时长与执行目的，完成后进度将同步到每日复盘。
            </p>
          </div>
          <span className="badge">{tasks.length} 项可执行任务</span>
        </div>
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <PlanCard key={task.id} onToggle={toggleTask} task={task} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="section-kicker">WEEKLY ROADMAP</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">本周计划</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          用每日主题保持节奏清晰，每天只聚焦少量核心动作和一个复盘问题。
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plan.weeklyPlan.map((day) => (
            <article className="plan-week-card" key={day.day}>
              <div className="flex items-center justify-between gap-3">
                <span className="plan-day-pill">{day.day}</span>
                <p className="text-sm font-bold text-slate-950">{day.theme}</p>
              </div>
              <ul className="mt-5 space-y-2">
                {day.tasks.map((task) => (
                  <li className="check-item" key={task}>{task}</li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-indigo-50/70 p-3 text-xs leading-6 text-indigo-700">
                复盘：{day.review}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <article className="surface-card p-6 md:p-8">
          <p className="section-kicker">STAGE FOCUS</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">阶段重点</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            当前处于{plan.stage}，优先将精力放在这些方向。
          </p>
          <div className="mt-6 space-y-3">
            {plan.stageFocus.map((focus, index) => (
              <p className="plan-focus-item" key={focus}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {focus}
              </p>
            ))}
          </div>
        </article>

        <article className="surface-card p-6 md:p-8">
          <p className="section-kicker">TIME ALLOCATION</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">科目时间分配</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            建议比例随基础、跨考情况与剩余时间变化，用于规划本周可用时长。
          </p>
          <div className="mt-7 space-y-5">
            {plan.timeAllocation.map((item) => (
              <div key={item.subject}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{item.percentage}%</span>
                </div>
                <div className="progress-track mt-3">
                  <div className="progress-value" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="surface-card mt-10 grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_350px]">
        <div>
          <p className="section-kicker">DAILY REVIEW</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">每日复盘模板</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            复盘不是追加任务，而是帮助下一天变得更清楚、更可执行。
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {plan.reviewTemplate.map((prompt, index) => (
              <p className="review-prompt" key={prompt}>
                <span>{index + 1}</span>
                {prompt}
              </p>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-indigo-100 bg-indigo-50/55 p-6">
          <p className="text-sm font-bold text-indigo-800">下一步动作</p>
          <p className="mt-3 text-sm leading-7 text-indigo-700">
            勾选今日任务后进入复盘，Agent 将根据真实完成率与状态给出次日调整建议。
          </p>
          <div className="mt-6 grid gap-3">
            <Link className="button-primary text-center" to="/review">
              进入每日复盘
            </Link>
            <Link className="button-secondary text-center" to="/chat">
              进入智能问答
            </Link>
            <Link className="button-secondary text-center" to="/report">
              返回定位报告
            </Link>
          </div>
        </aside>
      </section>

      <div className="mt-8">
        <DisclaimerBanner />
      </div>
    </main>
  );
}
