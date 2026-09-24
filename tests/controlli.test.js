import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { controllaLezione, controllaCartella } from "../lib/controlli.js";

const PROGRAMMI = [{
  materia: "geostoria", anno: 1,
  moduli: [{ numero: 1, titolo: "Strumenti", slug: "strumenti-dello-storico",
    argomenti: [{ numero: 2, titolo: "Fonte" }, { numero: 4, titolo: "Storico" }] }],
}];

const FM = "---\nmateria: geostoria\nmodulo: strumenti-dello-storico\nargomento: 2\ntitolo: Che cos'è una fonte\n---\n";
const CORPO = [
  "::: obiettivo", "Distinguere le fonti.", ":::", "",
  "::: do-now", "Tre cose.", ":::", "",
  '::: passo "Che cos\'è una fonte"', "Testo.", "", "---", "", "Altro.", ":::", "",
  "::: uscita", '??? Il diario? -> torna a: "Che cos\'è una fonte"', "- [x] scritta", "- [ ] materiale", ":::", "",
].join("\n");
const BUONA = FM + CORPO;

const messaggi = (errori) => errori.map((e) => e.messaggio).join("\n");

test("una lezione corretta non ha errori", () => {
  assert.deepEqual(controllaLezione(BUONA, "a.md", PROGRAMMI), []);
});

test("blocco obbligatorio mancante", () => {
  const testo = BUONA.replace("::: do-now\nTre cose.\n:::\n", "");
  assert.match(messaggi(controllaLezione(testo, "a.md", PROGRAMMI)), /manca il blocco obbligatorio «do-now»/);
});

test("campo del front matter mancante e argomento inesistente", () => {
  const senzaTitolo = BUONA.replace("titolo: Che cos'è una fonte\n", "");
  assert.match(messaggi(controllaLezione(senzaTitolo, "a.md", PROGRAMMI)), /manca il campo «titolo»/);
  const inesistente = BUONA.replace("argomento: 2", "argomento: 9");
  assert.match(messaggi(controllaLezione(inesistente, "a.md", PROGRAMMI)), /argomento 9: non esiste/);
});

test("blocco sconosciuto e passo senza titolo", () => {
  const testo = BUONA.replace("::: do-now", "::: donow").replace('::: passo "Che cos\'è una fonte"', "::: passo");
  const m = messaggi(controllaLezione(testo, "a.md", PROGRAMMI));
  assert.match(m, /blocco sconosciuto «donow»/);
  assert.match(m, /il passo ha bisogno di un titolo/);
});

test("--- senza riga vuota prima, con numero di riga", () => {
  const testo = BUONA.replace("Testo.\n\n---", "Testo.\n---");
  const errori = controllaLezione(testo, "a.md", PROGRAMMI).filter((e) => /riga vuota prima di ---/.test(e.messaggio));
  assert.equal(errori.length, 1);
  assert.equal(testo.split("\n")[errori[0].riga - 1], "---");
});

test("--- con spazi davanti o trattini in più, senza riga vuota prima", () => {
  for (const riga of [" ---", "   ---", "----"]) {
    const testo = BUONA.replace("Testo.\n\n---", `Testo.\n${riga}`);
    const errori = controllaLezione(testo, "a.md", PROGRAMMI).filter((e) => /riga vuota prima di ---/.test(e.messaggio));
    assert.equal(errori.length, 1, JSON.stringify(riga));
    assert.equal(testo.split("\n")[errori[0].riga - 1], riga);
  }
});

test("--- con spazi davanti ma con la riga vuota prima non è un errore", () => {
  const testo = BUONA.replace("Testo.\n\n---", "Testo.\n\n  ---");
  assert.deepEqual(controllaLezione(testo, "a.md", PROGRAMMI), []);
});

