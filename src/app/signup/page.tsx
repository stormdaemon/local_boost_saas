"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck, UserPlus } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    });
    if (error) {
      setError(
        error.message.toLowerCase().includes("already")
          ? "Un compte existe déjà avec cette adresse. Connectez-vous."
          : "L'inscription n'a pas abouti. Vérifiez votre adresse email et réessayez.",
      );
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/app");
      router.refresh();
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthShell
        title="Vérifiez votre boîte mail"
        subtitle="Plus qu'une étape pour activer votre compte."
      >
        <div className="grid gap-4 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-emerald-300" />
          <p className="text-sm leading-relaxed text-white/65">
            Un email de confirmation vient d&apos;être envoyé à{" "}
            <span className="font-semibold text-white">{email}</span>. Cliquez sur
            le lien qu&apos;il contient pour activer votre compte et accéder à
            votre espace.
          </p>
          <p className="text-xs text-white/40">
            Pensez à vérifier votre dossier spam si l&apos;email n&apos;apparaît pas
            sous quelques minutes.
          </p>
          <Link href="/login" className="btn-ghost mx-auto">
            Retour à la connexion
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Générez votre premier audit prospect en quelques minutes."
    >
      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label className="label">Email professionnel</label>
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
          <label className="label">Mot de passe (8 caractères min.)</label>
          <input
            type="password"
            required
            minLength={8}
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
            <UserPlus className="h-4 w-4" />
          )}
          Créer mon compte
        </button>
        <p className="text-center text-xs text-white/40">
          En créant un compte, vous acceptez nos{" "}
          <Link href="/legal/mentions-legales" className="underline hover:text-white/70">
            conditions
          </Link>{" "}
          et notre{" "}
          <Link href="/legal/confidentialite" className="underline hover:text-white/70">
            politique de confidentialité
          </Link>
          .
        </p>
        <p className="text-center text-sm text-white/50">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
