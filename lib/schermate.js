import { parse } from "node-html-parser";

const ESCLUSI = new Set(["obiettivo", "approfondimento"]);

export function estraiObiettivo(html) {
  const blocco = parse(html).querySelector('[data-blocco="obiettivo"]');
  if (!blocco) return "";
  blocco.querySelector(".blocco-etichetta")?.remove();
  return blocco.innerHTML.trim();
}

export function inSchermate(html) {
  const radice = parse(html);
  const schermate = [];
  let sciolti = [];

  const chiudiSciolti = () => {
    if (!sciolti.length) return;
    schermate.push(`<section data-blocco="testo">\n${sciolti.join("\n")}\n</section>`);
    sciolti = [];
  };

  for (const nodo of radice.childNodes) {
    if (nodo.nodeType !== 1) {
      if (nodo.text.trim()) sciolti.push(nodo.toString());
      continue;
    }
    const blocco = nodo.getAttribute("data-blocco");
    if (!blocco) {
      sciolti.push(nodo.toString());
      continue;
    }
    chiudiSciolti();
    if (ESCLUSI.has(blocco)) continue;

    if (blocco === "note") {
      if (!schermate.length) continue;
      const nota = `<aside class="notes">\n${nodo.innerHTML.trim()}\n</aside>\n`;
      schermate[schermate.length - 1] = schermate[schermate.length - 1].replace(/<\/section>$/, `${nota}</section>`);
      continue;
    }

    for (const li of nodo.querySelectorAll("ul.rivela > li")) li.classList.add("fragment");
    const etichetta = nodo.querySelector(".blocco-etichetta")?.toString() ?? "";
    const gruppi = [[]];
    for (const figlio of nodo.childNodes) {
      if (figlio.nodeType === 1 && figlio.classList.contains("blocco-etichetta")) continue;
      if (figlio.nodeType === 1 && figlio.tagName === "HR") {
        gruppi.push([]);
        continue;
      }
      gruppi[gruppi.length - 1].push(figlio.toString());
    }

    const extra = ["data-chiave", "data-src"]
      .filter((a) => nodo.getAttribute(a))
      .map((a) => ` ${a}="${nodo.getAttribute(a)}"`)
      .join("");
    gruppi.forEach((gruppo, i) => {
      const id = i === 0 && nodo.id ? ` id="${nodo.id}"` : "";
      schermate.push(`<section data-blocco="${blocco}"${id}${extra}>\n${etichetta}\n${gruppo.join("").trim()}\n</section>`);
    });
  }
  chiudiSciolti();
  return schermate.join("\n");
}
