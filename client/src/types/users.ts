export type DemoRole = "trainee" | "associate" | "senior_associate" | "partner";

export interface DemoUser {
  id: string;
  name: string;
  role: DemoRole;
  title: string;
  initials: string;
  color: string;
}

export const ROLE_LEVEL: Record<DemoRole, number> = {
  trainee: 0,
  associate: 1,
  senior_associate: 2,
  partner: 3,
};

export function roleLabel(role: DemoRole): string {
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

export function suggestedEscalationRole(from: DemoRole): DemoRole {
  switch (from) {
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

export function suggestedDelegateRole(from: DemoRole): DemoRole {
  switch (from) {
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
