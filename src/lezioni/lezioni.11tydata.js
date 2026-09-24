export default {
  layout: "lezione.njk",
  tags: ["lezioni"],
  eleventyComputed: {
    permalink: (data) => `/${data.materia}/${data.modulo}/${data.page.fileSlug.replace(/^\d+-/, "")}/`,
  },
};
