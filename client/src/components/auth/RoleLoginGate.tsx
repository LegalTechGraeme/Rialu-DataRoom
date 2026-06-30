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
    <div className="flex min-h-screen items-center justify-center bg-surface p-6 max-lg:p-4">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">{BRAND_NAME}</h1>
          <p className="mt-1 text-sm text-ink-muted">{BRAND_TAGLINE}</p>
          <p className="page-subtitle mt-4">Select your role to enter the deal team workspace</p>
        </div>

        <div className="space-y-6">
          {grouped.map(({ role, members }) => (
            <div key={role}>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {roleLabel(role)}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 max-lg:grid-cols-1">
                {members.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelect(user)}
                    className="card flex items-center gap-3 p-4 text-left transition hover:border-brand/25"
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
