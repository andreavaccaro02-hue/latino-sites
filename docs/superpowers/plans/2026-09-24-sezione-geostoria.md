# Sezione «Geostoria» · piano di lavoro

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pubblicare le cinque pagine del Modulo 0 di geostoria su `latino-sites`, con indice, voce di menu e card in home, senza nomi di classe.

**Architecture:** le pagine si spostano nel repo del sito (`geostoria/`) con i soli asset che usano; in `materiali/` restano collegamenti simbolici, così vault e sito leggono lo stesso file. Pagine statiche, nessun build.

**Tech Stack:** HTML/CSS/JS statici, GitHub Pages, `css/style.css` del sito, Chrome headless per la verifica, git.

**Spec:** `docs/superpowers/specs/2026-09-24-sezione-geostoria-design.md`

## Global Constraints

- Percorsi: sito in `~/Documents/60-69_progetti/latino-sites` (qui `SITO`), materiali in `~/Documents/10-19_lavoro/2026-27/classi/geostoria/materiali` (qui `MAT`).
- Nessuna stringa `1ALS`, `1BLS`, `1BSA`, `1ESA`, `2G` nelle pagine pubblicate.
- La cartella delle foto si chiama `reperti/` (`.gitignore` ignora `fonti/`).
- Commit in italiano, minuscolo, indicativo presente («aggiunge…»); nessun push finché tutte le verifiche passano.
- Non toccare `prima-ora-1bsa.html`, `_admin/`, `latino-sites-AUDIT.md`.

---

### Task 1: spostare pagine e asset, lasciare i collegamenti simbolici

**Files:**
- Create: `SITO/geostoria/{carta-mediterraneo-lim,contare-il-tempo,linea-del-tempo,le-fonti-lim,da-dove-veniamo}.html`, `SITO/geostoria/fonts/*`, `SITO/geostoria/reperti/*.jpg`, `SITO/geostoria/img/carta-muta-mediterraneo.png`
- Modify: `MAT/` (cinque file diventano symlink; nuovi symlink `reperti`, `img`)

- [ ] **Step 1: spostare e collegare**

```bash
SITO=~/Documents/60-69_progetti/latino-sites; MAT=~/Documents/10-19_lavoro/2026-27/classi/geostoria/materiali
mkdir -p "$SITO/geostoria/fonts" "$SITO/geostoria/reperti" "$SITO/geostoria/img"
for f in carta-mediterraneo-lim contare-il-tempo linea-del-tempo le-fonti-lim da-dove-veniamo; do
  mv "$MAT/$f.html" "$SITO/geostoria/$f.html" && ln -s "$SITO/geostoria/$f.html" "$MAT/$f.html"; done
cp "$MAT/accoglienza/fonts/ShantellSans[BNCE,INFM,SPAC,wght].ttf" "$MAT/accoglienza/fonts/LibertinusSerif-Regular.otf" "$MAT/accoglienza/fonts/LibertinusSerif-Italic.otf" "$MAT/accoglienza/fonts/LibertinusSerif-Semibold.otf" "$MAT/accoglienza/fonts/Kalam-Regular.ttf" "$SITO/geostoria/fonts/"
cp "$MAT"/fonti/*.jpg "$SITO/geostoria/reperti/"
cp "$MAT/accoglienza/carta-muta-mediterraneo.png" "$SITO/geostoria/img/"
ln -s fonti "$MAT/reperti"; ln -s accoglienza "$MAT/img"
```

- [ ] **Step 2: verificare**

Run: `ls -l "$MAT" | grep -- '->'` — attese 7 righe di link (5 pagine, `reperti`, `img`, più `fonts` già esistente = 8). `du -sh "$SITO/geostoria"` sotto 5 MB. `git -C "$SITO" status --short | grep -c geostoria` maggiore di 0 e `git -C "$SITO" check-ignore geostoria/reperti/lucy.jpg` senza output.

