/**
 * QA responsive de l'espace authentifié.
 * 1. Crée un utilisateur QA (Supabase admin) et le passe ADMIN (accès complet).
 * 2. Se connecte via le formulaire /login dans Chrome headless.
 * 3. Capture dashboard, formulaire prospect, fiche prospect (nav mobile),
 *    settings, billing à plusieurs largeurs + détection de débordement.
 * 4. Nettoie tout (prospect, profil, utilisateur Supabase).
 */
import "dotenv/config";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3000";
const OUT = join(process.cwd(), "qa-screens");
mkdirSync(OUT, { recursive: true });

const QA_EMAIL = "qa.responsive.claude@example.com";
const QA_PASSWORD = "QaResponsive!2026";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

async function findQaUser() {
  const { data } = await supabase.auth.admin.listUsers({ perPage: 200 });
  return data?.users?.find((u) => u.email === QA_EMAIL) ?? null;
}

async function cleanup() {
  const user = await findQaUser();
  if (user) {
    await db.query(`DELETE FROM "Business" WHERE "userId" = $1`, [user.id]);
    await db.query(`DELETE FROM "UsageLog" WHERE "userId" = $1`, [user.id]).catch(() => {});
    await db.query(`DELETE FROM "Subscription" WHERE "userId" = $1`, [user.id]).catch(() => {});
    await db.query(`DELETE FROM "Profile" WHERE id = $1`, [user.id]);
    await supabase.auth.admin.deleteUser(user.id);
    console.log("cleanup: utilisateur QA supprimé");
  }
}

if (process.argv.includes("--cleanup-only")) {
  await cleanup();
  await db.end();
  process.exit(0);
}

// --- Setup utilisateur QA -------------------------------------------------
await cleanup(); // état propre si run précédent interrompu
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email: QA_EMAIL,
  password: QA_PASSWORD,
  email_confirm: true,
});
if (createErr) {
  console.error("Création utilisateur QA impossible:", createErr.message);
  process.exit(1);
}
console.log("setup: utilisateur QA créé", created.user.id);

// --- Navigateur -----------------------------------------------------------
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
});
const page = await browser.newPage();
let failures = 0;

async function checkAndShoot(name, width, { fullPage = false } = {}) {
  const metrics = await page.evaluate(() => {
    const doc = document.scrollingElement ?? document.documentElement;
    const overflowing = [];
    if (doc.scrollWidth > window.innerWidth + 1) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width > window.innerWidth + 1 || r.right > window.innerWidth + 8) {
          overflowing.push(
            `<${el.tagName.toLowerCase()} class="${(el.className?.toString() ?? "").slice(0, 70)}"> right=${Math.round(r.right)}`,
          );
          if (overflowing.length >= 4) break;
        }
      }
    }
    return { scrollWidth: doc.scrollWidth, innerWidth: window.innerWidth, overflowing };
  });
  const overflow = metrics.scrollWidth > metrics.innerWidth + 1;
  if (overflow) failures++;
  console.log(
    `${(overflow ? "OVERFLOW" : "ok").padEnd(8)} ${name.padEnd(24)} @${width} scrollW=${metrics.scrollWidth}`,
  );
  for (const o of metrics.overflowing) console.log(`         ↳ ${o}`);
  await page.screenshot({ path: join(OUT, `${name}-${width}.png`), fullPage });
}

async function visit(name, path, widths, opts) {
  for (const w of widths) {
    await page.setViewport({ width: w, height: 850, deviceScaleFactor: 1.5 });
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 500));
    await checkAndShoot(name, w, opts);
  }
}

try {
  // --- Connexion (et au passage QA du formulaire à 375) --------------------
  await page.setViewport({ width: 375, height: 800, deviceScaleFactor: 1.5 });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
  await page.type('input[type="email"]', QA_EMAIL);
  await page.type('input[type="password"]', QA_PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 45000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log("login: ok ->", page.url());

  // Paywall (utilisateur sans abonnement) — écran réel à vérifier.
  await visit("app-paywall", "/app", [320, 375]);

  // Accès complet via rôle ADMIN.
  await db.query(`UPDATE "Profile" SET role = 'ADMIN' WHERE id = $1`, [created.user.id]);
  console.log("setup: profil passé ADMIN");

  await visit("app-dashboard", "/app", [320, 375, 768, 1024]);
  await visit("app-new-prospect", "/app/prospects/new", [320, 375, 768]);
  await visit("app-settings", "/app/settings", [320, 375]);
  await visit("app-billing", "/app/billing", [320, 375]);

  // --- Création d'un prospect directement via l'API (cookies de session) ---
  const business = await page.evaluate(async () => {
    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Boulangerie Test",
        contactName: "Jean QA",
        sector: "Boulangerie / Pâtisserie",
        city: "Angers",
        website: "",
        phone: "",
        description: "Prospect de test QA responsive",
        hasGoogleBusiness: true,
        socialNetworks: ["Instagram"],
        mainGoal: "Attirer plus de clients locaux",
        targetAudience: "",
        monthlyBudget: 500,
        potentialValue: null,
      }),
    });
    return res.json();
  });
  if (!business?.id) throw new Error("Création du prospect QA échouée: " + JSON.stringify(business));
  console.log("setup: prospect QA créé", business.id);

  // Pages prospect SANS auto-génération (strategy, roi, presentation, report).
  await visit("prospect-strategy", `/app/prospects/${business.id}/strategy`, [320, 375, 768, 1024]);
  await visit("prospect-roi", `/app/prospects/${business.id}/roi`, [320, 375, 768]);
  await visit("prospect-report", `/app/prospects/${business.id}/report`, [320, 375]);
  await visit("prospect-presentation", `/app/prospects/${business.id}/presentation`, [320, 375]);

  // Dashboard avec une ligne dans le tableau.
  await visit("app-dashboard-filled", "/app", [375]);

  // Admin.
  await visit("admin-overview", "/admin", [320, 375, 768]);
  await visit("admin-models", "/admin/models", [320, 375]);
} finally {
  await browser.close();
  await cleanup();
  await db.end();
}

console.log(failures === 0 ? "\nQA APP OK : aucun débordement." : `\n${failures} cas en débordement.`);
process.exit(failures === 0 ? 0 : 1);
