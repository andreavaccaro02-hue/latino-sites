# Rifacimento del sito · design

Data: 24 settembre 2026. Stato: da approvare.
Brainstorming di partenza: `docs/superpowers/2026-09-24-brainstorming-rifacimento-sito.md`. Audit: `docs/audit-2026-09-24.md`.

## Scopo

Il sito smette di essere una raccolta di pagine di latino e diventa il **manuale online delle materie che mi vengono assegnate**, anno per anno (nel 2026/27: geostoria in prima e seconda, latino a metodo natura in una seconda). Ogni lezione nasce da un solo file Markdown, da cui escono due viste: la pagina da scorrere, per lo studente a casa, e la vista LIM, per la classe. Aspetto da rivista, struttura da manuale, riferimenti didattici TLAC e mastery learning.

Successo del pilota: le due lezioni convertite si usano alla LIM, concatenate, in una lezione vera senza intoppi, e la pagina da scorrere si legge a 412 px senza sbordare.

## Vincoli

- Nessun nome di classe, nessuna data di lezione, nessun dato di studenti nelle pagine pubbliche.
- I testi pubblici rispettano i criteri Giunta e /lan (`verifica-lan.py`).
- Tutti gli URL già pubblicati continuano a funzionare.
- Le pagine interattive di `geostoria/` restano fisicamente dove sono: in `classi/geostoria/materiali/` ci sono symlink che puntano a quei file.
- I nomi delle tecniche TLAC (Do Now, Cold Call, Show Call…) stanno solo nei copioni del vault, mai sulle pagine.
- Modifiche ai contenuti una alla volta, con approvazione; git spiegato passo passo.

## Tre livelli, confini netti

| Livello | Dove | Chi lo vede | Contenuto |
|---|---|---|---|
| Programma | file Argo `.xls` in `10-19_lavoro/2026-27/classi/<materia>/argo/` | io | moduli e argomenti ufficiali, numerati |
| Copione | vault, `Scuola/D'Alessandro 2026-27/Lezioni/` | io | regia dell'ora: tempi, tecniche, classi, inclusione, «Se» |
| Lezione | repo, `src/lezioni/` | tutti | solo ciò che vedono gli studenti |

Il copione rimanda alla lezione pubblica con un link e dice quali lezioni usa quel giorno (per esempio «1.2 e inizio 1.4»). La lezione non rimanda mai al copione.

## Unità: una lezione per argomento Argo

Ogni lezione del sito corrisponde a **un argomento** del programma Argo (una riga con `ORD. ARGOMENTO`). L'ora in classe non coincide con la lezione: alla LIM le lezioni si concatenano e decido io dove fermarmi.

Un **modulo** Argo (capitolo del manuale, percorso di geografia, Cittadinanza) ha un'identità propria, indipendente dall'anno: i capitoli 6, 7 e 8 di geostoria stanno sia nel programma di prima (moduli 10-12) sia in quello di seconda (moduli 1-3). Le lezioni si scrivono una volta sola, dentro il modulo, e compaiono negli indici di tutti gli anni che lo prevedono.

## Struttura del repo

```
src/                                   sorgenti Eleventy
  lezioni/
    geostoria/
      strumenti-dello-storico/         un modulo = una cartella (slug stabile)
        _modulo.json                   titolo Argo del modulo
        02-che-cos-e-una-fonte.md      NN = ORD. ARGOMENTO
        04-storico-e-archeologo.md
      cap-06-roma-popoli-preromani/
  _includes/                           modelli: pagina, lim, indice, home
  _data/
    materie.json                       materie, anni attivi, colore, programma
    programmi/                         generati dallo script Argo, uno per anno
    moduli.json                        titolo Argo del modulo → slug
  index.njk                            home
  indici.njk                           un indice per materia e anno
  assets/
    css/rivista.css                    veste B, token
    css/lim.css                        vista LIM
    js/quiz.js                         quiz e biglietto d'uscita
    js/lim.js                          configurazione reveal.js, tasti, lavagna
    fonts/                             Newsreader e Inter in WOFF2
scripts/
  argo-in-json.py                      .xls Argo → src/_data/programmi/*.json
  controlla.mjs                        controlli dello scheletro, privacy, quiz
eleventy.config.js
package.json
.github/workflows/pubblica.yml
```

