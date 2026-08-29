/* ═══════════════════════════════════════════════════════════════════
   NAIRA FLORE — header behaviour
   Vanilla port of the React state in the Lovable repo:
     src/components/Header.tsx      -> scrolled flag (window.scrollY > 10)
     src/components/Navbar.tsx      -> mobile menu trigger, badge counts
     src/components/MobileMenu.tsx  -> drawer open/close + body scroll lock
   No framework, no build step. Everything is defensive: if a node is
   missing the block is skipped rather than throwing.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WISHLIST_KEY = 'naira-wishlist'; // matches src/contexts/WishlistContext.tsx

  /* ── 1. Scrolled state ────────────────────────────────────────────
     Header.tsx: setScrolled(window.scrollY > 10) on a passive scroll
     listener. The visual change (translucent + blur + hairline shadow)
     lives in CSS under .nf-header--scrolled. */
  function initScrollState(header) {
    var ticking = false;

    function apply() {
      ticking = false;
      header.classList.toggle('nf-header--scrolled', window.scrollY > 10);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
  }

  /* ── 2. Mobile menu ───────────────────────────────────────────────
     MobileMenu.tsx: slide-in panel, backdrop click closes, Escape
     closes, body scroll locked while open, focus moved into the panel
     and returned to the trigger on close. */
  function initMobileMenu(header) {
    var menu = header.querySelector('[data-nf-menu]');
    if (!menu) return;

    var panel = menu.querySelector('[data-nf-menu-panel]');
    var openers = header.querySelectorAll('[data-nf-menu-open]');
    var lastFocused = null;
    var isOpen = false;

    var FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function focusables() {
      return Array.prototype.filter.call(panel.querySelectorAll(FOCUSABLE), function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
    }

    function open(trigger) {
      if (isOpen) return;
      isOpen = true;
      lastFocused = trigger || document.activeElement;
      menu.classList.add('is-open');
      menu.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      Array.prototype.forEach.call(openers, function (el) {
        el.setAttribute('aria-expanded', 'true');
      });
      var first = focusables()[0];
      if (first) first.focus();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      Array.prototype.forEach.call(openers, function (el) {
        el.setAttribute('aria-expanded', 'false');
      });
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      lastFocused = null;
    }

    Array.prototype.forEach.call(openers, function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        open(el);
      });
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('[data-nf-menu-close]')) {
        // Links inside the panel close it too, but must still navigate.
        if (event.target.closest('a[href]')) {
          close();
          return;
        }
        event.preventDefault();
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // The theme editor re-renders sections in place; never leave the
    // page scroll-locked behind a panel that no longer exists.
    document.addEventListener('shopify:section:load', function () {
      document.body.style.overflow = '';
    });
  }

  /* ── 3. Wishlist dot ──────────────────────────────────────────────
     Liquid has no wishlist object, so the count is read from the same
     localStorage key the Lovable WishlistContext writes. Purely
     decorative: absence of the key just means "no dot". */
  function readWishlistCount() {
    try {
      var raw = window.localStorage.getItem(WISHLIST_KEY);
      if (!raw) return 0;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
      if (parsed && Array.isArray(parsed.items)) return parsed.items.length;
      return 0;
    } catch (error) {
      return 0;
    }
  }

  function initWishlist(header) {
    var dots = header.querySelectorAll('[data-nf-wishlist-dot]');
    if (!dots.length) return;

    function paint() {
      var count = readWishlistCount();
      Array.prototype.forEach.call(dots, function (dot) {
        dot.hidden = count < 1;
      });
    }

    paint();
    window.addEventListener('storage', function (event) {
      if (!event.key || event.key === WISHLIST_KEY) paint();
    });
    // Any in-page wishlist UI can announce itself without knowing about us.
    document.addEventListener('nf:wishlist:change', paint);
  }

  /* ── 4. Keep our cart icon after Dawn re-renders it ───────────────
     The cart link carries id="cart-icon-bubble" so Dawn's cart
     notification / cart drawer can find it (real cart state, real
     drawer hook-up). Both replace that element's innerHTML with
     sections/cart-icon-bubble.liquid, which would swap our bag glyph
     for Dawn's. We watch for that and re-render our own markup with
     the count Dawn just told us about. */
  function initCartIcon() {
    var cartIcon = document.getElementById('cart-icon-bubble');
    if (!cartIcon || !cartIcon.hasAttribute('data-nf-cart')) return;

    var template = cartIcon.innerHTML;
    var painting = false;

    function paint(count) {
      painting = true;
      cartIcon.innerHTML = template;
      var badge = cartIcon.querySelector('[data-nf-cart-count]');
      if (badge) {
        badge.textContent = count > 9 ? '9+' : String(count);
        badge.hidden = count < 1;
      }
      var label = cartIcon.querySelector('[data-nf-cart-label]');
      if (label) {
        label.textContent = count === 1 ? '1 item in cart' : count + ' items in cart';
      }
      // The drawer's cart badge is a plain server-rendered mirror.
      Array.prototype.forEach.call(
        document.querySelectorAll('[data-nf-cart-mirror]'),
        function (mirror) {
          mirror.textContent = count > 9 ? '9+' : String(count);
          mirror.hidden = count < 1;
        }
      );
      window.requestAnimationFrame(function () {
        painting = false;
      });
    }

    new MutationObserver(function () {
      if (painting) return;
      if (cartIcon.querySelector('[data-nf-cart-count]')) return; // still ours
      var injected = cartIcon.querySelector('.cart-count-bubble span[aria-hidden="true"]');
      var count = injected ? parseInt(injected.textContent.trim(), 10) || 0 : 0;
      paint(count);
    }).observe(cartIcon, { childList: true, subtree: true });
  }

  function boot() {
    var header = document.querySelector('[data-nf-header]');
    if (!header) return;
    initScrollState(header);
    initMobileMenu(header);
    initWishlist(header);
    initCartIcon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Re-bind when the merchant edits the header in the theme editor.
  document.addEventListener('shopify:section:load', function (event) {
    if (event.target && event.target.querySelector('[data-nf-header]')) boot();
  });
})();
