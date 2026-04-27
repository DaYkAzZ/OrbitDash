// ─── User / Auth Types ────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
}
