/**
 * QA responsive : capture chaque page publique à plusieurs largeurs et
 * signale tout débordement horizontal (scrollWidth > viewport).
 * Usage : node scripts/qa-responsive.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = join(process.cwd(), "qa-screens");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["landing", "/"],
  ["login", "/login"],
  ["signup", "/signup"],
  ["mdp-oublie", "/mot-de-passe-oublie"],
  ["tarifs", "/tarifs"],
  ["blog", "/blog"],
  ["blog-article", "/blog/vendre-plus-vite-prestations-web-audit-digital-local"],
  ["contact", "/contact"],
  ["exemple-rapport", "/exemple-rapport"],
  ["not-found", "/page-inexistante"],
];

const WIDTHS = [320, 375, 414, 768, 1024, 1440];

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
});

let failures = 0;
const page = await browser.newPage();

for (const [name, path] of PAGES) {
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 30000 });
    // Laisse le temps aux fonts/transitions de se stabiliser.
    await new Promise((r) => setTimeout(r, 300));

    const metrics = await page.evaluate(() => {
      const doc = document.scrollingElement ?? document.documentElement;
      const overflowing = [];
      if (doc.scrollWidth > window.innerWidth + 1) {
        // Identifie les éléments plus larges que le viewport.
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width > window.innerWidth + 1 || r.right > window.innerWidth + 8) {
            const cls = (el.className?.toString() ?? "").slice(0, 80);
            overflowing.push(`<${el.tagName.toLowerCase()} class="${cls}"> right=${Math.round(r.right)}`);
            if (overflowing.length >= 5) break;
          }
        }
      }
      return {
        scrollWidth: doc.scrollWidth,
        innerWidth: window.innerWidth,
        overflowing,
      };
    });

    const overflow = metrics.scrollWidth > metrics.innerWidth + 1;
    const tag = overflow ? "OVERFLOW" : "ok";
    if (overflow) failures++;
    console.log(
      `${tag.padEnd(8)} ${name.padEnd(16)} @${String(width).padEnd(4)} scrollW=${metrics.scrollWidth}`,
    );
    for (const o of metrics.overflowing) console.log(`         ↳ ${o}`);

    if (width === 320 || width === 375 || width === 768 || width === 1440) {
      await page.screenshot({
        path: join(OUT, `${name}-${width}.png`),
        fullPage: true,
      });
    }
  }
}

await browser.close();
console.log(failures === 0 ? "\nQA OK : aucun débordement." : `\n${failures} cas en débordement.`);
process.exit(failures === 0 ? 0 : 1);
