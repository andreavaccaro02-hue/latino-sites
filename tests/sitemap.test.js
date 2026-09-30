import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { aggiungiCanonical, creaSitemap, indicizzabile, preparaIndicizzazione, urlDaPercorso } from "../lib/sitemap.js";

test("indicizzabile esclude noindex, redirect e file senza <html>", () => {
  assert.equal(indicizzabile('<html lang="it"><head></head></html>'), true);
  assert.equal(indicizzabile('<html><head><meta name="robots" content="noindex"></head></html>'), false);
  assert.equal(indicizzabile('<html><head><meta http-equiv="refresh" content="0;url=x"></head></html>'), false);
  assert.equal(indicizzabile("google-site-verification: google123.html"), false);
});

test("urlDaPercorso toglie index.html e tiene gli altri nomi", () => {
  const b = "https://x.it/s/";
  assert.equal(urlDaPercorso("index.html", b), "https://x.it/s/");
  assert.equal(urlDaPercorso("geostoria/1/index.html", b), "https://x.it/s/geostoria/1/");
  assert.equal(urlDaPercorso("chi-sono.html", b), "https://x.it/s/chi-sono.html");
  assert.equal(urlDaPercorso("strumenti/myindex.html", b), "https://x.it/s/strumenti/myindex.html");
});

test("aggiungiCanonical inserisce il link subito dopo <head>", () => {
  assert.equal(
    aggiungiCanonical('<html><head lang="it"><title>x</title></head></html>', "https://x.it/a"),
    '<html><head lang="it">\n<link rel="canonical" href="https://x.it/a"><title>x</title></head></html>',
  );
});

test("creaSitemap ordina gli indirizzi", () => {
  const xml = creaSitemap(["https://x.it/b", "https://x.it/a"]);
  assert.ok(xml.indexOf("https://x.it/a") < xml.indexOf("https://x.it/b"));
  assert.match(xml, /^<\?xml/);
});

test("preparaIndicizzazione scrive sitemap, canonical e segnala le description mancanti", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-"));
  fs.mkdirSync(path.join(dir, "a/lim"), { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), '<html><head><link rel="canonical" href="x"><meta name="description" content="d"></head></html>');
  fs.writeFileSync(path.join(dir, "a/pagina.html"), "<html><head><title>p</title></head></html>");
  fs.writeFileSync(path.join(dir, "a/lim/index.html"), '<html><head><meta name="robots" content="noindex"></head></html>');
  fs.writeFileSync(path.join(dir, "google1.html"), "google-site-verification: google1.html");

  const { url, senzaDescrizione } = preparaIndicizzazione(dir);
  assert.equal(url.length, 2);
  assert.deepEqual(senzaDescrizione, ["a/pagina.html"]);
  assert.match(fs.readFileSync(path.join(dir, "a/pagina.html"), "utf8"), /rel="canonical" href="[^"]*\/a\/pagina\.html"/);
  const xml = fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8");
  assert.doesNotMatch(xml, /lim|google1/);
  fs.rmSync(dir, { recursive: true });
});
