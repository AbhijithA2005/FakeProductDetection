import { storage } from "./storage";
import type { User } from "./types";

export function login(username: string, password: string): User | null {
  const user = storage
    .getUsers()
    .find((u) => u.username === username && u.password === password);
  if (!user) return null;
  const safe: User = { ...user };
  delete safe.password;
  storage.setSession(safe);
  return safe;
}

export function logout(): void {
  storage.setSession(null);
}

export function currentUser(): User | null {
  return storage.getSession();
}
