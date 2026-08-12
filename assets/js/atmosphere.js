/* ============================================================
   atmosphere.js
   - Brand of Sacrifice cursor (a seared sigil that trails molten
     light, breathes, leans into movement, and flares open into a
     rune ring over anything interactive)
   - Drifting ember / ash particles rising in the background
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TAU = Math.PI * 2;

  /* ---------------------------------------------------------
     EMBER FIELD — rising motes of ash lit from below
     --------------------------------------------------------- */
  (function embers() {
    var canvas = document.getElementById('ember-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h, motes = [];

    function resize() {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      var count = reduced ? 0 : Math.min(46, Math.floor(w / 32));
      motes = [];
      for (var i = 0; i < count; i++) motes.push(spawn(true));
    }
    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: Math.random() * 1.6 + 0.5,
        vy: -(Math.random() * 0.35 + 0.12),
        vx: (Math.random() - 0.5) * 0.25,
        life: Math.random(),
        flick: Math.random() * Math.PI * 2,
        hot: Math.random() < 0.35
      };
    }
    resize();
    window.addEventListener('resize', resize);

    if (reduced) return;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx;
        m.y += m.vy;
        m.flick += 0.05;
        m.life -= 0.0015;
        var twinkle = 0.5 + Math.sin(m.flick) * 0.5;
        if (m.y < -10 || m.life <= 0) { motes[i] = spawn(false); continue; }
        var alpha = twinkle * 0.6 * Math.min(1, m.life * 2);
        if (m.hot) {
          ctx.fillStyle = 'rgba(224,70,40,' + alpha + ')';
          ctx.shadowColor = 'rgba(224,70,40,0.8)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = 'rgba(201,169,97,' + (alpha * 0.7) + ')';
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* =========================================================
     BRAND OF SACRIFICE CURSOR
     ========================================================= */
  if (!finePointer) return;

  var canvas = document.getElementById('brand-cursor');
  if (!canvas) return;
  document.body.classList.add('fine-pointer');

  var ctx = canvas.getContext('2d');
  var w = 0, h = 0;

  // back with real device pixels or 1px strokes go to mush on HiDPI
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- state ------------------------------------------------ */
  var px = innerWidth / 2, py = innerHeight / 2;   // true pointer
  var bx = px, by = py;                            // the mark (springs behind)
  var seen = false;
  var present = 0;      // 0..1 fade as the pointer enters/leaves the window
  var lock = 0;         // 0..1 eased hover state
  var lockTarget = 0;
  var press = 0;        // 0..1 click impact, decays
  var lean = 0;         // radians, mark tips into the direction of travel
  var t = 0;

  var trail = [];      // molten smear of recent positions
  var sparks = [];      // embers shed off the mark
  var waves = [];      // click shockwaves
  var MAX_SPARKS = 90;

  /* ---- input ------------------------------------------------ */
  var lastHit = null;
  var LOCK_SEL = 'a, button, input, textarea, select, [role="button"], ' +
    '.proj-card, .skill-card, .cert-row, .wu-card, .t-item, ' +
    '.term-card, .stat-box';

  window.addEventListener('mousemove', function (e) {
    px = e.clientX; py = e.clientY;
    if (!seen) { seen = true; bx = px; by = py; }
    // off the live target, not a list captured at load: cards load later
    if (e.target !== lastHit) {
      lastHit = e.target;
      lockTarget = (e.target && e.target.closest && e.target.closest(LOCK_SEL)) ? 1 : 0;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function () { seen = false; });
  document.addEventListener('mouseenter', function () { seen = true; });
  window.addEventListener('blur', function () { seen = false; });

  window.addEventListener('mousedown', function () {
    press = 1;
    waves.push({ x: px, y: py, r: 7, life: 1 });
    for (var i = 0; i < 16; i++) {
      var a = Math.random() * TAU;
      var sp = Math.random() * 2.4 + 0.7;
      sparks.push({
        x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6,
        life: 1, decay: 0.022, r: Math.random() * 1.6 + 0.6, hot: true
      });
    }
  });

  /* Same geometry as the #brand-mark symbol, around (0,0).
     Spans x -0.92..0.92, y -1.40..1.40. Keep the two in sync. */
  function traceBrand() {
    ctx.beginPath();
    // spine driven through the whole mark
    ctx.moveTo(0, -1.40); ctx.lineTo(0, 1.40);
    // upper diamond, pinched to the waist at the origin
    ctx.moveTo(0, -1.00); ctx.lineTo(0.92, -0.50);
    ctx.lineTo(0, 0); ctx.lineTo(-0.92, -0.50);
    ctx.closePath();
    // lower diamond
    ctx.moveTo(0, 0); ctx.lineTo(0.92, 0.50);
    ctx.lineTo(0, 1.00); ctx.lineTo(-0.92, 0.50);
    ctx.closePath();
    // thorns forking off the spine above the upper diamond
    ctx.moveTo(0, -1.14); ctx.lineTo(-0.28, -1.36);
    ctx.moveTo(0, -1.14); ctx.lineTo(0.28, -1.36);
  }

  // 0..1: banked crimson -> forge orange, short of white so the
  // additive passes don't wash the colour out
  function heatColor(heat, a) {
    var r, g, b, k;
    if (heat < 0.5) {
      k = heat / 0.5;
      r = 148 + 76 * k; g = 24 + 46 * k; b = 20 + 18 * k;
    } else {
      k = (heat - 0.5) / 0.5;
      r = 224 + 26 * k; g = 70 + 88 * k; b = 38 + 52 * k;
    }
    return 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + a + ')';
  }

  // three additive passes (bloom, body, core); lineWidth is divided by
  // scale so screen thickness stays constant as the mark flares
  function drawBrand(scale, heat, alpha) {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';

    traceBrand();
    ctx.strokeStyle = heatColor(heat * 0.45, alpha * 0.11);
    ctx.lineWidth = 7 / scale;
    ctx.stroke();

    ctx.strokeStyle = heatColor(heat * 0.75, alpha * 0.22);
    ctx.lineWidth = 3.2 / scale;
    ctx.stroke();

    ctx.strokeStyle = heatColor(heat, alpha * 0.9);
    ctx.lineWidth = 1.5 / scale;
    ctx.stroke();

    // molten core at the waist
    var cr = 0.22 + heat * 0.12;
    var core = ctx.createRadialGradient(0, 0, 0, 0, 0, cr);
    core.addColorStop(0, 'rgba(255,226,182,' + (alpha * 0.8) + ')');
    core.addColorStop(0.35, 'rgba(255,140,62,' + (alpha * 0.5) + ')');
    core.addColorStop(1, 'rgba(224,70,40,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, cr, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // reduced motion: still tracks the pointer, just doesn't animate
  if (reduced) {
    (function still() {
      ctx.clearRect(0, 0, w, h);
      if (seen) {
        ctx.save();
        ctx.translate(px, py);
        drawBrand(9, 0.5, 1);
        ctx.restore();
      }
      requestAnimationFrame(still);
    })();
    return;
  }

  function loop() {
    t += 1 / 60;

    // tight spring: weight without feeling like it lags the click point
    var lastX = bx, lastY = by;
    bx += (px - bx) * 0.32;
    by += (py - by) * 0.32;
    var vx = bx - lastX, vy = by - lastY;
    var speed = Math.sqrt(vx * vx + vy * vy);

    // ease the discrete states so nothing pops
    lock += (lockTarget - lock) * 0.16;
    press *= 0.88;
    present += ((seen ? 1 : 0) - present) * 0.14;

    // tip toward travel, capped ~6deg
    var leanTarget = Math.max(-0.11, Math.min(0.11, vx * 0.012));
    lean += (leanTarget - lean) * 0.12;

    ctx.clearRect(0, 0, w, h);
    if (present < 0.01) { requestAnimationFrame(loop); return; }

    // two detuned sines read as flame; per-frame random strobes
    var flick = 0.86 + Math.sin(t * 7.3) * 0.09 + Math.sin(t * 11.9 + 1.3) * 0.05;
    var pulse = 0.5 + Math.sin(t * 1.9) * 0.5;
    var heat = Math.min(0.88, (0.26 + lock * 0.4 + speed * 0.018 + press * 0.4) * flick);
    var scale = (17 + pulse * 0.5 + lock * 3.5) * (1 - press * 0.16);
    var alpha = present;

    /* --- molten trail --------------------------------------- */
    if (speed > 0.7) {
      var head = trail[trail.length - 1];
      if (!head || Math.abs(head.x - bx) + Math.abs(head.y - by) > 2) {
        trail.push({ x: bx, y: by, life: 1 });
      }
    }
    while (trail.length > 16) trail.shift();
    for (var i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 0.055;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }
    if (trail.length > 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (var pass = 0; pass < 2; pass++) {
        var wm = pass === 0 ? 1 : 0.34;
        var am = pass === 0 ? 0.05 : 0.14;
        for (var s = 1; s < trail.length; s++) {
          var a = trail[s - 1], b = trail[s];
          var f = (s / trail.length) * b.life;   // taper toward the tail
          ctx.strokeStyle = 'rgba(224,70,40,' + (am * f * alpha) + ')';
          ctx.lineWidth = 11 * f * wm;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    /* --- shed embers ---------------------------------------- */
    var shed = Math.min(3, Math.floor(speed * 0.32));
    for (var k = 0; k < shed; k++) {
      sparks.push({
        x: bx + (Math.random() - 0.5) * 7,
        y: by + (Math.random() - 0.5) * 7,
        vx: -vx * 0.13 + (Math.random() - 0.5) * 0.5,
        vy: -vy * 0.13 + (Math.random() - 0.5) * 0.5 - 0.3,
        life: 1, decay: 0.026, r: Math.random() * 1.2 + 0.4,
        hot: Math.random() < 0.6
      });
    }
    // idle drip off the bottom point
    if (Math.random() < 0.05 + lock * 0.1) {
      sparks.push({
        x: bx + (Math.random() - 0.5) * 3,
        y: by + 1.2 * scale,
        vx: (Math.random() - 0.5) * 0.18,
        vy: Math.random() * 0.35 + 0.12,
        life: 1, decay: 0.019, r: Math.random() * 0.9 + 0.4, hot: true
      });
    }
    if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS);

    /* --- bleed halo under the mark -------------------------- */
    var haloR = (20 + lock * 16 + pulse * 3) * (1 + press * 0.5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var halo = ctx.createRadialGradient(bx, by, 0, bx, by, haloR);
    halo.addColorStop(0, 'rgba(139,10,10,' + ((0.16 + lock * 0.14 + press * 0.2) * alpha) + ')');
    halo.addColorStop(1, 'rgba(139,10,10,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(bx, by, haloR, 0, TAU);
    ctx.fill();
    ctx.restore();

    /* --- click shockwaves ----------------------------------- */
    for (var v = waves.length - 1; v >= 0; v--) {
      var wv = waves[v];
      wv.r += (46 - wv.r) * 0.12;
      wv.life -= 0.045;
      if (wv.life <= 0) { waves.splice(v, 1); continue; }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,140,70,' + (wv.life * 0.4 * alpha) + ')';
      ctx.lineWidth = 1 + wv.life * 1.4;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, wv.r, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    /* --- lock: rune rings open around the mark -------------- */
    if (lock > 0.012) {
      ctx.save();
      ctx.translate(bx, by);
      ctx.globalCompositeOperation = 'lighter';
      var ease = lock * lock * (3 - 2 * lock);   // smoothstep the bloom open

      // tarnished gold ring, dashed, drifting clockwise
      ctx.save();
      ctx.rotate(t * 0.55);
      ctx.strokeStyle = 'rgba(201,169,97,' + (0.75 * ease * alpha) + ')';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 9]);
      ctx.shadowColor = 'rgba(201,169,97,0.7)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 30 - ease * 4, 0, TAU);
      ctx.stroke();
      ctx.restore();

      // crimson sweep, counter-rotating — the "lock acquired" tell
      ctx.save();
      ctx.rotate(-t * 1.15);
      ctx.strokeStyle = 'rgba(224,70,40,' + (0.55 * ease * alpha) + ')';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 22 - ease * 3, -0.5, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 22 - ease * 3, Math.PI - 0.5, Math.PI + 0.9);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    /* --- the Brand itself ----------------------------------- */
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(lean);
    drawBrand(scale, heat, alpha);
    ctx.restore();

    /* --- exact-pointer core: unsprung, so the click point is clear --- */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var dot = Math.min(1, speed * 0.14);
    ctx.fillStyle = 'rgba(255,214,170,' + ((0.4 + dot * 0.5) * alpha) + ')';
    ctx.beginPath();
    ctx.arc(px, py, 1.1 + dot * 0.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    /* --- embers --------------------------------------------- */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var e = sparks.length - 1; e >= 0; e--) {
      var sp2 = sparks[e];
      sp2.x += sp2.vx; sp2.y += sp2.vy;
      sp2.vy += 0.014;
      sp2.vx *= 0.98;
      sp2.life -= sp2.decay;
      if (sp2.life <= 0) { sparks.splice(e, 1); continue; }
      ctx.fillStyle = sp2.hot
        ? 'rgba(255,' + Math.round(120 + sp2.life * 100) + ',60,' + (sp2.life * 0.85 * alpha) + ')'
        : 'rgba(201,169,97,' + (sp2.life * 0.5 * alpha) + ')';
      ctx.beginPath();
      ctx.arc(sp2.x, sp2.y, sp2.r * sp2.life, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    requestAnimationFrame(loop);
  }
  loop();
})();
