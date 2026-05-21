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
      // error via context
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => { loginAsGuest(); router.replace("/"); };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Déco de fond néobrut */}
      <div style={{
        position: "absolute", top: "-60px", right: "-60px",
        width: "300px", height: "300px",
        background: "var(--neon-yellow)",
        border: "3px solid var(--border)",
        boxShadow: "var(--shadow-neo-xl)",
        transform: "rotate(15deg)",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "-40px",
        width: "250px", height: "250px",
        background: "var(--neon-pink)",
        border: "3px solid var(--border)",
        boxShadow: "var(--shadow-neo-xl)",
        transform: "rotate(-10deg)",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "5%",
        width: "80px", height: "80px",
        background: "var(--neon-cyan)",
        border: "3px solid var(--border)",
        boxShadow: "var(--shadow-neo)",
        transform: "rotate(5deg)",
        zIndex: 0,
      }} />

      {/* Carte principale */}
      <div
        className="w-full max-w-md relative anim-scale"
        style={{
          background: "var(--bg-card)",
          border: "3px solid var(--border)",
          boxShadow: "var(--shadow-neo-xl)",
          zIndex: 1,
        }}
      >
        {/* Header coloré */}
        <div
          className="px-8 py-6 text-center"
          style={{
            background: "var(--accent)",
            borderBottom: "3px solid var(--border)",
          }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-3"
            style={{
              background: "var(--neon-yellow)",
              border: "3px solid var(--border)",
              boxShadow: "var(--shadow-neo)",
              animation: "brutBounce 3s ease infinite",
            }}
          >
            <span className="font-black text-3xl text-black" style={{ fontFamily: "Space Mono" }}>O</span>
          </div>
          <h1
            className="text-2xl font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "Space Mono" }}
          >
            OrbitDash
          </h1>
          <p className="text-white/70 text-xs mt-1 uppercase tracking-wider font-bold">
            Votre dashboard ultra-personnalisable
          </p>
        </div>

        <div className="p-8 space-y-5">
          {/* Comptes démo */}
          <div
            className="p-4 space-y-2"
            style={{
              background: "var(--neon-yellow)",
              border: "2.5px solid var(--border)",
              boxShadow: "var(--shadow-neo-sm)",
            }}
          >
            <p className="text-xs font-black text-black uppercase tracking-wider" style={{ fontFamily: "Space Mono" }}>
              ★ Comptes de démo
            </p>
            <div className="space-y-1">
              <p className="text-xs font-bold text-black" style={{ fontFamily: "Space Mono" }}>
                admin@orbitdash.dev / admin123
              </p>
              <p className="text-xs font-bold text-black" style={{ fontFamily: "Space Mono" }}>
                user@orbitdash.dev / user123
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-black uppercase tracking-wider text-[var(--text-2)]"
                style={{ fontFamily: "Space Mono" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@orbitdash.dev"
                className="input-base"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-black uppercase tracking-wider text-[var(--text-2)]"
                style={{ fontFamily: "Space Mono" }}
              >
                Mot de passe
              </label>
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
              <div
                className="px-4 py-3 text-xs font-bold"
                style={{
                  background: "var(--accent)",
                  color: "white",
                  border: "2px solid var(--border)",
                  boxShadow: "var(--shadow-neo-sm)",
                  fontFamily: "Space Mono",
                }}
              >
                ✕ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ height: "48px", fontSize: "14px" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span style={{ animation: "brutSpin 0.8s linear infinite", display: "inline-block" }}>◌</span>
                  Connexion…
                </span>
              ) : "→ Se connecter"}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: "2px", background: "var(--border)" }} />
            <span
              className="text-xs font-black uppercase text-[var(--text-3)]"
              style={{ fontFamily: "Space Mono" }}
            >
              OU
            </span>
            <div style={{ flex: 1, height: "2px", background: "var(--border)" }} />
          </div>

          <button
            onClick={handleGuest}
            className="btn-secondary w-full"
            style={{ height: "48px", fontSize: "13px" }}
          >
            Continuer en invité
          </button>
        </div>
      </div>
    </div>
  );
}
