# Sezione «Geostoria» sul sito · design

Data: 24 settembre 2026. Stato: da approvare.

## Scopo

Pubblicare su `latino-sites` (GitHub Pages) le pagine interattive delle lezioni di geostoria, per due usi: il docente le apre dal sito in aula e le proietta; gli studenti le riaprono da casa per rivedere la lezione. Il sito serve anche da vetrina del lavoro su geostoria. Nessun nome di classe, nessun dato di studenti online.

## Che cosa va online

Cinque pagine, oggi in `~/Documents/10-19_lavoro/2026-27/classi/geostoria/materiali/`:

| Pagina | Ruolo | Dipendenze |
|---|---|---|
| `carta-mediterraneo-lim.html` | L01 · DOVE | Shantell Sans, `carta-muta-mediterraneo.png` |
| `contare-il-tempo.html` | L02 · QUANDO | Shantell Sans |
| `linea-del-tempo.html` | L02 · linea del tempo | Shantell Sans (solo Google Fonts) |
| `le-fonti-lim.html` | L03 · COME SAPPIAMO | Shantell Sans, Libertinus Serif, Kalam, quattro foto dei reperti, un'immagine remota da Wikimedia con riserva locale |
| `da-dove-veniamo.html` | strumento per la lezione: mappa delle provenienze | Libertinus, Shantell, Leaflet e html2canvas da cdnjs, tile Esri, Nominatim; salva l'elenco nel browser |

Resta fuori `prima-ora-1bsa.html` (accoglienza di una sola classe).

## Struttura nel sito

```
latino-sites/
  geostoria/
    index.html                  indice della sezione
    carta-mediterraneo-lim.html
    contare-il-tempo.html
    linea-del-tempo.html
    le-fonti-lim.html
    da-dove-veniamo.html
    fonts/                      solo i font caricati dalle pagine (Shantell Sans, Libertinus Serif Regular/Italic/Semibold, Kalam Regular), ~2,7 MB
    reperti/                    hammurabi.jpg, denario-augusto.jpg, hadar-1973.jpg, lucy.jpg
    img/carta-muta-mediterraneo.png
```

La cartella delle foto si chiama `reperti/` e non `fonti/` perché `.gitignore` del sito ignora ogni cartella `fonti/`. Nelle pagine cambiano quindi due percorsi: `fonti/` → `reperti/` in `le-fonti-lim.html`, `accoglienza/carta-muta-mediterraneo.png` → `img/carta-muta-mediterraneo.png` in `carta-mediterraneo-lim.html`. `fonts/` resta uguale.

## Una copia sola

Le cinque pagine vivono nel repo del sito. In `materiali/` ogni pagina diventa un collegamento simbolico al file del sito (`materiali/le-fonti-lim.html → latino-sites/geostoria/le-fonti-lim.html`, ecc.). I link del vault Obsidian puntano a `materiali/` e continuano a funzionare. Perché aperte da lì trovino gli asset con i nuovi percorsi, in `materiali/` si aggiungono due collegamenti simbolici: `reperti → fonti` e `img → accoglienza` (contiene `carta-muta-mediterraneo.png`). Ogni modifica si fa sul file del sito e va online con un commit.

## Pulizia delle pagine

- Via il parametro `?classe=` e `?data=` da `le-fonti-lim.html` e `da-dove-veniamo.html`: l'intestazione mostra «Geostoria» e la data di oggi; le lavagne si salvano nel browser con una chiave senza classe (`le-fonti-lim:<schermata>`), l'elenco dei luoghi con `da-dove-veniamo`; i file scaricati si chiamano `da-dove-veniamo-<data>`. Restano i parametri di navigazione (`i`, `f`, `r`).
- Nessun nome di classe nel codice delle cinque pagine (verifica con grep su `1ALS|1BLS|1BSA|1ESA|2G`).
- I link a Google Fonts restano come riserva quando c'è rete; i font locali servono in aula senza rete.
- Le pagine restano a schermo intero come oggi, senza barra del sito dentro la lezione; in basso a destra, visibile solo al passaggio del mouse come gli altri comandi, un piccolo link «← Geostoria» all'indice.

## Indice, menu, home

- `geostoria/index.html`: stile del sito (`css/style.css`, `liquid-glass`), barra di navigazione, titolo «Geostoria · primo biennio», sezione «Modulo 0 · Gli strumenti dello storico» con tre card in ordine (DOVE, QUANDO, COME SAPPIAMO), ognuna con una frase e i comandi (frecce, spazio; T e B dove esistono); una card più piccola per la linea del tempo; una riga finale «Per la lezione» con il link alla mappa delle provenienze. Nessuna data, nessun nome di classe.
- Menu di tutte le pagine del sito: voce «Geostoria» dopo «Grammatica», con il prefisso di percorso giusto per la profondità della pagina (script su tutti gli `.html` del repo che contengono la navbar).
- Home: card «Geostoria» nella sezione degli strumenti, sottotitolo dell'hero «Latino e geostoria», `<title>` e descrizione aggiornati; «Su di me» cita la geostoria in una riga.
- `sitemap.xml`: sei URL in più.

## Verifica

Chrome headless su ogni pagina aperta dal percorso del sito: screenshot per controllare font, immagini, carta e mappa; `grep` per i nomi di classe; controllo che da `materiali/` le pagine si aprano ancora tramite i collegamenti simbolici. Dopo il push, apertura dell'URL pubblico delle sei pagine.

## Pubblicazione

Un commit sul ramo `main` del repo `latino-sites` (stile: «aggiunge la sezione geostoria con le cinque pagine del Modulo 0»), poi `git push origin main`. GitHub Pages aggiorna il sito da solo in pochi minuti. Il file `latino-sites-AUDIT.md` non tracciato resta fuori dal commit; `.claude/` è ora in `.gitignore`.

## Fuori scopo

Le pagine future (G03, cap. 6) si aggiungono con lo stesso schema: file in `geostoria/`, collegamento in `materiali/`, card nell'indice. Nessun cambiamento al resto del sito.
