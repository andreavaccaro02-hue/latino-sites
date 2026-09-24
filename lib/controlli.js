import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BLOCCHI } from "./blocchi.js";

const OBBLIGATORI = Object.entries(BLOCCHI).filter(([, b]) => b.obbligatorio).map(([nome]) => nome);
const CLASSE = /(?<![\p{L}\p{N}])[1-5][A-Z]{1,3}(?![\p{L}\p{N}])/u;
const DATA = /(?<![\d/])(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})(?![\d/])/;
const TORNA = /(?:→|->)\s*torna a:\s*[""]([^"""]+)[""]\s*$/;

export function controllaLezione(testo, file, programmi) {
  const errori = [];
  const errore = (messaggio, riga) => errori.push(riga ? { file, riga, messaggio } : { file, messaggio });

  let fm;
  let corpo;
  try {
    ({ data: fm, content: corpo } = matter(testo));
  } catch (e) {
    errore(`front matter illeggibile: ${e.message}`);
    return errori;
  }

  for (const campo of ["materia", "modulo", "argomento", "titolo"]) {
    if (fm[campo] === undefined || fm[campo] === null || fm[campo] === "") errore(`manca il campo «${campo}» nel front matter`);
  }
  if (fm.materia && fm.modulo && fm.argomento !== undefined) {
    const esiste = programmi.some((p) => p.materia === fm.materia
      && p.moduli.some((m) => m.slug === fm.modulo && m.argomenti.some((a) => a.numero === Number(fm.argomento))));
    if (!esiste) errore(`modulo «${fm.modulo}», argomento ${fm.argomento}: non esiste in nessun programma di ${fm.materia}`);
  }

  const righe = testo.split("\n");
  const righeCorpo = corpo.split("\n");
  const scarto = righe.length - righeCorpo.length;
  const rigaFile = (i) => scarto + i + 1;

  const presenti = new Set();
  const passi = new Set();
  righeCorpo.forEach((r, i) => {
    const m = r.match(/^:::\s*(\S+)(.*)$/);
    if (!m) return;
    const nome = m[1];
    if (!BLOCCHI[nome]) {
      errore(`blocco sconosciuto «${nome}»`, rigaFile(i));
      return;
    }
    presenti.add(nome);
    if (nome === "passo") {
      const titolo = m[2].trim().match(/^"(.+)"$/);
      if (titolo) passi.add(titolo[1]);
      else errore('il passo ha bisogno di un titolo tra virgolette: ::: passo "Titolo"', rigaFile(i));
    }
  });
  for (const nome of OBBLIGATORI) if (!presenti.has(nome)) errore(`manca il blocco obbligatorio «${nome}»`);

  righeCorpo.forEach((r, i) => {
    if (/^ {0,3}-{3,}\s*$/.test(r) && i > 0 && righeCorpo[i - 1].trim() !== "") {
      errore("serve una riga vuota prima di --- (altrimenti diventa un titolo)", rigaFile(i));
    }
  });

  righeCorpo.forEach((r, i) => {
    if (!r.startsWith("??? ")) return;
    const opzioni = [];
    for (let k = i + 1; k < righeCorpo.length && /^- \[( |x|X)\] /.test(righeCorpo[k]); k++) opzioni.push(righeCorpo[k]);
    if (!opzioni.length) errore("domanda senza opzioni (- [ ] / - [x])", rigaFile(i));
    else if (!opzioni.some((o) => /^- \[(x|X)\]/.test(o))) errore("nessuna risposta segnata con [x]", rigaFile(i));
    const torna = r.match(TORNA);
    if (torna && !passi.has(torna[1])) errore(`«torna a» punta a un passo che non esiste: «${torna[1]}»`, rigaFile(i));
    else if (!torna && /torna a:/.test(r)) errore('«torna a» scritto male: serve -> torna a: "Titolo del passo"', rigaFile(i));
  });

  righe.forEach((r, i) => {
    const classe = r.match(CLASSE);
    if (classe) errore(`possibile sigla di classe: «${classe[0]}»`, i + 1);
    const data = r.match(DATA);
    if (data) errore(`possibile data di calendario: «${data[0]}»`, i + 1);
  });

  return errori;
}

export function leggiProgrammi(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

export function controllaCartella(dirLezioni, dirProgrammi) {
  if (!fs.existsSync(dirLezioni)) return [];
  const programmi = leggiProgrammi(dirProgrammi);
  const file = fs.readdirSync(dirLezioni, { recursive: true })
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dirLezioni, f))
    .sort();
  const errori = [];
  const visti = new Map();
  for (const f of file) {
    const testo = fs.readFileSync(f, "utf8");
    errori.push(...controllaLezione(testo, f, programmi));
    let fm;
    try { fm = matter(testo).data; } catch { continue; }
    const chiave = `${fm.materia}/${fm.modulo}/${fm.argomento}`;
    if (visti.has(chiave)) errori.push({ file: f, messaggio: `stesso argomento già trattato in ${visti.get(chiave)}` });
    else visti.set(chiave, f);
  }
  return errori;
}

export function formattaErrori(errori) {
  return errori.map((e) => `${e.file}${e.riga ? `:${e.riga}` : ""}  ${e.messaggio}`).join("\n");
}
