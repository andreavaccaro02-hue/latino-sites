# Dopo la pubblicazione: correzioni rimandate, workflow, pagine di geostoria senza date

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** chiudere i sette difetti minori della revisione finale del rifacimento, aggiornare il workflow di pubblicazione, togliere date e riferimenti a lezioni reali dalle pagine pubbliche di geostoria e, dopo la prova in classe, togliere i file del vecchio sistema.

**Architecture:** correzioni piccole e indipendenti su `lib/` (controlli, quiz, link), su `.github/workflows/pubblica.yml` e su due pagine HTML scritte a mano. Ogni compito ha il suo test, rosso prima e verde dopo, e il suo commit. Un agente per compito. I compiti che toccano gli stessi file vanno in fila (vedi «Corsie»).

**Tech Stack:** Eleventy 3.1.6, markdown-it 14, `node --test`, Python unittest, GitHub Actions (Pages).

**Spec:** `docs/superpowers/specs/2026-09-24-rifacimento-sito-design.md`, più il rapporto della revisione finale (sette minori, riportati nell'ultimo messaggio della sessione del 2026-09-24) e le proposte sulle date raccolte nella stessa sessione (qui nel Task 8).

## Global Constraints

- Cartella di lavoro: `/Users/andreavaccaro/Documents/60-69_progetti/latino-sites/.claude/worktrees/rifacimento`, ramo `rifacimento`. Il ramo coincide con `main` pubblicato (commit `82e0675`).
- Commit in italiano, minuscola iniziale, indicativo presente in terza persona («aggiunge», «corregge», «toglie»), sul cosa e non sul perché. Ultima riga: `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Nessun `git push` senza il via esplicito di Andrea. Ogni push a `main` pubblica il sito.
- Nelle pagine pubbliche niente sigle di classe e niente date o giorni legati a lezioni reali.
- Testi pubblici: criteri Giunta e /lan (poche «che», niente punto e virgola, frasi piane). Ogni modifica di testo va approvata da Andrea una alla volta.
- Non toccare i collegamenti simbolici in `~/Documents/10-19_lavoro/2026-27/classi/geostoria/materiali/*.html`: puntano a `latino-sites/geostoria/*.html` nella cartella principale e si aggiornano da soli quando Andrea scarica `main`.
- Gli agenti non lanciano `npm run build` in parallelo: la build riscrive `_site/`, che altri test leggono. La build la lancia solo chi chiude il compito, da solo.
- Comandi git semplici e separati: la protezione del worktree rifiuta le catene con `cd`, variabili o reindirizzamenti.

## Review Focus

- Un link scritto `/latino-sites` (senza barra finale) punta alla home e non va segnalato come rotto. Test nel Task 1.
- Una riga ` ---` preceduta da una riga vuota resta un cambio di schermata e non va segnalata. Test nel Task 3.
- Virgolette miste nel «torna a» (`“Uno"`, `"Uno”`) funzionano come quelle dritte. Test nel Task 4.
- «torna a» dentro un testo normale, fuori da una riga `???`, non è un errore. Test nel Task 4.
- Se una lezione non ha argomento, due lezioni complete e uguali vanno comunque segnalate come doppione. Test nel Task 5.

## Corsie

| Corsia | Compiti | File |
|---|---|---|
| A | 1 | `lib/uscita.js`, `scripts/link-interni.mjs`, `tests/uscita.test.js` |
| B | 2 | `lib/markdown.js`, `lib/schermate.js`, `tests/markdown.test.js`, `tests/schermate.test.js` |
| C | 3 → 4 → 5 (in fila) | `lib/controlli.js`, `lib/quiz-md.js`, `tests/controlli.test.js`, `tests/quiz-md.test.js` |
| D | 6 | `.github/workflows/pubblica.yml` |
| E | 7 → 8 (in fila, 8 dopo l'approvazione) | `geostoria/le-fonti-lim.html`, `geostoria/contare-il-tempo.html` |
| F | 9 (dopo la prova in classe) | `_config.yml`, `index.html`, `geostoria/index.html` |
| — | 10 (ultimo) | push e verifica online |

Le corsie A, B, C, D ed E possono andare in parallelo. Dentro una corsia si va in fila. Il commit di ogni compito aggiunge solo i propri file (`git add <file>`, mai `git add .`).

---

### Task 1: il controllo dei link segnala i link assoluti senza `/latino-sites/`

**Files:**
- Modify: `lib/uscita.js`
- Modify: `scripts/link-interni.mjs:21-27`
- Test: `tests/uscita.test.js`

**Interfaces:**
- Produces: `fuoriPrefisso(link, prefisso = "/latino-sites/") → boolean`, esportata da `lib/uscita.js`.

Oggi `risolviLink("index.html", "/assets/x.css")` toglie la barra e restituisce `assets/x.css`, che esiste in `_site`. Il controllo quindi passa, ma all'indirizzo reale `https://andreavaccaro02-hue.github.io/assets/x.css` il file non c'è (404).

- [ ] **Step 1: scrivere il test che fallisce**

In fondo a `tests/uscita.test.js` aggiungere:

```js
test("fuoriPrefisso riconosce i link assoluti senza /latino-sites/", () => {
  assert.equal(fuoriPrefisso("/assets/x.css"), true);
  assert.equal(fuoriPrefisso("/geostoria/"), true);
  assert.equal(fuoriPrefisso("/latino-sites/assets/x.css"), false);
  assert.equal(fuoriPrefisso("/latino-sites"), false);
  assert.equal(fuoriPrefisso("../css/style.css"), false);
  assert.equal(fuoriPrefisso("https://esempio.it/x"), false);
  assert.equal(fuoriPrefisso("//cdn.esempio.it/x.js"), false);
  assert.equal(fuoriPrefisso("#su"), false);
});
```

Nella riga 3 aggiungere `fuoriPrefisso` all'import:

```js
import { fileMancanti, fuoriPrefisso, linkInterni, risolviLink } from "../lib/uscita.js";
```

- [ ] **Step 2: eseguirlo e vederlo fallire**

Run: `node --test tests/uscita.test.js`
Expected: FAIL con `SyntaxError: The requested module '../lib/uscita.js' does not provide an export named 'fuoriPrefisso'`

- [ ] **Step 3: scrivere il codice minimo**

In `lib/uscita.js`, dopo `risolviLink`:

```js
export function fuoriPrefisso(link, prefisso = "/latino-sites/") {
  if (ESTERNO.test(link) || !link.startsWith("/")) return false;
  const percorso = link.split("#")[0].split("?")[0];
  return percorso !== prefisso.replace(/\/$/, "") && !percorso.startsWith(prefisso);
}
```

In `scripts/link-interni.mjs`, riga 3:

```js
import { fuoriPrefisso, linkInterni, risolviLink } from "../lib/uscita.js";
```

e nel ciclo, subito dopo `for (const link of linkInterni(html)) {`:

```js
    if (fuoriPrefisso(link)) {
      rotti.push(`${pagina} -> ${link} (manca /latino-sites/ davanti)`);
      continue;
    }
```

- [ ] **Step 4: eseguire i test e il controllo**

Run: `node --test tests/uscita.test.js`
Expected: PASS, nessun fallimento

Run: `npm run link`
Expected: `Link interni controllati in 65 pagine: nessun link rotto nuovo.` (oggi in `_site` non ci sono link senza prefisso: è stato verificato)

- [ ] **Step 5: controllare che un link senza prefisso venga davvero segnalato**

Run: `node -e 'import("./lib/uscita.js").then(u => console.log(u.fuoriPrefisso("/assets/css/rivista.css")))'`
Expected: `true`

- [ ] **Step 6: commit**

```bash
git add lib/uscita.js scripts/link-interni.mjs tests/uscita.test.js
git commit -m "corregge il controllo dei link: segnala i link assoluti senza /latino-sites/

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: toglie `data-src` dal blocco interattivo

**Files:**
- Modify: `lib/markdown.js:61`
- Modify: `lib/schermate.js:55`
- Test: `tests/markdown.test.js:51`

**Interfaces:**
- Consumes: niente.
- Produces: il blocco `interattivo` non ha più l'attributo `data-src`. L'`iframe` e il link «Apri a tutto schermo» restano come sono.

Nessun codice legge `data-src`: lo si è verificato con `grep -rn "data-src" lib src tests scripts`, che trova solo il punto dove l'attributo viene scritto e quello dove viene copiato. HtmlBasePlugin non aggiunge il prefisso agli attributi `data-*`, quindi l'attributo punterebbe alla radice del dominio.

- [ ] **Step 1: cambiare il test perché fallisca**

In `tests/markdown.test.js` sostituire la riga 51:

```js
  assert.match(html, /data-src="\/geostoria\/linea-del-tempo.html"/);
```

con:

```js
  assert.doesNotMatch(html, /data-src=/);
```

In `tests/schermate.test.js` aggiungere in fondo:

```js
test("il blocco interattivo passa alla LIM senza data-src", () => {
  const html = md.render("::: interattivo geostoria/linea-del-tempo.html\n:::\n");
  const lim = inSchermate(html);
  assert.match(lim, /<iframe src="\/geostoria\/linea-del-tempo.html"/);
  assert.doesNotMatch(lim, /data-src=/);
});
```

`tests/schermate.test.js` importa già `creaMarkdown` e `inSchermate` e definisce `md` alle righe 3-6.

- [ ] **Step 2: eseguirli e vederli fallire**

Run: `node --test tests/markdown.test.js tests/schermate.test.js`
Expected: FAIL in «lavagna, interattivo, approfondimento, note» e in «il blocco interattivo passa alla LIM senza data-src», con un errore `doesNotMatch` su `data-src=`

- [ ] **Step 3: scrivere il codice minimo**

In `lib/markdown.js`, riga 61:

```js
      return `<section class="blocco blocco-interattivo" data-blocco="interattivo">\n`
```

In `lib/schermate.js`, riga 55:

```js
    const extra = ["data-chiave"]
```

- [ ] **Step 4: eseguire tutti i test di lib**

Run: `node --test tests/markdown.test.js tests/schermate.test.js`
Expected: PASS, nessun fallimento

- [ ] **Step 5: commit**

```bash
git add lib/markdown.js lib/schermate.js tests/markdown.test.js tests/schermate.test.js
git commit -m "toglie l'attributo data-src dal blocco interattivo, che nessuno legge e non ha il prefisso

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: il controllo del `---` riconosce anche le righe con spazi davanti o trattini in più

**Files:**
- Modify: `lib/controlli.js:57-61`
- Test: `tests/controlli.test.js`

**Interfaces:**
- Consumes: `controllaLezione(testo, file, programmi)`, `BUONA`, `PROGRAMMI` (già nel file di test).
- Produces: niente di nuovo. Stesso messaggio: `serve una riga vuota prima di --- (altrimenti diventa un titolo)`.

markdown-it trasforma in titolo anche ` ---` (da 1 a 3 spazi davanti) e `----` scritti sotto una riga di testo. Oggi la regex `/^---\s*$/` non li vede.

- [ ] **Step 1: scrivere il test che fallisce**

Dopo il test «--- senza riga vuota prima, con numero di riga» aggiungere:

```js
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
```

- [ ] **Step 2: eseguirlo e vederlo fallire**

Run: `node --test tests/controlli.test.js`
Expected: FAIL in «--- con spazi davanti o trattini in più…» con `0 !== 1` per `" ---"`. Il secondo test passa già: è un controllo contro i falsi allarmi.

- [ ] **Step 3: scrivere il codice minimo**

In `lib/controlli.js`, riga 58, sostituire `/^---\s*$/` con `/^ {0,3}-{3,}\s*$/`:

```js
    if (/^ {0,3}-{3,}\s*$/.test(r) && i > 0 && righeCorpo[i - 1].trim() !== "") {
```

- [ ] **Step 4: eseguire i test**

Run: `node --test tests/controlli.test.js`
Expected: PASS, nessun fallimento

Run: `npm run controlla`
Expected: nessun errore sulle due lezioni esistenti

- [ ] **Step 5: commit**

```bash
git add lib/controlli.js tests/controlli.test.js
git commit -m "corregge il controllo del cambio di schermata: vede anche --- con spazi davanti e ----

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: «torna a» accetta le virgolette tipografiche e segnala quello scritto male

**Files:**
- Modify: `lib/quiz-md.js:4`
- Modify: `lib/controlli.js:9`, `lib/controlli.js:69-70`
- Test: `tests/quiz-md.test.js`, `tests/controlli.test.js`

**Interfaces:**
- Consumes: Task 3 già in `lib/controlli.js` (stessa corsia, in fila).
- Produces: nuovo messaggio d'errore `«torna a» scritto male: serve -> torna a: "Titolo del passo"`.

Se l'editor trasforma `"Uno"` in `“Uno”`, oggi sia il quiz sia il controllo ignorano il rimando senza avvisare: lo studente non vede «Rivedi» e la build passa.

- [ ] **Step 1: scrivere i test che falliscono**

In `tests/quiz-md.test.js`, dopo «torna a con freccia → o con ->»:

```js
test("torna a con virgolette tipografiche o miste", () => {
  for (const titolo of ["“Che cos'è una fonte”", "“Che cos'è una fonte\"", "\"Che cos'è una fonte”"]) {
    const html = md.render(`??? Domanda -> torna a: ${titolo}\n- [x] sì\n- [ ] no\n`);
    assert.match(html, /data-torna="passo-che-cos-e-una-fonte"/, titolo);
    assert.match(html, /<p class="quiz-domanda">Domanda<\/p>/, titolo);
  }
});
```

In `tests/controlli.test.js`, dopo «torna a con → e con -> passano entrambi»:

```js
test("torna a con virgolette tipografiche passa", () => {
  const testo = BUONA.replace('torna a: "Che cos\'è una fonte"', "torna a: “Che cos'è una fonte”");
  assert.deepEqual(controllaLezione(testo, "a.md", PROGRAMMI), []);
});

test("torna a scritto male viene segnalato", () => {
  const testo = BUONA.replace('-> torna a: "Che cos\'è una fonte"', "-> torna a: Che cos'è una fonte");
  const m = messaggi(controllaLezione(testo, "a.md", PROGRAMMI));
  assert.match(m, /«torna a» scritto male/);
});

test("torna a in un testo normale non è un errore", () => {
  const testo = BUONA.replace("Tre cose.", "Poi si torna a: casa.");
  assert.deepEqual(controllaLezione(testo, "a.md", PROGRAMMI), []);
});
```

- [ ] **Step 2: eseguirli e vederli fallire**

Run: `node --test tests/quiz-md.test.js tests/controlli.test.js`
Expected: FAIL in «torna a con virgolette tipografiche o miste» (nessun `data-torna`) e in «torna a scritto male viene segnalato». Passano già «torna a con virgolette tipografiche passa» (oggi il rimando viene ignorato in silenzio) e «torna a in un testo normale». Tutti e due servono a evitare che la nuova regola dia falsi allarmi.

- [ ] **Step 3: scrivere il codice minimo**

`lib/quiz-md.js`, riga 4:

```js
const TORNA = /\s*(?:→|->)\s*torna a:\s*["“]([^"“”]+)["”]\s*$/;
```

`lib/controlli.js`, riga 9:

```js
const TORNA = /(?:→|->)\s*torna a:\s*["“]([^"“”]+)["”]\s*$/;
```

`lib/controlli.js`, righe 69-70:

```js
    const torna = r.match(TORNA);
    if (torna && !passi.has(torna[1])) errore(`«torna a» punta a un passo che non esiste: «${torna[1]}»`, rigaFile(i));
    else if (!torna && /torna a:/.test(r)) errore('«torna a» scritto male: serve -> torna a: "Titolo del passo"', rigaFile(i));
```

- [ ] **Step 4: eseguire i test**

Run: `node --test tests/quiz-md.test.js tests/controlli.test.js`
Expected: PASS, nessun fallimento

- [ ] **Step 5: commit**

```bash
git add lib/quiz-md.js lib/controlli.js tests/quiz-md.test.js tests/controlli.test.js
git commit -m "corregge «torna a»: accetta le virgolette tipografiche e segnala quello scritto male

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: niente falso doppione fra lezioni senza front matter

**Files:**
- Modify: `lib/controlli.js:102-106`
- Test: `tests/controlli.test.js`

**Interfaces:**
- Consumes: Task 4 già in `lib/controlli.js` (stessa corsia, in fila).
- Produces: niente di nuovo.

Oggi due lezioni senza front matter hanno tutte e due la chiave `undefined/undefined/undefined` e producono il messaggio «stesso argomento già trattato», che è falso. I messaggi giusti sui campi mancanti ci sono già.

- [ ] **Step 1: scrivere il test che fallisce**

Dopo «controllaCartella trova due lezioni sullo stesso argomento»:

```js
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
```

- [ ] **Step 2: eseguirlo e vederlo fallire**

Run: `node --test tests/controlli.test.js`
Expected: FAIL con `2 !== 1` (il falso doppione fra `a.md` e `b.md` più quello vero fra `c.md` e `d.md`)

- [ ] **Step 3: scrivere il codice minimo**

In `lib/controlli.js`, dopo `try { fm = matter(testo).data; } catch { continue; }`:

```js
    if (!fm.materia || !fm.modulo || fm.argomento === undefined || fm.argomento === null || fm.argomento === "") continue;
```

- [ ] **Step 4: eseguire tutti i test**

Run: `npm test`
Expected: PASS, nessun fallimento. Serve `_site`, che c'è già: non rilanciare la build se altre corsie sono ancora al lavoro.

- [ ] **Step 5: commit**

```bash
git add lib/controlli.js tests/controlli.test.js
git commit -m "corregge il controllo dei doppioni: salta le lezioni a cui manca un campo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: il workflow esegue anche il test Python e usa azioni su Node 24

**Files:**
- Modify: `.github/workflows/pubblica.yml`

**Interfaces:**
- Consumes: niente.
- Produces: niente per gli altri compiti.

Il test `tests/test_argo.py` importa solo moduli della libreria standard (`json`, `re`, `sys`, `pathlib`) e non ha bisogno di `xlrd`. Il runner `ubuntu-latest` ha già `python3`, quindi `actions/setup-python` non serve.

L'ultima esecuzione ha dato questo avviso: «Node.js 20 is deprecated … actions/checkout@v4, actions/setup-node@v4, actions/upload-artifact@v4». Le ultime versioni principali, verificate il 2026-09-24 con `gh api repos/actions/<nome>/releases/latest`, sono:

| azione | ora | ultima |
|---|---|---|
| actions/checkout | v4 | v7.0.1 |
| actions/setup-node | v4 | v7.0.0 |
| actions/upload-pages-artifact | v3 | v5.0.0 |
| actions/deploy-pages | v4 | v5.0.1 |

- [ ] **Step 1: leggere le note di rilascio dei salti di versione**

Leggere le note di rilascio di ogni versione principale fra quella attuale e l'ultima:

```bash
gh release view v5.0.0 --repo actions/checkout
gh release view v6.0.0 --repo actions/checkout
gh release view v7.0.0 --repo actions/checkout
gh release view v5.0.0 --repo actions/setup-node
gh release view v6.0.0 --repo actions/setup-node
gh release view v7.0.0 --repo actions/setup-node
gh release view v4.0.0 --repo actions/upload-pages-artifact
gh release view v5.0.0 --repo actions/upload-pages-artifact
gh release view v5.0.0 --repo actions/deploy-pages
```

Annotare ogni cambiamento incompatibile che tocca questo workflow, per esempio:
- `cache: npm` in setup-node;
- file nascosti o link simbolici esclusi dall'artefatto di Pages (in `_site` ci sono `geostoria/fonts` e i file passthrough);
- la coppia di versioni compatibili fra upload-pages-artifact e deploy-pages;
- la versione minima del runner.

Se una versione ha un cambiamento che rompe il workflow e non si può adattare in una riga, restare sulla versione principale precedente che gira su Node 24 e scriverlo nel registro con un `Ruling:`.

- [ ] **Step 2: scrivere il workflow**

`.github/workflows/pubblica.yml`, job `costruisci` (le versioni vanno confermate allo Step 1):

```yaml
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: python3 -m unittest tests/test_argo.py
      - run: npm run confronta
      - run: npm run link
      - uses: actions/upload-pages-artifact@v5
        with:
          path: _site
```

e nel job `pubblica`:

```yaml
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 3: controllare sintassi e comando Python**

Run: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pubblica.yml"); puts "ok"'`
Expected: `ok`

Run: `python3 -m unittest tests/test_argo.py`
Expected: `OK`

- [ ] **Step 4: commit**

```bash
git add .github/workflows/pubblica.yml
git commit -m "aggiorna il workflow: esegue il test dello script argo e passa alle azioni su node 24

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

La verifica vera avviene con il push del Task 10: se il job fallisce, per tornare indietro basta annullare questo commit con `git revert` e pubblicare di nuovo.

---

### Task 7: la copertina del manuale in `le-fonti-lim.html` torna visibile

**Files:**
- Modify: `geostoria/le-fonti-lim.html:267`

**Interfaces:**
- Consumes: niente.
- Produces: niente.

Il percorso `accoglienza/ramo-doro-copertina.jpg` punta a una cartella che non esiste nel sito. L'immagine sta in `geostoria/reperti/ramo-doro-copertina.jpg`. Oggi al posto della copertina compare il testo alternativo. Il controllo dei link non se ne accorge perché il percorso sta dentro una stringa JavaScript (`img: "…"`), non in un attributo `src`.

- [ ] **Step 1: verificare il difetto**

Run: `grep -n "ramo-doro-copertina" geostoria/le-fonti-lim.html`
Expected: una riga con `accoglienza/ramo-doro-copertina.jpg`

Run: `ls geostoria/reperti/ramo-doro-copertina.jpg`
Expected: il file esiste

- [ ] **Step 2: correggere il percorso**

Nella riga trovata, sostituire `accoglienza/ramo-doro-copertina.jpg` con `reperti/ramo-doro-copertina.jpg` (solo il percorso, niente altro).

- [ ] **Step 3: verificare**

Run: `grep -rn "accoglienza/" geostoria/*.html`
Expected: nessun risultato

Dopo la build del Task 10 aprire `…/geostoria/le-fonti-lim.html` nel browser, andare sulla schermata del manuale e controllare che la copertina si veda.

- [ ] **Step 4: commit**

```bash
git add geostoria/le-fonti-lim.html
git commit -m "corregge il percorso della copertina del manuale in le-fonti-lim

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: toglie date e rimandi a lezioni reali dalle pagine di geostoria

**Files:**
- Modify: `geostoria/le-fonti-lim.html` (righe 231, 302, 305, 307, 336, 355, 369, 373)
- Modify: `geostoria/contare-il-tempo.html` (righe 161, 163)

**Interfaces:**
- Consumes: Task 7 già fatto (stesso file, in fila).
- Produces: niente.

**Prima di cominciare:** Andrea approva ogni proposta una alla volta. L'agente applica solo quelle segnate «approvata» e con il testo approvato, anche se Andrea l'ha cambiato. Le proposte non approvate restano come sono.

Vincoli per non rompere la pagina:
- Se si toglie la costante `DATA` (riga 231), va tolto anche `${DATA}` alla riga 302. Altrimenti la prima schermata va in errore e non si vede nulla.
- I valori `nome:` delle schermate non si toccano. Il tasto B cerca `"biglietto d'uscita"` (riga 385) e le lavagne salvano con chiavi basate sul nome (riga 456).

| # | File e riga | Prima | Dopo | Esito |
|---|---|---|---|---|
| 1 | le-fonti-lim 231 e 302 | `const DATA = new Date().toLocaleDateString(…)` e `Geostoria · ${DATA}` | tolta la riga 231, la 302 diventa `<div class="sopra">Geostoria</div>` (facoltativa: la data è quella del giorno in cui si apre la pagina, non rivela lezioni) | [ ] |
| 2 | le-fonti-lim 305 | `Lezione 1: la carta. Lezione 2: la linea del tempo. Oggi: che cosa resta del passato.` | `Prima la carta, poi la linea del tempo. Ora: che cosa resta del passato.` | [ ] |
| 3 | le-fonti-lim 307 | `Banchi a coppie, come venerdì. Quaderno aperto.` | `Banchi a coppie. Quaderno aperto.` | [ ] |
| 4 | le-fonti-lim 336 | `il vostro primo giorno al D'Alessandro, <b>16 settembre 2026</b>.` | `il vostro <b>primo giorno di scuola superiore</b>.` | [ ] |
| 5 | le-fonti-lim 355 | `<div class="obiettivo passo"><b>Mercoledì 30 settembre: test d'ingresso.</b> …</div>` | tolto tutto il `<div>` | [ ] |
| 6a | le-fonti-lim 369 | `Per la prossima volta` | `Consegna` | [ ] |
| 6b | le-fonti-lim 373 | `Lo riprendiamo in classe, cinque minuti a rotazione, e lo leghiamo ai luoghi delle vostre famiglie usciti al World Café.` | riga tolta | [ ] |
| 7 | contare-il-tempo 163 | `La prossima volta parliamo delle <b>fonti</b>. Le schede che avete scritto mercoledì sono già una fonte: vi spiego perché.` | `La prossima volta parliamo delle <b>fonti</b>.` | [ ] |
| 8 | contare-il-tempo 161 | `Se non hai ancora il libro, fattelo prestare: la prossima settimana serve a tutti.` | `Se non hai ancora il libro, fattelo prestare.` | [ ] |

Da lasciare come sono, perché non rivelano lezioni né classi:
- «Uno storico del 2126»;
- gli esempi di calcolo con il 2026 in `contare-il-tempo.html`;
- Bagheria in `carta-mediterraneo-lim.html` e `da-dove-veniamo.html`, dove serve al funzionamento della pagina;
- la data nei nomi dei file scaricati da `da-dove-veniamo.html`.

- [ ] **Step 1: applicare solo le proposte approvate**

Una modifica per proposta, con Edit sulla stringa esatta della colonna «Prima».

- [ ] **Step 2: verificare che non restino date o giorni**

Run: `grep -nE "settembre|ottobre|lunedì|martedì|mercoledì|giovedì|venerdì|D'Alessandro|World Café" geostoria/le-fonti-lim.html geostoria/contare-il-tempo.html`
Expected: nessuna riga, oppure solo quelle di proposte non approvate

Run: `node -e 'const h=require("fs").readFileSync("geostoria/le-fonti-lim.html","utf8"); console.log(/\$\{DATA\}/.test(h) === /const DATA/.test(h) ? "ok" : "DATA incoerente")'`
Expected: `ok`

- [ ] **Step 3: provare la pagina**

Dopo la build del Task 10, aprire `le-fonti-lim.html` nel browser e scorrere tutte le schermate con le frecce. Controllare che la console non abbia errori, che il tasto B porti al biglietto d'uscita e che le lavagne salvino.

- [ ] **Step 4: commit**

```bash
git add geostoria/le-fonti-lim.html geostoria/contare-il-tempo.html
git commit -m "toglie date e rimandi a lezioni reali da le-fonti-lim e contare-il-tempo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: toglie `_config.yml` e i vecchi indici (solo dopo la prova in classe)

**Files:**
- Delete: `_config.yml`, `index.html`, `geostoria/index.html`

**Interfaces:**
- Consumes: niente.
- Produces: niente.

**Si parte solo quando Andrea dice che la prova in classe è andata bene.** Dopo questo compito non si può più tornare al sito vecchio con «Deploy from a branch»: Jekyll pubblicherebbe i sorgenti e la home non ci sarebbe. Il ritorno indietro resta possibile, ma con `git revert` di questo commit.

`tests/sostituzioni.test.js` confronta con le copie in `tests/fixtures/`, non con questi file, quindi continua a funzionare. `npm run confronta` elenca i file tracciati da git, quindi dopo la rimozione non li cerca più.

- [ ] **Step 1: togliere i file**

```bash
git rm _config.yml index.html geostoria/index.html
```

- [ ] **Step 2: verificare da zero**

Run: `npm run build`
Expected: nessun errore

Run: `npm test`
Expected: tutti PASS

Run: `npm run confronta`
Expected: `Confronto riuscito: 83 file del sito attuale presenti in _site/.` (85 meno i due indici tolti, perché `_config.yml` era già escluso)

Run: `npm run link`
Expected: `nessun link rotto nuovo`

- [ ] **Step 3: commit**

```bash
git commit -m "toglie _config.yml e le vecchie pagine indice, sostituite dal sito costruito con eleventy

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: pubblicazione e verifica online

**Files:** nessuno.

**Interfaces:**
- Consumes: i commit dei compiti fatti.
- Produces: il sito aggiornato su https://andreavaccaro02-hue.github.io/latino-sites/

- [ ] **Step 1: verifica completa da zero**

Run: `npm run build`, poi `npm test`, `python3 -m unittest tests/test_argo.py`, `npm run confronta`, `npm run link`
Expected: tutto verde

- [ ] **Step 2: chiedere il via ad Andrea**

Mostrare l'elenco dei commit (`git log --oneline origin/main..HEAD`) e aspettare un sì esplicito.

- [ ] **Step 3: push**

```bash
git fetch origin
git merge-base --is-ancestor origin/main HEAD
git push origin rifacimento:main
```

Il secondo comando non stampa nulla se va bene. Se esce con errore, vuol dire che su GitHub ci sono modifiche che il ramo non ha: fermarsi e chiedere.

- [ ] **Step 4: seguire il workflow**

Run: `gh run list -L 2`, poi `gh run watch <id> --exit-status`
Expected: `costruisci success` e `pubblica success`

- [ ] **Step 5: verificare online**

Controllare lo stato HTTP (200) di: `/`, `/geostoria/`, le due lezioni con `/lim/`, `geostoria/le-fonti-lim.html`, `geostoria/contare-il-tempo.html`. Poi aprire `le-fonti-lim.html` nel browser e ripetere i controlli dei Task 7 e 8.

- [ ] **Step 6: ricordare ad Andrea di aggiornare la cartella principale**

```
cd /Users/andreavaccaro/Documents/60-69_progetti/latino-sites
git pull
```

Così si aggiornano anche i collegamenti simbolici in `materiali/`.
