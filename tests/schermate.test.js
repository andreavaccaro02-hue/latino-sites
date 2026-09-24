import { test } from "node:test";
import assert from "node:assert/strict";
import { creaMarkdown } from "../lib/markdown.js";
import { inSchermate, estraiObiettivo } from "../lib/schermate.js";

const md = creaMarkdown();
const html = md.render([
  "::: obiettivo", "Distinguere le fonti.", ":::", "",
  "::: do-now", "Tre cose.", ":::", "",
  '::: passo "Che cos\'è una fonte"', "Uno.", "", "+ a", "+ b", "", "---", "", "Due.", ":::", "",
  "::: note", "Solo per me.", ":::", "",
  "::: approfondimento", "Extra.", ":::", "",
  "::: uscita", "??? Q", "- [x] s", "- [ ] n", ":::", "",
].join("\n"));
const out = inSchermate(html);
const sezioni = out.match(/<section [^>]*>/g);

test("una schermata per blocco e una in più per ogni ---", () => {
  assert.deepEqual(sezioni.map((s) => s.match(/data-blocco="([^"]+)"/)[1]), ["do-now", "passo", "passo", "uscita"]);
});

test("l'id del passo e del biglietto sta sulla prima schermata", () => {
  assert.match(sezioni[1], /id="passo-che-cos-e-una-fonte"/);
  assert.doesNotMatch(sezioni[2], /id=/);
  assert.match(sezioni[3], /id="biglietto"/);
});

test("l'etichetta si ripete sulle schermate successive dello stesso passo", () => {
  const parti = out.split("</section>");
  assert.match(parti[2], /Passo 1<\/span><span class="passo-sep"> · <\/span>Che cos/);
});

test("elenchi + diventano frammenti", () => {
  assert.match(out, /<li class="fragment">a<\/li>/);
});

test("obiettivo e approfondimento esclusi, note nelle note del relatore", () => {
  assert.doesNotMatch(out, /Distinguere le fonti|Extra\./);
  assert.match(out, /<aside class="notes">\s*<p>Solo per me.<\/p>\s*<\/aside>\s*<\/section>/);
  assert.doesNotMatch(out, /<hr/);
});

test("estraiObiettivo restituisce il testo senza etichetta", () => {
  assert.equal(estraiObiettivo(html), "<p>Distinguere le fonti.</p>");
});

test("il blocco interattivo passa alla LIM senza data-src", () => {
  const html = md.render("::: interattivo geostoria/linea-del-tempo.html\n:::\n");
  const lim = inSchermate(html);
  assert.match(lim, /<iframe src="\/geostoria\/linea-del-tempo.html"/);
  assert.doesNotMatch(lim, /data-src=/);
});