### Task 2: percorsi degli asset e pulizia dei nomi di classe

**Files:**
- Modify: `SITO/geostoria/carta-mediterraneo-lim.html:75`, `SITO/geostoria/le-fonti-lim.html` (righe 229-235, 240-280, 305, 459), `SITO/geostoria/da-dove-veniamo.html` (72, 99-101, 236, 266)

- [ ] **Step 1: percorsi**

```bash
cd "$SITO/geostoria"
sed -i '' 's#accoglienza/carta-muta-mediterraneo.png#img/carta-muta-mediterraneo.png#' carta-mediterraneo-lim.html
sed -i '' 's#img: "fonti/#img: "reperti/#g' le-fonti-lim.html
```

- [ ] **Step 2: via classe e data**

`le-fonti-lim.html`: sostituire il blocco parametri con
```js
// ---------- parametri: ?i=9&r=all&f=3 ----------
const q = new URLSearchParams(location.search);
const DATA = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
```
riga 305: `<div class="sopra">Geostoria · ${DATA}</div>`; riga 459: `` function chiaveLavagna(s) { return `le-fonti-lim:${s.nome}`; } ``.

`da-dove-veniamo.html`: riga 72 → `<h1>Da dove veniamo</h1>`; righe 99-101 →
```js
const q = new URLSearchParams(location.search);
const CHIAVE = "da-dove-veniamo";
```
riga 236 → `` scarica(`da-dove-veniamo-${oggi}.json`, JSON.stringify({ data: oggi, luoghi }, null, 2), "application/json"); ``; riga 266: `` a.download = `da-dove-veniamo-${oggi}.png`; ``.

- [ ] **Step 3: verificare**

Run: `grep -nE '1ALS|1BLS|1BSA|1ESA|\b2G\b|CLASSE|q.get\("classe"\)' "$SITO"/geostoria/*.html` — atteso nessun risultato. `node -e` che estrae lo script di ciascuna pagina e lo passa a `new Function` senza errori di sintassi.

### Task 3: link «← Geostoria» dentro le cinque pagine

**Files:** Modify: le cinque pagine in `SITO/geostoria/`, prima di `</body>`

- [ ] **Step 1: aggiungere in ogni pagina**

```html
<a class="torna-indice" href="index.html" title="Indice di geostoria">← Geostoria</a>
<style>.torna-indice{position:fixed;right:14px;bottom:10px;z-index:99;font:600 14px/1 system-ui,sans-serif;color:#555;text-decoration:none;opacity:0;transition:opacity .25s;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.85)}.torna-indice:hover,.torna-indice:focus,body:hover .torna-indice{opacity:1}</style>
```
Regola: `body:hover` la mostra solo col mouse sopra la pagina, come gli altri comandi; sulla LIM a tastiera resta invisibile.

- [ ] **Step 2: verificare**

Run: `grep -c torna-indice "$SITO"/geostoria/*.html` — 1 per pagina.

### Task 4: `geostoria/index.html`

**Files:** Create: `SITO/geostoria/index.html` (navbar e classi di `grammatica/index.html`, `body class="liquid-glass"`, `css/../css/style.css`)

- [ ] **Step 1: scrivere la pagina**: head come `grammatica/index.html` (title «Geostoria — Lingua e Cultura Latina», canonical `…/latino-sites/geostoria/`), navbar con la voce Geostoria attiva, hero «Geostoria» / «Primo biennio · Modulo 0: gli strumenti dello storico», `cards-grid` con tre `a.card` (DOVE → `carta-mediterraneo-lim.html`, QUANDO → `contare-il-tempo.html`, COME SAPPIAMO? → `le-fonti-lim.html`), ognuna con una frase e la riga comandi «frecce: schermata · spazio: passo successivo (· T tabella · B biglietto per le fonti)», una card «La linea del tempo» → `linea-del-tempo.html`, una `tools-section` «Per la lezione» con `tool-link` a `da-dove-veniamo.html` («Mappa delle provenienze: serve la rete»), footer del sito.

