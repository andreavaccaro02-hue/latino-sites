import { execFileSync } from "node:child_process";
import { controllaCartella, formattaErrori } from "../lib/controlli.js";

const errori = controllaCartella("src/lezioni", "src/_data/programmi");
if (errori.length) {
  console.error(formattaErrori(errori));
  process.exit(1);
}
console.log("Controlli delle lezioni: nessun errore.");

// La revisione di stile (criteri Giunta e /lan) non è automatica: si fa sui file
// elencati qui, con ~/Documents/tesi-magistrale/.claude/commands/lan.md e
// ~/Documents/tesi-magistrale/.claude/agents/risorse/giunta-regole.md.
const modificati = execFileSync("git", ["status", "--porcelain", "--", "src/lezioni"], { encoding: "utf8" })
  .split("\n").map((r) => r.slice(3).trim()).filter((f) => f.endsWith(".md"));
if (modificati.length) {
  console.log("\nDa rivedere con i criteri Giunta e /lan prima del commit:");
  for (const f of modificati) console.log(`  ${f}`);
}
