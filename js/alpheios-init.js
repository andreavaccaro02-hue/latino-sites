/**
 * Alpheios — inizializzazione automatica per Lingua e Cultura Latina
 *
 * Marca automaticamente i contenitori di testo latino con le classi
 * necessarie ad Alpheios, poi attiva la libreria.
 *
 * Uso: lo studente fa doppio clic su una parola latina → popup con
 * analisi morfologica, lemma, traduzione, tabella flessiva.
 */
document.addEventListener("DOMContentLoaded", function () {

  /* ── 1. Selettori dei contenitori di testo latino ── */
  var LATIN_SELECTORS = [
    ".brano-testo",          /* brani antologici */
    ".brano-box",            /* box brano (contiene .brano-testo) */
    ".lat-cite",             /* citazioni inline */
    ".latino-text",          /* testi con gloss (Tacito) */
    ".verso-lat",            /* versi latini (Bucoliche) */
    '[lang="la"]',           /* elementi già marcati */
    '[lang="lat"]'
  ];

  var containers = document.querySelectorAll(LATIN_SELECTORS.join(","));

  containers.forEach(function (el) {
    el.classList.add("alpheios-enabled");
    if (!el.lang) el.lang = "lat";
  });

  /* Se non troviamo contenitori specifici ma la pagina è un albero
     sintattico, marca i nodi SVG text come non cliccabili (Alpheios
     non funziona su SVG) — nessuna azione necessaria. */

  /* ── 2. Attiva Alpheios ── */
  if (containers.length === 0) return; /* niente latino, non caricare */

  import("https://cdn.jsdelivr.net/npm/alpheios-embedded@latest/dist/alpheios-embedded.min.js")
    .then(function () {
      window.AlpheiosEmbed.importDependencies({ mode: "cdn" })
        .then(function (Embedded) {
          new Embedded({
            clientId: "lingua-cultura-latina-vaccaro",
            desktopTriggerEvent: "dblclick",
            mobileTriggerEvent: "longtap",
          }).activate();
        })
        .catch(function (e) { console.warn("Alpheios init:", e); });
    })
    .catch(function (e) { console.warn("Alpheios load:", e); });
});
