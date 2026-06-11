"use client";

import { useEffect, useState } from "react";
import { Brush, Check, Loader2, Lock } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { AgencyBranding } from "@/lib/types";

type Me = {
  email: string;
  role: string;
  plan: string | null;
  planStatus: string;
  features: { whiteLabel: boolean } | null;
  agency: AgencyBranding;
};

const EMPTY: AgencyBranding = {
  agencyName: "",
  logoUrl: "",
  primaryColor: "",
  website: "",
  contactEmail: "",
  phone: "",
  signature: "",
};

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [agency, setAgency] = useState<AgencyBranding>(EMPTY);
  const [savingAgency, setSavingAgency] = useState(false);
  const [agencyMsg, setAgencyMsg] = useState<string | null>(null);
  const [agencyErr, setAgencyErr] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Me) => {
        setMe(d);
        setAgency({
          agencyName: d.agency.agencyName ?? "",
          logoUrl: d.agency.logoUrl ?? "",
          primaryColor: d.agency.primaryColor ?? "",
          website: d.agency.website ?? "",
          contactEmail: d.agency.contactEmail ?? "",
          phone: d.agency.phone ?? "",
          signature: d.agency.signature ?? "",
        });
      });
  }, []);

  const canWhiteLabel = me?.features?.whiteLabel || me?.role === "ADMIN";

  async function saveAgency(e: React.FormEvent) {
    e.preventDefault();
    setSavingAgency(true);
    setAgencyMsg(null);
    setAgencyErr(null);
    const res = await fetch("/api/me/agency", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agency),
    });
    if (res.ok) {
      setAgencyMsg("Personnalisation enregistrée. Vos prochains rapports l'afficheront.");
    } else {
      const body = await res.json().catch(() => null);
      setAgencyErr(body?.error ?? "L'enregistrement a échoué. Veuillez réessayer.");
    }
    setSavingAgency(false);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdErr(null);
    setPwdMsg(null);
    if (password.length < 8) {
      setPwdErr("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setPwdErr("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSavingPwd(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPwdErr("La mise à jour du mot de passe a échoué. Veuillez réessayer.");
    } else {
      setPwdMsg("Mot de passe mis à jour.");
      setPassword("");
      setConfirm("");
    }
    setSavingPwd(false);
  }

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const field = (key: keyof AgencyBranding, label: string, placeholder: string, type = "text") => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        value={agency[key] ?? ""}
        onChange={(e) => setAgency((a) => ({ ...a, [key]: e.target.value }))}
        disabled={!canWhiteLabel}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold text-white">Mon compte</h1>
      <p className="mt-1 text-sm text-white/55">{me.email}</p>

      {/* Marque blanche */}
      <form onSubmit={saveAgency} className="card mt-8 p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Brush className="h-5 w-5 text-indigo-300" />
          Marque blanche
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Vos rapports et propositions affichent l&apos;identité de votre agence.
        </p>
        {!canWhiteLabel && (
          <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            La marque blanche est incluse dans les forfaits Agence et Pro.
          </p>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {field("agencyName", "Nom de l'agence", "Ex. : Studio Horizon")}
          {field("website", "Site web", "https://votre-agence.fr")}
          {field("logoUrl", "URL du logo", "https://…/logo.png")}
          <div>
            <label className="label">Couleur principale</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded-lg border border-white/15 bg-white/[0.05]"
                value={agency.primaryColor || "#6366f1"}
                onChange={(e) =>
                  setAgency((a) => ({ ...a, primaryColor: e.target.value }))
                }
                disabled={!canWhiteLabel}
              />
              <input
                className="input min-w-0 flex-1"
                placeholder="#6366f1"
                value={agency.primaryColor ?? ""}
                onChange={(e) =>
                  setAgency((a) => ({ ...a, primaryColor: e.target.value }))
                }
                disabled={!canWhiteLabel}
              />
            </div>
          </div>
          {field("contactEmail", "Email de contact", "contact@votre-agence.fr", "email")}
          {field("phone", "Téléphone", "06 12 34 56 78")}
        </div>
        <div className="mt-4">
          <label className="label">Signature commerciale</label>
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder="Ex. : « Nous aidons les commerces locaux à devenir incontournables. »"
            value={agency.signature ?? ""}
            onChange={(e) => setAgency((a) => ({ ...a, signature: e.target.value }))}
            disabled={!canWhiteLabel}
          />
        </div>
        {agencyMsg && (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" /> {agencyMsg}
          </p>
        )}
        {agencyErr && <p className="mt-4 text-sm text-rose-300">{agencyErr}</p>}
        <button
          type="submit"
          disabled={savingAgency || !canWhiteLabel}
          className="btn-primary mt-5"
        >
          {savingAgency ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Enregistrer
        </button>
      </form>

      {/* Mot de passe */}
      <form onSubmit={savePassword} className="card mt-6 p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Lock className="h-5 w-5 text-indigo-300" />
          Changer le mot de passe
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input
              type="password"
              minLength={8}
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Confirmation</label>
            <input
              type="password"
              required
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        {pwdMsg && (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" /> {pwdMsg}
          </p>
        )}
        {pwdErr && <p className="mt-4 text-sm text-rose-300">{pwdErr}</p>}
        <button type="submit" disabled={savingPwd} className="btn-primary mt-5">
          {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Mettre à jour
        </button>
      </form>
    </main>
  );
}
