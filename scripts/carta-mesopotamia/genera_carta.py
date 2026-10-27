"""Genera geostoria/mesopotamia-ieri-oggi.html da Natural Earth (50m)."""
import json, math, sys

NE, OUT = sys.argv[1], sys.argv[2]
LON0, LON1, LAT0, LAT1 = 31.8, 49.2, 28.5, 38.5
K = 100.0
CX = math.cos(math.radians(33.5))
W, H = round((LON1 - LON0) * CX * K), round((LAT1 - LAT0) * K)

def xy(lon, lat):
    return (lon - LON0) * CX * K, (LAT1 - lat) * K

def anelli(g):
    t, c = g["type"], g["coordinates"]
    if t == "Polygon": return c
    if t == "MultiPolygon": return [r for p in c for r in p]
    if t == "LineString": return [c]
    if t == "MultiLineString": return c
    return []

def vicino(r, m=1.5):
    return any(LON0 - m < p[0] < LON1 + m and LAT0 - m < p[1] < LAT1 + m for p in r)

def d(r, chiudi):
    out, prec = [], None
    for lon, lat in r:
        x, y = xy(lon, lat)
        q = f"{x:.1f},{y:.1f}"
        if q != prec: out.append(q); prec = q
    if len(out) < 2: return ""
    return "M" + " L".join(out) + ("Z" if chiudi else "")

def carica(nome):
    return json.load(open(f"{NE}/{nome}.geojson"))["features"]

terre, confini = [], []
for f in carica("ne_50m_admin_0_countries"):
    rr = [r for r in anelli(f["geometry"]) if vicino(r)]
    if not rr: continue
    p = "".join(d(r, True) for r in rr)
    terre.append(p)
confini = terre

# Tharthar, Habbaniyah, Razzaza, Assad: bacini artificiali del Novecento, solo nella carta di oggi
laghi, bacini = [], []
for f in carica("ne_50m_lakes"):
    rr = [r for r in anelli(f["geometry"]) if r and vicino(r, 0)]
    if not rr: continue
    lon = sum(p[0] for p in rr[0]) / len(rr[0]); lat = sum(p[1] for p in rr[0]) / len(rr[0])
    (bacini if 38 < lon < 44.5 and 32 < lat < 36.5 else laghi).append("".join(d(r, True) for r in rr))

FIUMI = {"Tigris", "Dicle", "Euphrates", "Firat", "Al Furat"}
fiumi, shatt = [], []
for f in carica("ne_50m_rivers_lake_centerlines"):
    n = f["properties"].get("name")
    rr = [r for r in anelli(f["geometry"]) if r and vicino(r, 0)]
    if n in FIUMI: fiumi += [d(r, False) for r in rr]
    elif n == "Shatt al Arab": shatt += [d(r, False) for r in rr]

# costa intorno al 3000 a.C.: ricostruzione approssimativa, il mare arriva fino a Ur ed Eridu
COSTA = [(47.75, 29.45), (47.3, 29.9), (46.7, 30.4), (46.15, 30.72), (46.22, 30.95), (46.6, 31.18),
         (47.1, 31.38), (47.6, 31.45), (48.1, 31.35), (48.6, 31.0), (49.0, 30.6), (49.3, 30.2)]
golfo = d(COSTA + [(49.6, 29.6), (48.6, 29.0), (47.9, 29.2)], True)
costa = d(COSTA, False)

def punto(classe, nome, lon, lat, lato="d", dy=8):
    x, y = xy(lon, lat)
    a, dx = ("start", 16) if lato == "d" else ("end", -16)
    return (f'<g class="{classe}"><circle class="punto" cx="{x:.0f}" cy="{y:.0f}" r="9"/>'
            f'<text class="nome" x="{x + dx:.0f}" y="{y + dy:.0f}" text-anchor="{a}">{nome}</text></g>')

def scritta(classe, testo, lon, lat, ruota=0, anchor="middle"):
    x, y = xy(lon, lat)
    r = f' transform="rotate({ruota} {x:.0f} {y:.0f})"' if ruota else ""
    return f'<text class="{classe}" x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}"{r}>{testo}</text>'

