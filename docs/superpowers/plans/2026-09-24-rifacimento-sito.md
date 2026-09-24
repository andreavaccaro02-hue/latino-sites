# Rifacimento del sito · piano di implementazione (pilota)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare `latino-sites` in un sito generato con Eleventy dove ogni lezione è un file Markdown che produce una pagina da scorrere e una vista LIM reveal.js, con indici costruiti dai programmi Argo; pilota su due lezioni di geostoria.

**Architecture:** Eleventy 3 legge `src/` e scrive `_site/`; le pagine attuali sono copiate identiche (passthrough), tranne `index.html` e `geostoria/index.html` che diventano modelli. Tre estensioni markdown-it (blocchi `:::`, quiz `???`, elenchi `+`) producono HTML con attributi `data-blocco`; un filtro trasforma lo stesso HTML in schermate reveal.js. I controlli (scheletro, privacy, quiz, doppioni) girano prima di ogni build e la fermano se falliscono. GitHub Actions costruisce e pubblica.

**Tech Stack:** Node 26 locale / 22 nell'Action, Eleventy 3.1.6, markdown-it 14, markdown-it-container 4, node-html-parser 9, gray-matter 4, reveal.js 5.2.1, @fontsource-variable/newsreader e /inter 5.3.0, Python 3 + xlrd 2 per lo script Argo, `node --test` e `unittest`.

**Spec:** `docs/superpowers/specs/2026-09-24-rifacimento-sito-design.md`

## Global Constraints

