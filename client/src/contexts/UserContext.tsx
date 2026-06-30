import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { bootstrapDemoUsers } from "../lib/bootstrapUsers";
import type { DemoUser } from "../types/users";

/** True when the client talks to a remote API (Vercel → Render). */
export const USES_REMOTE_API = Boolean(import.meta.env.VITE_API_BASE);

interface UserContextValue {
  user: DemoUser | null;
  users: DemoUser[];
  usersReady: boolean;
  usersBooting: boolean;
  usersError: string | null;
  retryUsers: () => void;
  login: (user: DemoUser) => void;
  logout: () => void;
  switchUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [usersReady, setUsersReady] = useState(false);
  const [usersBooting, setUsersBooting] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [bootToken, setBootToken] = useState(0);

  const retryUsers = useCallback(() => {
    setUsersError(null);
    setUsersBooting(true);
    setUsersReady(false);
    setBootToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setUsersBooting(true);
    setUsersError(null);

    bootstrapDemoUsers(controller.signal)
      .then((list) => {
        setUsers(list);
        setUsersReady(true);
        setUsersError(null);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const message =
          e instanceof Error
            ? e.message.includes("timed out") || e.message.includes("Failed to fetch")
              ? "The server is still waking up. This is normal on first visit — please try again."
              : e.message
            : "Could not connect to the server.";
        setUsersError(message);
        setUsersReady(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setUsersBooting(false);
      });

    return () => controller.abort();
  }, [bootToken]);

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
    () => ({
      user,
      users,
      usersReady,
      usersBooting,
      usersError,
      retryUsers,
      login,
      logout,
      switchUser,
    }),
    [user, users, usersReady, usersBooting, usersError, retryUsers, login, logout, switchUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
