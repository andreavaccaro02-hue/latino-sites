import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from argo_in_json import costruisci_programma  # noqa: E402

MODULI = [
    {"materia": "geostoria", "titolo_argo": "Prima di cominciare · Gli strumenti dello storico", "slug": "strumenti-dello-storico"},
    {"materia": "geostoria", "titolo_argo": "Cap. 2 · L'alba della Grecia. L'Egeo fra II e I millennio a.C.", "slug": "cap-02-alba-della-grecia"},
    {"materia": "geostoria", "titolo_argo": "Cittadinanza e Costituzione", "slug": "cittadinanza-1", "anni": [1]},
    {"materia": "geostoria", "titolo_argo": "Cittadinanza e Costituzione", "slug": "cittadinanza-2", "anni": [2]},
]

RIGHE = [
    [1.0, "Prima di cominciare · Gli strumenti dello storico", "", "", "", ""],
    ["", "", 1.0, "Tempo e spazio come coordinate", "Non svolto", ""],
    ["", "", 2.0, "Che cos'è una fonte: materiale e scritta, primaria e secondaria", "Svolto", "23/09/2026"],
    [2.0, "Cap. 2 · L’alba della Grecia.  L'Egeo fra II e I millennio a.C. ", "", "", "", ""],
    ["", "", 1.0, "Lezione 1 · I dominatori del mare. Creta e le origini della cultura greca", "Non svolto", ""],
    [3.0, "Cittadinanza e Costituzione", "", "", "", ""],
    ["", "", 1.0, "Legge scritta e potere", "Non svolto", ""],
]


class TestArgo(unittest.TestCase):
    def test_moduli_e_argomenti(self):
        p = costruisci_programma(RIGHE, "geostoria", 1, MODULI)
        self.assertEqual(p["materia"], "geostoria")
        self.assertEqual(p["anno"], 1)
        self.assertEqual([m["numero"] for m in p["moduli"]], [1, 2, 3])
        self.assertEqual(p["moduli"][0]["slug"], "strumenti-dello-storico")
        self.assertEqual(p["moduli"][0]["argomenti"][1],
                         {"numero": 2, "titolo": "Che cos'è una fonte: materiale e scritta, primaria e secondaria"})

    def test_stato_e_date_non_entrano(self):
        testo = json.dumps(costruisci_programma(RIGHE, "geostoria", 1, MODULI), ensure_ascii=False)
        self.assertNotIn("23/09/2026", testo)
        self.assertNotIn("Svolto", testo)

    def test_toglie_il_prefisso_lezione(self):
        p = costruisci_programma(RIGHE, "geostoria", 1, MODULI)
        self.assertEqual(p["moduli"][1]["argomenti"][0]["titolo"], "I dominatori del mare. Creta e le origini della cultura greca")

    def test_apostrofo_tipografico_e_spazi_doppi(self):
        p = costruisci_programma(RIGHE, "geostoria", 1, MODULI)
        self.assertEqual(p["moduli"][1]["slug"], "cap-02-alba-della-grecia")

    def test_cittadinanza_diversa_per_anno(self):
        self.assertEqual(costruisci_programma(RIGHE, "geostoria", 1, MODULI)["moduli"][2]["slug"], "cittadinanza-1")
        self.assertEqual(costruisci_programma(RIGHE, "geostoria", 2, MODULI)["moduli"][2]["slug"], "cittadinanza-2")

    def test_modulo_senza_slug_ferma_lo_script(self):
        righe = RIGHE + [[4.0, "Cap. 99 · Inesistente", "", "", "", ""]]
        with self.assertRaisesRegex(ValueError, "Cap. 99 · Inesistente"):
            costruisci_programma(righe, "geostoria", 1, MODULI)


if __name__ == "__main__":
    unittest.main()