- Nessun nome di classe, nessuna data di lezione, nessun dato di studenti in `src/lezioni/` né nelle pagine generate.
- I testi pubblici nuovi (lezioni, home, indici) passano da `~/Documents/tesi-magistrale/output/verifica-lan.py --conta` e sono approvati da Andrea uno alla volta prima del commit.
- Tutti gli URL già pubblicati restano validi; le cinque pagine interattive di `geostoria/` non si spostano (ci puntano i symlink in `~/Documents/10-19_lavoro/2026-27/classi/geostoria/materiali/`).
- `pathPrefix` del sito: `/latino-sites/`. Nei modelli gli URL interni si scrivono assoluti (`/geostoria/…`); li riscrive `HtmlBasePlugin`.
- Veste B: fondo `#fcfbf8`, testo `#16140f`, Newsreader (testo, titoli), Inter (etichette, didascalie); accento geostoria `#a34a28`, latino `#8B1E3F`.
- Etichette pubbliche dei blocchi: Obiettivo · Per cominciare · Passo N · Biglietto d'uscita · Esercitati · Verifica di padronanza · Per saperne di più. Mai nomi di tecniche TLAC.
- reveal.js e i font serviti dal sito, nessun CDN nelle pagine nuove.
- Commit in italiano, minuscola, indicativo presente, terza persona (es. `aggiunge…`, `sistema…`), con la riga `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Nessun push senza chiederlo ad Andrea.
- Nessuna modifica alla sorgente di GitHub Pages prima del Task 10.

## Review Focus

- «Cittadinanza e Costituzione» ha lo stesso titolo in prima e in seconda ma argomenti diversi: deve dare due slug distinti (`cittadinanza-1`, `cittadinanza-2`), non un modulo condiviso. Test nel Task 5.
- `---` scritto subito sotto una riga di testo diventa un titolo Markdown invece di un cambio di schermata: il controllo deve fermarlo indicando la riga. Test nel Task 4.
- Due file che dichiarano la stessa materia, modulo e argomento renderebbero l'indice ambiguo: il controllo deve nominarli entrambi. Test nel Task 4.
- La sostituzione di `index.html` e `geostoria/index.html` non deve far sparire nessun link interno che le pagine vecchie offrivano. Test nel Task 8.
- In nvim si scrive più facilmente `->` che `→` nel «torna a»: tutte e due le forme devono funzionare sia nel quiz sia nel controllo. Test nei Task 3 e 4.

## Mappa dei file

| File | Responsabilità |
|---|---|
| `package.json` | dipendenze e comandi npm |
| `eleventy.config.js` | configurazione: libreria Markdown, passthrough, filtri, controlli prima della build |
| `_config.yml` | provvisorio: fa ignorare a Jekyll i sorgenti finché Pages pubblica dal ramo |
| `lib/slug.js` | `slug(testo)` |
| `lib/blocchi.js` | tabella dei blocchi (`BLOCCHI`) |
| `lib/markdown.js` | `creaMarkdown()`: markdown-it con blocchi, rivela, cambio schermata, quiz |
| `lib/quiz-md.js` | estensione markdown-it per i quiz `???` |
| `lib/schermate.js` | `inSchermate(html)`, `estraiObiettivo(html)` per la vista LIM |
| `lib/navigazione.js` | ricerca lezioni, vicine, programmi, moduli, materie |
| `lib/controlli.js` | `controllaLezione`, `controllaCartella` |
| `lib/uscita.js` | `fileMancanti`, `linkInterni`, `risolviLink` per confronto e link rotti |
| `scripts/controlla.mjs` | `npm run controlla`: controlli + /lan |
| `scripts/confronta-uscita.mjs` | `npm run confronta`: nessun file del sito attuale manca in `_site/` |
| `scripts/link-interni.mjs` | `npm run link`: link interni rotti in `_site/` |
| `scripts/link-noti.json` | link rotti già presenti nelle pagine vecchie, tollerati |
| `scripts/argo_in_json.py` | `.xls` Argo → `src/_data/programmi/<materia>-<anno>.json` |
| `src/_data/materie.json` | materie, colori, pagine interattive della materia |
| `src/_data/moduli.json` | titolo Argo → slug, rimandi |
| `src/_data/programmi/*.json` | generati dallo script |
| `src/_data/materieConProgramma.js` | materie che hanno almeno un programma |
| `src/_data/home.json` | sezioni e link della home |
| `src/_includes/base.njk` | struttura HTML comune |
| `src/_includes/lezione.njk` | pagina da scorrere |
| `src/lim.njk` | vista LIM (paginazione sulle lezioni) |
| `src/indice.njk` | indice per materia e anno |
| `src/materia.njk` | pagina della materia |
| `src/index.njk` | home |
| `src/lezioni/lezioni.11tydata.js` | layout, tag e permalink delle lezioni |
| `src/lezioni/geostoria/strumenti-dello-storico/*.md` | le due lezioni del pilota |
| `src/assets/css/fonts.css`, `rivista.css`, `lim.css` | stili |
| `src/assets/js/quiz.js`, `lim.js` | comportamento nel browser |
| `tests/*.test.js`, `tests/test_argo.py`, `tests/fixtures/` | test |
| `.github/workflows/pubblica.yml` | build e pubblicazione |

Scostamenti minimi dalla spec, decisi qui: lo script si chiama `argo_in_json.py` (col trattino Python non lo importa nei test); il titolo del modulo sta in `moduli.json` e non in un `_modulo.json` per cartella (una sola fonte); il controllo dei link rotti è uno script Node invece di lychee, perché lychee non gestisce il `pathPrefix` `/latino-sites/` senza rimappature fragili e perché le pagine vecchie hanno già link rotti da tollerare.

---

### Task 1: Eleventy che riproduce il sito attuale

**Files:**
- Create: `package.json`, `eleventy.config.js`, `_config.yml`, `lib/uscita.js`, `scripts/confronta-uscita.mjs`, `scripts/link-interni.mjs`, `scripts/link-noti.json`, `tests/uscita.test.js`, `src/.gitkeep`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `fileMancanti(tracciati: string[], presenti: Set<string>): string[]`; `linkInterni(html: string): string[]`; `risolviLink(daFile: string, link: string, prefisso = "/latino-sites/"): string | null` (percorso relativo a `_site/`, `null` se esterno o da ignorare); costante `PASSTHROUGH` esportata da `eleventy.config.js`; comandi `npm run build`, `anteprima`, `test`, `confronta`, `link`.

- [ ] **Step 1: Installa le dipendenze**

```bash
cd /Users/andreavaccaro/Documents/60-69_progetti/latino-sites
npm init -y >/dev/null
npm install --save-exact @11ty/eleventy@3.1.6 markdown-it@14.1.0 markdown-it-container@4.0.0 node-html-parser@9.0.4 gray-matter@4.0.3 reveal.js@5.2.1 @fontsource-variable/newsreader@5.3.0 @fontsource-variable/inter@5.3.0
```

Poi riscrivi `package.json` così (le versioni in `dependencies` restano quelle che npm ha scritto):

```json
{
  "name": "latino-sites",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "eleventy",
    "anteprima": "eleventy --serve",
    "test": "node --test",
    "controlla": "node scripts/controlla.mjs",
    "confronta": "node scripts/confronta-uscita.mjs",
    "link": "node scripts/link-interni.mjs"
  },
  "dependencies": {
    "@11ty/eleventy": "3.1.6",
    "@fontsource-variable/inter": "5.3.0",
    "@fontsource-variable/newsreader": "5.3.0",
    "gray-matter": "4.0.3",
    "markdown-it": "14.1.0",
    "markdown-it-container": "4.0.0",
    "node-html-parser": "9.0.4",
    "reveal.js": "5.2.1"
  }
}
```

In `.gitignore` aggiungi in fondo:

```
node_modules/
_site/
```

- [ ] **Step 2: Scrivi i test di `lib/uscita.js`**

`tests/uscita.test.js`:

```js
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
```

- [ ] **Step 3: Esegui i test e verifica che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../lib/uscita.js'`.

- [ ] **Step 4: Scrivi `lib/uscita.js`**

```js
import path from "node:path";

const ESTERNO = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export function fileMancanti(tracciati, presenti) {
  return tracciati.filter((f) => !presenti.has(f));
}

export function linkInterni(html) {
  const link = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const valore = m[1].trim();
    if (!valore || ESTERNO.test(valore) || valore.includes("${") || valore.includes("{{")) continue;
    link.push(valore);
  }
  return link;
}

export function risolviLink(daFile, link, prefisso = "/latino-sites/") {
  if (ESTERNO.test(link)) return null;
  let percorso = decodeURI(link.split("#")[0].split("?")[0]);
  if (percorso === "") return null;
  if (percorso.startsWith("/")) {
    if (!percorso.startsWith(prefisso)) return percorso.slice(1) || "index.html";
    percorso = percorso.slice(prefisso.length);
  } else {
    percorso = path.posix.join(path.posix.dirname(daFile), percorso);
  }
  if (percorso === "" || percorso === "." || percorso.endsWith("/")) percorso = `${percorso === "." ? "" : percorso}index.html`;
  return path.posix.normalize(percorso);
}
```

- [ ] **Step 5: Esegui i test e verifica che passino**

Run: `npm test`
Expected: PASS, 3 test.

- [ ] **Step 6: Scrivi `eleventy.config.js` (prima versione: solo copia)**

```js
import { HtmlBasePlugin } from "@11ty/eleventy";

export const PASSTHROUGH = [
  "autori",
  "calendario",
  "css",
  "flashcard",
  "grammatica",
  "js",
  "pdf",
  "percorsi",
  "strumenti",
  "geostoria/carta-mediterraneo-lim.html",
  "geostoria/contare-il-tempo.html",
  "geostoria/da-dove-veniamo.html",
  "geostoria/le-fonti-lim.html",
  "geostoria/linea-del-tempo.html",
  "geostoria/fonts",
  "geostoria/img",
  "geostoria/reperti",
  "chi-sono.html",
  "favicon.svg",
  "og-image.svg",
  "robots.txt",
  "sitemap.xml",
  "google381d0d291942dea2.html",
  // Pagine che il Task 8 sostituisce con modelli: finché non esistono, si copiano.
  "index.html",
  "geostoria/index.html",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  for (const p of PASSTHROUGH) eleventyConfig.addPassthroughCopy(p);

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: "/latino-sites/",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
```

Crea `src/.gitkeep` vuoto (Eleventy vuole la cartella di ingresso).

- [ ] **Step 7: Scrivi `scripts/confronta-uscita.mjs`**

```js
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileMancanti } from "../lib/uscita.js";

const ESCLUSI = [/^docs\//, /^src\//, /^lib\//, /^scripts\//, /^tests\//, /^\.github\//,
  /^\.gitignore$/, /^package(-lock)?\.json$/, /^eleventy\.config\.js$/, /^_config\.yml$/];

const tracciati = execSync("git ls-files", { encoding: "utf8" })
  .split("\n").filter(Boolean).filter((f) => !ESCLUSI.some((r) => r.test(f)));

const presenti = new Set();
(function visita(dir) {
  for (const voce of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, voce.name);
    if (voce.isDirectory()) visita(p);
    else presenti.add(path.relative("_site", p).split(path.sep).join("/"));
  }
})("_site");

const mancanti = fileMancanti(tracciati, presenti);
if (mancanti.length) {
  console.error(`Mancano ${mancanti.length} file del sito attuale in _site/:\n` + mancanti.join("\n"));
  process.exit(1);
}
console.log(`Confronto riuscito: ${tracciati.length} file del sito attuale presenti in _site/.`);
```

- [ ] **Step 8: Scrivi `scripts/link-interni.mjs`**

```js
import fs from "node:fs";
import path from "node:path";
import { linkInterni, risolviLink } from "../lib/uscita.js";

const NOTI = "scripts/link-noti.json";
const aggiorna = process.argv.includes("--aggiorna-noti");
const noti = new Set(fs.existsSync(NOTI) ? JSON.parse(fs.readFileSync(NOTI, "utf8")) : []);

const pagine = [];
(function visita(dir) {
  for (const voce of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, voce.name);
    if (voce.isDirectory()) visita(p);
    else if (p.endsWith(".html")) pagine.push(path.relative("_site", p).split(path.sep).join("/"));
  }
})("_site");

const rotti = [];
for (const pagina of pagine) {
  const html = fs.readFileSync(path.join("_site", pagina), "utf8");
  for (const link of linkInterni(html)) {
    const destinazione = risolviLink(pagina, link);
    if (destinazione === null) continue;
    const pieno = path.join("_site", destinazione);
    const esiste = fs.existsSync(pieno) && (fs.statSync(pieno).isFile() || fs.existsSync(path.join(pieno, "index.html")));
    if (!esiste) rotti.push(`${pagina} -> ${link}`);
  }
}

if (aggiorna) {
  fs.writeFileSync(NOTI, JSON.stringify([...new Set(rotti)].sort(), null, 2) + "\n");
  console.log(`Salvati ${rotti.length} link rotti già presenti in ${NOTI}.`);
  process.exit(0);
}
const nuovi = rotti.filter((r) => !noti.has(r));
if (nuovi.length) {
  console.error(`Link interni rotti (${nuovi.length}):\n` + nuovi.join("\n"));
  process.exit(1);
}
console.log(`Link interni controllati in ${pagine.length} pagine: nessun link rotto nuovo.`);
```

- [ ] **Step 9: Scrivi `_config.yml` (Jekyll, provvisorio)**

```yaml
# Provvisorio: finché GitHub Pages pubblica dal ramo main, Jekyll non deve
# pubblicare i sorgenti di Eleventy. Si rimuove dopo il passaggio alle Actions.
exclude:
  - src
  - lib
  - scripts
  - tests
  - node_modules
  - package.json
  - package-lock.json
  - eleventy.config.js
```

- [ ] **Step 10: Costruisci e confronta**

Run: `npm run build && npm run confronta`
Expected: la build finisce senza errori; `Confronto riuscito: N file del sito attuale presenti in _site/.`

Poi registra i link rotti delle pagine vecchie e verifica che il controllo passi:

Run: `node scripts/link-interni.mjs --aggiorna-noti && npm run link`
Expected: `Salvati K link rotti…`, poi `nessun link rotto nuovo`. Riporta ad Andrea il numero K e l'elenco in `scripts/link-noti.json`: sono difetti già online da correggere in un secondo momento, non in questo piano.

- [ ] **Step 11: Controlla l'anteprima**

Run: `npm run anteprima` (in background), poi apri `http://localhost:8080/latino-sites/` e `http://localhost:8080/latino-sites/geostoria/le-fonti-lim.html`.
Expected: le due pagine identiche a quelle online. Ferma l'anteprima.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json eleventy.config.js _config.yml .gitignore lib/uscita.js scripts/confronta-uscita.mjs scripts/link-interni.mjs scripts/link-noti.json tests/uscita.test.js src/.gitkeep
git commit -m "aggiunge eleventy che riproduce il sito attuale, con confronto dei file e controllo dei link interni

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Markdown con blocchi, elenchi rivelabili e cambi di schermata

**Files:**
- Create: `lib/slug.js`, `lib/blocchi.js`, `lib/markdown.js`, `tests/markdown.test.js`

**Interfaces:**
- Produces: `slug(testo: string): string`; `BLOCCHI: Record<string, {etichetta: string|null, obbligatorio?: boolean}>`; `creaMarkdown(): MarkdownIt`. HTML prodotto:
  - blocco generico: `<section class="blocco blocco-<nome>" data-blocco="<nome>">` + `<h2 class="blocco-etichetta">…</h2>`
  - `passo`: `id="passo-<slug titolo>"`, etichetta `<span class="passo-numero">Passo N</span> · Titolo`
  - `uscita`: `id="biglietto"`
  - `lavagna`: `data-chiave="<slug titolo>"` e `<div class="lavagna"><p class="lavagna-quaderno">Rispondi sul quaderno.</p></div>`
  - `interattivo`: `data-src="/percorso"`, `<iframe>` e link «Apri a tutto schermo»
  - `approfondimento`: `<details … data-blocco="approfondimento"><summary>Per saperne di più</summary>`
  - `note`: `<aside class="blocco blocco-note" data-blocco="note" hidden>`
  - `---` → `<hr class="schermata">`; elenco con `+` → `<ul class="rivela">`

- [ ] **Step 1: Scrivi i test**

`tests/markdown.test.js`:

```js
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
  assert.match(html, /<span class="passo-numero">Passo 1<\/span> · Che cos'è una fonte/);
  assert.match(html, /<span class="passo-numero">Passo 2<\/span> · Quanto fidarsi/);
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
  assert.match(html, /data-src="\/geostoria\/linea-del-tempo.html"/);
  assert.match(html, /<iframe src="\/geostoria\/linea-del-tempo.html"/);
  assert.match(html, /<details class="blocco blocco-approfondimento" data-blocco="approfondimento">\s*<summary>Per saperne di più<\/summary>/);
  assert.match(html, /<aside class="blocco blocco-note" data-blocco="note" hidden>/);
});
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../lib/slug.js'`.

- [ ] **Step 3: Scrivi `lib/slug.js` e `lib/blocchi.js`**

`lib/slug.js`:

```js
export function slug(testo) {
  return String(testo)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

`lib/blocchi.js`:

```js
// Blocchi ammessi in una lezione. L'etichetta è quella che vedono gli studenti.
export const BLOCCHI = {
  obiettivo: { etichetta: "Obiettivo", obbligatorio: true },
  "do-now": { etichetta: "Per cominciare", obbligatorio: true },
  passo: { etichetta: "Passo", obbligatorio: true },
  uscita: { etichetta: "Biglietto d'uscita", obbligatorio: true },
  pratica: { etichetta: "Esercitati" },
  padronanza: { etichetta: "Verifica di padronanza" },
  interattivo: { etichetta: null },
  lavagna: { etichetta: null },
  approfondimento: { etichetta: "Per saperne di più" },
  note: { etichetta: null },
};
```

- [ ] **Step 4: Scrivi `lib/markdown.js` (senza quiz)**

```js
import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import { BLOCCHI } from "./blocchi.js";
import { slug } from "./slug.js";

export function creaMarkdown() {
  const md = new MarkdownIt({ html: true });
  const esc = md.utils.escapeHtml;

  for (const nome of Object.keys(BLOCCHI)) {
    md.use(container, nome, {
      validate: (params) => params.trim().split(/\s+/)[0] === nome,
      render: (tokens, idx) => {
        const token = tokens[idx];
        if (token.nesting === -1) {
          if (nome === "approfondimento") return "</details>\n";
          if (nome === "note") return "</aside>\n";
          return "</section>\n";
        }
        const resto = token.info.trim().slice(nome.length).trim();
        return apertura(nome, resto, tokens, idx, esc);
      },
    });
  }

  md.renderer.rules.hr = () => '<hr class="schermata">\n';
  md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
    if (tokens[idx].markup === "+") tokens[idx].attrJoin("class", "rivela");
    return self.renderToken(tokens, idx, options);
  };

  return md;
}

function titoloTraVirgolette(resto) {
  const m = resto.match(/^"(.+)"$/);
  return m ? m[1] : "";
}

function apertura(nome, resto, tokens, idx, esc) {
  const { etichetta } = BLOCCHI[nome];
  switch (nome) {
    case "passo": {
      const titolo = titoloTraVirgolette(resto);
      const numero = tokens.slice(0, idx + 1).filter((t) => t.type === "container_passo_open").length;
      return `<section class="blocco blocco-passo" data-blocco="passo" id="passo-${slug(titolo)}">\n`
        + `<h2 class="blocco-etichetta"><span class="passo-numero">Passo ${numero}</span> · ${esc(titolo)}</h2>\n`;
    }
    case "uscita":
      return `<section class="blocco blocco-uscita" data-blocco="uscita" id="biglietto">\n<h2 class="blocco-etichetta">${etichetta}</h2>\n`;
    case "lavagna": {
      const titolo = titoloTraVirgolette(resto);
      return `<section class="blocco blocco-lavagna" data-blocco="lavagna" data-chiave="${slug(titolo)}">\n`
        + `<h2 class="blocco-etichetta">${esc(titolo)}</h2>\n`
        + `<div class="lavagna"><p class="lavagna-quaderno">Rispondi sul quaderno.</p></div>\n`;
    }
    case "interattivo": {
      const src = esc("/" + resto.replace(/^\/+/, ""));
      return `<section class="blocco blocco-interattivo" data-blocco="interattivo" data-src="${src}">\n`
        + `<iframe src="${src}" title="Pagina interattiva" loading="lazy"></iframe>\n`
        + `<p class="interattivo-apri"><a href="${src}" target="_blank" rel="noopener">Apri a tutto schermo</a></p>\n`;
    }
    case "approfondimento":
      return `<details class="blocco blocco-approfondimento" data-blocco="approfondimento">\n<summary>${etichetta}</summary>\n`;
    case "note":
      return `<aside class="blocco blocco-note" data-blocco="note" hidden>\n`;
    default:
      return `<section class="blocco blocco-${nome}" data-blocco="${nome}">\n<h2 class="blocco-etichetta">${etichetta}</h2>\n`;
  }
}
```

- [ ] **Step 5: Esegui i test e verifica che passino**

Run: `npm test`
Expected: PASS (tutti i test di `markdown.test.js` e `uscita.test.js`).

- [ ] **Step 6: Commit**

```bash
git add lib/slug.js lib/blocchi.js lib/markdown.js tests/markdown.test.js
git commit -m "aggiunge il markdown delle lezioni con blocchi, elenchi rivelabili e cambi di schermata

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Quiz nel Markdown

**Files:**
- Create: `lib/quiz-md.js`, `tests/quiz-md.test.js`
- Modify: `lib/markdown.js` (registra l'estensione)

**Interfaces:**
- Consumes: `slug` (Task 2), `creaMarkdown` (Task 2).
- Produces: `quiz(md)` estensione markdown-it. HTML:
  ```html
  <div class="quiz" data-torna="passo-<slug>" data-torna-titolo="Titolo">   <!-- data-torna* solo con «torna a» -->
  <p class="quiz-domanda">…</p>
  <ul class="quiz-opzioni">
  <li><button type="button" class="quiz-opzione" data-giusta="true|false">…</button></li>
  </ul>
  <p class="quiz-esito" hidden></p>
  </div>
  ```

- [ ] **Step 1: Scrivi i test**

`tests/quiz-md.test.js`:

```js
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
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `npm test`
Expected: FAIL in `quiz-md.test.js` (nessun `class="quiz"` nell'HTML).

- [ ] **Step 3: Scrivi `lib/quiz-md.js`**

```js
import { slug } from "./slug.js";

const DOMANDA = /^\?\?\?\s+/;
const TORNA = /\s*(?:→|->)\s*torna a:\s*"([^"]+)"\s*$/;
const OPZIONE = /^\[( |x|X)\]\s+([\s\S]*)$/;

export function quiz(md) {
  md.core.ruler.after("inline", "quiz", (state) => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      if (t[i].type !== "paragraph_open" || t[i + 1]?.type !== "inline") continue;
      if (!DOMANDA.test(t[i + 1].content) || t[i + 3]?.type !== "bullet_list_open") continue;

      const livello = t[i + 3].level;
      let fine = i + 4;
      while (fine < t.length && !(t[fine].type === "bullet_list_close" && t[fine].level === livello)) fine++;

      const opzioni = [];
      let valido = true;
      for (let k = i + 4; k < fine; k++) {
        if (t[k].type !== "list_item_open" || t[k].level !== livello + 1) continue;
        const m = t[k + 2]?.content?.match(OPZIONE);
        if (!m) { valido = false; break; }
        opzioni.push({ giusta: m[1] !== " ", testo: m[2] });
      }
      if (!valido || !opzioni.length) continue;

      let domanda = t[i + 1].content.replace(DOMANDA, "");
      const torna = domanda.match(TORNA)?.[1];
      if (torna) domanda = domanda.replace(TORNA, "");

      const blocco = new state.Token("html_block", "", 0);
      blocco.content = htmlQuiz(md, domanda, opzioni, torna);
      t.splice(i, fine - i + 1, blocco);
    }
  });
}

function htmlQuiz(md, domanda, opzioni, torna) {
  const esc = md.utils.escapeHtml;
  const attr = torna ? ` data-torna="passo-${slug(torna)}" data-torna-titolo="${esc(torna)}"` : "";
  const voci = opzioni
    .map((o) => `<li><button type="button" class="quiz-opzione" data-giusta="${o.giusta}">${md.renderInline(o.testo)}</button></li>`)
    .join("\n");
  return `<div class="quiz"${attr}>\n<p class="quiz-domanda">${md.renderInline(domanda)}</p>\n`
    + `<ul class="quiz-opzioni">\n${voci}\n</ul>\n<p class="quiz-esito" hidden></p>\n</div>\n`;
}
```

In `lib/markdown.js` aggiungi l'import e la registrazione, subito prima di `return md;`:

```js
import { quiz } from "./quiz-md.js";
// …
  md.use(quiz);
  return md;
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test`
Expected: PASS, tutti i file di test.

- [ ] **Step 5: Commit**

```bash
git add lib/quiz-md.js lib/markdown.js tests/quiz-md.test.js
git commit -m "aggiunge i quiz a scelta multipla nel markdown delle lezioni, con rimando al passo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Controlli delle lezioni

**Files:**
- Create: `lib/controlli.js`, `scripts/controlla.mjs`, `tests/controlli.test.js`
- Modify: `eleventy.config.js` (controlli prima della build)

**Interfaces:**
- Consumes: `BLOCCHI` (Task 2).
- Produces: `controllaLezione(testo: string, file: string, programmi: Programma[]): Errore[]`; `controllaCartella(dirLezioni: string, dirProgrammi: string): Errore[]`; `leggiProgrammi(dir): Programma[]`. `Errore = {file: string, riga?: number, messaggio: string}`. `Programma = {materia, anno, moduli: [{numero, titolo, slug, argomenti: [{numero, titolo}]}]}` (formato prodotto nel Task 5).

- [ ] **Step 1: Scrivi i test**

`tests/controlli.test.js`:

```js
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

test("controllaCartella senza cartella delle lezioni non dà errori", () => {
  assert.deepEqual(controllaCartella("/percorso/che/non/esiste", "/percorso/che/non/esiste"), []);
});
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../lib/controlli.js'`.

- [ ] **Step 3: Scrivi `lib/controlli.js`**

```js
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BLOCCHI } from "./blocchi.js";

const OBBLIGATORI = Object.entries(BLOCCHI).filter(([, b]) => b.obbligatorio).map(([nome]) => nome);
const CLASSE = /(?<![\p{L}\p{N}])[1-5][A-Z]{1,3}(?![\p{L}\p{N}])/u;
const DATA = /(?<![\d/])(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})(?![\d/])/;
const TORNA = /(?:→|->)\s*torna a:\s*"([^"]+)"\s*$/;

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
    if (/^---\s*$/.test(r) && i > 0 && righeCorpo[i - 1].trim() !== "") {
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
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test`
Expected: PASS. Se «privacy» fallisce per `2026-09-30` segnalato due volte o per `23/9` non trovato, correggi solo l'espressione `DATA` finché il test passa senza toccare le asserzioni.

- [ ] **Step 5: Collega i controlli alla build**

In `eleventy.config.js` aggiungi l'import e, dentro la funzione, prima del `return`:

```js
import { controllaCartella, formattaErrori } from "./lib/controlli.js";
// …
  eleventyConfig.on("eleventy.before", () => {
    const errori = controllaCartella("src/lezioni", "src/_data/programmi");
    if (errori.length) throw new Error(`Controlli delle lezioni falliti:\n${formattaErrori(errori)}`);
  });
```

- [ ] **Step 6: Scrivi `scripts/controlla.mjs`**

```js
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { controllaCartella, formattaErrori } from "../lib/controlli.js";

const errori = controllaCartella("src/lezioni", "src/_data/programmi");
if (errori.length) {
  console.error(formattaErrori(errori));
  process.exit(1);
}
console.log("Controlli delle lezioni: nessun errore.");

const lan = path.join(os.homedir(), "Documents/tesi-magistrale/output/verifica-lan.py");
if (!fs.existsSync(lan)) {
  console.warn(`Avviso: ${lan} non trovato, controllo /lan saltato.`);
  process.exit(0);
}
const modificati = execFileSync("git", ["status", "--porcelain", "--", "src/lezioni"], { encoding: "utf8" })
  .split("\n").map((r) => r.slice(3).trim()).filter((f) => f.endsWith(".md"));
for (const f of modificati) {
  console.log(`\n/lan su ${f}`);
  execFileSync("python3", [lan, "--conta", f], { stdio: "inherit" });
}
```

Prima di usarlo, verifica come `verifica-lan.py` riceve i file: `python3 ~/Documents/tesi-magistrale/output/verifica-lan.py --help`. Se la sintassi non è `--conta <file>`, adegua solo l'array di argomenti e annotalo nel commit.

- [ ] **Step 7: Verifica build e comando**

Run: `npm run build && npm run controlla`
Expected: build riuscita (nessuna lezione ancora); `Controlli delle lezioni: nessun errore.` seguito da nessun file /lan.

- [ ] **Step 8: Commit**

```bash
git add lib/controlli.js scripts/controlla.mjs tests/controlli.test.js eleventy.config.js
git commit -m "aggiunge i controlli delle lezioni (scheletro, quiz, privacy, doppioni) prima di ogni build

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Programmi da Argo

**Files:**
- Create: `scripts/argo_in_json.py`, `tests/test_argo.py`, `src/_data/moduli.json`, `src/_data/programmi/geostoria-1.json`, `src/_data/programmi/geostoria-2.json` (generati)

**Interfaces:**
- Produces: `costruisci_programma(righe, materia: str, anno: int, moduli: list) -> dict` in formato `Programma` (Task 4); `normalizza(testo) -> str`. `moduli.json` = lista di `{titolo_argo, slug, materia, anni?: int[], rimandi?: {"<argomento>": string[]}}`.

- [ ] **Step 1: Scrivi i test**

`tests/test_argo.py`:

```python
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from argo_in_json import costruisci_programma  # noqa: E402

MODULI = [
    {"materia": "geostoria", "titolo_argo": "Prima di cominciare · Gli strumenti dello storico", "slug": "strumenti-dello-storico"},
    {"materia": "geostoria", "titolo_argo": "Cap. 2 · L'alba della Grecia. L'Egeo fra II e I millennio a.C.", "slug": "cap-02-alba-della-grecia"},
    {"materia": "geostoria", "titolo_argo": "Cittadinanza e Costituzione", "slug": "cittadinanza-1", "anni": [1]},
    {"materia": "geostoria", "titolo_argo": "Cittadinanza e Costituzione", "slug": "cittadinanza-2", "anni": [2]},
]

RIGHE = [
    [1.0, "Prima di cominciare · Gli strumenti dello storico", "", "", "", ""],
    ["", "", 1.0, "Tempo e spazio come coordinate", "Non svolto", ""],
    ["", "", 2.0, "Che cos'è una fonte: materiale e scritta, primaria e secondaria", "Svolto", "23/09/2026"],
    [2.0, "Cap. 2 · L\u2019alba della Grecia.  L'Egeo fra II e I millennio a.C. ", "", "", "", ""],
    ["", "", 1.0, "Lezione 1 · I dominatori del mare. Creta e le origini della cultura greca", "Non svolto", ""],
    [3.0, "Cittadinanza e Costituzione", "", "", "", ""],
    ["", "", 1.0, "Legge scritta e potere", "Non svolto", ""],
]


class TestArgo(unittest.TestCase):
    def test_moduli_e_argomenti(self):
        p = costruisci_programma(RIGHE, "geostoria", 1, MODULI)
        self.assertEqual(p["materia"], "geostoria")
        self.assertEqual(p["anno"], 1)
        self.assertEqual([m["numero"] for m in p["moduli"]], [1, 2, 3])
        self.assertEqual(p["moduli"][0]["slug"], "strumenti-dello-storico")
        self.assertEqual(p["moduli"][0]["argomenti"][1],
                         {"numero": 2, "titolo": "Che cos'è una fonte: materiale e scritta, primaria e secondaria"})

    def test_stato_e_date_non_entrano(self):
        testo = json.dumps(costruisci_programma(RIGHE, "geostoria", 1, MODULI), ensure_ascii=False)
        self.assertNotIn("23/09/2026", testo)
        self.assertNotIn("Svolto", testo)

    def test_toglie_il_prefisso_lezione(self):
        p = costruisci_programma(RIGHE, "geostoria", 1, MODULI)
        self.assertEqual(p["moduli"][1]["argomenti"][0]["titolo"], "I dominatori del mare. Creta e le origini della cultura greca")

    def test_apostrofo_tipografico_e_spazi_doppi(self):
        p = costruisci_programma(RIGHE, "geostoria", 1, MODULI)
        self.assertEqual(p["moduli"][1]["slug"], "cap-02-alba-della-grecia")

    def test_cittadinanza_diversa_per_anno(self):
        self.assertEqual(costruisci_programma(RIGHE, "geostoria", 1, MODULI)["moduli"][2]["slug"], "cittadinanza-1")
        self.assertEqual(costruisci_programma(RIGHE, "geostoria", 2, MODULI)["moduli"][2]["slug"], "cittadinanza-2")

    def test_modulo_senza_slug_ferma_lo_script(self):
        righe = RIGHE + [[4.0, "Cap. 99 · Inesistente", "", "", "", ""]]
        with self.assertRaisesRegex(ValueError, "Cap. 99 · Inesistente"):
            costruisci_programma(righe, "geostoria", 1, MODULI)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `python3 -m unittest tests/test_argo.py -v`
Expected: FAIL con `ModuleNotFoundError: No module named 'argo_in_json'`.

- [ ] **Step 3: Scrivi `scripts/argo_in_json.py`**

```python
#!/usr/bin/env python3
"""Converte un programma Argo (.xls) in src/_data/programmi/<materia>-<anno>.json.

Uso: python3 scripts/argo_in_json.py <file.xls> <materia> <anno>
Legge solo le colonne ORD. MODULO, MODULO, ORD. ARGOMENTO, ARGOMENTO:
stato e data di svolgimento non entrano mai nel sito.
"""
import json
import re
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
PREFISSO_LEZIONE = re.compile(r"^Lezione\s+\d+\s*·\s*")


def normalizza(testo):
    return " ".join(str(testo).replace("\u2019", "'").split())


def numero(valore):
    return int(float(valore))


def slug_modulo(titolo, materia, anno, moduli):
    for m in moduli:
        if m["materia"] != materia or normalizza(m["titolo_argo"]) != titolo:
            continue
        if "anni" in m and anno not in m["anni"]:
            continue
        return m["slug"]
    raise ValueError(f"Modulo senza slug in src/_data/moduli.json: «{titolo}» ({materia}, anno {anno})")


def costruisci_programma(righe, materia, anno, moduli):
    programma = {"materia": materia, "anno": anno, "moduli": []}
    corrente = None
    for riga in righe:
        celle = [normalizza(c) for c in list(riga)[:4]]
        celle += [""] * (4 - len(celle))
        ord_modulo, modulo, ord_argomento, argomento = celle
        if ord_modulo and modulo:
            corrente = {
                "numero": numero(ord_modulo),
                "titolo": modulo,
                "slug": slug_modulo(modulo, materia, anno, moduli),
                "argomenti": [],
            }
            programma["moduli"].append(corrente)
        elif ord_argomento and argomento:
            if corrente is None:
                raise ValueError(f"Argomento prima di qualsiasi modulo: «{argomento}»")
            corrente["argomenti"].append({
                "numero": numero(ord_argomento),
                "titolo": PREFISSO_LEZIONE.sub("", argomento),
            })
    return programma


def leggi_xls(percorso):
    import xlrd
    foglio = xlrd.open_workbook(percorso).sheet_by_index(0)
    return [foglio.row_values(i) for i in range(1, foglio.nrows)]


def main(argv):
    if len(argv) != 4:
        print(__doc__)
        return 2
    xls, materia, anno = argv[1], argv[2], int(argv[3])
    moduli = json.loads((RADICE / "src/_data/moduli.json").read_text(encoding="utf-8"))
    programma = costruisci_programma(leggi_xls(xls), materia, anno, moduli)
    uscita = RADICE / "src/_data/programmi" / f"{materia}-{anno}.json"
    uscita.parent.mkdir(parents=True, exist_ok=True)
    uscita.write_text(json.dumps(programma, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    argomenti = sum(len(m["argomenti"]) for m in programma["moduli"])
    print(f"{uscita.relative_to(RADICE)}: {len(programma['moduli'])} moduli, {argomenti} argomenti")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `python3 -m unittest tests/test_argo.py -v`
Expected: PASS, 6 test.

- [ ] **Step 5: Scrivi `src/_data/moduli.json`**

I titoli sono copiati dai due file Argo. I rimandi portano gli argomenti del modulo 1 alle pagine interattive attuali (spec, pilota punto 5).

```json
[
  { "materia": "geostoria", "titolo_argo": "Prima di cominciare · Gli strumenti dello storico", "slug": "strumenti-dello-storico",
    "rimandi": {
      "1": ["geostoria/contare-il-tempo.html", "geostoria/linea-del-tempo.html"],
      "3": ["geostoria/carta-mediterraneo-lim.html"]
    } },
  { "materia": "geostoria", "titolo_argo": "Capitolo introduttivo · La preistoria", "slug": "preistoria" },
  { "materia": "geostoria", "titolo_argo": "Cap. 1 · Le origini della storia. Popoli e culture del Vicino Oriente", "slug": "cap-01-vicino-oriente" },
  { "materia": "geostoria", "titolo_argo": "Percorso di geografia 1 · Economia, ambiente, sviluppo", "slug": "geo-1-economia-ambiente-sviluppo" },
  { "materia": "geostoria", "titolo_argo": "Cap. 2 · L'alba della Grecia. L'Egeo fra II e I millennio a.C.", "slug": "cap-02-alba-della-grecia" },
  { "materia": "geostoria", "titolo_argo": "Percorso di geografia 2 · Popoli, città, migrazioni", "slug": "geo-2-popoli-citta-migrazioni" },
  { "materia": "geostoria", "titolo_argo": "Cap. 3 · La polis e i suoi nemici. Sparta, Atene e le guerre persiane", "slug": "cap-03-polis-e-nemici" },
  { "materia": "geostoria", "titolo_argo": "Cap. 4 · Atene: ascesa e declino. Dall'età di Pericle alla guerra del Peloponneso", "slug": "cap-04-atene-ascesa-declino" },
  { "materia": "geostoria", "titolo_argo": "Cap. 5 · Dalle poleis ai regni. L'inizio dell'età ellenistica", "slug": "cap-05-poleis-ai-regni" },
  { "materia": "geostoria", "titolo_argo": "Cap. 6 · L'infanzia di una città. Roma e i popoli preromani", "slug": "cap-06-roma-popoli-preromani" },
  { "materia": "geostoria", "titolo_argo": "Cap. 7 · Da città a impero. L'espansione romana nel Mediterraneo", "slug": "cap-07-da-citta-a-impero" },
  { "materia": "geostoria", "titolo_argo": "Cap. 8 · Crisi di sistema. La lunga notte della repubblica romana", "slug": "cap-08-crisi-repubblica" },
  { "materia": "geostoria", "titolo_argo": "Cittadinanza e Costituzione", "slug": "cittadinanza-1", "anni": [1] },
  { "materia": "geostoria", "titolo_argo": "Cittadinanza e Costituzione", "slug": "cittadinanza-2", "anni": [2] },
  { "materia": "geostoria", "titolo_argo": "Cap. 9 · Un nuovo inizio. L'Impero romano da Augusto ai Flavi", "slug": "cap-09-augusto-flavi" },
  { "materia": "geostoria", "titolo_argo": "Cap. 10 · La città e il mondo. L'Impero romano da Traiano ai Severi", "slug": "cap-10-traiano-severi" },
  { "materia": "geostoria", "titolo_argo": "Percorso di geografia 3 · L'età del mondo globale", "slug": "geo-3-mondo-globale" },
  { "materia": "geostoria", "titolo_argo": "Cap. 11 · Crisi e trasformazione. L'Impero romano dal III al V secolo", "slug": "cap-11-impero-iii-v-secolo" },
  { "materia": "geostoria", "titolo_argo": "Cap. 12 · Re, monaci, imperatori. L'inizio del Medioevo in Europa", "slug": "cap-12-inizio-medioevo" },
  { "materia": "geostoria", "titolo_argo": "Cap. 13 · L'altro Medioevo. Nascita ed espansione dell'islam", "slug": "cap-13-islam" },
  { "materia": "geostoria", "titolo_argo": "Cap. 14 · Il ritorno dell'impero. L'Europa da Carlo Magno agli Ottoni", "slug": "cap-14-carlo-magno-ottoni" },
  { "materia": "geostoria", "titolo_argo": "Percorso di geografia 4 · Le organizzazioni sovranazionali", "slug": "geo-4-organizzazioni-sovranazionali" }
]
```

- [ ] **Step 6: Genera i due programmi dai file Argo reali**

```bash
cd /Users/andreavaccaro/Documents/60-69_progetti/latino-sites
python3 scripts/argo_in_json.py ~/Documents/10-19_lavoro/2026-27/classi/geostoria/argo/programma-geostoria-prima.xls geostoria 1
python3 scripts/argo_in_json.py ~/Documents/10-19_lavoro/2026-27/classi/geostoria/argo/programma-geostoria-seconda.xls geostoria 2
```

Expected:
```
src/_data/programmi/geostoria-1.json: 13 moduli, 53 argomenti
src/_data/programmi/geostoria-2.json: 12 moduli, 54 argomenti
```

Se lo script si ferma con «Modulo senza slug», il titolo in Argo differisce da `moduli.json`: correggi `titolo_argo` copiandolo dal messaggio, non modificare il file Argo.

Verifica che nessuna data sia entrata: `grep -c "2026" src/_data/programmi/*.json` → `0` per entrambi.

- [ ] **Step 7: Verifica la build**

Run: `npm run build`
Expected: build riuscita.

- [ ] **Step 8: Commit**

```bash
git add scripts/argo_in_json.py tests/test_argo.py src/_data/moduli.json src/_data/programmi/
git commit -m "aggiunge lo script che converte i programmi argo di geostoria e i due programmi generati

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Pagina della lezione (veste rivista)

**Files:**
- Create: `lib/navigazione.js`, `tests/navigazione.test.js`, `src/_data/materie.json`, `src/_data/materieConProgramma.js`, `src/lezioni/lezioni.11tydata.js`, `src/_includes/base.njk`, `src/_includes/lezione.njk`, `src/assets/css/fonts.css`, `src/assets/css/rivista.css`, `src/assets/js/quiz.js`, `src/lezioni/geostoria/strumenti-dello-storico/02-che-cos-e-una-fonte.md` (bozza di prova)
- Modify: `eleventy.config.js`

**Interfaces:**
- Consumes: `creaMarkdown` (Task 2-3), programmi e `moduli.json` (Task 5).
- Produces, in `lib/navigazione.js`: `lezioniDelModulo(lezioni, materia, modulo)`, `vicine(lezioni, corrente) -> {precedente, successiva}`, `lezionePer(lezioni, materia, modulo, argomento)`, `inProgrammi(programmi, materia, modulo) -> [{anno, numero}]`, `voceModulo(moduli, materia, slug)`, `rimandiPer(moduli, materia, slug, argomento) -> string[]`, `materia(materie, id)`, `nomeAnno(n)`. Lezione = oggetto con `{url, data: {materia, modulo, argomento, titolo}}` (voce di collezione Eleventy). Filtri Nunjucks con gli stessi nomi, più `nomeMateria(id, materie)` e `md(testo)`. Collezione `lezioni`. URL lezione `/<materia>/<modulo>/<fileSlug senza NN->/`.

- [ ] **Step 1: Scrivi i test di navigazione**

`tests/navigazione.test.js`:

```js
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
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../lib/navigazione.js'`.

- [ ] **Step 3: Scrivi `lib/navigazione.js`**

```js
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
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Dati delle materie**

`src/_data/materie.json` (le voci di `pagine` riprendono i testi dei link dell'indice di geostoria attuale, senza emoji):

```json
[
  {
    "id": "geostoria",
    "nome": "Geostoria",
    "colore": "#a34a28",
    "pagine": [
      { "titolo": "DOVE · La carta del Mediterraneo", "url": "geostoria/carta-mediterraneo-lim.html" },
      { "titolo": "QUANDO · Contare il tempo", "url": "geostoria/contare-il-tempo.html" },
      { "titolo": "COME SAPPIAMO? · Le fonti", "url": "geostoria/le-fonti-lim.html" },
      { "titolo": "La linea del tempo", "url": "geostoria/linea-del-tempo.html" },
      { "titolo": "Da dove veniamo, la mappa dei luoghi da cui vengono le famiglie della classe (serve la rete)", "url": "geostoria/da-dove-veniamo.html" }
    ]
  },
  { "id": "latino", "nome": "Latino", "colore": "#8B1E3F", "pagine": [] }
]
```

`src/_data/materieConProgramma.js`:

```js
import fs from "node:fs";
import path from "node:path";

export default function () {
  const materie = JSON.parse(fs.readFileSync("src/_data/materie.json", "utf8"));
  const dir = "src/_data/programmi";
  const programmi = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    : [];
  return materie
    .map((m) => ({ ...m, anni: programmi.filter((p) => p.materia === m.id).map((p) => p.anno).sort() }))
    .filter((m) => m.anni.length);
}
```

- [ ] **Step 6: Dati della cartella lezioni**

`src/lezioni/lezioni.11tydata.js`:

```js
export default {
  layout: "lezione.njk",
  tags: ["lezioni"],
  eleventyComputed: {
    permalink: (data) => `/${data.materia}/${data.modulo}/${data.page.fileSlug.replace(/^\d+-/, "")}/`,
  },
};
```

- [ ] **Step 7: Registra libreria, filtri e risorse in `eleventy.config.js`**

Aggiungi gli import:

```js
import { creaMarkdown } from "./lib/markdown.js";
import * as nav from "./lib/navigazione.js";
```

e, dentro la funzione, dopo il ciclo dei passthrough:

```js
  const md = creaMarkdown();
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/newsreader/files/newsreader-latin*-wght-*.woff2": "assets/fonts",
    "node_modules/@fontsource-variable/inter/files/inter-latin*-wght-normal.woff2": "assets/fonts",
  });

  eleventyConfig.addFilter("md", (testo) => md.render(testo ?? ""));
  eleventyConfig.addFilter("vicine", nav.vicine);
  eleventyConfig.addFilter("lezionePer", nav.lezionePer);
  eleventyConfig.addFilter("inProgrammi", nav.inProgrammi);
  eleventyConfig.addFilter("voceModulo", nav.voceModulo);
  eleventyConfig.addFilter("rimandiPer", nav.rimandiPer);
  eleventyConfig.addFilter("materia", nav.materia);
  eleventyConfig.addFilter("nomeMateria", (id, materie) => nav.materia(materie, id).nome);
  eleventyConfig.addFilter("nomeAnno", nav.nomeAnno);
```

- [ ] **Step 8: Modelli**

`src/_includes/base.njk`:

```njk
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{% if titolo %}{{ titolo }} — {% endif %}Prof. Andrea Vaccaro</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/rivista.css">
<style>:root { --accento: {{ (materie | materia(materia)).colore if materia else "#16140f" }}; }</style>
</head>
<body>
<header class="testata-sito">
  <a class="marchio" href="/">Prof. Andrea Vaccaro</a>
  <nav aria-label="Sezioni">
    <a href="/geostoria/">Geostoria</a>
    <a href="/grammatica/index.html">Grammatica</a>
    <a href="/strumenti/glossario-eulalia.html">Strumenti</a>
    <a href="/strumenti/raccoglitore.html">Raccoglitore</a>
    <a href="/chi-sono.html">Su di me</a>
    <a href="/pdf/cv-vaccaro-europass.pdf">CV</a>
  </nav>
</header>
<main>
{{ content | safe }}
</main>
<footer class="piede-sito"><p>Prof. Andrea Vaccaro · <a href="/chi-sono.html">Su di me</a></p></footer>
<script src="/assets/js/quiz.js" defer></script>
</body>
</html>
```

`src/_includes/lezione.njk`:

```njk
---
layout: base.njk
---
{% set voce = moduli | voceModulo(materia, modulo) %}
{% set vic = collections.lezioni | vicine(page) %}
{% set anni = programmi | inProgrammi(materia, modulo) %}
<article class="lezione">
  {% if immagine %}
  <figure class="reperto">
    <img src="/{{ immagine }}" alt="{{ didascalia }}">
    {% if didascalia %}<figcaption>{{ didascalia }}</figcaption>{% endif %}
  </figure>
  {% endif %}
  <header class="lezione-testata">
    <p class="kicker">{{ materia | nomeMateria(materie) }} · {{ voce.titolo_argo }} · Lezione {{ argomento }}</p>
    <h1>{{ titolo }}</h1>
    {% if sottotitolo %}<p class="sottotitolo">{{ sottotitolo }}</p>{% endif %}
    <p class="programmi">Nel programma di: {% for a in anni %}{{ a.anno | nomeAnno }} (modulo {{ a.numero }}){% if not loop.last %}, {% endif %}{% endfor %}</p>
    <a class="vista-lim" href="{{ page.url }}lim/">Vista LIM</a>
  </header>
  <div class="lezione-corpo">
{{ content | safe }}
  </div>
  <nav class="lezione-nav" aria-label="Lezioni del modulo">
    {% if vic.precedente %}<a rel="prev" href="{{ vic.precedente.url }}">← {{ vic.precedente.data.titolo }}</a>{% else %}<span></span>{% endif %}
    {% if vic.successiva %}<a rel="next" href="{{ vic.successiva.url }}">{{ vic.successiva.data.titolo }} →</a>{% endif %}
  </nav>
</article>
```

- [ ] **Step 9: Stili e script**

`src/assets/css/fonts.css`:

```css
@font-face { font-family: "Newsreader"; font-style: normal; font-weight: 200 800; font-display: swap;
  src: url("../fonts/newsreader-latin-wght-normal.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Newsreader"; font-style: normal; font-weight: 200 800; font-display: swap;
  src: url("../fonts/newsreader-latin-ext-wght-normal.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "Newsreader"; font-style: italic; font-weight: 200 800; font-display: swap;
  src: url("../fonts/newsreader-latin-wght-italic.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Newsreader"; font-style: italic; font-weight: 200 800; font-display: swap;
  src: url("../fonts/newsreader-latin-ext-wght-italic.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "Inter"; font-style: normal; font-weight: 100 900; font-display: swap;
  src: url("../fonts/inter-latin-wght-normal.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Inter"; font-style: normal; font-weight: 100 900; font-display: swap;
  src: url("../fonts/inter-latin-ext-wght-normal.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
```

`src/assets/css/rivista.css`:

```css
/* Veste «rivista museale». Un solo accento, per materia, in --accento. */
:root {
  --carta: #fcfbf8;
  --inchiostro: #16140f;
  --grigio: #5c5647;
  --tenue: #77705f;
  --sabbia: #f1ebe0;
  --filetto: #d9cfbd;
  --accento: #a34a28;
  --serif: "Newsreader", Georgia, serif;
  --sans: "Inter", system-ui, sans-serif;
  --colonna: 44rem;
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--carta); color: var(--inchiostro); font-family: var(--serif); font-size: 1.1875rem; line-height: 1.6; }
img, iframe { max-width: 100%; }
a { color: var(--accento); text-underline-offset: .15em; }

