export default function FeatureCard({ title, description, accent }) {
  return (
    <article className="surface-card group p-6">
      <div
        className={`mb-5 h-11 w-11 rounded-2xl bg-gradient-to-br ${accent} opacity-90 shadow-lg transition-transform group-hover:-translate-y-1`}
      />
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}
