import { HtmlBasePlugin } from "@11ty/eleventy";
import { controllaCartella, formattaErrori } from "./lib/controlli.js";

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
  // Pagine che il Task 8 sostituisce con modelli: finché non esistono, si copiano.
  "index.html",
  "geostoria/index.html",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  for (const p of PASSTHROUGH) eleventyConfig.addPassthroughCopy(p);

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
