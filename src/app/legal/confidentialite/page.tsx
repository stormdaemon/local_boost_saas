import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et de protection des données personnelles de ProspectPilot Local (RGPD).",
  alternates: { canonical: "/legal/confidentialite" },
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-white">Politique de confidentialité</h1>
        <p className="mt-3 text-sm text-white/50">
          Dernière mise à jour : juin 2026 — conforme au Règlement général sur la
          protection des données (RGPD).
        </p>

        <section className="mt-8 grid gap-6 text-sm leading-relaxed text-white/65">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Données collectées</h2>
            <ul className="grid list-disc gap-1.5 pl-5">
              <li>
                <span className="font-medium text-white">Données de compte</span> :
                adresse email et mot de passe (chiffré), informations de
                personnalisation de votre agence.
              </li>
              <li>
                <span className="font-medium text-white">Données métier</span> :
                informations sur les prospects que vous saisissez (nom,
                secteur, ville, présence digitale) et les analyses générées.
              </li>
              <li>
                <span className="font-medium text-white">Données de facturation</span> :
                statut de votre abonnement et identifiants de transaction
                transmis par notre prestataire de paiement PayPal. Nous ne
                stockons aucun numéro de carte ni identifiant bancaire.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Finalités</h2>
            <p>
              Ces données servent exclusivement à fournir le service : génération
              des audits et rapports, gestion de votre compte et de votre
              abonnement, support client et amélioration du produit. Elles ne
              sont ni vendues ni louées à des tiers.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Durées de conservation</h2>
            <p>
              Les données de compte et les analyses sont conservées tant que
              votre compte est actif, puis supprimées dans un délai de 12 mois
              après sa clôture. Les données de facturation sont conservées selon
              les obligations comptables légales.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
              rectification, d&apos;effacement, de limitation, d&apos;opposition et
              de portabilité sur vos données. Pour l&apos;exercer, contactez-nous à{" "}
              <a href="mailto:contact@prospectpilot.fr" className="text-indigo-300 hover:text-indigo-200">
                contact@prospectpilot.fr
              </a>
              . Vous pouvez également saisir la CNIL.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Cookies</h2>
            <p>
              Le service utilise uniquement des cookies strictement nécessaires à
              son fonctionnement (maintien de votre session de connexion). Aucun
              cookie publicitaire ou de pistage tiers n&apos;est déposé.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Hébergement et sécurité</h2>
            <p>
              Les données sont hébergées au sein de l&apos;Union européenne. Les
              échanges sont chiffrés (HTTPS), les mots de passe sont stockés sous
              forme hachée et chaque compte est strictement isolé des autres.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
