/** @typedef {'trainee'|'associate'|'senior_associate'|'partner'} DemoRole */

/** @type {Record<DemoRole, number>} */
export const ROLE_LEVEL = {
  trainee: 0,
  associate: 1,
  senior_associate: 2,
  partner: 3,
};

/** @type {Array<{ id: string; name: string; role: DemoRole; title: string; initials: string; color: string }>} */
export const DEMO_USERS = [
  {
    id: "user-trainee",
    name: "Alex Chen",
    role: "trainee",
    title: "Trainee solicitor",
    initials: "AC",
    color: "#0d9488",
  },
  {
    id: "user-associate",
    name: "Priya Sharma",
    role: "associate",
    title: "Associate",
    initials: "PS",
    color: "#2563eb",
  },
  {
    id: "user-senior",
    name: "James Okonkwo",
    role: "senior_associate",
    title: "Senior associate",
    initials: "JO",
    color: "#7c3aed",
  },
  {
    id: "user-partner",
    name: "Sarah Mitchell",
    role: "partner",
    title: "Partner",
    initials: "SM",
    color: "#b45309",
  },
];

/** @param {string} userId */
export function getDemoUser(userId) {
  return DEMO_USERS.find((u) => u.id === userId) ?? null;
}

/** @param {DemoRole} role */
export function roleLabel(role) {
  switch (role) {
    case "trainee":
      return "Trainee";
    case "associate":
      return "Associate";
    case "senior_associate":
      return "Senior associate";
    case "partner":
      return "Partner";
    default:
      return role;
  }
}

/** @param {DemoRole} fromRole */
export function suggestedEscalationRole(fromRole) {
  switch (fromRole) {
    case "trainee":
      return "senior_associate";
    case "associate":
      return "senior_associate";
    case "senior_associate":
      return "partner";
    default:
      return "partner";
  }
}

/** @param {DemoRole} fromRole */
export function suggestedDelegateRole(fromRole) {
  switch (fromRole) {
    case "partner":
      return "senior_associate";
    case "senior_associate":
      return "associate";
    case "associate":
      return "trainee";
    default:
      return "associate";
  }
}

/** @param {DemoRole} role */
export function usersForRole(role) {
  return DEMO_USERS.filter((u) => u.role === role);
}
