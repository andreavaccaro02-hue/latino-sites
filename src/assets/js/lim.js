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
