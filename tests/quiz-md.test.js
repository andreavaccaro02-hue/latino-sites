import { test } from "node:test";
import assert from "node:assert/strict";
import { creaMarkdown } from "../lib/markdown.js";

const md = creaMarkdown();

test("domanda con opzioni diventa quiz", () => {
  const html = md.render("??? Un denario è una fonte…\n- [ ] scritta\n- [x] *materiale*\n");
  assert.match(html, /<div class="quiz">/);
  assert.match(html, /<p class="quiz-domanda">Un denario è una fonte…<\/p>/);
  assert.match(html, /data-giusta="false">scritta<\/button>/);
  assert.match(html, /data-giusta="true"><em>materiale<\/em><\/button>/);
  assert.doesNotMatch(html, /\[x\]/);
});

test("torna a con freccia → o con ->", () => {
  for (const freccia of ["→", "->"]) {
    const html = md.render(`??? Domanda ${freccia} torna a: "Che cos'è una fonte"\n- [x] sì\n- [ ] no\n`);
    assert.match(html, /data-torna="passo-che-cos-e-una-fonte"/);
    assert.match(html, /data-torna-titolo="Che cos'è una fonte"/);
    assert.match(html, /<p class="quiz-domanda">Domanda<\/p>/);
  }
});

test("quiz dentro un blocco", () => {
  const html = md.render("::: uscita\n??? Q\n- [x] a\n- [ ] b\n:::\n");
  assert.match(html, /data-blocco="uscita" id="biglietto">[\s\S]*<div class="quiz">[\s\S]*<\/section>/);
});

test("elenco normale dopo ??? senza caselle resta un elenco", () => {
  const html = md.render("??? Q\n- a\n- b\n");
  assert.doesNotMatch(html, /class="quiz"/);
  assert.match(html, /<li>a<\/li>/);
});
