const CLAUSE_TYPES = [
  { tag: "Obligation", className: "clause-obligation", desc: "Duties a party must perform" },
  { tag: "Payment", className: "clause-payment", desc: "Fees, pricing, and consideration" },
  { tag: "Termination", className: "clause-termination", desc: "Exit rights and notice periods" },
  { tag: "Condition", className: "clause-condition", desc: "Precedents and closing conditions" },
  { tag: "Permission", className: "clause-permission", desc: "Consents and permitted actions" },
  { tag: "Definition", className: "clause-definition", desc: "Defined terms and scope" },
  { tag: "Other", className: "clause-other", desc: "Miscellaneous provisions" },
];

export function ClauseTypeLegend() {
  return (
    <section className="card p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
        Clause types
      </h2>
      <ul className="mt-4 space-y-3">
        {CLAUSE_TYPES.map((c) => (
          <li key={c.tag} className="flex items-start gap-2.5">
            <span className={c.className}>{c.tag}</span>
            <span className="text-xs leading-relaxed text-ink-muted">{c.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
