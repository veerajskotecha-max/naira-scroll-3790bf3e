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

  /* Below the fold only. Nothing here may touch #shopify-section-main,
     .product-information*, .product-details, media-gallery or .header-section:
     those have sticky descendants, and a transformed ancestor becomes the
     containing block and kills sticky silently. */
  var SEL = [
    '#shopify-section-grid .resource-list__item',
    '#shopify-section-grid .text-block',
    '#shopify-section-reasons .group-block',
    '#shopify-section-recommendations .resource-list__item'
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

  function boot() {
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
