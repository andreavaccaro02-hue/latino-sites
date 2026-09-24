import { test } from "node:test";
import assert from "node:assert/strict";
import { fileMancanti, linkInterni, risolviLink } from "../lib/uscita.js";

test("fileMancanti elenca i file tracciati assenti dall'uscita", () => {
  const presenti = new Set(["index.html", "css/style.css"]);
  assert.deepEqual(fileMancanti(["index.html", "css/style.css", "pdf/cv.pdf"], presenti), ["pdf/cv.pdf"]);
});

test("linkInterni ignora esterni, ancore, mailto e segnaposto JavaScript", () => {
  const html = `<a href="../css/x.css"></a><a href="https://a.it"></a><a href="#su"></a>
    <a href="mailto:a@b.it"></a><img src="\${f.img}"><img src="reperti/a.jpg">`;
  assert.deepEqual(linkInterni(html), ["../css/x.css", "reperti/a.jpg"]);
});

test("risolviLink gestisce relativi, assoluti col prefisso e cartelle", () => {
  assert.equal(risolviLink("geostoria/index.html", "../css/style.css"), "css/style.css");
  assert.equal(risolviLink("geostoria/a/b/index.html", "/latino-sites/geostoria/"), "geostoria/index.html");
  assert.equal(risolviLink("index.html", "percorsi/latino1.html?x=1#top"), "percorsi/latino1.html");
  assert.equal(risolviLink("index.html", "https://esempio.it"), null);
});
