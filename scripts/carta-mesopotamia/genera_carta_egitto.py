"""Genera geostoria/egitto-regione-chiusa.html da Natural Earth (50m e 110m), sul modello della carta della Mesopotamia."""
import json, math, sys

NE, OUT = sys.argv[1], sys.argv[2]
LON0, LON1, LAT0, LAT1 = 24.3, 36.3, 21.0, 31.9
K = 100.0
CX = math.cos(math.radians(25.0))
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

# colori degli Stati come nella carta della Mesopotamia; qui il colore proprio va all'Egitto
CIPRO = {"Cyprus", "N. Cyprus"}
def colore(f):
    n = f["properties"]["NAME"]
    if n == "Egypt": return 0
    if n == "Palestine": return 7
    if n in CIPRO: return 5
    return f["properties"]["MAPCOLOR7"]
def politica(paesi, classe):
    return f'<g class="{classe}">' + "".join(f'<path class="stato-{c}" d="{p}"/>' for p, c in paesi) + "</g>"

terre, confini, paesi = [], [], []
for f in carica("ne_50m_admin_0_countries"):
    rr = [r for r in anelli(f["geometry"]) if vicino(r)]
    if not rr: continue
    p = "".join(d(r, True) for r in rr)
    terre.append(p); paesi.append((p, colore(f)))
    if f["properties"]["NAME"] not in CIPRO: confini.append(p)

# il lago Nasser nasce con la diga di Assuan: solo nella carta di oggi
laghi, bacini = [], []
for f in carica("ne_50m_lakes"):
    rr = [r for r in anelli(f["geometry"]) if r and vicino(r, 0)]
    if not rr: continue
    (bacini if f["properties"].get("name") == "Lake Nasser" else laghi).append("".join(d(r, True) for r in rr))

FIUMI = {"Nile", "Rosetta Branch", "Damietta Branch"}
CANALI = {"Suez Canal", "Ismailiya Canal"}
fiumi, canali = [], []
for f in carica("ne_50m_rivers_lake_centerlines"):
    n = f["properties"].get("name")
    rr = [r for r in anelli(f["geometry"]) if r and vicino(r, 0)]
    if n in FIUMI: fiumi += [d(r, False) for r in rr]
    elif n in CANALI: canali += [d(r, False) for r in rr]

# la Terra nera: una fascia lungo il fiume e il ventaglio del delta (contorno approssimativo)
DELTA = [(31.24, 30.05), (30.55, 30.55), (30.15, 31.05), (30.05, 31.32), (30.6, 31.45), (31.0, 31.58),
         (31.6, 31.52), (32.25, 31.28), (31.95, 30.85), (31.6, 30.4)]
delta = d(DELTA, True)

def punto(classe, nome, lon, lat, lato="d", dy=8):
    x, y = xy(lon, lat)
    a, dx = ("start", 16) if lato == "d" else ("end", -16)
    return (f'<g class="{classe}"><circle class="punto" cx="{x:.0f}" cy="{y:.0f}" r="9"/>'
            f'<text class="nome" x="{x + dx:.0f}" y="{y + dy:.0f}" text-anchor="{a}">{nome}</text></g>')

def scritta(classe, testo, lon, lat, ruota=0, anchor="middle"):
    x, y = xy(lon, lat)
    r = f' transform="rotate({ruota} {x:.0f} {y:.0f})"' if ruota else ""
    return f'<text class="{classe}" x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}"{r}>{testo}</text>'

# la cataratta: un segno di traverso sul fiume, con il numero
def cataratta(n, lon, lat, lato="d", dy=10):
    x, y = xy(lon, lat)
    a, dx = ("start", 20) if lato == "d" else ("end", -20)
    return (f'<g class="cataratta"><path d="M{x - 16:.0f},{y - 6:.0f} L{x + 16:.0f},{y + 6:.0f} M{x - 16:.0f},{y + 4:.0f} L{x + 16:.0f},{y + 16:.0f}"/>'
            f'<text class="nome-cat" x="{x + dx:.0f}" y="{y + dy:.0f}" text-anchor="{a}">{n}ª cataratta</text></g>')

