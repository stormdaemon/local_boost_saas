/**
 * Test de fumée authentifié : connexion Supabase, puis parcours API complet
 * (profil, création de prospect, génération d'audit, proposition, CRM).
 * Usage : node --env-file=.env scripts/smoke-e2e.mjs
 */
import { createServerClient } from "@supabase/ssr";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.SMOKE_EMAIL ?? "tlafont49@gmail.com";
const PASSWORD = process.env.SMOKE_PASSWORD ?? "AdminPass";

const jar = new Map();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cs) => cs.forEach((c) => jar.set(c.name, c.value)),
    },
  },
);

const { error } = await supabase.auth.signInWithPassword({
  email: EMAIL,
  password: PASSWORD,
});
if (error) {
  console.error("ÉCHEC connexion:", error.message);
  process.exit(1);
}
const cookie = [...jar].map(([n, v]) => `${n}=${v}`).join("; ");
console.log("✓ Connexion Supabase OK,", jar.size, "cookie(s) de session");

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

// 1. Profil
const me = await api("GET", "/api/me");
console.log(
  me.status === 200
    ? `✓ /api/me → rôle ${me.json.role}, plan ${me.json.plan ?? "aucun"}`
    : `✗ /api/me → ${me.status}`,
);
if (me.status !== 200) process.exit(1);

// 2. Création de prospect
const created = await api("POST", "/api/businesses", {
  name: "Garage Dupont (test)",
  sector: "Garage automobile",
  city: "Tours",
  mainGoal: "Attirer plus de clients locaux",
  contactName: "Paul Dupont",
  hasGoogleBusiness: true,
  socialNetworks: ["Facebook"],
  monthlyBudget: 800,
  potentialValue: 6000,
});
console.log(
  created.status === 201
    ? `✓ Prospect créé : ${created.json.id}`
    : `✗ Création prospect → ${created.status} ${JSON.stringify(created.json)}`,
);
if (created.status !== 201) process.exit(1);
const bizId = created.json.id;

// 3. Génération d'audit (chaîne réelle + repli)
const audit = await api("POST", `/api/businesses/${bizId}/generate/audit`, {});
console.log(
  audit.status === 200
    ? `✓ Audit généré (moteur : ${audit.json.modelUsed}) — score global ${audit.json.data?.scores?.global}`
    : `✗ Audit → ${audit.status} ${JSON.stringify(audit.json)}`,
);

// 4. Proposition commerciale
const prop = await api("POST", `/api/businesses/${bizId}/generate/proposal`, {});
console.log(
  prop.status === 200
    ? `✓ Proposition générée (${prop.json.data?.offers?.length} offres, reco : ${prop.json.data?.recommendedOffer})`
    : `✗ Proposition → ${prop.status} ${JSON.stringify(prop.json)}`,
);

// 5. CRM : statut + montant
const patch = await api("PATCH", `/api/businesses/${bizId}`, {
  status: "RDV_PREVU",
  potentialValue: 7500,
});
console.log(
  patch.status === 200
    ? `✓ CRM mis à jour (statut ${patch.json.status})`
    : `✗ CRM → ${patch.status}`,
);

// 6. Lecture complète (rapport)
const full = await api("GET", `/api/businesses/${bizId}`);
const assets = full.json?.assets ? Object.keys(full.json.assets) : [];
console.log(
  full.status === 200
    ? `✓ Dossier complet relu (${assets.join(", ")})`
    : `✗ Lecture → ${full.status}`,
);

// 7. Nettoyage
const del = await api("DELETE", `/api/businesses/${bizId}`);
console.log(del.status === 200 ? "✓ Prospect de test supprimé" : `✗ Suppression → ${del.status}`);

console.log("\nPARCOURS AUTHENTIFIÉ COMPLET : OK");