# coordinate: Pleiades per i siti antichi (reprPoint), Wikidata P625 per le città di oggi, verificate il 27/10/2026
ANTICHE = [("Babilonia", 44.425, 32.537, "s"), ("Kish", 44.593, 32.546, "d"), ("Nippur", 45.231, 32.127, "d"),
           ("Umma", 45.887, 31.668, "d"), ("Uruk", 45.639, 31.323, "s"), ("Lagash", 46.410, 31.419, "d"),
           ("Ur", 46.105, 30.961, "d"), ("Eridu", 45.996, 30.820, "s")]
MODERNE = [("Baghdad", 44.366, 33.315, "d"), ("Bassora", 47.810, 30.515, "s"), ("Mosul", 43.129, 36.342, "d"),
           ("Kuwait", 47.980, 29.375, "d"), ("Damasco", 36.292, 33.513, "d")]
STATI = [("IRAQ", 41.3, 32.9), ("SIRIA", 38.6, 35.3), ("TURCHIA", 41.0, 38.15), ("IRAN", 48.1, 32.9),
         ("ARABIA SAUDITA", 42.6, 29.2), ("GIORDANIA", 37.3, 30.9)]

# vista larga, dalla Sicilia al Golfo Persico: stessa proiezione, viewBox più ampio
LX0, LX1, LCLAT = 11.0, 54.0, 36.0
LW = (LX1 - LX0) * CX * K
LH = LW * H / W
LVX, LVY = (LX0 - LON0) * CX * K, (LAT1 - (LCLAT + LH / K / 2)) * K
def nel_largo(r):
    return any(LX0 - 3 < p[0] < LX1 + 3 and 18 < p[1] < 54 for p in r)
terre_l = []
for f in carica("ne_110m_admin_0_countries"):
    rr = [r for r in anelli(f["geometry"]) if nel_largo(r)]
    if rr: terre_l.append("".join(d(r, True) for r in rr))

def grande(classe, testo, lon, lat, ruota=0, anchor="middle"):
    x, y = xy(lon, lat)
    r = f' transform="rotate({ruota} {x:.0f} {y:.0f})"' if ruota else ""
    return f'<text class="{classe}" x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}"{r}>{testo}</text>'
bx, by = xy(13.500, 38.083)
LARGO = [
    '<g class="largo">',
    '<path class="confine-largo" d="' + "".join(terre_l) + '"/>',
    f'<rect class="riquadro-meso" x="0" y="0" width="{W}" height="{H}"/>',
    grande("l-meso", "MESOPOTAMIA", 42.3, 33.6),
    grande("l-mare", "Mar Mediterraneo", 19.5, 34.4),
    grande("l-mare", "Mar Nero", 34.5, 43.3),
    grande("l-mare", "Mar Caspio", 50.9, 41.6, 72),
    grande("l-mare", "Mar Rosso", 37.2, 24.6, 58),
    grande("l-mare", "Golfo", 51.6, 27.6), grande("l-mare", "Persico", 51.6, 26.7),
    grande("l-stato", "ITALIA", 13.6, 43.4),
    grande("l-stato", "GRECIA", 22.0, 40.4),
    grande("l-stato", "TURCHIA", 33.0, 39.9), grande("l-nota", "l'antica Anatolia", 33.0, 39.15),
    grande("l-stato", "EGITTO", 29.5, 26.5),
    grande("l-stato", "ARABIA SAUDITA", 44.5, 23.9),
    grande("l-stato", "IRAN", 52.6, 33.4),
    f'<circle class="l-noi-punto" cx="{bx:.0f}" cy="{by:.0f}" r="26"/>',
    grande("l-noi", "Bagheria", 14.5, 38.0, anchor="start"), grande("l-nota", "noi siamo qui", 14.5, 37.25, anchor="start"),
    '</g>']

