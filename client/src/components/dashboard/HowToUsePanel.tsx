const STEPS = [
  {
    title: "Data room",
    body: "Browse the diligence index, upload documents, and open files for review.",
  },
  {
    title: "Legal assistant",
    body: "Ask questions across the room — risks, obligations, and deal impact with citations.",
  },
  {
    title: "Risk register",
    body: "Aggregate AI-identified issues and cross-document conflicts into a working register.",
  },
];

export function HowToUsePanel() {
  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold text-ink">How to use this system</h2>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
