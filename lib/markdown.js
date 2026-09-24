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
