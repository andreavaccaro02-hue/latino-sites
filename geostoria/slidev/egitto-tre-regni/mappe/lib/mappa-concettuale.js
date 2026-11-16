// Motore delle mappe concettuali per la LIM (geostoria). Usa Cytoscape.js (MIT), in lib/cytoscape.min.js.
// La pagina definisce window.MAPPA = {sopra, titolo, nota, tappe: [{titolo, testo, dom}], nodi: [...], archi: [...]}
//   nodo: {id, t: 'testo', x, y (in colonne e righe), tipo: 'centro'|'fatto'|'esito'|'causa'|'nota', tappa: n}
//   arco: {da, a, t: 'frase di collegamento', tappa: n}
// Comandi: frecce o spazio, pulsanti; «Mettiti alla prova» copre i riquadri, clic per scoprirli. ?t=N apre la tappa N, ?prova=1 la prova.
(function () {
  const M = window.MAPPA;
  const css = `
:root{--roma:#b8322a;--lapis:#1f4e8c;--ocra:#c8962e;--testo:#1d2430;--grigio:#6b7280}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#fff;color:var(--testo);font-family:Lexend,"Atkinson Hyperlegible",system-ui,sans-serif;overflow:hidden}
.tutto{display:grid;grid-template-columns:62% 38%;height:100vh}
.sx{position:relative;background:radial-gradient(circle at 50% 40%,#fffdf6,#f3ecdc)}
#cy{position:absolute;inset:0 0 4.5vh 0}
.leg{position:absolute;left:1.2vw;right:1.2vw;bottom:.8vh;display:flex;gap:1.4vw;flex-wrap:wrap;font-size:1.75vh;color:#4b5563}
.leg span{display:flex;align-items:center;gap:.4vw}
.leg i{display:inline-block;width:2.2vh;height:1.6vh;border-radius:.4vh;border:2px solid}
.pannello{display:flex;flex-direction:column;padding:2.4vh 2vw 1.6vh 1.8vw;gap:1.2vh;background:#fffdf8}
.sopra{font-size:2.2vh;font-weight:600;color:var(--grigio);text-transform:uppercase;letter-spacing:.08em}
.titolo{font-size:4.3vh;font-weight:700;color:var(--roma);line-height:1.1}
.testo{font-size:2.9vh;line-height:1.38}
.testo b{color:var(--lapis)}
.domanda{margin-top:auto;font-size:2.55vh;line-height:1.3;border-left:.6vh solid var(--ocra);padding:.7vh 0 .7vh 1vw;color:#4a3a12;background:#faf3e3;border-radius:0 .6vh .6vh 0}
.tempo{display:flex;gap:.4vw}
.tempo button{flex:1;font:inherit;font-size:1.8vh;padding:.7vh 0;border:none;border-radius:.6vh;background:#e5e7eb;color:var(--testo);cursor:pointer}
.tempo button.ora{background:var(--roma);color:#fff;font-weight:700}
.comandi,.modi{display:flex;gap:.6vw}
.comandi button,.modi button{flex:1;font:inherit;font-size:2.2vh;padding:.8vh;border-radius:.8vh;border:2px solid var(--lapis);background:#fff;color:var(--lapis);cursor:pointer}
.modi button{font-size:2vh;border-color:var(--ocra);color:#6a4a0a}
.modi button.attivo{background:var(--ocra);color:#fff}
.comandi button:disabled{opacity:.35;cursor:default}
.nota{font-size:1.5vh;color:var(--grigio)}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  document.body.innerHTML = `<div class="tutto">
  <div class="sx"><div id="cy"></div><div class="leg">
    <span><i style="background:#b8322a;border-color:#b8322a"></i>il tema</span>
    <span><i style="background:#fff;border-color:#1f4e8c"></i>fatti e date</span>
    <span><i style="background:#fbe7e4;border-color:#b8322a"></i>risultati</span>
    <span><i style="background:#faf3e3;border-color:#c8962e"></i>perché</span></div></div>
  <div class="pannello">
    <div class="sopra" id="sopra"></div><div class="titolo" id="titolo"></div><div class="testo" id="testo"></div>
    <div class="domanda" id="domanda"></div>
    <div class="modi"><button id="prova">Mettiti alla prova</button><button id="tutta">Tutta la mappa</button></div>
    <div class="tempo" id="tempo"></div>
    <div class="comandi"><button id="ind">◀ indietro</button><button id="av">avanti ▶</button></div>
    <div class="nota">${M.nota || ''}</div>
  </div></div>`;

  const DX = M.dx || 215, DY = M.dy || 120;
  const COL = {
    centro: ['#b8322a', '#b8322a', '#fff', 21, 'bold'],
    fatto: ['#ffffff', '#1f4e8c', '#1d2430', 19, 'normal'],
    esito: ['#fbe7e4', '#b8322a', '#1d2430', 19, 'bold'],
    causa: ['#faf3e3', '#c8962e', '#1d2430', 19, 'normal'],
    nota: ['#f3f4f6', '#9ca3af', '#374151', 17, 'normal']
  };
  const elementi = [
    ...M.nodi.map(n => ({group: 'nodes', data: {id: n.id, t: n.t, tipo: n.tipo || 'fatto', tappa: n.tappa}, position: {x: n.x * DX, y: n.y * DY}})),
    ...M.archi.map((a, i) => ({group: 'edges', data: {id: 'e' + i, source: a.da, target: a.a, t: a.t || '', tappa: a.tappa}}))
  ];
  const cy = cytoscape({
    container: document.getElementById('cy'), elements: elementi, layout: {name: 'preset'},
    userZoomingEnabled: false, userPanningEnabled: false, boxSelectionEnabled: false, autoungrabify: true, autounselectify: true,
    style: [
      {selector: 'node', style: {
        'shape': 'round-rectangle', 'label': e => e.hasClass('coperto') ? '?' : e.data('t'),
        'text-wrap': 'wrap', 'text-max-width': (M.larghezza || 175) + 'px', 'text-valign': 'center', 'text-halign': 'center',
        'font-family': 'Lexend, system-ui, sans-serif', 'line-height': 1.25, 'padding': '11px',
        'width': e => e.data('w') || 'label', 'height': e => e.data('h') || 'label',
        'background-color': e => COL[e.data('tipo')][0], 'border-color': e => COL[e.data('tipo')][1], 'border-width': 2.5,
        'color': e => COL[e.data('tipo')][2], 'font-size': e => e.hasClass('coperto') ? 26 : COL[e.data('tipo')][3],
        'font-weight': e => e.hasClass('coperto') ? 'bold' : COL[e.data('tipo')][4],
        'transition-property': 'opacity, border-width, border-color, background-color', 'transition-duration': '0.6s'}},
      {selector: 'node.coperto', style: {'background-color': '#eef2f8', 'color': '#1f4e8c', 'border-style': 'dashed'}},
      {selector: 'edge', style: {
        'curve-style': 'bezier', 'width': 2.5, 'line-color': '#b9a77e', 'target-arrow-color': '#b9a77e', 'target-arrow-shape': 'triangle', 'arrow-scale': 1.2,
        'label': 'data(t)', 'font-size': 16, 'font-style': 'italic', 'color': '#4b5563', 'font-family': 'Lexend, system-ui, sans-serif',
        'text-background-color': '#fffaf0', 'text-background-opacity': 1, 'text-background-padding': '3px', 'text-wrap': 'wrap', 'text-max-width': '140px',
        'transition-property': 'opacity, line-color', 'transition-duration': '0.6s'}},
      {selector: '.nasc', style: {'opacity': 0}},
      {selector: 'node.nuovo', style: {'border-width': 5, 'border-color': '#c8962e'}},
      {selector: 'edge.nuovo', style: {'line-color': '#c8962e', 'target-arrow-color': '#c8962e'}}
    ]
  });
  // misure fisse: un riquadro coperto resta grande quanto quello scoperto
  // le misure si prendono dopo il caricamento di Lexend, altrimenti la mappa esce dal riquadro
  function misura() {
    const coperti = cy.nodes('.coperto'); coperti.removeClass('coperto');
    cy.nodes().forEach(n => { n.removeData('w'); n.removeData('h'); });
    cy.style().update();
    cy.nodes().forEach(n => { n.data('w', n.width()); n.data('h', n.height()); });
    coperti.addClass('coperto');
    cy.resize(); cy.fit(cy.elements(), 22);
  }
  cy.ready(misura);
  if (document.fonts) document.fonts.ready.then(misura);
  setTimeout(misura, 600);
  addEventListener('resize', () => { cy.resize(); cy.fit(cy.elements(), 22); });

  const T = M.tappe, ultimo = T.length - 1;
  const tempo = document.getElementById('tempo');
  const bt = T.map((t, i) => { const b = document.createElement('button'); b.textContent = i + 1; b.onclick = () => vai(i); tempo.appendChild(b); return b; });
  let ora = 0, prova = false;
  function vai(i) {
    ora = Math.max(0, Math.min(ultimo, i)); const t = T[ora];
    document.getElementById('sopra').textContent = M.sopra;
    document.getElementById('titolo').textContent = t.titolo;
    document.getElementById('testo').innerHTML = prova ? 'Prima di cliccare, <b>dillo tu</b> a voce o scrivilo sul quaderno. Poi clicca sul riquadro e controlla.' : t.testo;
    document.getElementById('domanda').textContent = prova ? 'Quanti riquadri sai ricostruire senza aiuto?' : t.dom;
    bt.forEach((b, j) => b.classList.toggle('ora', j === ora));
    document.getElementById('ind').disabled = ora === 0; document.getElementById('av').disabled = ora === ultimo;
    cy.batch(() => cy.elements().forEach(e => {
      const k = e.data('tappa');
      e.toggleClass('nasc', k > ora);
      e.toggleClass('nuovo', k === ora && ora > 0 && !prova);
    }));
  }
  function setProva(v) {
    prova = v; document.getElementById('prova').classList.toggle('attivo', v);
    document.getElementById('prova').textContent = v ? 'Torna alla spiegazione' : 'Mettiti alla prova';
    cy.batch(() => cy.nodes().forEach(n => n.toggleClass('coperto', v && n.data('tipo') !== 'centro')));
    if (v) vai(ultimo); else vai(ora);
  }
  cy.on('tap', 'node', e => { if (prova && e.target.data('tipo') !== 'centro') e.target.toggleClass('coperto'); });
  document.getElementById('prova').onclick = () => setProva(!prova);
  document.getElementById('tutta').onclick = () => { if (prova) setProva(false); vai(ultimo); };
  document.getElementById('av').onclick = () => vai(ora + 1);
  document.getElementById('ind').onclick = () => vai(ora - 1);

  // ponte con Slidev (come nelle altre pagine): la pagina prende i tasti quando la sua slide è visibile;
  // avanti dopo l'ultima tappa e indietro dalla prima passano alle slide; i tasti tornano a Slidev quando la slide cambia.
  function restituisci() { try { if (window.frameElement) window.frameElement.blur(); window.parent.focus(); } catch (e) {} }
  function passa(dir) {
    try { const n = window.parent !== window && window.parent.__slidev__ && window.parent.__slidev__.nav; if (n) { dir > 0 ? n.next() : n.prev(); restituisci(); } } catch (e) {}
  }
  addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); ora === ultimo ? passa(1) : vai(ora + 1); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); ora === 0 ? passa(-1) : vai(ora - 1); }
  });
  (function () {
    if (window.parent === window) return;
    let relatore = false; try { relatore = window.parent.location.pathname.includes('presenter') || window.parent.location.hash.includes('presenter'); } catch (e) {}
    if (relatore) return;
    const fe = window.frameElement; let era = false;
    setInterval(() => { const vis = !!fe && fe.getBoundingClientRect().height > 0; if (vis && !era) { window.focus(); cy.resize(); cy.fit(cy.elements(), 22); } if (!vis && era) restituisci(); era = vis; }, 250);
  })();

  const q = new URLSearchParams(location.search);
  vai(q.get('t') ? +q.get('t') : 0);
  if (q.get('prova')) setProva(true);
})();