# coordinate: Pleiades per i siti antichi (reprPoint), Wikidata P625 per le città di oggi, verificate il 29/10/2026
ANTICHE = [("Giza", 31.127, 29.970, "s"), ("Menfi", 31.255, 29.849, "d", 30), ("Avaris", 31.823, 30.786, "d"),
           ("Akhetaton", 30.898, 27.644, "s"), ("Tebe", 32.632, 25.665, "s"), ("Abu Simbel", 31.626, 22.337, "s")]
CATARATTE = [(1, 32.878, 24.078, "d", 42), (2, 30.963, 21.472, "s", 10)]
MODERNE = [("Il Cairo", 31.236, 30.044, "d", -12), ("Alessandria", 29.892, 31.198, "s"), ("Luxor", 32.644, 25.697, "d"),
           ("Assuan", 32.900, 24.089, "d", -12)]
STATI = [("EGITTO", 28.4, 28.6), ("SUDAN", 26.4, 21.45)]

# vista larga, dalla Sicilia all'Egitto: stessa proiezione, viewBox più ampio
LX0, LX1, LCLAT = 10.5, 38.5, 31.0
LW = (LX1 - LX0) * CX * K
LH = LW * H / W
LVX, LVY = (LX0 - LON0) * CX * K, (LAT1 - (LCLAT + LH / K / 2)) * K
def nel_largo(r):
    return any(LX0 - 3 < p[0] < LX1 + 3 and 10 < p[1] < 52 for p in r)
terre_l, paesi_l, confini_l = [], [], []
for f in carica("ne_110m_admin_0_countries"):
    rr = [r for r in anelli(f["geometry"]) if nel_largo(r)]
    if rr:
        p = "".join(d(r, True) for r in rr)
        terre_l.append(p); paesi_l.append((p, colore(f)))
        if f["properties"]["NAME"] not in CIPRO: confini_l.append(p)

bx, by = xy(13.500, 38.083)
LARGO = [
    '<g class="largo">',
    '<path class="confine-largo" d="' + "".join(confini_l) + '"/>',
    f'<rect class="riquadro-meso" x="0" y="0" width="{W}" height="{H}"/>',
    scritta("l-meso", "EGITTO", 30.2, 24.6),
    scritta("l-mare", "Mar Mediterraneo", 19.5, 34.6),
    scritta("l-mare", "Mar Nero", 33.5, 43.4),
    scritta("l-mare", "Mar Rosso", 37.0, 21.8, 58),
    scritta("l-stato", "ITALIA", 13.6, 43.4),
    scritta("l-stato", "GRECIA", 22.0, 40.4),
    scritta("l-stato", "TURCHIA", 33.0, 39.9),
    scritta("l-stato", "LIBIA", 18.5, 27.5),
    f'<circle class="l-noi-punto" cx="{bx:.0f}" cy="{by:.0f}" r="26"/>',
    scritta("l-noi", "Bagheria", 14.5, 38.0, anchor="start"), scritta("l-nota", "noi siamo qui", 14.5, 37.25, anchor="start"),
    '</g>']

def guida(lon0, lat0, lon1, lat1):
    (x0, y0), (x1, y1) = xy(lon0, lat0), xy(lon1, lat1)
    return f'<path class="guida" d="M{x0:.0f},{y0:.0f} L{x1:.0f},{y1:.0f}"/>'
# a nord-est la carta tocca appena Israele, Palestina e Giordania: scritte piccole con linee guida
VICINI = [
    scritta("stato piccolo", "ISRAELE", 34.95, 30.15, anchor="middle"),
    guida(33.9, 31.62, 34.4, 31.45), scritta("stato piccolo", "PALESTINA", 33.85, 31.68, anchor="end"),
    scritta("stato piccolo", "GIORDANIA", 35.95, 29.6, -90),
    scritta("stato piccolo", "ARABIA SAUDITA", 36.05, 25.9, -90),
    scritta("stato piccolo", "LIBIA", 24.75, 27.0, -90),
]

