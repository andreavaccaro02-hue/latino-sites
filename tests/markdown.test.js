import { test } from "node:test";
import assert from "node:assert/strict";
import { slug } from "../lib/slug.js";
import { creaMarkdown } from "../lib/markdown.js";

const md = creaMarkdown();

test("slug toglie accenti, apostrofi e punteggiatura", () => {
  assert.equal(slug("Che cos'è una fonte"), "che-cos-e-una-fonte");
  assert.equal(slug("  Storico  e archeologo! "), "storico-e-archeologo");
});

test("blocco obbligatorio con etichetta pubblica", () => {
  const html = md.render("::: do-now\nScrivi tre cose.\n:::\n");
  assert.match(html, /<section class="blocco blocco-do-now" data-blocco="do-now">/);
  assert.match(html, /<h2 class="blocco-etichetta">Per cominciare<\/h2>/);
  assert.match(html, /<p>Scrivi tre cose.<\/p>/);
});

test("i passi sono numerati e hanno un'ancora", () => {
  const html = md.render('::: passo "Che cos\'è una fonte"\nA\n:::\n\n::: passo "Quanto fidarsi"\nB\n:::\n');
  assert.match(html, /id="passo-che-cos-e-una-fonte"/);
  assert.match(html, /<span class="passo-numero">Passo 1<\/span><span class="passo-sep"> · <\/span>Che cos'è una fonte/);
  assert.match(html, /<span class="passo-numero">Passo 2<\/span><span class="passo-sep"> · <\/span>Quanto fidarsi/);
});

test("uscita ha l'ancora biglietto", () => {
  assert.match(md.render("::: uscita\nX\n:::\n"), /data-blocco="uscita" id="biglietto"/);
});

test("--- con riga vuota prima diventa cambio di schermata", () => {
  const html = md.render('::: passo "A"\nUno.\n\n---\n\nDue.\n:::\n');
  assert.match(html, /<hr class="schermata">/);
});

test("elenco con + è rivelabile, con - no", () => {
  const html = md.render("+ uno\n+ due\n\n- tre\n");
  assert.match(html, /<ul class="rivela">\s*<li>uno<\/li>/);
  assert.match(html, /<ul>\s*<li>tre<\/li>/);
});

test("lavagna, interattivo, approfondimento, note", () => {
  const html = md.render([
    '::: lavagna "Storico e archeologo"', ":::", "",
    "::: interattivo geostoria/linea-del-tempo.html", ":::", "",
    "::: approfondimento", "Extra.", ":::", "",
    "::: note", "Per me.", ":::", "",
  ].join("\n"));
  assert.match(html, /data-blocco="lavagna" data-chiave="storico-e-archeologo"/);
  assert.match(html, /Rispondi sul quaderno\./);
  assert.doesNotMatch(html, /data-src=/);
  assert.match(html, /<iframe src="\/geostoria\/linea-del-tempo.html"/);
  assert.match(html, /<details class="blocco blocco-approfondimento" data-blocco="approfondimento">\s*<summary>Per saperne di più<\/summary>/);
  assert.match(html, /<aside class="blocco blocco-note" data-blocco="note" hidden>/);
});
