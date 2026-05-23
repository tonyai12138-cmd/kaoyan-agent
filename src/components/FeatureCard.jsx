export default function FeatureCard({ title, description, accent, number }) {
  return (
    <article className="surface-card feature-card group p-6">
      <div className="flex items-center justify-between">
        <span className={`module-icon bg-gradient-to-br ${accent}`}>{number}</span>
        <span className="badge bg-slate-50 text-slate-500">核心模块</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}
