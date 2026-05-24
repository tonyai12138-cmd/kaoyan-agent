import DisclaimerBanner from "./DisclaimerBanner";

export default function ReportCard({ recommendation, selected, onSelect }) {
  return (
    <article
      className={`report-recommendation-card flex h-full flex-col p-6 ${
        selected ? "report-recommendation-selected" : ""
      } ${recommendation.recommended ? "report-recommendation-highlight" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-600">
            {recommendation.tag}
          </p>
          <h3 className="text-xl font-bold text-slate-950">{recommendation.tier}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {recommendation.recommended && <span className="badge">AI 优先建议</span>}
          {selected && <span className="badge badge-success">当前计划目标</span>}
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-indigo-50/70 p-4">
        <p className="text-xs font-semibold text-indigo-600">样例方向与选择标准</p>
        <p className="mt-2 text-sm font-medium leading-7 text-slate-800">
          {recommendation.sampleDirection}
        </p>
      </div>
      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-slate-900">为什么适合</dt>
          <dd className="mt-1 leading-7 text-slate-600">{recommendation.why}</dd>
        </div>
        <div>
          <dt className="font-semibold text-amber-700">主要风险</dt>
          <dd className="mt-1 leading-7 text-slate-600">{recommendation.risk}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">需要补足条件</dt>
          <dd className="mt-1 leading-7 text-slate-600">{recommendation.condition}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">验证动作</dt>
          <dd className="mt-1 leading-7 text-slate-600">{recommendation.verification}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-5">
        <DisclaimerBanner compact />
      </div>
      <button
        className={selected ? "button-secondary mt-5" : "button-primary mt-5"}
        onClick={() => onSelect(recommendation.planTargetId)}
        type="button"
      >
        {selected ? "已用于后续计划" : "选择此档作为计划目标"}
      </button>
    </article>
  );
}