Le cartelle attuali (`grammatica/`, `autori/`, `strumenti/`, `percorsi/`, `calendario/`, `flashcard/`, `geostoria/`, `pdf/`, `css/`, `js/`, i file in radice) restano dove sono e vengono **copiate identiche** nell'uscita. Unica eccezione: `geostoria/index.html` viene sostituito dall'indice nuovo di geostoria allo stesso indirizzo (vedi «URL»). L'uscita va in `_site/`, che non si committa.

## URL

- Lezione: `/geostoria/<slug-modulo>/<slug-lezione>/`
- Vista LIM: `/geostoria/<slug-modulo>/<slug-lezione>/lim/`
- Indice per anno: `/geostoria/1/`, `/geostoria/2/`
- Pagina della materia: `/geostoria/` (sostituisce l'indice attuale, l'unica pagina che dice «Modulo 0»: la numerazione corretta è quella di Argo, modulo 1; le cinque pagine interattive mantengono i loro indirizzi)
- Home: `/`
- Tutti gli altri indirizzi attuali restano invariati.

I programmi Argo di un anno scolastico successivo possono cambiare numerazione: l'URL dipende dallo slug del modulo, non dal numero, quindi resta stabile.

## Il file di una lezione

```markdown
---
materia: geostoria
modulo: strumenti-dello-storico
argomento: 2
titolo: Che cos'è una fonte
sottotitolo: Che cosa resta del passato
immagine: reperti/hammurabi.webp
didascalia: Stele di Hammurabi, Louvre (XVIII sec. a.C.)
---

::: obiettivo
Distinguere fonte materiale e scritta, primaria e secondaria.
:::

::: do-now
Scrivi tre cose che uno storico del 2126 potrebbe trovare nella tua stanza.
:::

::: passo "Che cos'è una fonte"
Testo della spiegazione.

+ si rivela a spazio
+ poi questo

---

??? Un denario d'argento è una fonte…
- [ ] scritta
- [x] materiale
:::

::: lavagna "Storico e archeologo"
:::

::: uscita
??? Il diario di un soldato del 1915 è una fonte… → torna a: "Che cos'è una fonte"
- [x] scritta e primaria
- [ ] materiale e secondaria
:::

::: note
Visibile solo nella vista relatore della LIM.
:::
```

### Blocchi

| Blocco | Obbligo | Etichetta pubblica | Pagina | LIM |
|---|---|---|---|---|
| `obiettivo` | sì | Obiettivo | filetto sotto il titolo | nella schermata d'apertura |
| `do-now` | sì | Per cominciare | riquadro sabbia | una schermata |
| `passo "Titolo"` | almeno uno | Passo N · Titolo | sezione con titolo | una o più schermate |
| `uscita` | sì | Biglietto d'uscita | quiz con rimandi | una schermata, tasto `B` |
| `pratica` | no | Esercitati | sezione | una o più schermate |
| `padronanza` | no | Verifica di padronanza | quiz con rimandi | una schermata |
| `interattivo <pagina>` | no | (titolo della pagina) | pagina incorporata | schermata intera con «apri a tutto schermo» |
| `lavagna "Titolo"` | no | (titolo) | riquadro vuoto «Rispondi sul quaderno» | riquadro dove scrivo in diretta |
| `approfondimento` | no | Per saperne di più | riquadro chiuso, si apre al clic | esclusa |
| `note` | no | — | esclusa | solo vista relatore |

`interattivo` accetta il percorso di una pagina esistente del sito (per esempio `geostoria/linea-del-tempo.html`).

### Sintassi dentro i blocchi

- `---` su riga vuota: nuova schermata alla LIM; nella pagina da scorrere non si vede.
- Elenco con `+`: alla LIM si rivela un punto per volta con lo spazio; nella pagina è un normale elenco.
- Elenco con `-`: compare tutto insieme.
- Quiz: riga che comincia con `??? ` (la domanda), seguita da un elenco di opzioni `- [ ]` / `- [x]`. Almeno una `[x]`. In coda alla domanda, facoltativo, `→ torna a: "Titolo del passo"`. Solo scelta multipla nel pilota.

### Comportamento dei quiz

`js/quiz.js` rende cliccabili tutti i quiz. Al clic: verde se giusta, rossa se sbagliata, e la giusta si evidenzia. Nell'`uscita` e nella `padronanza`, una risposta sbagliata mostra «Rivedi: *titolo del passo*» con il link all'ancora del passo (nella vista LIM, alla sua prima schermata). Nessun dato salvato, nessun punteggio inviato.

