import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DemoUser } from "../types/users";
import { fetchDemoUsers } from "../services/tasksApi";

interface UserContextValue {
  user: DemoUser | null;
  users: DemoUser[];
  login: (user: DemoUser) => void;
  logout: () => void;
  switchUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [users, setUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    fetchDemoUsers()
      .then(setUsers)
      .catch(() => {});
  }, []);

  const login = useCallback((u: DemoUser) => {
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchUser = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, users, login, logout, switchUser }),
    [user, users, login, logout, switchUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