.testata-sito, .piede-sito, main { width: min(100% - 2rem, var(--colonna)); margin-inline: auto; }
.testata-sito { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; align-items: baseline; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--inchiostro); font-family: var(--sans); font-size: .875rem; }
.testata-sito nav { display: flex; flex-wrap: wrap; gap: .25rem 1rem; }
.testata-sito a { color: var(--inchiostro); text-decoration: none; }
.marchio { font-weight: 700; }
.piede-sito { margin-top: 4rem; padding: 1rem 0 2rem; border-top: 1px solid var(--filetto); font-family: var(--sans); font-size: .8125rem; color: var(--tenue); }

.kicker { margin: 0; font-family: var(--sans); font-weight: 700; font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accento); }
h1 { font-weight: 600; font-size: clamp(2.2rem, 7vw, 3.2rem); line-height: 1.05; letter-spacing: -.01em; margin: .35rem 0 .4rem; }
h2 { font-weight: 600; font-size: 1.5rem; line-height: 1.2; }
.sottotitolo { margin: 0 0 1rem; font-style: italic; font-size: 1.3rem; color: var(--grigio); }

/* Lezione */
.reperto { margin: 1.5rem 0 0; }
.reperto img { display: block; width: 100%; max-height: 26rem; object-fit: cover; }
.reperto figcaption { margin-top: .4rem; font-family: var(--sans); font-size: .75rem; color: var(--tenue); }
.lezione-testata { position: relative; margin-top: 1.5rem; }
.programmi { margin: 0; font-family: var(--sans); font-size: .8125rem; color: var(--tenue); }
.vista-lim { display: inline-block; margin-top: .75rem; padding: .3rem .7rem; border: 1px solid var(--accento); border-radius: 3px; font-family: var(--sans); font-size: .8125rem; font-weight: 700; text-decoration: none; }
@media (min-width: 40rem) { .vista-lim { position: absolute; top: 0; right: 0; margin: 0; } }

