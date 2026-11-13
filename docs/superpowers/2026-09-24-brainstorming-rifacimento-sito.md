# Rifacimento del sito: punto del brainstorming (24/9/2026)

> Nota di passaggio fra conversazioni. Riprendere con la skill `superpowers:brainstorming`, path architetturale, una domanda alla volta. Nessun codice scritto: solo audit, ricerca e domande.

## Cosa è stato deciso

- **Strada C, rifacimento** del sito (scartate A «ritocchi» e B «restyling del CSS»).
- Il sito nuovo deve avere **aspetto da rivista** (tipografia curata, reperto o foto in apertura, testo largo e leggibile) e **struttura da manuale**.
- Le pagine **interattive** piacciono molto e restano; serve **sempre** la possibilità di avere **slide** per la classe («è difficile che in classe legga una nota markdown per intero»).
- Riferimenti didattici che vuole vedere nella struttura: **TLAC** (Teach Like a Champion) e **mastery learning**. Le lezioni di latino già sul sito «non gli sono dispiaciute».

## «Struttura da manuale», spiegata nell'ultimo messaggio

1. Gerarchia fissa: anno → capitolo/modulo → lezione, con «precedente / successiva» e posizione visibile («Latino 1 · Cap. 3 · Lezione 2»). Oggi `percorsi/latinoN.html` è una tabella argomento/stato/risorse e le lezioni stanno sparse in `grammatica/`, `strumenti/`, quiz.
2. Scheletro fisso per ogni lezione. `grammatica/infinitiva.html` è già il modello implicito: quiz d'apertura, Passo 1, esercizio rapido, esempio guidato, Passo 2, esercizio «riconosci».
3. Slide e pagina dalla stessa fonte: una lezione è un file solo, vista scorrevole a casa e a slide alla LIM; le pagine interattive di geostoria sono un blocco della lezione, non un'eccezione.

## Domanda aperta (non ancora risposta)

Scheletro della lezione:
- **A** sette blocchi pieni (obiettivo, Do Now, spiegazione a passi, pratica guidata, pratica autonoma, biglietto d'uscita, padronanza);
- **B** quattro obbligatori (obiettivo, Do Now, spiegazione a passi con pratica dentro, biglietto d'uscita) più facoltativi. **Consigliata.**
- **C** nessuno scheletro, solo guida di stile.

## Domande ancora da fare

- Dove scrive le pagine nuove: Markdown nel repo, Obsidian, HTML su misura, misto (domanda posta, risposta deviata sulle slide).
- Come scrive le slide: Markdown → reveal.js, HTML su misura, entrambe (consigliata: entrambe).
- Generatore statico sì/no (Eleventy o Jekyll) contro HTML a mano con include via web component.
- Cosa migrare subito e cosa lasciare com'è (quiz, glossario Eulalia, tabelle, diario, calendari, raccoglitore).

## Materiale già prodotto

- Audit: `docs/audit-2026-09-24.md` (non committato). Punti: font TTF pesanti (passare a WOFF2 + `font-display`), foto da comprimere, dicitura «Liceo Classico e Liceo Scientifico» in 16 pagine (ora è al D'Alessandro), contrasti, tabelle dei percorsi che sbordano su mobile (412 px), una pagina orfana. L'«overflow su 6/6 pagine» del primo passaggio era un artefatto di Chrome headless senza emulazione: verificato con Playwright Pixel 5.
- Progetti GitHub trovati: Eleventy, Jekyll (generatori); include HTML via web component; lychee (link rotti); Prettier; Open Props (token CSS); al-folio e academicpages (siti accademici); reveal.js, Marp (slide); TimelineJS.
- Sezione Geostoria pubblicata il 24/9 (commit b297acb e 5bfeb95): `geostoria/*.html`, copia unica con symlink da `classi/geostoria/materiali/`, senza nomi di classe. Spec e piano in `docs/superpowers/specs/` e `plans/`.

## Vincoli da rispettare

- Testi pubblici con i criteri Giunta e /lan (`~/Documents/tesi-magistrale/.claude/agents/risorse/giunta-regole.md`, `.claude/commands/lan.md`, `python3 output/verifica-lan.py --conta`).
- Niente nomi di classe né date di lezione nelle pagine pubbliche.
- Modifiche ai contenuti una alla volta, con approvazione.
- Git spiegato passo passo, lazygit; commit in italiano, minuscolo, indicativo presente.
- Il guard worktree delle sessioni in background è disattivato in `.claude/settings.json` (ignorato da git); Write/Edit possono restare bloccati, si scrive via Bash.
