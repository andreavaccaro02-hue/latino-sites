import fs from "node:fs";
import path from "node:path";

export const BASE = "https://andreavaccaro02-hue.github.io/latino-sites/";

export function indicizzabile(html) {
  if (!/<html[\s>]/i.test(html)) return false;
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) return false;
  if (/http-equiv="refresh"/i.test(html)) return false;
  return true;
}

export function urlDaPercorso(percorso, base = BASE) {
  return base + percorso.replace(/(^|\/)index\.html$/, "$1");
}

export function haCanonical(html) {
  return /<link\s+rel="canonical"/i.test(html);
}

export function haDescrizione(html) {
  return /<meta\s+name="description"/i.test(html);
}

export function aggiungiCanonical(html, url) {
  return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<link rel="canonical" href="${url}">`);
}

export function creaSitemap(url) {
  const voci = [...url].sort().map((u) => `  <url><loc>${u}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${voci}\n</urlset>\n`;
}

function fileHtml(dir, radice = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((voce) => {
    const p = path.join(dir, voce.name);
    if (voce.isDirectory()) return fileHtml(p, radice);
    return voce.name.endsWith(".html") ? [path.relative(radice, p).split(path.sep).join("/")] : [];
  });
}

// Dopo la build: aggiunge il canonical dove manca, scrive sitemap.xml
// e restituisce le pagine indicizzabili senza description.
export function preparaIndicizzazione(uscita) {
  const url = [];
  const senzaDescrizione = [];
  for (const percorso of fileHtml(uscita)) {
    const file = path.join(uscita, percorso);
    let html = fs.readFileSync(file, "utf8");
    if (!indicizzabile(html)) continue;
    const indirizzo = urlDaPercorso(percorso);
    if (!haCanonical(html)) {
      html = aggiungiCanonical(html, indirizzo);
      fs.writeFileSync(file, html);
    }
    if (!haDescrizione(html)) senzaDescrizione.push(percorso);
    url.push(indirizzo);
  }
  fs.writeFileSync(path.join(uscita, "sitemap.xml"), creaSitemap(url));
  return { url, senzaDescrizione };
}
