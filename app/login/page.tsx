"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/store/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch {
      // error affiché via context
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    router.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight">OrbitDash</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">Connectez-vous pour accéder à votre dashboard</p>
        </div>

        {/* Demo accounts hint */}
        <div className="mb-5 p-3 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20">
          <p className="text-xs font-semibold text-[var(--accent)] mb-1">Comptes de démo</p>
          <p className="text-xs text-[var(--text-2)]">
            <span className="font-mono">admin@orbitdash.dev</span> / <span className="font-mono">admin123</span>
          </p>
          <p className="text-xs text-[var(--text-2)]">
            <span className="font-mono">user@orbitdash.dev</span> / <span className="font-mono">user123</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-2)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@orbitdash.dev"
              className="input-base"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-2)]">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-base"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--red)] bg-[var(--red-light)] px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 text-xs text-[var(--text-3)] bg-[var(--bg)]">ou</span>
          </div>
        </div>

        <button onClick={handleGuest} className="btn-secondary w-full">
          Continuer en tant qu'invité
        </button>
      </div>
    </div>
  );
}
