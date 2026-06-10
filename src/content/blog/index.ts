import a1 from "./vendre-plus-vite-prestations-web-audit-digital-local.json";
import a2 from "./agences-seo-automatiser-pre-audits-prospects.json";
import a3 from "./transformer-rapport-seo-local-proposition-commerciale.json";
import a4 from "./freelance-web-professionnaliser-rendez-vous-clients.json";
import a5 from "./marque-blanche-arme-petites-agences.json";

export type BlogArticle = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  excerpt: string;
  keywords: string[];
  publishedAt: string;
  readingMinutes: number;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  faq: {
    q: string;
    a: string;
  }[];
};

export const ARTICLES: BlogArticle[] = [a1, a2, a3, a4, a5].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
) as BlogArticle[];

export function getArticle(slug: string): BlogArticle | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