svg = [f'<svg viewBox="{LVX:.0f} {LVY:.0f} {LW:.0f} {LH:.0f}" preserveAspectRatio="xMidYMid meet" role="img" '
       f'aria-label="Carta dell\'Egitto: dove si trova, una regione chiusa, com\'è oggi" '
       f'data-largo="{LVX:.0f} {LVY:.0f} {LW:.0f} {LH:.0f}" data-vicino="0 0 {W} {H}">',
       f'<defs><clipPath id="riquadro"><rect id="taglio" x="{LVX:.0f}" y="{LVY:.0f}" width="{LW:.0f}" height="{LH:.0f}"/></clipPath></defs>',
       '<g clip-path="url(#riquadro)">',
       f'<rect class="mare" x="{LVX - 500:.0f}" y="{LVY - 500:.0f}" width="{LW + 1000:.0f}" height="{LH + 1000:.0f}"/>',
       '<path class="terra" d="' + "".join(terre_l) + '"/>',
       '<path class="terra" d="' + "".join(terre) + '"/>',
       politica(paesi_l, "politica-largo"),
       politica(paesi, "politica"),
       f'<g class="ieri"><path class="terra-nera" d="{delta}"/><path class="terra-nera-fiume" d="' + "".join(fiumi) + '"/></g>',
       '<path class="lago" d="' + "".join(laghi) + '"/>',
       '<path class="fiume" d="' + "".join(fiumi) + '"/>',
       '<g class="oggi"><path class="lago" d="' + "".join(bacini) + '"/><path class="canale" d="' + "".join(canali) + '"/></g>',
       '<g class="oggi"><path class="confine" d="' + "".join(confini) + '"/></g>',
       *LARGO,
       '<g class="vicino">',
       scritta("acqua", "Mar Mediterraneo", 27.6, 31.65),
       scritta("acqua", "Mar Rosso", 35.4, 24.3, 62),
       scritta("nome-fiume", "Nilo", 32.15, 28.6, 70),
       '</g>',
       '<g class="ieri">',
       scritta("regione", "BASSO EGITTO", 29.95, 30.45, anchor="end"),
       guida(30.0, 30.55, 30.75, 30.75),
       scritta("regione", "ALTO EGITTO", 30.75, 25.7, 72),
       scritta("rilievo", "Deserto Occidentale", 27.3, 26.3), scritta("rilievo", "(libico)", 27.3, 25.9),
       scritta("rilievo", "Deserto Orientale", 33.75, 25.9, 62),
       scritta("rilievo", "Sinai", 33.8, 29.15), scritta("risorsa", "rame e turchesi", 33.8, 28.82),
       scritta("rilievo", "NUBIA", 33.6, 22.3), scritta("risorsa", "oro", 33.6, 21.9),
       *[cataratta(*c) for c in CATARATTE],
       *[punto("antica", *a) for a in ANTICHE],
       '</g>',
       '<g class="oggi">',
       *[scritta("stato", n, lo, la) for n, lo, la in STATI],
       *VICINI,
       scritta("acqua piccola", "Lago Nasser", 31.5, 22.95, anchor="end"),
       scritta("acqua piccola", "Canale di Suez", 32.75, 30.15, anchor="start"),
       *[punto("moderna", *m) for m in MODERNE],
       '</g>',
       f'<rect class="cornice vicino" x="2" y="2" width="{W - 4}" height="{H - 4}"/>',
       '</g>',
       '</svg>']

pagina = open(sys.argv[3]).read().replace("<!--SVG-->", "\n".join(svg))
open(OUT, "w").write(pagina)
print(W, H, len(pagina) // 1024, "KB")
