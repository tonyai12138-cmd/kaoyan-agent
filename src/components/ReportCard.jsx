import DisclaimerBanner from "./DisclaimerBanner";

export default function ReportCard({ school, selected, onSelect }) {
  return (
    <article
      className={`surface-card flex h-full flex-col p-6 ${
        selected ? "ring-2 ring-indigo-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-600">
            {school.tag}
          </p>
          <h3 className="text-lg font-bold text-slate-950">{school.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{school.program}</p>
        </div>
        {selected && <span className="badge badge-success">已选择</span>}
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-600">{school.fit}</p>
      <dl className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
        <div>
          <dt className="text-slate-500">初试科目</dt>
          <dd className="mt-1 font-medium text-slate-800">
            {school.subjects.join(" / ")}
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-slate-500">分数线</dt>
            <dd className="mt-1 font-medium text-slate-800">{school.scoreLine}</dd>
          </div>
          <div>
            <dt className="text-slate-500">招生人数</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {school.plannedEnrollment}
            </dd>
          </div>
        </div>
        <div>
          <dt className="text-slate-500">参考资料</dt>
          <dd className="mt-1 font-medium text-slate-800">
            {school.referenceBooks}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-amber-700">
        风险提示：{school.risk}
      </p>
      <div className="mt-4">
        <DisclaimerBanner compact />
      </div>
      <button
        className={selected ? "button-secondary mt-5" : "button-primary mt-5"}
        onClick={() => onSelect(school.id)}
        type="button"
      >
        {selected ? "当前主目标" : "设为主目标"}
      </button>
    </article>
  );
}
