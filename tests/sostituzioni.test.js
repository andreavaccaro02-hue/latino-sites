import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { linkInterni, risolviLink } from "../lib/uscita.js";

const CASI = [
  { vecchia: "tests/fixtures/vecchia-home.html", posto: "index.html" },
  { vecchia: "tests/fixtures/vecchio-indice-geostoria.html", posto: "geostoria/index.html" },
];

const destinazioni = (html, posto) => new Set(linkInterni(html).map((l) => risolviLink(posto, l)).filter(Boolean));

for (const { vecchia, posto } of CASI) {
  test(`la nuova ${posto} conserva i link interni della vecchia`, { skip: !fs.existsSync(`_site/${posto}`) && "manca _site: esegui npm run build" }, () => {
    const prima = destinazioni(fs.readFileSync(vecchia, "utf8"), posto);
    const dopo = destinazioni(fs.readFileSync(`_site/${posto}`, "utf8"), posto);
    const persi = [...prima].filter((d) => !dopo.has(d) && !d.startsWith("css/") && d !== "favicon.svg");
    assert.deepEqual(persi, []);
  });
}
