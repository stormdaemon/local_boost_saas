import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="card relative z-10 w-full max-w-md p-10 text-center">
        <span className="mx-auto inline-flex rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 text-indigo-300">
          <Compass className="h-8 w-8" />
        </span>
        <p className="mt-5 text-5xl font-extrabold gradient-text">404</p>
        <h1 className="mt-3 text-xl font-bold text-white">
          Cette page n&apos;existe pas ou n&apos;est plus disponible.
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Le lien est peut-être périmé, ou la page a été déplacée.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          <Home className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
