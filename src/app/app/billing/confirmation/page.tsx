"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

function ConfirmationContent() {
  const params = useSearchParams();
  const [state, setState] = useState<"loading" | "active" | "pending" | "error">(
    "loading",
  );

  useEffect(() => {
    const subscriptionId = params.get("subscription_id");
    if (!subscriptionId) {
      setState("error");
      return;
    }
    void fetch("/api/billing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (res.ok && body?.activated) setState("active");
        else if (res.ok) setState("pending");
        else setState("error");
      })
      .catch(() => setState("error"));
  }, [params]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="card w-full p-10">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-400" />
            <h1 className="mt-5 text-xl font-bold text-white">
              Confirmation du paiement…
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Quelques secondes, nous vérifions votre abonnement.
            </p>
          </>
        )}
        {state === "active" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
            <h1 className="mt-5 text-xl font-bold text-white">
              Bienvenue à bord !
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Votre paiement est confirmé et votre accès complet est actif. Vous
              pouvez créer votre premier prospect dès maintenant.
            </p>
            <Link href="/app" className="btn-primary mt-6 inline-flex">
              Accéder à mon espace
            </Link>
          </>
        )}
        {state === "pending" && (
          <>
            <Clock className="mx-auto h-12 w-12 text-amber-300" />
            <h1 className="mt-5 text-xl font-bold text-white">
              Paiement en cours de validation
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Votre paiement est en cours de traitement. Votre accès sera activé
              automatiquement dans quelques minutes.
            </p>
            <Link href="/app" className="btn-ghost mt-6 inline-flex">
              Retour à mon espace
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-rose-300" />
            <h1 className="mt-5 text-xl font-bold text-white">
              Le paiement n&apos;a pas pu être confirmé
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
            <Link href="/app/billing" className="btn-primary mt-6 inline-flex">
              Réessayer
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function BillingConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
