"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Loader2, Mail, MailCheck, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="hidden font-bold text-white min-[480px]:inline">
            ProspectPilot Local
          </span>
        </Link>
        <Link href="/" className="btn-ghost px-4 py-2 text-sm">
          Accueil
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-xl px-6 pb-20">
        <h1 className="text-3xl font-bold text-white">Contact</h1>
        <p className="mt-2 text-white/55">
          Une question sur le produit, les forfaits ou votre compte ? Nous
          répondons sous 24 h ouvrées.
        </p>

        <div className="card mt-6 flex items-center gap-3 p-5">
          <Mail className="h-5 w-5 shrink-0 text-indigo-300" />
          <p className="text-sm text-white/65">
            Par email :{" "}
            <a
              href="mailto:contact@prospectpilot.fr"
              className="font-medium text-indigo-300 hover:text-indigo-200"
            >
              contact@prospectpilot.fr
            </a>
          </p>
        </div>

        {state === "sent" ? (
          <div className="card mt-6 p-10 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-emerald-300" />
            <h2 className="mt-4 text-xl font-bold text-white">Message envoyé</h2>
            <p className="mt-2 text-sm text-white/55">
              Merci ! Nous revenons vers vous sous 24 h ouvrées.
            </p>
            <Link href="/" className="btn-ghost mt-6 inline-flex">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-6 grid gap-4 p-5 sm:p-7">
            <div>
              <label className="label">Votre nom</label>
              <input
                required
                minLength={2}
                maxLength={80}
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Votre email</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Votre message</label>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                className="input min-h-[140px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {state === "error" && (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                Une erreur est survenue. Veuillez réessayer ou nous écrire
                directement par email.
              </p>
            )}
            <button type="submit" disabled={state === "sending"} className="btn-primary">
              {state === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Envoyer
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
