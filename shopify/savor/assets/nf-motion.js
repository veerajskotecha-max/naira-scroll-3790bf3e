/* Naira — the reveal system. One IntersectionObserver, no scroll listener.

   Above 990px Horizon's scroller is .page-wrapper, not the window, so a
   scroll listener on window would simply never fire. IntersectionObserver
   with root:null is correct at both breakpoints, which is why nothing else
   is used here.

   Fail-open by design: the CSS that hides an element is gated behind the
   .nf-motion class this script adds. Blocked, deferred or thrown, the store
   renders as it does without it -- it can never blank the page. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Below the fold only. Nothing here may touch [id^="shopify-section-"][id$="__main"],
     .product-information*, .product-details, media-gallery or .header-section:
     those have sticky descendants, and a transformed ancestor becomes the
     containing block and kills sticky silently. */
  var SEL = [
    '[id^="shopify-section-"][id$="__grid"] .resource-list__item',
    '[id^="shopify-section-"][id$="__grid"] .text-block',
    '[id^="shopify-section-"][id$="__reasons"] .group-block',
    '[id^="shopify-section-"][id$="__recommendations"] .resource-list__item',
    '[id^="shopify-section-"][id$="__categories"] .collection-card',
    '[id^="shopify-section-"][id$="__catintro"] .text-block',
    '[id^="shopify-section-"][id$="__gridintro"] .text-block',
    '[id^="shopify-section-"][id$="__recintro"] .text-block',
    '[id^="shopify-section-"][id$="__cartintro"] .text-block',
    '[id^="shopify-section-"][id$="__story"] .text-block',
    '[id^="shopify-section-"][id$="__story"] .hero__media-wrapper',
    '.product-grid-container .product-grid > *'
  ].join(',');

  document.documentElement.classList.add('nf-motion');

  var targets = [];
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      entries[i].target.classList.add('nf-in');
      io.unobserve(entries[i].target);
    }
  }, { threshold: 0.02, rootMargin: '0px 0px -6% 0px' });

  function scan() {
    targets = [].slice.call(document.querySelectorAll(SEL));
    targets.forEach(function (el) {
      if (el.classList.contains('nf-r')) return;
      el.classList.add('nf-r');
      el.style.setProperty('--nf-i', [].indexOf.call(el.parentElement.children, el));
      io.observe(el);
    });
  }

  /* Anything already on screen at boot is revealed outright rather than
     waiting for a scroll that may never come. */
  function sweep() {
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.height > 0 && r.top < innerHeight && r.bottom > 0) el.classList.add('nf-in');
    });
  }

  /* The hero headline, word by word. Splitting has to happen before the
     first paint the reveal animates, and it must be idempotent -- the theme
     editor re-runs boot() on every section reload. */
  function splitHeadline() {
    var h = document.querySelector('[id^="shopify-section-"][id$="__hero"] .text-block.h1 :is(h1, h2, p)')
         || document.querySelector('[id^="shopify-section-"][id$="__hero"] .text-block.h1');
    if (!h || h.dataset.nfSplit) return;
    var words = h.textContent.trim().split(/\s+/);
    if (!words.length || words.length > 24) return;
    h.dataset.nfSplit = '1';
    h.textContent = '';
    var line = document.createElement('span');
    line.className = 'nf-wline';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'nf-w';
      span.style.setProperty('--nf-wi', i);
      span.textContent = w;
      line.appendChild(span);
      if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
    h.appendChild(line);
  }

  /* Petals over the hero's type column. Five, at different sizes, speeds and
     delays, in the two brand colours. Injected rather than templated so that
     a blocked script costs nothing but the petals. */
  var PETALS = [
    { l: '6%',  w: 104, o: .6,  rot: -22, c: '#FFBDA8', a: 'nf-drift-a', dur: 30, d: 0 },
    { l: '21%', w: 122, o: .5,  rot: -10, c: '#FFBDA8', a: 'nf-drift-b', dur: 34, d: 6 },
    { l: '33%', w: 84,  o: .45, rot: -30, c: '#99B4AF', a: 'nf-drift-b', dur: 32, d: 3 },
    { l: '12%', w: 132, o: .4,  rot: -16, c: '#FFBDA8', a: 'nf-drift-a', dur: 36, d: 11 },
    { l: '41%', w: 58,  o: .55, rot: 20,  c: '#99B4AF', a: 'nf-drift-b', dur: 33, d: 16 }
  ];
  function petals() {
    if (innerWidth < 750) return;
    var hero = document.querySelector('[id^="shopify-section-"][id$="__hero"] .hero__container');
    if (!hero || hero.querySelector('.nf-petal')) return;
    PETALS.forEach(function (p) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'nf-petal');
      svg.setAttribute('viewBox', '0 0 100 34');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.left = p.l;
      svg.style.width = p.w + 'px';
      svg.style.height = (p.w * 0.34) + 'px';
      svg.style.opacity = p.o;
      svg.style.animationName = p.a;
      svg.style.animationDuration = p.dur + 's';
      svg.style.animationDelay = p.d + 's';
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M2,17 C18,2 70,2 98,17 C70,32 18,32 2,17 Z');
      path.setAttribute('fill', p.c);
      svg.appendChild(path);
      hero.appendChild(svg);
    });
  }

  function boot() {
    splitHeadline();
    petals();
    scan();
    sweep();
    requestAnimationFrame(sweep);
    setTimeout(sweep, 350);
    setTimeout(sweep, 1100);
  }

  if (document.readyState !== 'loading') boot();
  else addEventListener('DOMContentLoaded', boot);

  addEventListener('pageshow', sweep);
  /* The theme editor rebuilds sections in place. */
  document.addEventListener('shopify:section:load', boot);

  /* animation-fill-mode: both leaves filter:blur(0) computed, and a settled
     filter is still a containing block. Clear it once the animation ends. */
  document.addEventListener('animationend', function (e) {
    if (e.animationName.lastIndexOf('nf-rise', 0) === 0) e.target.classList.add('nf-done');
  }, true);
}());
