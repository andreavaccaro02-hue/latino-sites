import { test } from "node:test";
import assert from "node:assert/strict";
import { vicine, lezionePer, inProgrammi, voceModulo, rimandiPer, materia, nomeAnno } from "../lib/navigazione.js";

const L = (argomento, modulo = "strumenti-dello-storico") => ({
  url: `/geostoria/${modulo}/l${argomento}/`,
  data: { materia: "geostoria", modulo, argomento, titolo: `L${argomento}` },
});
const lezioni = [L(4), L(2), L(1, "preistoria"), L(3)];

test("vicine resta nel modulo e segue l'ordine degli argomenti", () => {
  const v = vicine(lezioni, { url: "/geostoria/strumenti-dello-storico/l3/" });
  assert.equal(v.precedente.data.argomento, 2);
  assert.equal(v.successiva.data.argomento, 4);
  const ultima = vicine(lezioni, { url: "/geostoria/strumenti-dello-storico/l4/" });
  assert.equal(ultima.successiva, null);
});

test("lezionePer trova per materia, modulo, argomento", () => {
  assert.equal(lezionePer(lezioni, "geostoria", "strumenti-dello-storico", 2).url, "/geostoria/strumenti-dello-storico/l2/");
  assert.equal(lezionePer(lezioni, "geostoria", "strumenti-dello-storico", 9), null);
});

test("inProgrammi elenca gli anni in cui il modulo compare", () => {
  const programmi = {
    "geostoria-2": { materia: "geostoria", anno: 2, moduli: [{ numero: 1, slug: "cap-06" }] },
    "geostoria-1": { materia: "geostoria", anno: 1, moduli: [{ numero: 10, slug: "cap-06" }] },
  };
  assert.deepEqual(inProgrammi(programmi, "geostoria", "cap-06"), [{ anno: 1, numero: 10 }, { anno: 2, numero: 1 }]);
});

test("voceModulo, rimandiPer, materia, nomeAnno", () => {
  const moduli = [{ materia: "geostoria", slug: "s", titolo_argo: "T", rimandi: { 1: ["a.html"] } }];
  assert.equal(voceModulo(moduli, "geostoria", "s").titolo_argo, "T");
  assert.deepEqual(rimandiPer(moduli, "geostoria", "s", 1), ["a.html"]);
  assert.deepEqual(rimandiPer(moduli, "geostoria", "s", 2), []);
  assert.equal(materia([{ id: "geostoria", nome: "Geostoria", colore: "#a34a28" }], "geostoria").colore, "#a34a28");
  assert.equal(nomeAnno(2), "seconda");
});
