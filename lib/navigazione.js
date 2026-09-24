const NOMI_ANNO = { 1: "prima", 2: "seconda", 3: "terza", 4: "quarta", 5: "quinta" };

export function lezioniDelModulo(lezioni, materia, modulo) {
  return lezioni
    .filter((l) => l.data.materia === materia && l.data.modulo === modulo)
    .sort((a, b) => Number(a.data.argomento) - Number(b.data.argomento));
}

export function vicine(lezioni, corrente) {
  const qui = lezioni.find((l) => l.url === corrente.url);
  if (!qui) return { precedente: null, successiva: null };
  const elenco = lezioniDelModulo(lezioni, qui.data.materia, qui.data.modulo);
  const i = elenco.indexOf(qui);
  return { precedente: elenco[i - 1] ?? null, successiva: elenco[i + 1] ?? null };
}

export function lezionePer(lezioni, materia, modulo, argomento) {
  return lezioni.find((l) => l.data.materia === materia && l.data.modulo === modulo
    && Number(l.data.argomento) === Number(argomento)) ?? null;
}

export function inProgrammi(programmi, materia, modulo) {
  return Object.values(programmi)
    .filter((p) => p.materia === materia)
    .flatMap((p) => p.moduli.filter((m) => m.slug === modulo).map((m) => ({ anno: p.anno, numero: m.numero })))
    .sort((a, b) => a.anno - b.anno);
}

export function voceModulo(moduli, materia, slug) {
  return moduli.find((m) => m.materia === materia && m.slug === slug)
    ?? { materia, slug, titolo_argo: slug, rimandi: {} };
}

export function rimandiPer(moduli, materia, slug, argomento) {
  return voceModulo(moduli, materia, slug).rimandi?.[String(argomento)] ?? [];
}

export function materia(materie, id) {
  return materie.find((m) => m.id === id) ?? { id, nome: id, colore: "#16140f", pagine: [] };
}

export function nomeAnno(n) {
  return NOMI_ANNO[n] ?? String(n);
}