- [ ] **Step 2: verificare**: screenshot Chrome headless, `--window-size=1400,1000`; i link rispondono (`ls` dei target).

### Task 5: menu, home, «Su di me», sitemap

**Files:** Modify: 52 pagine con navbar (script), `index.html`, `chi-sono.html`, `sitemap.xml`

- [ ] **Step 1: voce di menu ovunque**

```bash
cd "$SITO"
for f in $(grep -l 'class="navbar"' $(find . -name "*.html" -not -path "./_admin/*")); do
  perl -0pi -e 's#(<a href="((?:\.\./)*)grammatica/index\.html">Grammatica</a>)#$1\n      <a href="$2geostoria/index.html">Geostoria</a>#' "$f"; done
grep -c 'geostoria/index.html">Geostoria' $(grep -l 'class="navbar"' $(find . -name "*.html" -not -path "./_admin/*")) | grep -v ':1$'   # atteso: nessuna riga (tutte a 1)
```
Nelle pagine di `geostoria/` la voce è `<a href="index.html">` (già così in Task 4; le cinque lezioni non hanno navbar).

- [ ] **Step 2: home**: `<title>` «Lingua e Cultura Latina e Geostoria — Prof. Andrea Vaccaro»; description e og aggiornate («…Latino e geostoria per il liceo…»); hero: `<p class="subtitle">Latino, percorso quinquennale · Geostoria, primo biennio</p>`; nuova `section.tools-section` «Geostoria» prima di «Calendari Classi» con tre `tool-link` (🗺️ DOVE · la carta, ⏳ QUANDO · contare il tempo, 🔍 COME SAPPIAMO? · le fonti) e un quarto verso l'indice (📚 Tutte le lezioni).

- [ ] **Step 3: «Su di me»**: dopo «…Sant'Anna di Pisa.» aggiungere la frase «Dal 2026/27 insegno anche geostoria nel primo biennio: le lezioni proiettate in classe sono nella sezione <a href="geostoria/index.html">Geostoria</a>.»

- [ ] **Step 4: sitemap**: sei `<url>` prima di `</urlset>` (`geostoria/`, e le cinque pagine), `lastmod` 2026-09-24, `changefreq` weekly, priority 0.8 per l'indice e 0.6 per le pagine.

- [ ] **Step 5: verificare**: `grep -c "geostoria" sitemap.xml` = 6; screenshot della home.

### Task 6: verifica finale e pubblicazione

- [ ] **Step 1: Chrome headless** su `file://$SITO/geostoria/<pagina>.html` per le sei pagine, `--virtual-time-budget=8000`, screenshot in `~/.claude/jobs/7502468f/tmp/sito-*.png`; controllare font (Shantell), carta, reperti, mappa (Leaflet con rete).
- [ ] **Step 2: da materiali**: `file://$MAT/le-fonti-lim.html` e `carta-mediterraneo-lim.html` via symlink: reperti e carta visibili.
- [ ] **Step 3: grep** dei nomi di classe su tutto `geostoria/`: nessun risultato.
- [ ] **Step 4: commit e push**

```bash
cd "$SITO"
git add .gitignore docs geostoria index.html chi-sono.html sitemap.xml $(git diff --name-only)
git commit -m "aggiunge la sezione geostoria con le cinque pagine del Modulo 0 e la voce di menu"
git push origin main
```
Spiegare al docente: `git add` mette i file nel prossimo «pacchetto»; `git commit` lo registra con un messaggio; `git push origin main` lo manda su GitHub, ramo principale; GitHub Pages ricostruisce il sito da solo in pochi minuti.
- [ ] **Step 5: online**: `curl -sI https://andreavaccaro02-hue.github.io/latino-sites/geostoria/ | head -1` → 200 (dopo qualche minuto).
