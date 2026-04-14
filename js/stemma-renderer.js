/* ═══════════════════════════════════════════════════════════
   STEMMA RENDERER — motore condiviso per alberi sintattici
   Con zoom interattivo, focus su sottorami, modalità proiezione
   ═══════════════════════════════════════════════════════════ */

/* ── Aspetta CFG e TREES definiti globalmente dalla pagina ── */

(function () {
  'use strict';

  /* ════════════════════════════════════════
     COSTANTI E COLORI
     ════════════════════════════════════════ */
  var INVAR = { cong: 1, prep: 1, avv: 1 };
  var GRAY = { f: 'rgba(173,181,189,.25)', s: '#adb5bd', t: '#444d55' };
  var RG = { s: '#9b3a3a', t: '#5a1010' };

  /* ════════════════════════════════════════
     DOMINIO CROMATICO (versione unificata)
     Supporta sia nodi con rg:true sia senza
     ════════════════════════════════════════ */
  function assignDomain(nd, dom) {
    var isVerb = (nd.t === 'v' || nd.t === 'sub');
    nd._dom = nd.rg ? 'rg' : (isVerb ? 'y' : dom);
    if (!nd.ch) return;
    nd.ch.forEach(function (c) {
      var childDom;
      if (c.rg) {
        childDom = 'rg';
      } else if (c.t === 'v' || c.t === 'sub') {
        childDom = 'y';
      } else if (c.t === 'o') {
        childDom = 'g';
      } else if (c.t === 'spec' || c.t === 'term' || c.t === 'ind') {
        childDom = 'b';
      } else if (c.t === 's') {
        childDom = /acc/.test(c.r) ? 'rg' : /abl/.test(c.r) ? 'b' : 'r';
      } else if (c.t === 'pred' && isVerb) {
        childDom = /acc/.test(c.r) ? 'g' : 'r';
      } else {
        childDom = (nd._dom === 'y') ? 'b' : (nd._dom === 'rg') ? 'g' : nd._dom;
      }
      assignDomain(c, childDom);
    });
  }

  /* ════════════════════════════════════════
     LAYOUT
     ════════════════════════════════════════ */
  function nW(nd) {
    var ww = nd.w.length * CFG.CW + CFG.CP;
    var rw = nd.r.length * CFG.RW + CFG.CP;
    return Math.max(CFG.MW, ww, rw);
  }

  function computeSW(nd) {
    var own = nW(nd) + (CFG.HG || 20);
    if (!nd.ch || !nd.ch.length) { nd._sw = own; return; }
    nd.ch.forEach(computeSW);
    var sum = nd.ch.reduce(function (a, c) { return a + c._sw; }, 0);
    nd._sw = Math.max(own, sum);
  }

  function assignCX(nd, x0) {
    if (!nd.ch || !nd.ch.length) { nd._cx = x0 + nd._sw / 2; return; }
    var cx = x0;
    nd.ch.forEach(function (c) { assignCX(c, cx); cx += c._sw; });
    nd._cx = (nd.ch[0]._cx + nd.ch[nd.ch.length - 1]._cx) / 2;
  }

  function assignCY(nd, d) {
    nd._cy = CFG.PT + d * (CFG.NH + (CFG.VG || 70));
    if (nd.ch) nd.ch.forEach(function (c) { assignCY(c, d + 1); });
  }

  function maxD(nd) {
    if (!nd.ch || !nd.ch.length) return 0;
    return 1 + Math.max.apply(null, nd.ch.map(maxD));
  }

  /* ════════════════════════════════════════
     SVG HELPERS
     ════════════════════════════════════════ */
  function svgEl(tag, a) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(a).forEach(function (k) { el.setAttribute(k, a[k]); });
    return el;
  }

  function drawEdges(svg, nd) {
    if (!nd.ch) return;
    var px = nd._cx, py = nd._cy + CFG.NH;
    nd.ch.forEach(function (c) {
      var line = svgEl('line', {
        x1: px, y1: py, x2: c._cx, y2: c._cy,
        stroke: '#c0b09a', 'stroke-width': '1.8',
        'class': 'stemma-edge'
      });
      line._fromId = nd._nid;
      line._toId = c._nid;
      svg.appendChild(line);
      drawEdges(svg, c);
    });
  }

  var _curGradId = '';
  var _nodeIdCounter = 0;

  /* Assegna ID univoci a ogni nodo per tracciamento interattivo */
  function assignIds(nd) {
    nd._nid = _nodeIdCounter++;
    if (nd.ch) nd.ch.forEach(assignIds);
  }

  /* Calcola bounding box di un sottoramo */
  function subtreeBounds(nd) {
    var w = nW(nd);
    var minX = nd._cx - w / 2;
    var maxX = nd._cx + w / 2;
    var minY = nd._cy;
    var maxY = nd._cy + CFG.NH;
    if (nd.ch) {
      nd.ch.forEach(function (c) {
        var cb = subtreeBounds(c);
        if (cb.minX < minX) minX = cb.minX;
        if (cb.maxX > maxX) maxX = cb.maxX;
        if (cb.minY < minY) minY = cb.minY;
        if (cb.maxY > maxY) maxY = cb.maxY;
      });
    }
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  }

  /* Raccoglie tutti gli _nid in un sottoramo */
  function collectIds(nd) {
    var ids = [nd._nid];
    if (nd.ch) nd.ch.forEach(function (c) {
      ids = ids.concat(collectIds(c));
    });
    return ids;
  }

  /* Trova nodo per _nid nell'albero */
  function findNode(nd, nid) {
    if (nd._nid === nid) return nd;
    if (!nd.ch) return null;
    for (var i = 0; i < nd.ch.length; i++) {
      var found = findNode(nd.ch[i], nid);
      if (found) return found;
    }
    return null;
  }

  /* Costruisce il percorso dalla radice al nodo */
  function pathToNode(root, nid) {
    if (root._nid === nid) return [root];
    if (!root.ch) return null;
    for (var i = 0; i < root.ch.length; i++) {
      var p = pathToNode(root.ch[i], nid);
      if (p) { p.unshift(root); return p; }
    }
    return null;
  }

  function drawNodes(svg, nd, root) {
    var fill, stroke, textCol;
    if (INVAR[nd.t]) {
      fill = GRAY.f; stroke = GRAY.s; textCol = GRAY.t;
    } else if (nd._dom === 'rg') {
      fill = 'url(#' + _curGradId + ')'; stroke = RG.s; textCol = RG.t;
    } else {
      var col = CFG.COLS[nd._dom] || CFG.COLS.b;
      fill = col.f; stroke = col.s; textCol = col.t;
    }
    var w = nW(nd), x = nd._cx - w / 2, y = nd._cy;
    var isImp = nd.w.charAt(0) === '[';

    /* Gruppo cliccabile per il nodo */
    var g = svgEl('g', {
      'class': 'stemma-node',
      'data-nid': nd._nid,
      'cursor': nd.ch && nd.ch.length ? 'pointer' : 'default',
      'role': nd.ch && nd.ch.length ? 'button' : 'presentation',
      'tabindex': nd.ch && nd.ch.length ? '0' : '-1'
    });

    var rect = svgEl('rect', {
      x: x, y: y, width: w, height: CFG.NH, rx: 10,
      fill: fill, stroke: stroke, 'stroke-width': '2.2',
      'class': 'stemma-rect'
    });
    g.appendChild(rect);

    var t1 = svgEl('text', {
      x: nd._cx, y: y + 20,
      'text-anchor': 'middle',
      'font-family': 'Crimson Pro, Cardo, serif',
      'font-size': '14', 'font-weight': '700',
      'font-style': isImp ? 'italic' : 'normal',
      fill: textCol, 'pointer-events': 'none'
    });
    t1.textContent = nd.w;
    g.appendChild(t1);

    var t2 = svgEl('text', {
      x: nd._cx, y: y + 37,
      'text-anchor': 'middle',
      'font-family': 'Crimson Pro, Cardo, serif',
      'font-size': '9.5', 'font-style': 'italic',
      fill: textCol, 'pointer-events': 'none'
    });
    t2.textContent = nd.r;
    g.appendChild(t2);

    svg.appendChild(g);
    if (nd.ch) nd.ch.forEach(function (c) { drawNodes(svg, c, root); });
  }

  /* ════════════════════════════════════════
     ANIMAZIONE viewBox
     ════════════════════════════════════════ */
  function animateViewBox(svg, fromVB, toVB, duration, callback) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      /* ease-out cubic */
      var e = 1 - Math.pow(1 - t, 3);
      var vb = [
        fromVB[0] + (toVB[0] - fromVB[0]) * e,
        fromVB[1] + (toVB[1] - fromVB[1]) * e,
        fromVB[2] + (toVB[2] - fromVB[2]) * e,
        fromVB[3] + (toVB[3] - fromVB[3]) * e
      ];
      svg.setAttribute('viewBox', vb.join(' '));
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (callback) {
        callback();
      }
    }
    requestAnimationFrame(step);
  }

  function parseViewBox(svg) {
    return svg.getAttribute('viewBox').split(' ').map(Number);
  }

  /* ════════════════════════════════════════
     TOOLBAR + CONTROLLI
     ════════════════════════════════════════ */
  function createToolbar(wrap, svg, root, fullVB) {
    var bar = document.createElement('div');
    bar.className = 'stemma-toolbar';

    /* Breadcrumb / info zona */
    var info = document.createElement('span');
    info.className = 'stemma-info';
    info.textContent = 'Clicca su un nodo per ingrandirlo';
    bar.appendChild(info);

    var btns = document.createElement('div');
    btns.className = 'stemma-btns';

    /* Bottone Reset */
    var btnReset = makeBtn('Tutto', 'stemma-btn-reset', function () {
      zoomToFull(svg, fullVB, info, wrap, btnReset);
    });
    btnReset.style.display = 'none';
    btns.appendChild(btnReset);

    /* Bottone Zoom + */
    btns.appendChild(makeBtn('+', 'stemma-btn-zoom', function () {
      var vb = parseViewBox(svg);
      var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;
      var nw = vb[2] * 0.7, nh = vb[3] * 0.7;
      animateViewBox(svg, vb, [cx - nw / 2, cy - nh / 2, nw, nh], 250);
    }));

    /* Bottone Zoom - */
    btns.appendChild(makeBtn('\u2212', 'stemma-btn-zoom', function () {
      var vb = parseViewBox(svg);
      var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;
      var nw = Math.min(vb[2] * 1.4, fullVB[2] * 1.2);
      var nh = Math.min(vb[3] * 1.4, fullVB[3] * 1.2);
      animateViewBox(svg, vb, [cx - nw / 2, cy - nh / 2, nw, nh], 250);
    }));

    /* Bottone Schermo intero */
    btns.appendChild(makeBtn('Schermo intero', 'stemma-btn-fs', function () {
      var target = wrap.closest('.content-section') || wrap;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      }
    }));

    bar.appendChild(btns);

    /* ── Interazione nodi ── */
    svg.addEventListener('click', function (e) {
      var g = e.target.closest('.stemma-node');
      if (!g) return;
      var nid = parseInt(g.getAttribute('data-nid'), 10);
      var nd = findNode(root, nid);
      if (!nd || (!nd.ch || !nd.ch.length)) return;

      /* Calcola bounds del sottoramo */
      var b = subtreeBounds(nd);
      var pad = 30;
      var toVB = [b.minX - pad, b.minY - pad, (b.maxX - b.minX) + pad * 2, (b.maxY - b.minY) + pad * 2];

      /* Dim nodi fuori dal sottoramo */
      var activeIds = collectIds(nd);
      dimNodes(svg, activeIds, true);

      /* Aggiorna info con breadcrumb */
      var path = pathToNode(root, nid);
      if (path) {
        info.innerHTML = path.map(function (p, i) {
          var isLast = i === path.length - 1;
          return '<span class="stemma-crumb' + (isLast ? ' active' : '') + '" data-nid="' + p._nid + '">' + p.w + '</span>';
        }).join(' <span class="stemma-arrow">\u203A</span> ');

        /* Cliccabilità dei breadcrumb */
        info.querySelectorAll('.stemma-crumb').forEach(function (el) {
          el.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var crumbNid = parseInt(el.getAttribute('data-nid'), 10);
            var crumbNd = findNode(root, crumbNid);
            if (!crumbNd) return;
            if (crumbNid === root._nid) {
              zoomToFull(svg, fullVB, info, wrap, btnReset);
            } else {
              svg.dispatchEvent(new CustomEvent('focusNode', { detail: crumbNid }));
            }
          });
        });
      }

      btnReset.style.display = '';
      wrap.classList.add('stemma-focused');

      animateViewBox(svg, parseViewBox(svg), toVB, 400);
    });

    /* Evento custom per zoom da breadcrumb */
    svg.addEventListener('focusNode', function (e) {
      var nid = e.detail;
      var nd = findNode(root, nid);
      if (!nd) return;
      var b = subtreeBounds(nd);
      var pad = 30;
      var toVB = [b.minX - pad, b.minY - pad, (b.maxX - b.minX) + pad * 2, (b.maxY - b.minY) + pad * 2];
      var activeIds = collectIds(nd);
      dimNodes(svg, activeIds, true);
      var path = pathToNode(root, nid);
      if (path) {
        info.innerHTML = path.map(function (p, i) {
          var isLast = i === path.length - 1;
          return '<span class="stemma-crumb' + (isLast ? ' active' : '') + '" data-nid="' + p._nid + '">' + p.w + '</span>';
        }).join(' <span class="stemma-arrow">\u203A</span> ');
      }
      animateViewBox(svg, parseViewBox(svg), toVB, 400);
    });

    /* Hover highlight sottoramo */
    svg.addEventListener('mouseover', function (e) {
      var g = e.target.closest('.stemma-node');
      if (!g) return;
      var nid = parseInt(g.getAttribute('data-nid'), 10);
      var nd = findNode(root, nid);
      if (!nd || !nd.ch || !nd.ch.length) return;
      var ids = collectIds(nd);
      highlightNodes(svg, ids, true);
    });
    svg.addEventListener('mouseout', function (e) {
      var g = e.target.closest('.stemma-node');
      if (!g) return;
      highlightNodes(svg, [], false);
    });

    /* Keyboard: Escape per reset */
    wrap.setAttribute('tabindex', '0');
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('stemma-focused')) {
        zoomToFull(svg, fullVB, info, wrap, btnReset);
      }
    });

    return bar;
  }

  function makeBtn(label, cls, onclick) {
    var btn = document.createElement('button');
    btn.className = 'stemma-btn ' + cls;
    btn.textContent = label;
    btn.addEventListener('click', onclick);
    return btn;
  }

  function zoomToFull(svg, fullVB, info, wrap, btnReset) {
    animateViewBox(svg, parseViewBox(svg), fullVB, 400);
    dimNodes(svg, [], false);
    info.textContent = 'Clicca su un nodo per ingrandirlo';
    btnReset.style.display = 'none';
    wrap.classList.remove('stemma-focused');
  }

  function dimNodes(svg, activeIds, dim) {
    svg.querySelectorAll('.stemma-node').forEach(function (g) {
      var nid = parseInt(g.getAttribute('data-nid'), 10);
      if (dim && activeIds.indexOf(nid) === -1) {
        g.style.opacity = '0.18';
      } else {
        g.style.opacity = '1';
      }
    });
    svg.querySelectorAll('.stemma-edge').forEach(function (line) {
      if (dim && activeIds.indexOf(line._toId) === -1) {
        line.style.opacity = '0.12';
      } else {
        line.style.opacity = '1';
      }
    });
  }

  function highlightNodes(svg, ids, on) {
    svg.querySelectorAll('.stemma-node').forEach(function (g) {
      if (!on) {
        g.querySelector('.stemma-rect').style.filter = '';
        return;
      }
      var nid = parseInt(g.getAttribute('data-nid'), 10);
      if (ids.indexOf(nid) !== -1) {
        g.querySelector('.stemma-rect').style.filter = 'drop-shadow(0 0 6px rgba(156,122,60,0.5))';
      } else {
        g.querySelector('.stemma-rect').style.filter = '';
      }
    });
  }

  /* ════════════════════════════════════════
     RENDER PRINCIPALE
     ════════════════════════════════════════ */
  function renderAll() {
    var cont = document.getElementById('trees');
    if (!cont || typeof TREES === 'undefined') return;

    TREES.forEach(function (data, idx) {
      var root = JSON.parse(JSON.stringify(data.t));
      assignDomain(root, 'y');
      assignIds(root);
      computeSW(root);
      assignCX(root, CFG.PS);
      assignCY(root, 0);
      var md = maxD(root);
      var svgW = root._sw + CFG.PS * 2;
      var svgH = CFG.PT + (md + 1) * (CFG.NH + (CFG.VG || 70)) + 24;
      var fullVB = [0, 0, svgW, svgH];

      var svg = svgEl('svg', {
        viewBox: fullVB.join(' '),
        'class': 'stemma-svg',
        style: 'display:block;width:100%;min-width:' + Math.min(svgW, 380) + 'px;'
      });

      /* Gradiente per prop. infinitive */
      _curGradId = 'rg-g-' + idx;
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', _curGradId);
      grad.setAttribute('x1', '0'); grad.setAttribute('x2', '1');
      grad.setAttribute('y1', '0'); grad.setAttribute('y2', '0');
      [['50%', 'rgba(232,93,93,.22)'], ['50%', 'rgba(120,200,120,.28)']].forEach(function (s) {
        var st = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        st.setAttribute('offset', s[0]); st.setAttribute('stop-color', s[1]);
        grad.appendChild(st);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      drawEdges(svg, root);
      drawNodes(svg, root, root);

      /* Costruisci la sezione */
      var section = document.createElement('div');
      section.className = 'content-section';
      section.style.marginBottom = '28px';

      var hdr = document.createElement('div');
      hdr.className = 'content-header';
      hdr.innerHTML = '<h2>' + data.sec + '</h2>';
      section.appendChild(hdr);

      var body = document.createElement('div');
      body.className = 'content-body';

      var brano = document.createElement('div');
      brano.className = 'brano-box';
      brano.innerHTML = '<div class="brano-titolo">Testo</div><div class="brano-testo">' + data.q + '</div>';
      body.appendChild(brano);

      /* Toolbar + SVG */
      var wrap = document.createElement('div');
      wrap.className = 'stemma-wrap';
      wrap.style.marginTop = '20px';

      var toolbar = createToolbar(wrap, svg, root, fullVB);
      wrap.appendChild(toolbar);
      wrap.appendChild(svg);
      body.appendChild(wrap);

      if (data.note) {
        var nota = document.createElement('div');
        nota.className = 'nota-sintattica';
        nota.innerHTML = data.note;
        body.appendChild(nota);
      }
      section.appendChild(body);
      cont.appendChild(section);
    });
  }

  /* Avvia quando il DOM è pronto */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }

})();
