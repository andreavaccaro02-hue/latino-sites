import { HtmlBasePlugin } from "@11ty/eleventy";
import { controllaCartella, formattaErrori } from "./lib/controlli.js";
import { creaMarkdown } from "./lib/markdown.js";
import * as nav from "./lib/navigazione.js";
import { inSchermate, estraiObiettivo } from "./lib/schermate.js";

export const PASSTHROUGH = [
  "autori",
  "calendario",
  "css",
  "flashcard",
  "grammatica",
  "js",
  "pdf",
  "percorsi",
  "strumenti",
  "geostoria/carta-mediterraneo-lim.html",
  "geostoria/contare-il-tempo.html",
  "geostoria/da-dove-veniamo.html",
  "geostoria/le-fonti-lim.html",
  "geostoria/linea-del-tempo.html",
  "geostoria/fonts",
  "geostoria/img",
  "geostoria/reperti",
  "chi-sono.html",
  "favicon.svg",
  "og-image.svg",
  "robots.txt",
  "sitemap.xml",
  "google381d0d291942dea2.html",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  for (const p of PASSTHROUGH) eleventyConfig.addPassthroughCopy(p);

  const md = creaMarkdown();
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/newsreader/files/newsreader-latin*-wght-*.woff2": "assets/fonts",
    "node_modules/@fontsource-variable/inter/files/inter-latin*-wght-normal.woff2": "assets/fonts",
  });

  eleventyConfig.addFilter("md", (testo) => md.render(testo ?? ""));
  eleventyConfig.addFilter("vicine", nav.vicine);
  eleventyConfig.addFilter("lezionePer", nav.lezionePer);
  eleventyConfig.addFilter("inProgrammi", nav.inProgrammi);
  eleventyConfig.addFilter("voceModulo", nav.voceModulo);
  eleventyConfig.addFilter("rimandiPer", nav.rimandiPer);
  eleventyConfig.addFilter("materia", nav.materia);
  eleventyConfig.addFilter("nomeMateria", (id, materie) => nav.materia(materie, id).nome);
  eleventyConfig.addFilter("nomeAnno", nav.nomeAnno);
  eleventyConfig.addFilter("annoScolastico", nav.annoScolastico);

  eleventyConfig.addFilter("schermate", inSchermate);
  eleventyConfig.addFilter("obiettivo", estraiObiettivo);
  eleventyConfig.addPassthroughCopy({
    "node_modules/reveal.js/dist/reveal.js": "assets/reveal/reveal.js",
    "node_modules/reveal.js/dist/reveal.css": "assets/reveal/reveal.css",
    "node_modules/reveal.js/plugin/notes/notes.js": "assets/reveal/notes.js",
  });

  eleventyConfig.on("eleventy.before", () => {
    const errori = controllaCartella("src/lezioni", "src/_data/programmi");
    if (errori.length) throw new Error(`Controlli delle lezioni falliti:\n${formattaErrori(errori)}`);
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: "/latino-sites/",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
