"use client";

import Link from "next/link";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-rose-600/10 blur-3xl" />
      <div className="card relative z-10 w-full max-w-md p-10 text-center">
        <span className="mx-auto inline-flex rounded-2xl bg-rose-500/15 p-4 text-rose-300">
          <TriangleAlert className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-white">
          Une erreur est survenue.
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Veuillez réessayer. Si le problème persiste, contactez le support.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary">
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </button>
          <Link href="/" className="btn-ghost">
            <Home className="h-4 w-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
