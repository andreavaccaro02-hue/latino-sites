import fs from "node:fs";
import path from "node:path";

export default function () {
  const materie = JSON.parse(fs.readFileSync("src/_data/materie.json", "utf8"));
  const dir = "src/_data/programmi";
  const programmi = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    : [];
  return materie
    .map((m) => ({ ...m, anni: programmi.filter((p) => p.materia === m.id).map((p) => p.anno).sort() }))
    .filter((m) => m.anni.length);
}
