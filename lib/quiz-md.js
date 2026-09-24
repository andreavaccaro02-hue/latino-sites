import { slug } from "./slug.js";

const DOMANDA = /^\?\?\?\s+/;
const TORNA = /\s*(?:→|->)\s*torna a:\s*[""]([^"""]+)[""]\s*$/;
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
