import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileMancanti } from "../lib/uscita.js";

const ESCLUSI = [/^docs\//, /^src\//, /^lib\//, /^scripts\//, /^tests\//, /^\.github\//,
  /^\.gitignore$/, /^package(-lock)?\.json$/, /^eleventy\.config\.js$/, /^_config\.yml$/];

const tracciati = execSync("git ls-files", { encoding: "utf8" })
  .split("\n").filter(Boolean).filter((f) => !ESCLUSI.some((r) => r.test(f)));

const presenti = new Set();
(function visita(dir) {
  for (const voce of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, voce.name);
    if (voce.isDirectory()) visita(p);
    else presenti.add(path.relative("_site", p).split(path.sep).join("/"));
  }
})("_site");

const mancanti = fileMancanti(tracciati, presenti);
if (mancanti.length) {
  console.error(`Mancano ${mancanti.length} file del sito attuale in _site/:\n` + mancanti.join("\n"));
  process.exit(1);
}
console.log(`Confronto riuscito: ${tracciati.length} file del sito attuale presenti in _site/.`);
