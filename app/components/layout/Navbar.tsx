"use client";

import Link from "next/link";
import { Button } from "../ui";

/**
 * Navbar – barre de navigation supérieure
 * Affiche le titre et des boutons d'actions rapides
 */
export function Navbar() {
  return (
    <nav className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          OrbitDash
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            ⚙ Admin
          </Button>
        </Link>
        <span className="text-xs text-zinc-500">Bienvenue</span>
      </div>
    </nav>
  );
}
