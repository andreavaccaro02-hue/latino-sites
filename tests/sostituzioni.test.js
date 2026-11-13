import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { linkInterni, risolviLink } from "../lib/uscita.js";

const CASI = [
  { vecchia: "tests/fixtures/vecchia-home.html", posto: "index.html" },
  { vecchia: "tests/fixtures/vecchio-indice-geostoria.html", posto: "geostoria/index.html" },
];

// Tolti apposta il 13/11/2026: i calendari 2025-26 sono finiti, il CV resta solo in chi-sono.html.
const RIMOSSI = new Set(["calendario/terza.html", "calendario/quarta.html", "calendario/quinta.html", "pdf/cv-vaccaro-europass.pdf"]);

const destinazioni = (html, posto) => new Set(linkInterni(html).map((l) => risolviLink(posto, l)).filter(Boolean));

for (const { vecchia, posto } of CASI) {
  test(`la nuova ${posto} conserva i link interni della vecchia, in home o in archivio`, { skip: !fs.existsSync(`_site/${posto}`) && "manca _site: esegui npm run build" }, () => {
    const prima = destinazioni(fs.readFileSync(vecchia, "utf8"), posto);
    const dopo = destinazioni(fs.readFileSync(`_site/${posto}`, "utf8"), posto);
    // Gli strumenti stanno nella home (la barra ci porta con «Strumenti»), i materiali degli anni passati in /archivio/.
    for (const altra of ["index.html", "archivio/index.html"]) for (const d of destinazioni(fs.readFileSync(`_site/${altra}`, "utf8"), altra)) dopo.add(d);
    const persi = [...prima].filter((d) => !dopo.has(d) && !RIMOSSI.has(d) && !d.startsWith("css/") && d !== "favicon.svg");
    assert.deepEqual(persi, []);
  });
}

const META = [
  /<meta name="description" content="([^"]*)"/,
  /<link rel="canonical" href="([^"]*)"/,
  /<meta property="og:url" content="([^"]*)"/,
  /<meta property="og:image" content="([^"]*)"/,
  /<meta property="og:description" content="([^"]*)"/,
];

for (const { vecchia, posto } of CASI) {
  test(`la nuova ${posto} conserva i metadati di anteprima della vecchia`, { skip: !fs.existsSync(`_site/${posto}`) && "manca _site: esegui npm run build" }, () => {
    const prima = fs.readFileSync(vecchia, "utf8");
    const dopo = fs.readFileSync(`_site/${posto}`, "utf8");
    for (const re of META) {
      const v = prima.match(re);
      if (v) assert.equal(dopo.match(re)?.[1], v[1], re.source);
    }
  });
}
