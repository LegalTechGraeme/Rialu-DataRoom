import { useUser } from "../../contexts/UserContext";
import type { DemoUser } from "../../types/users";
import { roleLabel, suggestedEscalationRole } from "../../types/users";
import type { TextSelection } from "./InteractiveDocumentPreview";

interface SelectionActionBarProps {
  selection: TextSelection;
  users: DemoUser[];
  onAssign: () => void;
  onEscalate: () => void;
  onClear: () => void;
}

export function SelectionActionBar({
  selection,
  users,
  onAssign,
  onEscalate,
  onClear,
}: SelectionActionBarProps) {
  const { user } = useUser();
  const escalateRole = user ? suggestedEscalationRole(user.role) : "senior_associate";
  const escalateTarget = users.find((u) => u.role === escalateRole);

  return (
    <div className="absolute bottom-4 left-1/2 z-10 w-[min(100%-2rem,520px)] -translate-x-1/2 rounded-xl border border-line bg-surface-elevated p-3 shadow-lg">
      <p className="mb-2 line-clamp-2 text-xs italic text-ink-muted">
        "{selection.text.slice(0, 120)}
        {selection.text.length > 120 ? "…" : ""}"
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAssign}
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white"
        >
          Assign review
        </button>
        {escalateTarget && user?.id !== escalateTarget.id ? (
          <button
            type="button"
            onClick={onEscalate}
            className="rounded-lg border border-warn/50 bg-warn/10 px-3 py-1.5 text-xs font-medium text-warn"
          >
            Escalate to {escalateTarget.name.split(" ")[0]} ({roleLabel(escalateRole)})
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
