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
