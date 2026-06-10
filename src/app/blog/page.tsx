import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Compass } from "lucide-react";
import { ARTICLES } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog — Vendre plus de prestations web aux entreprises locales",
  description:
    "Conseils concrets pour freelances web, agences SEO et consultants : audits prospects, propositions commerciales, marque blanche et closing.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="font-bold text-white">
            ProspectPilot <span className="gradient-text">Local</span>
          </span>
        </Link>
        <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
          Essayer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Le blog de ceux qui signent plus de clients locaux
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/55">
            Méthodes concrètes pour transformer vos audits en contrats : pour
            freelances web, agences SEO et consultants.
          </p>
        </div>

        <div className="grid gap-5">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="card card-hover block p-7"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
                <span className="chip">
                  <Clock className="h-3 w-3" />
                  {a.readingMinutes} min de lecture
                </span>
                <span>
                  {new Date(a.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-white">{a.h1}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{a.excerpt}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-300">
                Lire l&apos;article
                <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
