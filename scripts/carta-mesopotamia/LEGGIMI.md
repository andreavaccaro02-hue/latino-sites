# Carta della Mesopotamia (geostoria/mesopotamia-ieri-oggi.html)

La pagina pubblicata si genera da qui: `modello-carta.html` contiene stile, testi e script; `genera_carta.py` disegna la carta in SVG e la inserisce al posto di `<!--SVG-->`.

Dati: Natural Earth (pubblico dominio), da scaricare in una cartella a parte:

    mkdir -p /tmp/ne && cd /tmp/ne
    for f in ne_50m_admin_0_countries ne_50m_rivers_lake_centerlines ne_50m_lakes ne_110m_admin_0_countries; do
      curl -sfLO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/$f.geojson
    done

Rigenerare, dalla cartella del sito:

    python3 -I scripts/carta-mesopotamia/genera_carta.py /tmp/ne geostoria/mesopotamia-ieri-oggi.html scripts/carta-mesopotamia/modello-carta.html

Coordinate delle città: Pleiades per i siti antichi, Wikidata per le città di oggi (verificate il 27/10/2026). La costa antica è una ricostruzione approssimativa.
