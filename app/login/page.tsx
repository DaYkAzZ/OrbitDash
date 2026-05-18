"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Login Page - Redirection vers dashboard
 * Pas d'authentification requise dans cette version
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger immédiatement vers le dashboard
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-2xl">O</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">OrbitDash</h1>
        <p className="text-zinc-400 mb-4">
          Redirection vers votre dashboard...
        </p>
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
