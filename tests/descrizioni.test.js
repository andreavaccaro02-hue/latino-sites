import { test } from "node:test";
import assert from "node:assert/strict";
import { accorcia, descrizioneLezione } from "../lib/descrizioni.js";

test("descrizioneLezione unisce sottotitolo e obiettivo", () => {
  const md = "::: obiettivo\nSo leggere una *fonte*.\n:::\n\nTesto.";
  assert.equal(descrizioneLezione("Che cosa resta del passato", md), "Che cosa resta del passato. So leggere una fonte.");
});

test("descrizioneLezione regge l'assenza di obiettivo o sottotitolo", () => {
  assert.equal(descrizioneLezione("Solo sottotitolo", "Testo."), "Solo sottotitolo.");
  assert.equal(descrizioneLezione(undefined, "::: obiettivo\nSo fare.\n:::"), "So fare.");
});

test("accorcia taglia a parola intera entro il limite", () => {
  const lungo = "parola ".repeat(40);
  const corto = accorcia(lungo, 30);
  assert.ok(corto.length <= 30);
  assert.match(corto, /parola…$/);
});
