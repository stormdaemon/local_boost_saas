"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/app/nouveau-mot-de-passe`,
    });
    // Toujours afficher le même message pour ne pas révéler l'existence d'un compte.
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un lien de réinitialisation par email."
    >
      {sent ? (
        <div className="grid gap-4 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-emerald-300" />
          <p className="text-sm leading-relaxed text-white/65">
            Si un compte existe pour <span className="font-semibold text-white">{email}</span>,
            un email de réinitialisation vient de lui être envoyé.
          </p>
          <Link href="/login" className="btn-ghost mx-auto">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="label">Email du compte</label>
            <input
              type="email"
              required
              className="input"
              placeholder="vous@agence.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Envoyer le lien
          </button>
          <p className="text-center text-sm text-white/50">
            <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
