const MASSIMO = 160;

export function accorcia(testo, massimo = MASSIMO) {
  const pulito = testo.replace(/\s+/g, " ").trim();
  if (pulito.length <= massimo) return pulito;
  const taglio = pulito.slice(0, massimo - 1);
  return taglio.slice(0, taglio.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…";
}

function senzaMarkdown(testo) {
  return testo.replace(/[*_`]/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

// Ripiego quando la lezione non dichiara `descrizione`: sottotitolo e obiettivo.
export function descrizioneLezione(sottotitolo, markdown) {
  const obiettivo = markdown.match(/^:::\s*obiettivo\s*\n([\s\S]*?)\n:::/m)?.[1] ?? "";
  const parti = [sottotitolo, senzaMarkdown(obiettivo)].map((p) => (p ?? "").trim()).filter(Boolean);
  return accorcia(parti.map((p) => (/[.!?…]$/.test(p) ? p : `${p}.`)).join(" "));
}
