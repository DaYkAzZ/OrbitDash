'use client';

import Link from 'next/link';
import { useTheme } from '../../store';
import { useAuth } from '../../store';
import { Button } from '../ui';

export function Navbar() {
  const { mode, toggleMode } = useTheme();
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-foreground tracking-tight">
          🛰️ OrbitDash
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              ⚙ Admin
            </Button>
          </Link>
        )}

        <button
          onClick={toggleMode}
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {mode === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <>
            <span className="text-xs text-zinc-500">{user.displayName ?? user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Déconnexion
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
