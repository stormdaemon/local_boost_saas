/** Captures viewport ciblées (non pleine page) pour inspection fine. */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = join(process.cwd(), "qa-screens");
mkdirSync(OUT, { recursive: true });

// [nom, chemin, largeur, hauteur, scrollY]
const SHOTS = [
  ["top-landing-320", "/", 320, 700, 0],
  ["top-landing-375", "/", 375, 750, 0],
  ["top-landing-768", "/", 768, 900, 0],
  ["login-320", "/login", 320, 700, 0],
  ["login-375", "/login", 375, 750, 0],
  ["tarifs-375", "/tarifs", 375, 750, 0],
  ["tarifs-table-375", "/tarifs", 375, 750, 500],
  ["landing-tarifs-375", "/#tarifs", 375, 800, 0],
  ["contact-320", "/contact", 320, 700, 0],
];

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
});
const page = await browser.newPage();

for (const [name, path, w, h, scrollY] of SHOTS) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 30000 });
  if (scrollY) await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  console.log(`shot ${name}`);
}

await browser.close();
