"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Rocket,
  Target,
  Wifi,
} from "lucide-react";

const SECTORS = [
  "Restaurant / Café",
  "Boulangerie / Pâtisserie",
  "Coiffure / Beauté",
  "Plomberie / Chauffage",
  "Électricité",
  "Garage automobile",
  "Boutique de mode",
  "Fleuriste",
  "Salle de sport / Coach",
  "Cabinet médical / Paramédical",
  "Agence immobilière",
  "Artisan du bâtiment",
  "Institut bien-être / Spa",
  "Opticien",
  "Autre commerce local",
];

const GOALS = [
  "Attirer plus de clients locaux",
  "Développer la notoriété locale",
  "Obtenir plus d'avis Google",
  "Augmenter le trafic du site web",
  "Lancer une nouvelle offre",
  "Fidéliser la clientèle existante",
];

const SOCIALS = ["Instagram", "Facebook", "TikTok", "LinkedIn", "YouTube", "X (Twitter)"];

const STEPS = [
  { icon: Building2, title: "Identité", subtitle: "Qui est le prospect ?" },
  { icon: Wifi, title: "Présence digitale", subtitle: "Où en est-il ?" },
  { icon: Target, title: "Objectifs & budget", subtitle: "Où veut-il aller ?" },
  { icon: Check, title: "Récapitulatif", subtitle: "On vérifie tout" },
];

type FormState = {
  name: string;
  contactName: string;
  sector: string;
  city: string;
  website: string;
  phone: string;
  description: string;
  hasGoogleBusiness: boolean;
  socialNetworks: string[];
  mainGoal: string;
  targetAudience: string;
  monthlyBudget: number;
  potentialValue: number | null;
};

const INITIAL: FormState = {
  name: "",
  contactName: "",
  sector: "",
  city: "",
  website: "",
  phone: "",
  description: "",
  hasGoogleBusiness: false,
  socialNetworks: [],
  mainGoal: "",
  targetAudience: "",
  monthlyBudget: 500,
  potentialValue: null,
};

export default function NewProspectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepValid = useMemo(() => {
    if (step === 0) return form.name.trim() && form.sector && form.city.trim();
    if (step === 2) return Boolean(form.mainGoal);
    return true;
  }, [step, form]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? "La création a échoué. Veuillez réessayer.",
        );
      }
      const business = await res.json();
      router.push(`/app/prospects/${business.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "La création a échoué.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Nouveau prospect</h1>
        <span className="text-sm text-white/40">
          Étape {step + 1} / {STEPS.length}
        </span>
      </div>

      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex flex-1 flex-col gap-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                i <= step
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                  : "bg-white/10"
              }`}
            />
            <span
              className={`hidden text-xs sm:block ${
                i === step ? "font-semibold text-white" : "text-white/40"
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          {(() => {
            const Icon = STEPS[step].icon;
            return (
              <span className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-3 text-indigo-300">
                <Icon className="h-6 w-6" />
              </span>
            );
          })()}
          <div>
            <h2 className="text-xl font-bold text-white">{STEPS[step].title}</h2>
            <p className="text-sm text-white/50">{STEPS[step].subtitle}</p>
          </div>
        </div>

        {step === 0 && (
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Nom de l&apos;entreprise *</label>
                <input
                  className="input"
                  placeholder="Ex. : Boulangerie Martin"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Contact (optionnel)</label>
                <input
                  className="input"
                  placeholder="Ex. : Jean Martin, gérant"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Secteur d&apos;activité *</label>
                <select
                  className="input"
                  value={form.sector}
                  onChange={(e) => set("sector", e.target.value)}
                >
                  <option value="" className="bg-slate-900">
                    Choisir un secteur…
                  </option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s} className="bg-slate-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ville *</label>
                <input
                  className="input"
                  placeholder="Ex. : Angers"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Site web (optionnel)</label>
                <input
                  className="input"
                  placeholder="https://…"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Téléphone (optionnel)</label>
                <input
                  className="input"
                  placeholder="02 41 …"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Description courte (optionnel)</label>
              <textarea
                className="input min-h-[88px] resize-y"
                placeholder="Ce qui rend cette entreprise unique…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-6">
            <div>
              <label className="label">Fiche Google Business</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { v: true, label: "Oui, une fiche Google existe" },
                  { v: false, label: "Non, pas encore" },
                ].map((opt) => (
                  <button
                    key={String(opt.v)}
                    type="button"
                    onClick={() => set("hasGoogleBusiness", opt.v)}
                    className={`rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                      form.hasGoogleBusiness === opt.v
                        ? "border-indigo-400/70 bg-indigo-500/15 text-white"
                        : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Réseaux sociaux actifs</label>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map((s) => {
                  const active = form.socialNetworks.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        set(
                          "socialNetworks",
                          active
                            ? form.socialNetworks.filter((x) => x !== s)
                            : [...form.socialNetworks, s],
                        )
                      }
                      className={`chip transition ${
                        active
                          ? "border-violet-400/60 bg-violet-500/20 text-white"
                          : "hover:border-white/30"
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-white/40">
                Laissez vide si le prospect n&apos;est présent sur aucun réseau.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div>
              <label className="label">Objectif principal *</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set("mainGoal", g)}
                    className={`rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                      form.mainGoal === g
                        ? "border-indigo-400/70 bg-indigo-500/15 text-white"
                        : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Clientèle cible (optionnel)</label>
              <input
                className="input"
                placeholder="Ex. : familles du quartier, jeunes actifs, professionnels…"
                value={form.targetAudience}
                onChange={(e) => set("targetAudience", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">
                  Budget marketing mensuel :{" "}
                  <span className="text-base font-bold text-white">
                    {form.monthlyBudget.toLocaleString("fr-FR")} €
                  </span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  value={form.monthlyBudget}
                  onChange={(e) => set("monthlyBudget", Number(e.target.value))}
                />
                <div className="mt-1 flex justify-between text-xs text-white/40">
                  <span>100 €</span>
                  <span>5 000 €</span>
                </div>
              </div>
              <div>
                <label className="label">Montant potentiel de l&apos;affaire (optionnel)</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  placeholder="Ex. : 4800"
                  value={form.potentialValue ?? ""}
                  onChange={(e) =>
                    set(
                      "potentialValue",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
                <p className="mt-1 text-xs text-white/40">
                  Utilisé pour votre pipeline commercial.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 text-sm">
            {[
              ["Entreprise", form.name],
              ["Contact", form.contactName || "—"],
              ["Secteur", form.sector],
              ["Ville", form.city],
              ["Site web", form.website || "—"],
              ["Fiche Google", form.hasGoogleBusiness ? "Oui" : "Non"],
              [
                "Réseaux sociaux",
                form.socialNetworks.length ? form.socialNetworks.join(", ") : "Aucun",
              ],
              ["Objectif", form.mainGoal],
              ["Budget mensuel", `${form.monthlyBudget.toLocaleString("fr-FR")} €`],
              [
                "Potentiel",
                form.potentialValue
                  ? `${form.potentialValue.toLocaleString("fr-FR")} €`
                  : "—",
              ],
            ].map(([k, v]) => (
              <div
                key={k as string}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5"
              >
                <span className="text-white/50">{k}</span>
                <span className="text-right font-medium text-white">{v}</span>
              </div>
            ))}
            <p className="mt-2 text-xs text-white/45">
              À la validation, le prospect rejoint votre pipeline et son audit
              digital est généré automatiquement.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!stepValid}
              className="btn-primary"
            >
              Continuer
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {submitting ? "Création en cours…" : "Créer le prospect"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