## Vista LIM

reveal.js, installato con npm e servito dal sito stesso (nessun CDN, per le reti scolastiche). Veste: lo stesso foglio della rivista, caratteri circa il doppio, reperto a destra quando c'è.

- Schermata d'apertura: posizione, titolo, obiettivo, reperto.
- Frecce: schermata avanti e indietro. Spazio: punto successivo degli elenchi `+`, poi schermata successiva.
- `B`: biglietto d'uscita della lezione corrente. `Home`: apertura. `O`: panoramica. `S`: vista relatore con le `note`.
- Comandi a schermo nascosti finché il mouse non si muove.
- Nessun timer: si usa quello fisico.
- Lavagna: riquadro chiaro con bordo, testo scritto da tastiera. Il testo si salva nel browser di quel computer, per lezione e lavagna, e si cancella con «Pulisci».
- Ultima schermata: «Prosegui con: *titolo della lezione successiva* →», che porta alla vista LIM della lezione successiva **nello stesso modulo**. A fine modulo: «Fine del modulo» con il link all'indice.

## Aspetto (veste B, «rivista museale»)

- Fondo `#fcfbf8`, testo `#16140f`. Newsreader per testo e titoli, Inter per etichette e didascalie. Entrambi in WOFF2 serviti dal sito, con `font-display: swap`.
- Un colore d'accento per materia in `materie.json`: geostoria `#a34a28`, latino `#8B1E3F`. Usato per etichette, numeri di modulo, link.
- Pagina della lezione: reperto in alto con didascalia da catalogo; poi posizione, titolo, sottotitolo in corsivo, obiettivo col filetto, «Per cominciare» su fondo sabbia; in fondo «precedente / successiva» nello stesso modulo; in alto a destra «Vista LIM».
- Posizione nella pagina della lezione: «Geostoria · *titolo del modulo* · Lezione N», dove N è l'`ORD. ARGOMENTO`. Sotto, in piccolo: «Nel programma di: prima (modulo 10), seconda (modulo 1)». Il numero di modulo dipende dall'anno, quindi compare solo negli indici e in questa riga.
- Indice per anno: sommario da libro. Moduli numerati come in Argo, argomenti in elenco sotto ciascun modulo; quelli con lezione pubblicata sono link, gli altri in grigio. Un argomento senza lezione ma con pagine interattive esistenti rimanda a quelle tramite il campo `rimandi` di `moduli.json` (vedi «Programmi da Argo»); quando la lezione esiste, il rimando si ignora.
- Home: le materie dell'anno in corso in evidenza, le altre sotto «Anche sul sito»; chi sono e strumenti nel menu.
- Contrasti AA verificati; nessuna tabella o riga che sbordi a 412 px.

## Programmi da Argo

`scripts/argo-in-json.py` legge i file `.xls` di Argo (colonne `ORD. MODULO`, `MODULO`, `ORD. ARGOMENTO`, `ARGOMENTO`) e scrive `src/_data/programmi/<materia>-<anno>.json`. Le colonne `STATO SVOLGIMENTO` e `DATA SVOLGIMENTO` non vengono lette. Il titolo del modulo si abbina allo slug tramite `moduli.json`; un titolo senza slug ferma lo script con un messaggio che lo nomina. Lo script si lancia a mano quando il programma Argo cambia, e il JSON risultante si committa.

Formato di una voce di `moduli.json`:

```json
{
  "titolo_argo": "Prima di cominciare · Gli strumenti dello storico",
  "slug": "strumenti-dello-storico",
  "materia": "geostoria",
  "rimandi": {
    "1": ["geostoria/contare-il-tempo.html", "geostoria/linea-del-tempo.html"],
    "3": ["geostoria/carta-mediterraneo-lim.html"]
  }
}
```

Per le materie senza file Argo (per esempio il latino a metodo natura, se il programma non è ancora su Argo), il programma si scrive a mano nello stesso formato JSON.

## Generazione, anteprima, pubblicazione

