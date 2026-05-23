import { useState } from "react";
import { moodOptions } from "../data/mockData";

export default function ReviewPanel({ completed, total, result, onSubmit }) {
  const [mood, setMood] = useState("平稳");
  const [challenge, setChallenge] = useState("");
  const [tomorrowMinutes, setTomorrowMinutes] = useState("180");
  const ratio = Math.round((completed / total) * 100);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ mood, challenge, tomorrowMinutes });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <form className="surface-card space-y-6 p-6 md:p-8" onSubmit={handleSubmit}>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-500">今日完成情况</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {completed}/{total} 项
              </p>
            </div>
            <span className="text-2xl font-bold text-indigo-600">{ratio}%</span>
          </div>
          <div className="progress-track mt-4">
            <div className="progress-value" style={{ width: `${ratio}%` }} />
          </div>
        </div>
        <fieldset>
          <legend className="field-label mb-3">今天的状态</legend>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <label
                className={`pill-select ${mood === option ? "pill-select-active" : ""}`}
                key={option}
              >
                <input
                  checked={mood === option}
                  className="sr-only"
                  name="mood"
                  onChange={() => setMood(option)}
                  type="radio"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field-label">
          今天最大的卡点
          <textarea
            className="field-input min-h-28 resize-none"
            onChange={(event) => setChallenge(event.target.value)}
            placeholder="例如：专业课章节理解比较慢，容易分心..."
            value={challenge}
          />
        </label>
        <label className="field-label">
          明日可用时间（分钟）
          <input
            className="field-input"
            min="30"
            onChange={(event) => setTomorrowMinutes(event.target.value)}
            type="number"
            value={tomorrowMinutes}
          />
        </label>
        <button className="button-primary" type="submit">
          生成复盘建议
        </button>
      </form>
      <section className="surface-card p-6 md:p-8">
        <p className="section-kicker">AGENT REVIEW</p>
        <h2 className="mt-3 text-xl font-bold text-slate-950">今日总结与明日建议</h2>
        {result ? (
          <div className="mt-6 space-y-5">
            <p className="rounded-2xl bg-indigo-50 p-4 text-sm leading-7 text-slate-700">
              {result.summary}
            </p>
            <p className="text-sm leading-7 text-slate-600">{result.support}</p>
            <ol className="space-y-3">
              {result.actions.map((action, index) => (
                <li className="flex gap-3 text-sm leading-7 text-slate-700" key={action}>
                  <span className="step-number">{index + 1}</span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-7 text-sm leading-7 text-slate-500">
            填写今日状态后，这里会生成一份温和、可执行的明日调整建议。
          </div>
        )}
      </section>
    </div>
  );
}