.blocco { margin: 2.25rem 0; }
.blocco-etichetta { margin: 0 0 .6rem; font-family: var(--sans); font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accento); }
.blocco-passo > .blocco-etichetta { font-family: var(--serif); font-size: 1.5rem; letter-spacing: 0; text-transform: none; color: var(--inchiostro); }
.passo-numero { display: block; font-family: var(--sans); font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accento); }
.blocco-obiettivo { margin-top: 1rem; padding-top: .6rem; border-top: 1px solid var(--inchiostro); font-family: var(--sans); font-size: 1rem; }
.blocco-obiettivo p { margin: 0; }
.blocco-do-now, .blocco-uscita, .blocco-padronanza { padding: 1rem 1.2rem; background: var(--sabbia); }
.blocco-lavagna .lavagna { min-height: 6rem; padding: 1rem; border: 1px solid var(--filetto); background: #fff; }
.lavagna-quaderno { margin: 0; font-style: italic; color: var(--tenue); }
.blocco-interattivo iframe { width: 100%; aspect-ratio: 16 / 10; border: 1px solid var(--filetto); background: #fff; }
.interattivo-apri { font-family: var(--sans); font-size: .875rem; }
.blocco-approfondimento { border-top: 1px solid var(--filetto); padding-top: .75rem; }
.blocco-approfondimento summary { cursor: pointer; font-family: var(--sans); font-weight: 700; font-size: .875rem; }
.blocco-note, hr.schermata { display: none; }
ul.rivela { padding-left: 1.2rem; }
table { width: 100%; border-collapse: collapse; font-size: 1rem; display: block; overflow-x: auto; }
th, td { padding: .4rem .6rem; border-bottom: 1px solid var(--filetto); text-align: left; vertical-align: top; }

.lezione-nav { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--inchiostro); font-family: var(--sans); font-size: .9375rem; }

/* Quiz */
.quiz { margin: 1.25rem 0; }
.quiz-domanda { margin: 0 0 .5rem; font-weight: 600; }
.quiz-opzioni { list-style: none; margin: 0; padding: 0; display: grid; gap: .4rem; }
.quiz-opzione { width: 100%; text-align: left; font: inherit; font-size: 1.05rem; padding: .55rem .8rem; background: #fff; color: var(--inchiostro); border: 1px solid var(--filetto); border-radius: 3px; cursor: pointer; }
.quiz-opzione:hover, .quiz-opzione:focus-visible { border-color: var(--inchiostro); }
.quiz-opzione.giusta { border-color: #2f6b3a; background: #e6f1e7; }
.quiz-opzione.sbagliata { border-color: #9b2c1f; background: #f7e3df; }
.quiz-opzione[aria-disabled="true"] { cursor: default; }
.quiz-esito { margin: .5rem 0 0; font-family: var(--sans); font-size: .9375rem; }
.quiz-riprova { font: inherit; background: none; border: 0; padding: 0; color: var(--accento); text-decoration: underline; cursor: pointer; }

/* Indici */
.indice-modulo { border-top: 1px solid var(--inchiostro); padding-top: .6rem; margin-top: 1.4rem; }
.indice-modulo h2 { font-size: 1.25rem; margin: 0 0 .3rem; }
.indice-modulo .numero { display: block; font-family: var(--sans); font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accento); }
.indice-argomenti { margin: 0; padding-left: 1.6rem; }
.indice-argomenti li { margin: .15rem 0; }
.in-preparazione { color: var(--tenue); }
.elenco-anni, .elenco-pagine { padding-left: 1.2rem; }
.home-sezione { margin-top: 2.5rem; }
.home-sezione h2 { border-top: 1px solid var(--inchiostro); padding-top: .6rem; }
```

`src/assets/js/quiz.js`:

```js
// Quiz a scelta multipla: nessun dato salvato, nessun punteggio inviato.
document.addEventListener("click", (evento) => {
  const scelta = evento.target.closest(".quiz-opzione");
  if (scelta) return rispondi(scelta);
  const riprova = evento.target.closest(".quiz-riprova");
  if (riprova) azzera(riprova.closest(".quiz"));
});

function rispondi(scelta) {
  const quiz = scelta.closest(".quiz");
  if (quiz.dataset.risposto) return;
  quiz.dataset.risposto = "si";
  const giusta = scelta.dataset.giusta === "true";
  for (const opzione of quiz.querySelectorAll(".quiz-opzione")) {
    opzione.setAttribute("aria-disabled", "true");
    if (opzione.dataset.giusta === "true") opzione.classList.add("giusta");
  }
  if (!giusta) scelta.classList.add("sbagliata");

  const esito = quiz.querySelector(".quiz-esito");
  esito.hidden = false;
  esito.textContent = giusta ? "Giusto." : "Non è questa.";
  const conRimando = quiz.closest('[data-blocco="uscita"], [data-blocco="padronanza"]');
  if (!giusta && conRimando && quiz.dataset.torna) {
    const link = document.createElement("a");
    link.href = (document.querySelector(".reveal") ? "#/" : "#") + quiz.dataset.torna;
    link.textContent = `Rivedi: ${quiz.dataset.tornaTitolo}`;
    esito.append(" ", link);
  }
  const bottone = document.createElement("button");
  bottone.type = "button";
  bottone.className = "quiz-riprova";
  bottone.textContent = "Riprova";
  esito.append(" ", bottone);
}

function azzera(quiz) {
  delete quiz.dataset.risposto;
  for (const opzione of quiz.querySelectorAll(".quiz-opzione")) {
    opzione.classList.remove("giusta", "sbagliata");
    opzione.removeAttribute("aria-disabled");
  }
  const esito = quiz.querySelector(".quiz-esito");
  esito.hidden = true;
  esito.textContent = "";
}
```

- [ ] **Step 10: Lezione di prova (bozza tecnica, riscritta nel Task 9)**

`src/lezioni/geostoria/strumenti-dello-storico/02-che-cos-e-una-fonte.md`:

```markdown
---
materia: geostoria
modulo: strumenti-dello-storico
argomento: 2
titolo: Che cos'è una fonte
sottotitolo: Bozza tecnica
immagine: geostoria/reperti/hammurabi.jpg
didascalia: Stele di Hammurabi
---

::: obiettivo
Bozza.
:::

::: do-now
Bozza.
:::

::: passo "Prima parte"
Bozza.

+ uno
+ due

---

??? Domanda di prova
- [ ] no
- [x] sì
:::

::: lavagna "Prova"
:::

::: uscita
??? Domanda d'uscita -> torna a: "Prima parte"
- [x] sì
- [ ] no
:::

::: note
Nota di prova.
:::
```

- [ ] **Step 11: Verifica nel browser**

Run: `npm run build && npm run confronta && npm run link`
Expected: tutti e tre riusciti.

Poi `npm run anteprima` (in background) e apri `http://localhost:8080/latino-sites/geostoria/strumenti-dello-storico/che-cos-e-una-fonte/`. Controlla: reperto con didascalia; kicker «Geostoria · Prima di cominciare · Gli strumenti dello storico · Lezione 2»; «Nel programma di: prima (modulo 1)»; blocchi con etichette pubbliche; la nota non si vede; il quiz colora le risposte; nel biglietto la risposta sbagliata mostra «Rivedi: Prima parte» e il link porta al passo; i font sono Newsreader e Inter (DevTools → Network, file `.woff2` da `/latino-sites/assets/fonts/`). Ferma l'anteprima.

- [ ] **Step 12: Commit**

```bash
git add lib/navigazione.js tests/navigazione.test.js src/_data/materie.json src/_data/materieConProgramma.js src/lezioni/ src/_includes/ src/assets/ eleventy.config.js
git commit -m "aggiunge la pagina della lezione nella veste rivista, con quiz, font locali e navigazione nel modulo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Vista LIM

**Files:**
- Create: `lib/schermate.js`, `tests/schermate.test.js`, `src/lim.njk`, `src/assets/css/lim.css`, `src/assets/js/lim.js`
- Modify: `eleventy.config.js`

**Interfaces:**
- Consumes: HTML di `creaMarkdown` (Task 2-3), filtri di navigazione (Task 6).
- Produces: `inSchermate(html: string): string` (sequenza di `<section data-blocco=…>` per reveal.js; `obiettivo` e `approfondimento` esclusi; `note` → `<aside class="notes">` nella schermata precedente; `ul.rivela > li` con classe `fragment`; `id` del passo/uscita sulla prima schermata del blocco); `estraiObiettivo(html: string): string`. URL LIM: `<url lezione>lim/`.

- [ ] **Step 1: Scrivi i test**

`tests/schermate.test.js`:

```js
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
  assert.match(parti[2], /Passo 1<\/span> · Che cos/);
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
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../lib/schermate.js'`.

- [ ] **Step 3: Scrivi `lib/schermate.js`**

```js
import { parse } from "node-html-parser";

const ESCLUSI = new Set(["obiettivo", "approfondimento"]);

export function estraiObiettivo(html) {
  const blocco = parse(html).querySelector('[data-blocco="obiettivo"]');
  if (!blocco) return "";
  blocco.querySelector(".blocco-etichetta")?.remove();
  return blocco.innerHTML.trim();
}

export function inSchermate(html) {
  const radice = parse(html);
  const schermate = [];
  let sciolti = [];

  const chiudiSciolti = () => {
    if (!sciolti.length) return;
    schermate.push(`<section data-blocco="testo">\n${sciolti.join("\n")}\n</section>`);
    sciolti = [];
  };

  for (const nodo of radice.childNodes) {
    if (nodo.nodeType !== 1) {
      if (nodo.text.trim()) sciolti.push(nodo.toString());
      continue;
    }
    const blocco = nodo.getAttribute("data-blocco");
    if (!blocco) {
      sciolti.push(nodo.toString());
      continue;
    }
    chiudiSciolti();
    if (ESCLUSI.has(blocco)) continue;

    if (blocco === "note") {
      if (!schermate.length) continue;
      const nota = `<aside class="notes">\n${nodo.innerHTML.trim()}\n</aside>\n`;
      schermate[schermate.length - 1] = schermate[schermate.length - 1].replace(/<\/section>$/, `${nota}</section>`);
      continue;
    }

    for (const li of nodo.querySelectorAll("ul.rivela > li")) li.classList.add("fragment");
    const etichetta = nodo.querySelector(".blocco-etichetta")?.toString() ?? "";
    const gruppi = [[]];
    for (const figlio of nodo.childNodes) {
      if (figlio.nodeType === 1 && figlio.classList.contains("blocco-etichetta")) continue;
      if (figlio.nodeType === 1 && figlio.tagName === "HR") {
        gruppi.push([]);
        continue;
      }
      gruppi[gruppi.length - 1].push(figlio.toString());
    }

    const extra = ["data-chiave", "data-src"]
      .filter((a) => nodo.getAttribute(a))
      .map((a) => ` ${a}="${nodo.getAttribute(a)}"`)
      .join("");
    gruppi.forEach((gruppo, i) => {
      const id = i === 0 && nodo.id ? ` id="${nodo.id}"` : "";
      schermate.push(`<section data-blocco="${blocco}"${id}${extra}>\n${etichetta}\n${gruppo.join("").trim()}\n</section>`);
    });
  }
  chiudiSciolti();
  return schermate.join("\n");
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test`
Expected: PASS. Se «note nelle note del relatore» fallisce solo per spazi bianchi, allenta l'espressione (`\s*`) senza cambiare cosa si verifica.

- [ ] **Step 5: Filtri e reveal.js in `eleventy.config.js`**

```js
import { inSchermate, estraiObiettivo } from "./lib/schermate.js";
// …
  eleventyConfig.addFilter("schermate", inSchermate);
  eleventyConfig.addFilter("obiettivo", estraiObiettivo);
  eleventyConfig.addPassthroughCopy({
    "node_modules/reveal.js/dist/reveal.js": "assets/reveal/reveal.js",
    "node_modules/reveal.js/dist/reveal.css": "assets/reveal/reveal.css",
    "node_modules/reveal.js/plugin/notes/notes.js": "assets/reveal/notes.js",
  });
```

- [ ] **Step 6: Scrivi `src/lim.njk`**

```njk
---
pagination:
  data: collections.lezioni
  size: 1
  alias: lezione
permalink: "{{ lezione.url }}lim/"
eleventyExcludeFromCollections: true
---
{%- set corpo = lezione.rawInput | md -%}
{%- set voce = moduli | voceModulo(lezione.data.materia, lezione.data.modulo) -%}
{%- set vic = collections.lezioni | vicine(lezione) -%}
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{{ lezione.data.titolo }} · LIM — Prof. Andrea Vaccaro</title>
<link rel="stylesheet" href="/assets/reveal/reveal.css">
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/lim.css">
<style>:root { --accento: {{ (materie | materia(lezione.data.materia)).colore }}; }</style>
</head>
<body>
<div class="reveal"><div class="slides">
<section id="apertura" data-blocco="apertura" class="apertura{% if lezione.data.immagine %} con-reperto{% endif %}">
  <div class="apertura-testo">
    <p class="kicker">{{ lezione.data.materia | nomeMateria(materie) }} · {{ voce.titolo_argo }} · Lezione {{ lezione.data.argomento }}</p>
    <h1>{{ lezione.data.titolo }}</h1>
    {% if lezione.data.sottotitolo %}<p class="sottotitolo">{{ lezione.data.sottotitolo }}</p>{% endif %}
    <div class="obiettivo"><span class="blocco-etichetta">Obiettivo</span>{{ corpo | obiettivo | safe }}</div>
  </div>
  {% if lezione.data.immagine %}
  <figure class="apertura-reperto"><img src="/{{ lezione.data.immagine }}" alt="{{ lezione.data.didascalia }}">{% if lezione.data.didascalia %}<figcaption>{{ lezione.data.didascalia }}</figcaption>{% endif %}</figure>
  {% endif %}
</section>
{{ corpo | schermate | safe }}
<section data-blocco="prosegui" class="prosegui">
  {% if vic.successiva %}
  <p class="kicker">Prosegui con</p>
  <h2><a href="{{ vic.successiva.url }}lim/">{{ vic.successiva.data.titolo }} →</a></h2>
  {% else %}
  <p class="kicker">Fine del modulo</p>
  <h2>{{ voce.titolo_argo }}</h2>
  <p><a href="/{{ lezione.data.materia }}/">Torna all'indice</a></p>
  {% endif %}
</section>
</div></div>
<script src="/assets/reveal/reveal.js"></script>
<script src="/assets/reveal/notes.js"></script>
<script src="/assets/js/quiz.js"></script>
<script src="/assets/js/lim.js"></script>
</body>
</html>
```

Verifica subito che `rawInput` esista: `npm run build` e poi `grep -c "Bozza" _site/geostoria/strumenti-dello-storico/che-cos-e-una-fonte/lim/index.html` → numero maggiore di 0. Se il file contiene il front matter o è vuoto, sostituisci `lezione.rawInput | md` con `lezione.content` e ripeti.

- [ ] **Step 7: Scrivi `src/assets/js/lim.js`**

```js
/* global Reveal, RevealNotes */
Reveal.initialize({
  hash: true,
  controls: true,
  controlsTutorial: false,
  progress: true,
  slideNumber: "c/t",
  transition: "none",
  width: 1600,
  height: 900,
  margin: 0.04,
  center: false,
  plugins: [RevealNotes],
  keyboard: {
    66: () => vaiA("biglietto"), // B: biglietto d'uscita (sostituisce la pausa di reveal)
  },
});

function vaiA(id) {
  const schermata = document.getElementById(id);
  if (schermata) Reveal.slide(Reveal.getIndices(schermata).h, 0, 0);
}

// Comandi visibili solo quando si muove il mouse.
let timer;
document.addEventListener("mousemove", () => {
  document.body.classList.add("mouse-attivo");
  clearTimeout(timer);
  timer = setTimeout(() => document.body.classList.remove("mouse-attivo"), 2500);
});

// Lavagne: si scrive da tastiera, il testo resta nel browser di questo computer.
for (const lavagna of document.querySelectorAll('[data-blocco="lavagna"] .lavagna')) {
  const chiave = `lavagna:${location.pathname}:${lavagna.closest("[data-chiave]").dataset.chiave}`;
  lavagna.textContent = "";
  lavagna.contentEditable = "true";
  lavagna.spellcheck = false;
  try { lavagna.textContent = localStorage.getItem(chiave) ?? ""; } catch { /* memoria non disponibile */ }
  lavagna.addEventListener("input", () => {
    try { localStorage.setItem(chiave, lavagna.innerText); } catch { /* memoria non disponibile */ }
  });
  lavagna.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") lavagna.blur();
  });
  const pulisci = document.createElement("button");
  pulisci.type = "button";
  pulisci.className = "lavagna-pulisci";
  pulisci.textContent = "Pulisci";
  pulisci.addEventListener("click", () => {
    lavagna.textContent = "";
    try { localStorage.removeItem(chiave); } catch { /* memoria non disponibile */ }
  });
  lavagna.after(pulisci);
}
```

- [ ] **Step 8: Scrivi `src/assets/css/lim.css`**

```css
:root { --carta: #fcfbf8; --inchiostro: #16140f; --grigio: #5c5647; --tenue: #77705f; --sabbia: #f1ebe0; --filetto: #d9cfbd;
  --serif: "Newsreader", Georgia, serif; --sans: "Inter", system-ui, sans-serif; }
html, body { background: var(--carta); }
.reveal { font-family: var(--serif); font-size: 44px; color: var(--inchiostro); line-height: 1.4; }
.reveal .slides { text-align: left; }
.reveal .slides section { height: 100%; padding: 0; }
.reveal h1 { font-size: 2.4em; font-weight: 600; line-height: 1.05; margin: .15em 0 .2em; }
.reveal h2 { font-size: 1.3em; font-weight: 600; margin: 0 0 .5em; }
.reveal a { color: var(--accento); }
.reveal .kicker, .reveal .blocco-etichetta { display: block; margin: 0 0 .4em; font-family: var(--sans); font-weight: 700; font-size: .5em; letter-spacing: .08em; text-transform: uppercase; color: var(--accento); }
.reveal h2.blocco-etichetta .passo-numero { display: block; }
.reveal section[data-blocco="passo"] > h2.blocco-etichetta { font-family: var(--serif); font-size: 1.3em; letter-spacing: 0; text-transform: none; color: var(--inchiostro); }
.reveal .passo-numero { font-family: var(--sans); font-size: .4em; letter-spacing: .08em; text-transform: uppercase; color: var(--accento); }
.reveal .sottotitolo { font-style: italic; color: var(--grigio); margin: 0 0 .8em; }
.reveal ul { margin: 0; padding-left: 1.1em; }
.reveal li { margin: .15em 0; }
.reveal .fragment { transition: opacity .2s; }

/* Solo sulla schermata corrente: reveal nasconde le altre con display: none. */
.reveal .slides section.apertura.con-reperto.present { display: grid !important; grid-template-columns: 1fr 36%; gap: 1.2em; }
.apertura .obiettivo { margin-top: .8em; padding-top: .4em; border-top: 2px solid var(--inchiostro); font-family: var(--sans); font-size: .6em; }
.apertura .obiettivo p { margin: 0; }
.apertura-reperto { margin: 0; }
.apertura-reperto img { width: 100%; max-height: 760px; object-fit: cover; }
.apertura-reperto figcaption { font-family: var(--sans); font-size: .35em; color: var(--tenue); }

section[data-blocco="do-now"], section[data-blocco="uscita"], section[data-blocco="padronanza"] { background: var(--sabbia); padding: .8em 1em !important; box-sizing: border-box; }
.lavagna { min-height: 480px; padding: .5em .7em; border: 2px solid var(--filetto); background: #fff; white-space: pre-wrap; outline: none; font-size: .9em; }
.lavagna:focus { border-color: var(--inchiostro); }
.lavagna-pulisci { margin-top: .3em; font-family: var(--sans); font-size: .4em; background: none; border: 1px solid var(--filetto); padding: .2em .6em; cursor: pointer; opacity: 0; }
.mouse-attivo .lavagna-pulisci, .lavagna-pulisci:focus { opacity: 1; }
section[data-blocco="interattivo"] iframe { width: 100%; height: 760px; border: 1px solid var(--filetto); background: #fff; }
.interattivo-apri { font-family: var(--sans); font-size: .45em; }

.quiz-domanda { font-weight: 600; margin: 0 0 .4em; }
.quiz-opzioni { list-style: none; padding: 0 !important; display: grid; gap: .3em; }
.quiz-opzione { width: 100%; text-align: left; font: inherit; font-size: .9em; padding: .3em .6em; background: #fff; color: var(--inchiostro); border: 2px solid var(--filetto); border-radius: 4px; cursor: pointer; }
.quiz-opzione.giusta { border-color: #2f6b3a; background: #e6f1e7; }
.quiz-opzione.sbagliata { border-color: #9b2c1f; background: #f7e3df; }
.quiz-esito { font-family: var(--sans); font-size: .5em; margin-top: .4em; }
.quiz-riprova { font: inherit; background: none; border: 0; padding: 0; color: var(--accento); text-decoration: underline; cursor: pointer; }

.reveal .controls, .reveal .progress, .reveal .slide-number { opacity: 0; transition: opacity .3s; }
.mouse-attivo .reveal .controls, .mouse-attivo .reveal .progress, .mouse-attivo .reveal .slide-number { opacity: 1; }
.reveal .slide-number { background: none; color: var(--tenue); font-family: var(--sans); }
.reveal .controls { color: var(--accento); }
.reveal .progress { color: var(--accento); }
```

- [ ] **Step 9: Verifica alla LIM simulata**

Run: `npm test && npm run build && npm run link`
Expected: tutto riuscito.

`npm run anteprima` e apri `http://localhost:8080/latino-sites/geostoria/strumenti-dello-storico/che-cos-e-una-fonte/lim/` a finestra piena. Controlla, con la tastiera:
1. apertura con kicker, titolo, obiettivo, reperto a destra;
2. freccia destra: «Per cominciare»; poi il passo; spazio rivela «uno», poi «due»;
3. `B` salta al biglietto; una risposta sbagliata mostra «Rivedi: Prima parte» e il link porta alla prima schermata del passo;
4. la lavagna si scrive, il testo resta dopo aver ricaricato la pagina, «Pulisci» (col mouse) lo cancella; mentre scrivi le frecce non cambiano schermata;
5. `S` apre la vista relatore con «Nota di prova»; `O` la panoramica; `Home` l'apertura;
6. comandi e numero di schermata compaiono solo muovendo il mouse;
7. ultima schermata: «Fine del modulo» (c'è una sola lezione) con il link all'indice.
Ferma l'anteprima.

- [ ] **Step 10: Commit**

```bash
git add lib/schermate.js tests/schermate.test.js src/lim.njk src/assets/css/lim.css src/assets/js/lim.js eleventy.config.js
git commit -m "aggiunge la vista LIM delle lezioni con reveal.js, biglietto col tasto B, lavagna e note del relatore

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Indici, pagina della materia, home

**Files:**
- Create: `src/indice.njk`, `src/materia.njk`, `src/index.njk`, `src/_data/home.json`, `tests/fixtures/vecchia-home.html`, `tests/fixtures/vecchio-indice-geostoria.html`, `tests/sostituzioni.test.js`
- Modify: `eleventy.config.js` (togli `index.html` e `geostoria/index.html` da `PASSTHROUGH`)

**Interfaces:**
- Consumes: `linkInterni`, `risolviLink` (Task 1); filtri di navigazione (Task 6); `materieConProgramma`, `programmi`, `moduli`.
- Produces: `/geostoria/1/`, `/geostoria/2/`, `/geostoria/`, `/`.

- [ ] **Step 1: Copia le pagine che verranno sostituite come riferimento per i test**

```bash
cp index.html tests/fixtures/vecchia-home.html
cp geostoria/index.html tests/fixtures/vecchio-indice-geostoria.html
```

- [ ] **Step 2: Scrivi il test di conservazione dei link**

`tests/sostituzioni.test.js` (legge `_site/`, quindi va eseguito dopo `npm run build`):

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { linkInterni, risolviLink } from "../lib/uscita.js";

const CASI = [
  { vecchia: "tests/fixtures/vecchia-home.html", posto: "index.html" },
  { vecchia: "tests/fixtures/vecchio-indice-geostoria.html", posto: "geostoria/index.html" },
];

const destinazioni = (html, posto) => new Set(linkInterni(html).map((l) => risolviLink(posto, l)).filter(Boolean));

for (const { vecchia, posto } of CASI) {
  test(`la nuova ${posto} conserva i link interni della vecchia`, { skip: !fs.existsSync(`_site/${posto}`) && "manca _site: esegui npm run build" }, () => {
    const prima = destinazioni(fs.readFileSync(vecchia, "utf8"), posto);
    const dopo = destinazioni(fs.readFileSync(`_site/${posto}`, "utf8"), posto);
    const persi = [...prima].filter((d) => !dopo.has(d) && !d.startsWith("css/") && d !== "favicon.svg");
    assert.deepEqual(persi, []);
  });
}
```

Il foglio di stile vecchio (`css/style.css`) e la favicon non sono contenuti: se la pagina nuova non li usa non conta come perdita.

- [ ] **Step 3: Togli le due pagine dalla copia e verifica che il test fallisca**

In `eleventy.config.js`, nell'array `PASSTHROUGH`, cancella le righe `"index.html",` e `"geostoria/index.html",` e il commento che le precede.

Run: `npm run build; npm test`
Expected: FAIL nei due test di `sostituzioni.test.js` oppure `SKIP` perché `_site/index.html` non esiste più. In entrambi i casi non è ancora verde.

- [ ] **Step 4: Scrivi `src/_data/home.json`**

I titoli dei link sono quelli della home attuale, senza emoji. Sono testi già pubblici: non passano da /lan salvo i due titoli di sezione nuovi, «Quest'anno» e «Anche sul sito».

```json
{
  "sezioni": [
    {
      "id": "latino",
      "titolo": "Latino",
      "link": [
        { "titolo": "Latino 1", "url": "percorsi/latino1.html" },
        { "titolo": "Latino 2", "url": "percorsi/latino2.html" },
        { "titolo": "Latino 3 · Classico", "url": "percorsi/latino3-classico.html" },
        { "titolo": "Latino 3 · Scientifico", "url": "percorsi/latino3-scientifico.html" },
        { "titolo": "Latino 4 · Classico", "url": "percorsi/latino4-classico.html" },
        { "titolo": "Latino 4 · Scientifico", "url": "percorsi/latino4-scientifico.html" },
        { "titolo": "Latino 5 · Classico", "url": "percorsi/latino5-classico.html" },
        { "titolo": "Latino 5 · Scientifico", "url": "percorsi/latino5-scientifico.html" },
        { "titolo": "Grammatica", "url": "grammatica/index.html" }
      ]
    },
    {
      "id": "strumenti",
      "titolo": "Strumenti",
      "link": [
        { "titolo": "Glossario Eulalia", "url": "strumenti/glossario-eulalia.html" },
        { "titolo": "Analisi Testi", "url": "strumenti/analisi_latino.html" },
        { "titolo": "Declinazioni", "url": "grammatica/declinazioni.html" },
        { "titolo": "Confronto Declinazioni", "url": "grammatica/declinazioni_confronto.html" },
        { "titolo": "Diario Apprendimento", "url": "strumenti/diario_latina.html" },
        { "titolo": "Raccoglitore Testi", "url": "strumenti/raccoglitore.html" },
        { "titolo": "Quiz Riconoscimento", "url": "strumenti/quiz-riconoscimento.html" },
        { "titolo": "Quiz Morfologia", "url": "strumenti/quiz-morfologia.html" },
        { "titolo": "Schema Congiunzioni", "url": "grammatica/schema-congiunzioni-v2.html" },
        { "titolo": "Maturità in 40 domande", "url": "strumenti/maturita-latino.html" },
        { "titolo": "Ripasso Maturità — sito completo", "url": "https://ripasso-maturita-5ac.vercel.app" },
        { "titolo": "Flashcard", "url": "flashcard/index.html" }
      ]
    },
    {
      "id": "calendari",
      "titolo": "Calendari",
      "link": [
        { "titolo": "Terza", "url": "calendario/terza.html" },
        { "titolo": "Quarta", "url": "calendario/quarta.html" },
        { "titolo": "Quinta", "url": "calendario/quinta.html" }
      ]
    },
    {
      "id": "chi-sono",
      "titolo": "Su di me",
      "link": [
        { "titolo": "Su di me", "url": "chi-sono.html" },
        { "titolo": "CV", "url": "pdf/cv-vaccaro-europass.pdf" }
      ]
    }
  ]
}
```

- [ ] **Step 5: Scrivi i tre modelli**

`src/indice.njk`:

```njk
---
layout: base.njk
pagination:
  data: programmi
  size: 1
  alias: programma
  resolve: values
permalink: "/{{ programma.materia }}/{{ programma.anno }}/"
eleventyComputed:
  titolo: "{{ programma.materia | nomeMateria(materie) }} {{ programma.anno }}"
  materia: "{{ programma.materia }}"
---
<article class="indice">
  <p class="kicker">{{ programma.materia | nomeMateria(materie) }} · {{ programma.anno | nomeAnno }} anno</p>
  <h1>{{ programma.materia | nomeMateria(materie) }} {{ programma.anno }}</h1>
  {% for m in programma.moduli %}
  <section class="indice-modulo">
    <h2><span class="numero">Modulo {{ m.numero }}</span>{{ m.titolo }}</h2>
    <ol class="indice-argomenti">
      {% for a in m.argomenti %}
      {% set lez = collections.lezioni | lezionePer(programma.materia, m.slug, a.numero) %}
      {% set rim = moduli | rimandiPer(programma.materia, m.slug, a.numero) %}
      <li value="{{ a.numero }}">
        {% if lez %}<a href="{{ lez.url }}">{{ lez.data.titolo }}</a>
        {% elif rim.length %}{{ a.titolo }} · {% for r in rim %}<a href="/{{ r }}">pagina interattiva{% if rim.length > 1 %} {{ loop.index }}{% endif %}</a>{% if not loop.last %} · {% endif %}{% endfor %}
        {% else %}<span class="in-preparazione">{{ a.titolo }}</span>{% endif %}
      </li>
      {% endfor %}
    </ol>
  </section>
  {% endfor %}
</article>
```

`src/materia.njk`:

```njk
---
layout: base.njk
pagination:
  data: materieConProgramma
  size: 1
  alias: m
permalink: "/{{ m.id }}/"
eleventyComputed:
  titolo: "{{ m.nome }}"
  materia: "{{ m.id }}"
---
<article class="materia">
  <p class="kicker">Materia</p>
  <h1>{{ m.nome }}</h1>
  <h2>Programma</h2>
  <ul class="elenco-anni">
    {% for anno in m.anni %}<li><a href="/{{ m.id }}/{{ anno }}/">{{ m.nome }} {{ anno }}</a> · {{ anno | nomeAnno }} anno</li>{% endfor %}
  </ul>
  {% if m.pagine.length %}
  <h2>Pagine interattive</h2>
  <ul class="elenco-pagine">
    {% for p in m.pagine %}<li><a href="/{{ p.url }}">{{ p.titolo }}</a></li>{% endfor %}
  </ul>
  {% endif %}
</article>
```

`src/index.njk`:

```njk
---
layout: base.njk
permalink: /
---
<section class="home-sezione">
  <h2>Quest'anno</h2>
  <ul class="elenco-anni">
    {% for m in materieConProgramma %}{% for anno in m.anni %}
    <li><a href="/{{ m.id }}/{{ anno }}/">{{ m.nome }} {{ anno }}</a></li>
    {% endfor %}<li><a href="/{{ m.id }}/">Tutto su {{ m.nome | lower }}</a></li>{% endfor %}
  </ul>
</section>
<h2 class="kicker home-sezione">Anche sul sito</h2>
{% for s in home.sezioni %}
<section class="home-sezione" id="{{ s.id }}">
  <h2>{{ s.titolo }}</h2>
  <ul class="elenco-pagine">
    {% for l in s.link %}<li><a href="{% if l.url.startsWith('http') %}{{ l.url }}{% else %}/{{ l.url }}{% endif %}">{{ l.titolo }}</a></li>{% endfor %}
  </ul>
</section>
{% endfor %}
```

- [ ] **Step 6: Esegui build e test e verifica che passino**

Run: `npm run build && npm test && npm run confronta && npm run link`
Expected: tutto PASS; i due test di `sostituzioni.test.js` verdi. Se un test elenca link persi, aggiungili alla sezione giusta di `home.json` o alle `pagine` di `materie.json`, non togliere il test.

- [ ] **Step 7: Controllo nel browser**

`npm run anteprima`, poi:
- `http://localhost:8080/latino-sites/`: «Quest'anno» con Geostoria 1 e 2; sezioni Latino, Strumenti, Calendari, Su di me;
- `…/geostoria/`: i due anni e le cinque pagine interattive;
- `…/geostoria/1/`: 13 moduli; modulo 1 con l'argomento 2 come link alla lezione, 1 e 3 con «pagina interattiva», 4 in grigio; «Modulo 1», non «Modulo 0»;
- `…/geostoria/2/`: 12 moduli, «Cittadinanza e Costituzione» con i quattro argomenti di seconda.

Mostra le quattro pagine ad Andrea e chiedi approvazione per i testi nuovi («Quest'anno», «Anche sul sito», «Tutto su geostoria», «Programma», «Pagine interattive», «Materia»). Applica le sue correzioni prima del commit.

- [ ] **Step 8: Commit**

```bash
git add src/indice.njk src/materia.njk src/index.njk src/_data/home.json tests/fixtures/ tests/sostituzioni.test.js eleventy.config.js
git commit -m "aggiunge home, pagina di geostoria e indici per anno dai programmi argo, al posto delle vecchie pagine indice

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Le due lezioni del pilota

**Files:**
- Modify: `src/lezioni/geostoria/strumenti-dello-storico/02-che-cos-e-una-fonte.md` (sostituisce la bozza tecnica)
- Create: `src/lezioni/geostoria/strumenti-dello-storico/04-storico-e-archeologo.md`

**Interfaces:**
- Consumes: formato della lezione (Task 2-4), rendering pagina e LIM (Task 6-7).
- Produces: due lezioni reali, argomenti 2 e 4 del modulo `strumenti-dello-storico`.

Questo task è di contenuto: ogni testo va mostrato ad Andrea e approvato prima del commit, una lezione alla volta (Global Constraints). La fonte è `geostoria/le-fonti-lim.html` (schermate e testi) più il copione `~/Documents/av-second-brain/Scuola/D'Alessandro 2026-27/Lezioni/Geostoria/L03 Le fonti.md`, **solo** per l'ordine delle fasi: dal copione non si copia niente che riguardi classi, alunni, date, tecniche.

- [ ] **Step 1: Leggi la fonte e prepara la ripartizione**

Leggi per intero `geostoria/le-fonti-lim.html` e la sezione «Testi pronti» del copione L03. Proponi ad Andrea una tabella «schermata della pagina LIM → lezione e blocco». Punto di partenza:

| Pagina LIM attuale | Lezione | Blocco |
|---|---|---|
| apertura (DOVE · QUANDO · COME SAPPIAMO?, obiettivo) | 02 | `obiettivo` |
| «Che cosa avete letto (pp. 2-7)» | 02 | `do-now` |
| definizione e le due coppie | 02 | `passo "Che cos'è una fonte"` |
| le sei fonti e «Tre fonti da classificare» | 02 | `passo "Sei fonti"` con quiz, rivelazioni `+` |
| «Le sei fonti, in una tabella» | 02 | `pratica` (tabella Markdown) |
| «Quanto fidarsi?» | 02 | `passo "Quanto fidarsi"` |
| biglietto (classifica tre fonti) | 02 | `uscita` con `torna a` |
| «Uno storico del 2126» + lavagna | 04 | `do-now` e `lavagna` |
| «Da tenere» (storico e archeologo) | 04 | `passo` |
| «Un oggetto-fonte di famiglia», «Una settima fonte» | 04 | `pratica` |

Aspetta l'approvazione della ripartizione.

- [ ] **Step 2: Scrivi la lezione 02 e falla approvare**

Sostituisci la bozza con il testo vero, stesso front matter tranne `sottotitolo` (dal titolo LIM: «Che cosa resta del passato») e `didascalia` completa del reperto (prendi la didascalia già usata in `le-fonti-lim.html`). Quiz dalle attività di classificazione della pagina LIM, ognuno con `-> torna a:` sul passo che spiega la risposta.

Run: `npm run controlla`
Expected: nessun errore dei controlli; il report /lan per il file. Correggi i rilievi /lan, poi mostra ad Andrea il file e le due viste nell'anteprima (pagina e LIM). Applica le sue correzioni. Nessun commit finché non dice sì.

- [ ] **Step 3: Commit della lezione 02**

```bash
git add src/lezioni/geostoria/strumenti-dello-storico/02-che-cos-e-una-fonte.md
git commit -m "aggiunge la lezione «Che cos'è una fonte» (geostoria, modulo 1, argomento 2)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Scrivi la lezione 04 e falla approvare**

Crea `04-storico-e-archeologo.md` con front matter:

```yaml
---
materia: geostoria
modulo: strumenti-dello-storico
argomento: 4
titolo: Il lavoro dello storico e quello dell'archeologo
---
```

Stesso procedimento dello Step 2: `npm run controlla`, correzioni /lan, anteprima di pagina e LIM, approvazione.

Verifica in più la concatenazione: nella vista LIM della lezione 02 l'ultima schermata è «Prosegui con: Il lavoro dello storico e quello dell'archeologo →» e porta alla LIM della 04; nella pagina da scorrere della 02 in fondo c'è «… →» verso la 04, e nella 04 «← Che cos'è una fonte».

- [ ] **Step 5: Commit della lezione 04**

```bash
git add src/lezioni/geostoria/strumenti-dello-storico/04-storico-e-archeologo.md
git commit -m "aggiunge la lezione «Il lavoro dello storico e quello dell'archeologo» (geostoria, modulo 1, argomento 4)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Pubblicazione con GitHub Actions

**Files:**
- Create: `.github/workflows/pubblica.yml`
- Delete (Step 7): `_config.yml`

**Interfaces:**
- Consumes: `npm test`, `npm run build`, `npm run confronta`, `npm run link` (Task 1-8).

- [ ] **Step 1: Scrivi il workflow**

`.github/workflows/pubblica.yml`:

```yaml
name: Pubblica il sito

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  costruisci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run confronta
      - run: npm run link
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  pubblica:
    needs: costruisci
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`npm test` va dopo la build perché `sostituzioni.test.js` legge `_site/`.

- [ ] **Step 2: Verifica completa in locale, come farà l'Action**

```bash
rm -rf _site node_modules
npm ci
npm run build && npm test && npm run confronta && npm run link
```

Expected: tutto riuscito.

- [ ] **Step 3: Controllo visivo a 412 px e a 1920×1080**

```bash
npx -y playwright@1 install chromium
npm run anteprima &
sleep 5
npx -y playwright@1 screenshot --device="Pixel 5" --full-page http://localhost:8080/latino-sites/geostoria/strumenti-dello-storico/che-cos-e-una-fonte/ /tmp/lezione-412.png
npx -y playwright@1 screenshot --device="Pixel 5" --full-page http://localhost:8080/latino-sites/geostoria/1/ /tmp/indice-412.png
npx -y playwright@1 screenshot --viewport-size=1920,1080 http://localhost:8080/latino-sites/geostoria/strumenti-dello-storico/che-cos-e-una-fonte/lim/ /tmp/lim-1920.png
kill %1
```

Apri le tre immagini e verifica: niente che sbordi a destra a 412 px (tabelle comprese), testo leggibile, apertura LIM con reperto a destra. Mostrale ad Andrea.

- [ ] **Step 4: Commit del workflow**

```bash
git add .github/workflows/pubblica.yml
git commit -m "aggiunge il workflow che costruisce, controlla e pubblica il sito su github pages

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Push, con Andrea (passo per passo)**

Spiega ad Andrea, prima di farlo, che cosa succede: il push manda su GitHub tutti i commit dei Task 1-10; finché la sorgente di Pages resta «Deploy from a branch», il sito online non cambia (Jekyll ignora i sorgenti grazie a `_config.yml`), e il workflow parte ma il passo di pubblicazione fallisce senza danni. Chiedi conferma. Solo dopo il sì:

```bash
cd /Users/andreavaccaro/Documents/60-69_progetti/latino-sites
git push origin main
```

(In lazygit: pannello dei rami, tasto `P`.) Poi su GitHub.com, scheda **Actions**: il job `costruisci` deve essere verde; `pubblica` può essere rosso a questo punto.

- [ ] **Step 6: Attivazione di Pages via Actions (Andrea, dall'interfaccia web)**

Guida Andrea schermata per schermata:
1. github.com → repository `latino-sites` → **Settings** → **Pages** (menu a sinistra).
2. Sezione «Build and deployment», menu **Source**: scegli **GitHub Actions**. Non serve salvare altro.
3. Scheda **Actions** → workflow «Pubblica il sito» → **Run workflow** → ramo `main` → **Run workflow**.
4. Attendi i due job verdi. Il link del sito compare nel job `pubblica`.

Poi verifica online: `https://andreavaccaro02-hue.github.io/latino-sites/`, `/geostoria/1/`, le due lezioni e le loro viste LIM, e almeno tre pagine vecchie (`grammatica/infinitiva.html`, `strumenti/glossario-eulalia.html`, `geostoria/le-fonti-lim.html`).

Se qualcosa non va: in Settings → Pages rimetti Source su «Deploy from a branch», `main`, `/ (root)`; il sito torna com'era.

- [ ] **Step 7: Rimuovi `_config.yml`**

Solo dopo che il sito via Actions funziona:

```bash
git rm _config.yml
git commit -m "rimuove la configurazione provvisoria di jekyll, non più usata con le actions

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

Chiedi ad Andrea prima del push, poi `git push origin main` e controlla che il workflow torni verde.

- [ ] **Step 8: Prova in classe**

Il pilota si chiude con Andrea che usa le due lezioni concatenate alla LIM in una lezione vera. Raccogli le sue osservazioni in `docs/superpowers/2026-09-24-brainstorming-rifacimento-sito.md` (sezione nuova «Dopo la prova in classe») per il giro successivo.

---

## Fuori da questo piano

Nell'ordine della spec, ognuno con il suo commit e la sua approvazione: la dicitura «Liceo Classico e Liceo Scientifico» nelle 16 pagine; i calendari con le date; la compressione delle foto (le due lezioni usano i `.jpg` esistenti di `geostoria/reperti/`, la conversione in WebP è rimandata a quel lavoro); i font TTF delle pagine vecchie; i link rotti registrati in `scripts/link-noti.json`; l'aggiornamento di `sitemap.xml` con le pagine nuove; le lezioni successive (geostoria, latino a metodo natura, grammatica).