test("quiz senza risposta giusta e torna a verso un passo inesistente", () => {
  const testo = BUONA.replace("- [x] scritta", "- [ ] scritta").replace('torna a: "Che cos\'è una fonte"', 'torna a: "Fonti"');
  const m = messaggi(controllaLezione(testo, "a.md", PROGRAMMI));
  assert.match(m, /nessuna risposta segnata con \[x\]/);
  assert.match(m, /«torna a» punta a un passo che non esiste: «Fonti»/);
});

test("torna a con → e con -> passano entrambi", () => {
  const testo = BUONA.replace("-> torna a", "→ torna a");
  assert.deepEqual(controllaLezione(testo, "a.md", PROGRAMMI), []);
});

test("torna a con virgolette tipografiche passa", () => {
  const testo = BUONA.replace('torna a: "Che cos\'è una fonte"', `torna a: “Che cos'è una fonte”`);
  assert.deepEqual(controllaLezione(testo, "a.md", PROGRAMMI), []);
});

test("torna a scritto male viene segnalato", () => {
  const testo = BUONA.replace('torna a: "Che cos\'è una fonte"', `torna a: Che cos'è una fonte`);
  const m = messaggi(controllaLezione(testo, "a.md", PROGRAMMI));
  assert.match(m, /«torna a» scritto male/);
});

test("torna a in un testo normale non è un errore", () => {
  const testo = BUONA.replace("Tre cose.", "Poi si torna a: casa.");
  assert.deepEqual(controllaLezione(testo, "a.md", PROGRAMMI), []);
});

test("privacy: sigle di classe e date, non le date storiche", () => {
  const testo = BUONA.replace("Tre cose.", "In 1ALS il 23/9, poi 2A il 2026-09-30. Roma nel 753 a.C., Lucy nel 1974.");
  const m = messaggi(controllaLezione(testo, "a.md", PROGRAMMI));
  assert.match(m, /sigla di classe: «1ALS»/);
  assert.match(m, /data di calendario: «23\/9»/);
  assert.doesNotMatch(m, /753|1974/);
  const due = controllaLezione(BUONA.replace("Tre cose.", "La 2A legge."), "a.md", PROGRAMMI);
  assert.match(messaggi(due), /sigla di classe: «2A»/);
});

test("controllaCartella trova due lezioni sullo stesso argomento", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lezioni-"));
  const dirProg = fs.mkdtempSync(path.join(os.tmpdir(), "programmi-"));
  fs.writeFileSync(path.join(dirProg, "geostoria-1.json"), JSON.stringify(PROGRAMMI[0]));
  fs.mkdirSync(path.join(dir, "geostoria", "strumenti-dello-storico"), { recursive: true });
  fs.writeFileSync(path.join(dir, "geostoria", "strumenti-dello-storico", "02-a.md"), BUONA);
  fs.writeFileSync(path.join(dir, "geostoria", "strumenti-dello-storico", "02-b.md"), BUONA);
  const errori = controllaCartella(dir, dirProg);
  assert.equal(errori.length, 1);
  assert.match(errori[0].messaggio, /stesso argomento già trattato in .*02-a\.md/);
});

test("controllaCartella non segnala doppioni fra lezioni senza campi", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lezioni-"));
  const dirProg = fs.mkdtempSync(path.join(os.tmpdir(), "programmi-"));
  fs.writeFileSync(path.join(dirProg, "geostoria-1.json"), JSON.stringify(PROGRAMMI[0]));
  fs.writeFileSync(path.join(dir, "a.md"), CORPO);
  fs.writeFileSync(path.join(dir, "b.md"), CORPO);
  fs.writeFileSync(path.join(dir, "c.md"), BUONA);
  fs.writeFileSync(path.join(dir, "d.md"), BUONA);
  const m = messaggi(controllaCartella(dir, dirProg));
  assert.match(m, /manca il campo «materia»/);
  assert.equal((m.match(/stesso argomento già trattato/g) || []).length, 1);
  assert.match(m, /stesso argomento già trattato in .*c\.md/);
});

test("controllaCartella senza cartella delle lezioni non dà errori", () => {
  assert.deepEqual(controllaCartella("/percorso/che/non/esiste", "/percorso/che/non/esiste"), []);
});
