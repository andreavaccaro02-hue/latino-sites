import fs from "node:fs";
import path from "node:path";
import { linkInterni, risolviLink } from "../lib/uscita.js";

const NOTI = "scripts/link-noti.json";
const aggiorna = process.argv.includes("--aggiorna-noti");
const noti = new Set(fs.existsSync(NOTI) ? JSON.parse(fs.readFileSync(NOTI, "utf8")) : []);

const pagine = [];
(function visita(dir) {
  for (const voce of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, voce.name);
    if (voce.isDirectory()) visita(p);
    else if (p.endsWith(".html")) pagine.push(path.relative("_site", p).split(path.sep).join("/"));
  }
})("_site");

const rotti = [];
for (const pagina of pagine) {
  const html = fs.readFileSync(path.join("_site", pagina), "utf8");
  for (const link of linkInterni(html)) {
    const destinazione = risolviLink(pagina, link);
    if (destinazione === null) continue;
    const pieno = path.join("_site", destinazione);
    const esiste = fs.existsSync(pieno) && (fs.statSync(pieno).isFile() || fs.existsSync(path.join(pieno, "index.html")));
    if (!esiste) rotti.push(`${pagina} -> ${link}`);
  }
}

if (aggiorna) {
  fs.writeFileSync(NOTI, JSON.stringify([...new Set(rotti)].sort(), null, 2) + "\n");
  console.log(`Salvati ${rotti.length} link rotti già presenti in ${NOTI}.`);
  process.exit(0);
}
const nuovi = rotti.filter((r) => !noti.has(r));
if (nuovi.length) {
  console.error(`Link interni rotti (${nuovi.length}):\n` + nuovi.join("\n"));
  process.exit(1);
}
console.log(`Link interni controllati in ${pagine.length} pagine: nessun link rotto nuovo.`);
