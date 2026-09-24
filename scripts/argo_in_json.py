#!/usr/bin/env python3
"""Converte un programma Argo (.xls) in src/_data/programmi/<materia>-<anno>.json.

Uso: python3 scripts/argo_in_json.py <file.xls> <materia> <anno>
Legge solo le colonne ORD. MODULO, MODULO, ORD. ARGOMENTO, ARGOMENTO:
stato e data di svolgimento non entrano mai nel sito.
"""
import json
import re
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
PREFISSO_LEZIONE = re.compile(r"^Lezione\s+\d+\s*·\s*")


def normalizza(testo):
    return " ".join(str(testo).replace("’", "'").split())


def numero(valore):
    return int(float(valore))


def slug_modulo(titolo, materia, anno, moduli):
    for m in moduli:
        if m["materia"] != materia or normalizza(m["titolo_argo"]) != titolo:
            continue
        if "anni" in m and anno not in m["anni"]:
            continue
        return m["slug"]
    raise ValueError(f"Modulo senza slug in src/_data/moduli.json: «{titolo}» ({materia}, anno {anno})")


def costruisci_programma(righe, materia, anno, moduli):
    programma = {"materia": materia, "anno": anno, "moduli": []}
    corrente = None
    for riga in righe:
        celle = [normalizza(c) for c in list(riga)[:4]]
        celle += [""] * (4 - len(celle))
        ord_modulo, modulo, ord_argomento, argomento = celle
        if ord_modulo and modulo:
            corrente = {
                "numero": numero(ord_modulo),
                "titolo": modulo,
                "slug": slug_modulo(modulo, materia, anno, moduli),
                "argomenti": [],
            }
            programma["moduli"].append(corrente)
        elif ord_argomento and argomento:
            if corrente is None:
                raise ValueError(f"Argomento prima di qualsiasi modulo: «{argomento}»")
            corrente["argomenti"].append({
                "numero": numero(ord_argomento),
                "titolo": PREFISSO_LEZIONE.sub("", argomento),
            })
    return programma


def leggi_xls(percorso):
    import xlrd
    foglio = xlrd.open_workbook(percorso).sheet_by_index(0)
    return [foglio.row_values(i) for i in range(1, foglio.nrows)]


def main(argv):
    if len(argv) != 4:
        print(__doc__)
        return 2
    xls, materia, anno = argv[1], argv[2], int(argv[3])
    moduli = json.loads((RADICE / "src/_data/moduli.json").read_text(encoding="utf-8"))
    programma = costruisci_programma(leggi_xls(xls), materia, anno, moduli)
    uscita = RADICE / "src/_data/programmi" / f"{materia}-{anno}.json"
    uscita.parent.mkdir(parents=True, exist_ok=True)
    uscita.write_text(json.dumps(programma, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    argomenti = sum(len(m["argomenti"]) for m in programma["moduli"])
    print(f"{uscita.relative_to(RADICE)}: {len(programma['moduli'])} moduli, {argomenti} argomenti")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
