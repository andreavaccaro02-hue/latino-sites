import fs from "node:fs";
import matter from "gray-matter";
import { descrizioneLezione } from "../../lib/descrizioni.js";

export default {
  layout: "lezione.njk",
  tags: ["lezioni"],
  eleventyComputed: {
    permalink: (data) => `/${data.materia}/${data.modulo}/${data.page.fileSlug.replace(/^\d+-/, "")}/`,
    descrizione: (data) =>
      data.descrizione || descrizioneLezione(data.sottotitolo, matter(fs.readFileSync(data.page.inputPath, "utf8")).content),
  },
};
