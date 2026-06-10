import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du service ProspectPilot Local.",
  alternates: { canonical: "/legal/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function LegalNoticePage() {
  return (
    <div className="relative min-h-screen">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="font-bold text-white">ProspectPilot Local</span>
        </Link>
        <Link href="/" className="btn-ghost px-4 py-2 text-sm">
          Accueil
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 pb-20">
        <h1 className="text-3xl font-bold text-white">Mentions légales</h1>

        <section className="mt-8 grid gap-6 text-sm leading-relaxed text-white/65">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Éditeur du service</h2>
            <p>
              Le service ProspectPilot Local est édité par ProspectPilot.
              <br />
              Contact :{" "}
              <a href="mailto:contact@prospectpilot.fr" className="text-indigo-300 hover:text-indigo-200">
                contact@prospectpilot.fr
              </a>
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Hébergement</h2>
            <p>
              L&apos;application et les données sont hébergées sur une plateforme
              cloud sécurisée au sein de l&apos;Union européenne.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des éléments composant le service (interface, textes,
              logos, structure) est protégé par le droit de la propriété
              intellectuelle. Les rapports générés par les utilisateurs leur
              appartiennent et peuvent être diffusés librement auprès de leurs
              clients, y compris sous leur propre marque.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Responsabilité</h2>
            <p>
              Les analyses et recommandations produites par le service sont
              fournies à titre indicatif pour appuyer un travail de conseil. Elles
              ne constituent pas un engagement de résultat. L&apos;éditeur ne
              saurait être tenu responsable des décisions commerciales prises sur
              la base des rapports générés.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Signalement</h2>
            <p>
              Pour toute question ou signalement relatif au service, écrivez-nous
              via la <Link href="/contact" className="text-indigo-300 hover:text-indigo-200">page de contact</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
