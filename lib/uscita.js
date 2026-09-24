import path from "node:path";

const ESTERNO = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export function fileMancanti(tracciati, presenti) {
  return tracciati.filter((f) => !presenti.has(f));
}

export function linkInterni(html) {
  const link = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const valore = m[1].trim();
    if (!valore || ESTERNO.test(valore) || valore.includes("${") || valore.includes("{{")) continue;
    link.push(valore);
  }
  return link;
}

export function risolviLink(daFile, link, prefisso = "/latino-sites/") {
  if (ESTERNO.test(link)) return null;
  let percorso = decodeURI(link.split("#")[0].split("?")[0]);
  if (percorso === "") return null;
  if (percorso.startsWith("/")) {
    if (!percorso.startsWith(prefisso)) return percorso.slice(1) || "index.html";
    percorso = percorso.slice(prefisso.length);
  } else {
    percorso = path.posix.join(path.posix.dirname(daFile), percorso);
  }
  if (percorso === "" || percorso === "." || percorso.endsWith("/")) percorso = `${percorso === "." ? "" : percorso}index.html`;
  return path.posix.normalize(percorso);
}
