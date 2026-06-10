import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Compass } from "lucide-react";
import { ARTICLES, getArticle } from "@/content/blog";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.metaDescription,
      publishedTime: article.publishedAt,
      locale: "fr_FR",
    },
  };
}

/** Rendu minimal du markdown autorisé dans les paragraphes : liens et gras. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] && match[2]) {
      const href = match[2];
      const internal = href.startsWith("/") || href.startsWith("#");
      nodes.push(
        internal ? (
          <Link
            key={key++}
            href={href}
            className="font-medium text-indigo-300 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-200"
          >
            {match[1]}
          </Link>
        ) : (
          <a
            key={key++}
            href={href}
            rel="noopener noreferrer"
            className="font-medium text-indigo-300 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-200"
          >
            {match[1]}
          </a>
        ),
      );
    } else if (match[3]) {
      nodes.push(
        <strong key={key++} className="font-semibold text-white">
          {match[3]}
        </strong>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const others = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.h1,
        description: article.metaDescription,
        datePublished: article.publishedAt,
        inLanguage: "fr-FR",
        author: { "@type": "Organization", name: "ProspectPilot Local" },
        publisher: { "@type": "Organization", name: "ProspectPilot Local" },
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "/blog" },
          {
            "@type": "ListItem",
            position: 3,
            name: article.h1,
            item: `/blog/${article.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="font-bold text-white">
            ProspectPilot <span className="gradient-text">Local</span>
          </span>
        </Link>
        <Link href="/blog" className="btn-ghost px-4 py-2 text-sm">
          Tous les articles
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20">
        <article>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-white/45">
            <span className="chip">
              <Clock className="h-3 w-3" />
              {article.readingMinutes} min
            </span>
            <span>
              Publié le{" "}
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {article.h1}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/60">
            {article.excerpt}
          </p>

          {article.sections.map((section, i) => (
            <section key={i} className="mt-10">
              <h2 className="text-2xl font-bold text-white">{section.heading}</h2>
              {section.paragraphs.map((p, j) => (
                <p key={j} className="mt-4 leading-relaxed text-white/70">
                  {renderInline(p)}
                </p>
              ))}
            </section>
          ))}

          {article.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-white">Questions fréquentes</h2>
              <div className="mt-5 grid gap-3">
                {article.faq.map((f) => (
                  <details key={f.q} className="card group p-0">
                    <summary className="cursor-pointer list-none px-5 py-4 font-medium text-white transition hover:text-indigo-200">
                      {f.q}
                    </summary>
                    <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/60">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* CTA */}
        <div className="card relative mt-12 overflow-hidden p-8 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[480px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
          <h2 className="relative text-xl font-bold text-white">
            Passez de la lecture à la signature
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/55">
            Générez votre premier audit prospect en moins de cinq minutes avec
            ProspectPilot Local.
          </p>
          <Link href="/signup" className="btn-primary relative mt-5 inline-flex">
            Créer mon premier audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* À lire aussi */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-white">À lire aussi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="card card-hover p-5">
                <p className="font-semibold leading-snug text-white">{a.h1}</p>
                <p className="mt-2 text-xs text-white/50">
                  {a.readingMinutes} min de lecture
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