# Israele e Palestina: la striscia è sottile, le scritte stanno fuori con linee guida
def guida(lon0, lat0, lon1, lat1):
    (x0, y0), (x1, y1) = xy(lon0, lat0), xy(lon1, lat1)
    return f'<path class="guida" d="M{x0:.0f},{y0:.0f} L{x1:.0f},{y1:.0f}"/>'
ISRAELE_PALESTINA = [
    guida(34.2, 32.68, 34.98, 32.75), scritta("stato piccolo", "ISRAELE", 31.95, 32.6, anchor="start"),
    guida(34.5, 31.82, 34.42, 31.47), guida(34.5, 31.82, 35.25, 31.98),
    scritta("stato piccolo", "PALESTINA", 31.95, 31.75, anchor="start"),
]

svg = [f'<svg viewBox="{LVX:.0f} {LVY:.0f} {LW:.0f} {LH:.0f}" preserveAspectRatio="xMidYMid meet" role="img" '
       f'aria-label="Carta della Mesopotamia: dove si trova, com\'era intorno al 3000 a.C. e com\'è oggi" '
       f'data-largo="{LVX:.0f} {LVY:.0f} {LW:.0f} {LH:.0f}" data-vicino="0 0 {W} {H}">',
       f'<defs><clipPath id="riquadro"><rect id="taglio" x="{LVX:.0f}" y="{LVY:.0f}" width="{LW:.0f}" height="{LH:.0f}"/></clipPath></defs>',
       '<g clip-path="url(#riquadro)">',
       f'<rect class="mare" x="{LVX - 500:.0f}" y="{LVY - 500:.0f}" width="{LW + 1000:.0f}" height="{LH + 1000:.0f}"/>',
       '<path class="terra" d="' + "".join(terre_l) + '"/>',
       '<path class="terra" d="' + "".join(terre) + '"/>',
       '<path class="lago" d="' + "".join(laghi) + '"/>',
       '<path class="fiume" d="' + "".join(fiumi) + '"/>',
       '<g class="oggi"><path class="lago" d="' + "".join(bacini) + '"/><path class="fiume" d="' + "".join(shatt) + '"/></g>',
       f'<g class="ieri"><path class="golfo" d="{golfo}"/><path class="costa-antica" d="{costa}"/></g>',
       '<g class="oggi"><path class="confine" d="' + "".join(confini) + '"/></g>',
       *LARGO,
       '<g class="vicino">',
       scritta("acqua", "Golfo Persico", 48.0, 28.8),
       scritta("acqua", "Mar", 33.2, 33.85), scritta("acqua", "Mediterraneo", 33.2, 33.5),
       scritta("rilievo", "Monti Zagros", 46.6, 34.4, -48),
       scritta("rilievo", "Deserto arabico", 40.0, 31.4),
       scritta("nome-fiume", "Tigri", 43.75, 35.75, -62),
       scritta("nome-fiume", "Eufrate", 40.6, 35.05, 22),
       '</g>',
       '<g class="ieri">',
       scritta("regione", "ACCAD", 43.3, 32.9),
       scritta("regione", "SUMER", 43.8, 30.8),
       scritta("rilievo", "Anatolia", 37.4, 38.15),
       scritta("acqua", "il mare di allora", 47.6, 30.05),
       *[punto("antica", n, lo, la, l) for n, lo, la, l in ANTICHE],
       '</g>',
       '<g class="oggi">',
       *[scritta("stato", n, lo, la) for n, lo, la in STATI],
       scritta("acqua piccola", "Shatt al-Arab", 48.75, 30.45, 52),
       *[punto("moderna", n, lo, la, l) for n, lo, la, l in MODERNE],
       *ISRAELE_PALESTINA,
       '</g>',
       f'<rect class="cornice vicino" x="2" y="2" width="{W - 4}" height="{H - 4}"/>',
       '</g>',
       '</svg>']

pagina = open(sys.argv[3]).read().replace("<!--SVG-->", "\n".join(svg))
open(OUT, "w").write(pagina)
print(W, H, len(pagina) // 1024, "KB")
