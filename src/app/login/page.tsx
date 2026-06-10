"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message.toLowerCase().includes("confirm")
          ? "Veuillez d'abord confirmer votre adresse email via le lien reçu."
          : "Identifiants incorrects. Vérifiez votre email et votre mot de passe.",
      );
      setLoading(false);
      return;
    }
    router.push(params.get("next") ?? "/app");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          required
          className="input"
          placeholder="vous@agence.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Mot de passe</label>
        <input
          type="password"
          required
          className="input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Se connecter
      </button>
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/mot-de-passe-oublie"
          className="text-white/50 hover:text-white"
        >
          Mot de passe oublié ?
        </Link>
        <Link href="/signup" className="font-medium text-indigo-300 hover:text-indigo-200">
          Créer un compte
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace ProspectPilot Local."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
