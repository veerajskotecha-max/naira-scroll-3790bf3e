/* ───────────────────────────────────────────────────────────────
   Naira Flore — global chrome
   Faithful ports of the three overlays App.tsx renders on every page:
     FilmGrain      src/components/wow/FilmGrain.tsx
     ScrollBloom    src/components/wow/ScrollBloom.tsx
     FeatherCursor  src/components/wow/FeatherCursor.tsx
   None of them existed in the Liquid theme.

   Every gate, constant and easing figure below is copied from the
   React source rather than re-derived, so the motion matches.
   ─────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.__nfChrome) return;
  window.__nfChrome = true;

  var LG = '(min-width: 1024px)';
  var isLg = function () { return window.matchMedia(LG).matches; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── FILM GRAIN ──────────────────────────────────────────────
     Desktop only: a full-viewport mix-blend layer re-composites the
     whole screen every frame and wrecks scroll on mobile GPUs.
     The grain deliberately does NOT move — the old steps(4) shift
     cost a median 36 dropped frames per scroll pass against 21
     with it off. Texture, opacity, blend mode and vignette are
     exactly as the React layer. */
  function filmGrain() {
    if (!isLg()) return;
    var svg = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(%23n)'/></svg>"
    );
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'nf-grain';
    wrap.innerHTML =
      '<div class="nf-grain__noise" style="background-image:url(&quot;data:image/svg+xml,' + svg + '&quot;);background-size:160px 160px"></div>' +
      '<div class="nf-grain__vignette"></div>';
    document.body.appendChild(wrap);
  }

  /* ── SCROLL BLOOM ────────────────────────────────────────────
     Right-edge rail: a sage line fills upward while a five-petal
     flower opens from bud to full bloom. lg-only — the listener is
     skipped entirely below that, not merely hidden. */
  function scrollBloom() {
    if (!isLg()) return;
    var PETALS = [0, 72, 144, 216, 288];
    var el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.className = 'nf-bloom';
    el.innerHTML =
      '<svg width="34" height="34" viewBox="0 0 40 40" class="nf-bloom__flower"><g></g></svg>' +
      '<div class="nf-bloom__rail"><div class="nf-bloom__fill"></div><span class="nf-bloom__dot"></span></div>' +
      '<span class="nf-bloom__pct">00</span>';
    document.body.appendChild(el);

    var g = el.querySelector('g');
    var fill = el.querySelector('.nf-bloom__fill');
    var dot = el.querySelector('.nf-bloom__dot');
    var pct = el.querySelector('.nf-bloom__pct');
    var raf = 0;

    function paint(p) {
      var bloom = 0.35 + p * 0.65;                 // petal scale
      var parts = '';
      for (var i = 0; i < PETALS.length; i++) {
        var a = PETALS[i], rad = (a * Math.PI) / 180;
        var px = 20 + Math.cos(rad) * 9 * bloom;
        var py = 20 + Math.sin(rad) * 9 * bloom;
        parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + (6 * bloom) + '" ry="' + (3.4 * bloom) +
                 '" fill="#99B4AF" transform="rotate(' + a + ' ' + px + ' ' + py + ')" opacity="' + (0.5 + p * 0.5) + '"/>';
      }
      parts += '<circle cx="20" cy="20" r="' + (3 + p * 2.5) + '" fill="#FFBDA8"/>';
      g.innerHTML = parts;
      g.style.transform = 'rotate(' + (p * 90) + 'deg)';
      fill.style.height = (p * 100) + '%';
      dot.style.top = ((1 - p) * 100) + '%';
      pct.textContent = String(Math.round(p * 100)).padStart(2, '0');
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        paint(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ── FEATHER CURSOR ──────────────────────────────────────────
     Sage-and-gold feather easing behind a precise ink dot. Tilts
     toward travel, sways when still, lifts over interactive things,
     sheds feathers on click. Fine pointer only, honours reduced-motion. */
  function featherCursor() {
    if (!window.matchMedia('(pointer: fine)').matches || reduce || !isLg()) return;
    document.documentElement.classList.add('has-feather-cursor');

    var host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.className = 'nf-cursor';
    host.innerHTML =
      '<div class="nf-cursor__burst"></div>' +
      '<div class="nf-cursor__feather">' +
        '<svg width="26" height="36" viewBox="0 0 26 36">' +
          '<path d="M13 35 L13.6 10" stroke="#C99A4C" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
          '<path d="M13.4 8 C4 12 2 23 7 32 C10 28 12.2 19 13.4 8 Z" fill="#99B4AF" opacity="0.92"/>' +
          '<path d="M13.4 8 C22 12 24 23 19 32 C16 28 14.6 19 13.4 8 Z" fill="#B4C7C2" opacity="0.92"/>' +
          '<g stroke="#7E9A94" stroke-width="0.6" opacity="0.5">' +
            '<path d="M13 14 L8 16"/><path d="M13 18 L7.5 21"/><path d="M13 22 L8 26"/>' +
            '<path d="M13.6 14 L18.5 16"/><path d="M13.6 18 L19 21"/><path d="M13.6 22 L18 26"/>' +
          '</g>' +
          '<circle cx="13" cy="35" r="1.4" fill="#C99A4C"/>' +
        '</svg>' +
      '</div>' +
      '<div class="nf-cursor__dot"></div>';
    document.body.appendChild(host);

    var featherEl = host.querySelector('.nf-cursor__feather');
    var dotEl = host.querySelector('.nf-cursor__dot');
    var burst = host.querySelector('.nf-cursor__burst');

    var target = { x: innerWidth / 2, y: innerHeight / 2 };
    var pos = { x: target.x, y: target.y };
    var vx = 0, vy = 0, rot = -22, sway = 0, hovering = false;

    var FEATHER_SM = '<svg width="16" height="22" viewBox="0 0 16 22"><path d="M8 21 L8.4 7" stroke="#C99A4C" stroke-width="1" fill="none"/><path d="M8.2 6 C2 9 1 15 4.5 20 C6 17 7.4 12 8.2 6Z" fill="#99B4AF"/><path d="M8.2 6 C14 9 15 15 11.5 20 C10 17 8.9 12 8.2 6Z" fill="#B4C7C2"/></svg>';
    var INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="bloom"]';

    window.addEventListener('mousemove', function (e) {
      target.x = e.clientX; target.y = e.clientY;
      dotEl.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0) translate(-50%,-50%)';
      var interactive = !!(e.target && e.target.closest && e.target.closest(INTERACTIVE));
      if (interactive !== hovering) { hovering = interactive; featherEl.classList.toggle('is-lift', hovering); }
    }, { passive: true });

    (function tick() {
      var px = pos.x, py = pos.y;
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      vx = pos.x - px; vy = pos.y - py;
      var speed = Math.min(1, Math.hypot(vx, vy) / 22);
      sway += 0.045;
      var travel = Math.atan2(vy, vx) * (180 / Math.PI);
      var targetRot = -22 + (speed > 0.02 ? (travel + 90) * speed * 0.28 : 0) + Math.sin(sway) * (3.5 - speed * 3);
      rot += (targetRot - rot) * 0.12;
      featherEl.style.transform = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
      requestAnimationFrame(tick);
    })();

    window.addEventListener('mousedown', function () { featherEl.classList.add('is-press'); });
    window.addEventListener('mouseup', function () { featherEl.classList.remove('is-press'); });
    window.addEventListener('click', function (e) {
      for (var i = 0; i < 3; i++) {
        var f = document.createElement('span');
        f.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;pointer-events:none;will-change:transform,opacity;';
        f.innerHTML = FEATHER_SM;
        burst.appendChild(f);
        var ang = (i - 1) * 0.7 - Math.PI / 2;
        var dx = Math.cos(ang) * (26 + i * 12), dy = Math.sin(ang) * 18;
        (function (node) {
          node.animate(
            [{ transform: 'translate(-50%,-50%) rotate(0) scale(.5)', opacity: 0.9 },
             { transform: 'translate(' + dx + 'px,' + (dy + 60) + 'px) rotate(' + (180 + i * 60) + 'deg) scale(1)', opacity: 0 }],
            { duration: 1100 + i * 80, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'forwards' }
          ).onfinish = function () { node.remove(); };
        })(f);
      }
    });
  }

  function boot() { filmGrain(); scrollBloom(); featherCursor(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
