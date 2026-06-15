import { BRAND_NAME, BRAND_TAGLINE } from "../../brand";
import type { DemoUser } from "../../types/users";
import { roleLabel } from "../../types/users";

interface RoleLoginGateProps {
  users: DemoUser[];
  onSelect: (user: DemoUser) => void;
}

const ROLE_ORDER = ["partner", "senior_associate", "associate", "trainee"] as const;

export function RoleLoginGate({ users, onSelect }: RoleLoginGateProps) {
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: users.filter((u) => u.role === role),
  })).filter((g) => g.members.length > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface to-brand-soft/40 p-6">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand">
              {BRAND_TAGLINE}
            </span>
          </div>
          <h1 className="page-title">{BRAND_NAME}</h1>
          <p className="page-subtitle">Select your role to enter the deal team workspace</p>
        </div>

        <div className="space-y-6">
          {grouped.map(({ role, members }) => (
            <div key={role}>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {roleLabel(role)}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {members.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelect(user)}
                    className="card flex items-center gap-3 p-4 text-left transition hover:border-brand/40 hover:shadow-md"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.initials}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{user.name}</p>
                      <p className="text-xs text-ink-muted">{user.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
