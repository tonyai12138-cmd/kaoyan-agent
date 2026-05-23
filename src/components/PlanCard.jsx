export default function PlanCard({ task, onToggle }) {
  return (
    <label
      className={`task-card ${task.completed ? "task-card-done" : ""}`}
      htmlFor={task.id}
    >
      <input
        checked={task.completed}
        className="h-5 w-5 accent-indigo-600"
        id={task.id}
        onChange={() => onToggle(task.id)}
        type="checkbox"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block font-semibold ${
            task.completed ? "text-slate-400 line-through" : "text-slate-900"
          }`}
        >
          {task.title}
        </span>
        <span className="mt-1 block text-sm text-slate-500">
          {task.subject} · {task.duration}
        </span>
      </span>
      <span className="badge">{task.priority}优先级</span>
    </label>
  );
}