- Eleventy 3 con markdown-it; tre estensioni locali in `eleventy.config.js`: blocchi `:::` (markdown-it-container), quiz `???`, elenchi `+` rivelabili. Ogni lezione produce due pagine con due modelli diversi.
- `npm run anteprima`: sito su `localhost:8080`, ricostruito a ogni salvataggio.
- `npm run controlla`: tutti i controlli qui sotto, più `~/Documents/tesi-magistrale/output/verifica-lan.py --conta` sui `.md` modificati (se lo script non esiste in quel percorso, avviso e non errore). Questo controllo non gira nell'Action.
- `.github/workflows/pubblica.yml`: a ogni push su `main`, installa, esegue i controlli, costruisce, pubblica su GitHub Pages. Se un passo fallisce, resta online la versione precedente.
- Periodo di transizione: finché Pages pubblica ancora direttamente dal ramo `main`, GitHub passa i file per Jekyll, che trasformerebbe i `.md` di `src/` in pagine pubbliche premature. Prima del primo push che contiene `src/`, un `_config.yml` in radice esclude `src`, `scripts`, `node_modules`, `package.json`, `package-lock.json` ed `eleventy.config.js`. Dopo l'attivazione il file non serve più e si rimuove.
- Attivazione: in GitHub.com, Settings → Pages → Source «GitHub Actions». Si fa **solo dopo** che il confronto fra i file prodotti in `_site/` e quelli del sito attuale non mostra mancanze.

## Controlli automatici

1. **Scheletro**: ogni lezione ha `obiettivo`, `do-now`, almeno un `passo`, `uscita`; front matter completo (`materia`, `modulo`, `argomento`, `titolo`); la coppia modulo-argomento esiste in almeno un programma.
2. **Privacy** (solo in `src/lezioni/`): sigle di classe nel formato delle classi dell'istituto (cifra da 1 a 5 seguita da una o più lettere maiuscole, per esempio `1ALS`, `2A`, `1BSA`) e date di calendario nei formati `gg/mm`, `gg/mm/aaaa`, `aaaa-mm-gg` fanno fallire la build. Le date storiche («753 a.C.», «1915») non corrispondono a questi formati.
3. **Quiz**: ogni `???` ha almeno una `[x]`; ogni «torna a» punta a un `passo` esistente nella stessa lezione.
4. **Link interni** rotti: lychee nell'Action, sull'uscita `_site/`.

## Pilota

1. Eleventy, copia identica del sito attuale, confronto dei file, Action (senza ancora cambiare la sorgente di Pages).
2. Veste B, modelli di pagina e LIM, `quiz.js`, `lim.js`, font in WOFF2.
3. `argo-in-json.py` sui due `.xls` di geostoria; `moduli.json` per i moduli di prima e seconda; home, pagina `/geostoria/`, indici `/geostoria/1/` e `/geostoria/2/`.
4. Due lezioni convertite dal contenuto di `geostoria/le-fonti-lim.html`: modulo «Prima di cominciare · Gli strumenti dello storico», argomento 2 (*Che cos'è una fonte*) e argomento 4 (*Il lavoro dello storico e quello dell'archeologo*). Ogni testo passa da /lan e mi viene proposto prima del commit. La pagina `le-fonti-lim.html` resta online com'è.
5. Nell'indice, gli argomenti 1 e 3 del modulo 1 rimandano a `contare-il-tempo.html` / `linea-del-tempo.html` e a `carta-mediterraneo-lim.html`.
6. Attivazione di Pages via Actions, verifica online, prova in classe.

## Fuori dal pilota

Commit separati, ciascuno con approvazione:
- La dicitura «Liceo Classico e Liceo Scientifico» nelle 16 pagine.
- I calendari `calendario/terza|quarta|quinta.html`, che contengono date.
- Compressione delle foto; font TTF delle pagine vecchie.

Dopo il pilota, una lezione alla volta: prima geostoria (man mano che preparo le lezioni), poi il latino a metodo natura, poi `grammatica/`. Autori, strumenti e percorsi restano come sono finché non decido altrimenti. I PDF e PPTX generati con NotebookLM non vanno sul sito.

## Test

- Test unitari (`node --test`) per le tre estensioni Markdown e per `controlla.mjs`: blocchi, quiz, elenchi `+`, privacy, scheletro, con esempi validi e non validi.
- Test di `argo-in-json.py` sui due `.xls` reali: numero di moduli e argomenti atteso (prima: 13 moduli; seconda: 12).
- Confronto dell'elenco dei file prodotti con quelli attuali prima dell'attivazione.
- Controllo visivo con Playwright in emulazione Pixel 5 (412 px) e a 1920×1080 (LIM), su una lezione e un indice.
- Prova in classe della vista LIM.
