export default function PlanCard({ task, onToggle }) {
  return (
    <label
      className={`plan-task-card ${task.completed ? "plan-task-card-done" : ""}`}
      htmlFor={task.id}
    >
      <input
        checked={task.completed}
        className="mt-1 h-5 w-5 shrink-0 accent-indigo-600"
        id={task.id}
        onChange={() => onToggle(task.id)}
        type="checkbox"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap gap-2">
          <span className="plan-module-pill">{task.subject}</span>
          <span className="plan-duration-pill">{task.duration}</span>
          <span className="plan-priority-pill">{task.priority}优先级</span>
        </span>
        <span
          className={`mt-4 block text-base font-bold ${
            task.completed ? "text-slate-400 line-through" : "text-slate-950"
          }`}
        >
          {task.title}
        </span>
        <span className="mt-2 block text-sm leading-7 text-slate-600">
          {task.purpose || "根据今日完成情况形成后续复盘建议。"}
        </span>
      </span>
    </label>
  );
}
