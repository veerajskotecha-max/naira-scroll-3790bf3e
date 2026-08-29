/* ═══════════════════════════════════════════════════════════════════
   Naira Flore — cart behaviour
   Ported from src/contexts/CartContext.tsx + src/components/CartDrawer.tsx.

   What deliberately did NOT come across: the Storefront API cart, the
   stored checkoutUrl, and the window.location.replace() to
   the permanent admin host at /checkouts/cn/<token>. That cross-site hop is why
   Razorpay refused every payment. Here the cart is Shopify's own cart,
   reached through the same-origin AJAX endpoints (/cart.js,
   /cart/add.js, /cart/change.js) and checkout is a form POST to /cart
   with a submit button named "checkout". No hostname is ever written.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var config = (window.NFCartConfig = window.NFCartConfig || {});
  var routes = {
    cart: '/cart',
    cartJs: '/cart.js',
    add: '/cart/add.js',
    change: '/cart/change.js'
  };

  /* ── Money ───────────────────────────────────────────────────────────
     Mirrors Shopify's own `money` filter so a price rendered here and a
     price rendered by Liquid on the same page always agree. Written with
     string scanning rather than regexes, deliberately. ──────────────── */
  function groupDigits(whole, thousands) {
    var out = '';
    var seen = 0;
    for (var i = whole.length - 1; i >= 0; i--) {
      var ch = whole.charAt(i);
      if (ch >= '0' && ch <= '9') {
        if (seen > 0 && seen % 3 === 0) out = thousands + out;
        seen++;
      }
      out = ch + out;
    }
    return out;
  }

  function group(number, precision, thousands, decimal) {
    if (precision == null) precision = 2;
    if (thousands == null) thousands = ',';
    if (decimal == null) decimal = '.';
    if (isNaN(number) || number === null) return '0';
    var parts = (number / 100.0).toFixed(precision).split('.');
    var whole = groupDigits(parts[0], thousands);
    return whole + (parts[1] ? decimal + parts[1] : '');
  }

  function money(cents) {
    var format = config.moneyFormat || 'Rs. {{amount}}';
    var open = format.indexOf('{{');
    var close = format.indexOf('}}');
    if (open === -1 || close === -1 || close < open) return format;
    var token = format.slice(open + 2, close).replace(/^[ ]+|[ ]+$/g, '');
    var value;
    switch (token) {
      case 'amount_no_decimals': value = group(cents, 0); break;
      case 'amount_with_comma_separator': value = group(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = group(cents, 0, '.', ','); break;
      case 'amount_with_space_separator': value = group(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = group(cents, 0, ' ', ','); break;
      case 'amount_with_period_and_space_separator': value = group(cents, 2, ' ', '.'); break;
      default: value = group(cents, 2);
    }
    return format.slice(0, open) + value + format.slice(close + 2);
  }

  var QUOTE = String.fromCharCode(34);

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .split('&').join('&amp;')
      .split('<').join('&lt;')
      .split('>').join('&gt;')
      .split(QUOTE).join('&quot;');
  }

  /* ── Drawer styles (injected once, so the drawer works on any page
        that loads this file without needing markup in the layout) ──── */
  var STYLES = [
    '.nf-drawer{position:fixed;inset:0;z-index:80;font-family:var(--nf-font-label);',
    '--nf-drawer-accent:hsl(186 35% 28%);--nf-drawer-accent-hover:hsl(186 35% 23%);',
    '--nf-drawer-line:hsl(0 0% 90%);--nf-drawer-ink:hsl(0 0% 15%);--nf-drawer-muted:hsl(0 0% 50%)}',
    '.nf-drawer[hidden]{display:none}',
    '.nf-drawer *,.nf-drawer *::before,.nf-drawer *::after{box-sizing:border-box}',
    '.nf-drawer__scrim{position:absolute;inset:0;background-color:hsl(0 0% 0%/.45);opacity:0;transition:opacity .3s ease}',
    '.nf-drawer.is-open .nf-drawer__scrim{opacity:1}',
    '.nf-drawer__panel{position:absolute;top:0;right:0;bottom:0;width:100%;max-width:420px;display:flex;flex-direction:column;',
    'background-color:hsl(0 0% 100%);transform:translateX(100%);transition:transform .35s var(--nf-ease-reveal,cubic-bezier(.22,1,.36,1))}',
    '.nf-drawer.is-open .nf-drawer__panel{transform:translateX(0)}',
    '.nf-drawer__head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 12px;border-bottom:1px solid var(--nf-drawer-line)}',
    '.nf-drawer__title{margin:0;font-family:var(--nf-font-editorial);font-size:20px;font-weight:600;color:var(--nf-drawer-ink)}',
    '.nf-drawer__close{display:flex;align-items:center;justify-content:center;width:44px;height:44px;margin-right:-10px;border:0;background:transparent;color:var(--nf-drawer-muted);cursor:pointer}',
    '.nf-drawer__ship{padding:12px 20px;background-color:hsl(33 30% 97%);border-bottom:1px solid var(--nf-drawer-line)}',
    '.nf-drawer__ship p{display:flex;align-items:center;gap:6px;margin:0 0 8px;font-size:12px;color:hsl(0 0% 38%)}',
    '.nf-drawer__ship strong{font-weight:600}',
    '.nf-drawer__ship .nf-drawer__amount{color:var(--nf-drawer-accent)}',
    '.nf-drawer__ship .is-free{font-weight:500;color:hsl(142 60% 30%)}',
    '.nf-drawer__track{height:6px;width:100%;overflow:hidden;border-radius:999px;background-color:hsl(0 0% 88%)}',
    '.nf-drawer__fill{height:100%;border-radius:999px;background-color:hsl(186 35% 38%);transition:width .5s ease-out}',
    '.nf-drawer__fill.is-done{background-color:hsl(142 60% 40%)}',
    '.nf-drawer__body{flex:1;overflow-y:auto;padding:16px 20px}',
    '.nf-drawer__line{display:flex;gap:12px;padding:12px 0}',
    '.nf-drawer__line+.nf-drawer__line{border-top:1px solid var(--nf-drawer-line)}',
    '.nf-drawer__line.is-busy{opacity:.5;pointer-events:none}',
    '.nf-drawer__img{width:80px;height:100px;object-fit:cover;flex-shrink:0}',
    '.nf-drawer__meta{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:8px}',
    '.nf-drawer__name{display:block;font-family:var(--nf-font-editorial);font-size:15px;font-weight:600;color:var(--nf-drawer-ink);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.nf-drawer__opts{margin:2px 0 0;font-size:12px;color:hsl(0 0% 55%)}',
    '.nf-drawer__price{margin:4px 0 0;font-family:var(--nf-font-editorial);font-size:15px;font-weight:700;color:var(--nf-drawer-accent)}',
    '.nf-drawer__row{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '.nf-drawer__stepper{display:inline-flex;align-items:center;border:1px solid hsl(0 0% 82%)}',
    '.nf-drawer__step{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:0;background:transparent;color:hsl(0 0% 30%);cursor:pointer}',
    '.nf-drawer__step:hover{background-color:hsl(0 0% 96%)}',
    '.nf-drawer__count{width:32px;text-align:center;font-size:13px;font-weight:500}',
    '.nf-drawer__remove{display:flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;border:0;background:transparent;color:hsl(0 0% 50%);cursor:pointer}',
    '.nf-drawer__foot{padding:16px 20px;border-top:1px solid var(--nf-drawer-line);display:flex;flex-direction:column;gap:12px}',
    '.nf-drawer__delivery{display:flex;align-items:center;gap:8px;padding:8px 12px;background-color:hsl(142 30% 96%)}',
    '.nf-drawer__delivery p{margin:0;font-size:12px;color:hsl(0 0% 38%)}',
    '.nf-drawer__subtotal{display:flex;align-items:center;justify-content:space-between}',
    '.nf-drawer__subtotal span:first-child{font-family:var(--nf-font-editorial);font-size:16px;font-weight:600;color:hsl(0 0% 25%)}',
    '.nf-drawer__subtotal span:last-child{font-family:var(--nf-font-editorial);font-size:18px;font-weight:700;color:var(--nf-drawer-accent)}',
    '.nf-drawer__checkout{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:52px;padding:16px;border:0;border-radius:0;',
    'background-color:var(--nf-drawer-accent);color:hsl(0 0% 100%);font-family:var(--nf-font-label);font-size:13px;font-weight:500;text-transform:uppercase;',
    'letter-spacing:var(--nf-track-10,.1em);cursor:pointer;transition:background-color .2s ease}',
    '.nf-drawer__checkout:hover{background-color:var(--nf-drawer-accent-hover)}',
    '.nf-drawer__badges{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}',
    '.nf-drawer__badge{padding:4px 8px;border:1px solid hsl(0 0% 82%);font-size:10px;font-weight:700;letter-spacing:.04em;color:hsl(0 0% 45%)}',
    '.nf-drawer__ssl{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:hsl(0 0% 55%)}',
    '.nf-drawer__continue{display:flex;align-items:center;justify-content:center;min-height:44px;font-family:var(--nf-font-editorial);font-size:14px;color:hsl(0 0% 45%);text-decoration:underline;text-underline-offset:4px}',
    '.nf-drawer__empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:32px;text-align:center}',
    '.nf-drawer__empty-title{margin:20px 0 0;font-family:var(--nf-font-editorial);font-size:22px;font-weight:600;color:hsl(0 0% 18%)}',
    '.nf-drawer__empty-body{max-width:240px;margin:8px 0 28px;font-family:var(--nf-font-editorial);font-size:15px;line-height:1.7;color:hsl(0 0% 50%)}',
    '.nf-drawer__empty-cta{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 36px;background-color:var(--nf-drawer-accent);color:hsl(0 0% 100%);',
    'font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.14em;text-decoration:none}',
    '.nf-toast{position:fixed;left:50%;bottom:24px;z-index:120;transform:translate(-50%,16px);opacity:0;padding:12px 20px;',
    'background-color:hsl(0 0% 12%);color:hsl(0 0% 100%);font-family:var(--nf-font-label);font-size:13px;pointer-events:none;transition:opacity .25s ease,transform .25s ease}',
    '.nf-toast.is-visible{opacity:1;transform:translate(-50%,0)}',
    '@media screen and (min-width:750px){.nf-drawer__panel{max-width:420px}}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('nf-drawer-styles')) return;
    var style = document.createElement('style');
    style.id = 'nf-drawer-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  /* ── Drawer ──────────────────────────────────────────────────────── */
  var drawer = null;
  var lastFocus = null;

  function buildDrawer() {
    if (drawer) return drawer;
    injectStyles();
    drawer = document.createElement('div');
    drawer.className = 'nf-drawer';
    drawer.setAttribute('data-nf-drawer', '');
    drawer.hidden = true;
    drawer.innerHTML = [
      '<div class="nf-drawer__scrim" data-nf-drawer-close></div>',
      '<aside class="nf-drawer__panel" role="dialog" aria-modal="true" aria-label="Your cart">',
      '<header class="nf-drawer__head">',
      '<h2 class="nf-drawer__title">Your Cart</h2>',
      '<button type="button" class="nf-drawer__close" data-nf-drawer-close aria-label="Close cart">',
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
      '</button></header>',
      '<div class="nf-drawer__ship" data-nf-drawer-ship></div>',
      '<div class="nf-drawer__body" data-nf-drawer-body></div>',
      '<div class="nf-drawer__foot" data-nf-drawer-foot></div>',
      '</aside>'
    ].join('');
    document.body.appendChild(drawer);
    return drawer;
  }

  var TRUCK = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  var SHIELD = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  var BAG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

  function renderDrawer(cart) {
    var el = buildDrawer();
    var title = el.querySelector('.nf-drawer__title');
    var ship = el.querySelector('[data-nf-drawer-ship]');
    var body = el.querySelector('[data-nf-drawer-body]');
    var foot = el.querySelector('[data-nf-drawer-foot]');
    var shopUrl = config.continueUrl || '/collections/all';

    title.textContent = 'Your Cart (' + cart.item_count + ')';

    if (!cart.item_count) {
      ship.innerHTML = '';
      ship.style.display = 'none';
      foot.innerHTML = '';
      foot.style.display = 'none';
      body.innerHTML = [
        '<div class="nf-drawer__empty">',
        '<div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;border:1px solid hsl(36 47% 46% / .35);background-color:hsl(33 41% 95%);color:hsl(36 47% 46%)">' + BAG + '</div>',
        '<p class="nf-drawer__empty-title">Your cart is empty</p>',
        '<p class="nf-drawer__empty-body">Pieces you choose will gather here, ready when you are.</p>',
        '<a class="nf-drawer__empty-cta" href="' + escapeHtml(shopUrl) + '">Continue Shopping</a>',
        '</div>'
      ].join('');
      return;
    }

    ship.style.display = '';
    foot.style.display = '';

    var threshold = Number(config.freeShippingThreshold || 0);
    if (threshold > 0) {
      var remaining = Math.max(0, threshold - cart.total_price);
      var pct = Math.min(100, (cart.total_price / threshold) * 100);
      ship.innerHTML = [
        remaining > 0
          ? '<p>' + TRUCK + ' Add <strong class="nf-drawer__amount">' + escapeHtml(money(remaining)) + '</strong> more for <strong>free shipping</strong></p>'
          : '<p class="is-free">' + TRUCK + ' This order ships free</p>',
        '<div class="nf-drawer__track"><div class="nf-drawer__fill' + (pct >= 100 ? ' is-done' : '') + '" style="width:' + pct + '%"></div></div>'
      ].join('');
    } else {
      ship.innerHTML = '';
      ship.style.display = 'none';
    }

    body.innerHTML = cart.items.map(function (item) {
      var options = '';
      if (item.options_with_values && item.options_with_values.length && item.variant_title) {
        options = item.options_with_values
          .map(function (o) { return escapeHtml(o.name) + ': ' + escapeHtml(o.value); })
          .join(' · ');
      }
      var src = item.image ? item.image + (item.image.indexOf('?') === -1 ? '?' : '&') + 'width=200' : '';
      var image = src
        ? '<img class="nf-drawer__img" src="' + escapeHtml(src) + '" alt="" width="80" height="100" loading="lazy">'
        : '';
      return [
        '<div class="nf-drawer__line" data-nf-drawer-line data-nf-key="' + escapeHtml(item.key) + '">',
        image,
        '<div class="nf-drawer__meta"><div>',
        '<a class="nf-drawer__name" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.product_title) + '</a>',
        options ? '<p class="nf-drawer__opts">' + options + '</p>' : '',
        '<p class="nf-drawer__price">' + escapeHtml(money(item.final_line_price)) + '</p>',
        '</div><div class="nf-drawer__row"><div class="nf-drawer__stepper">',
        '<button type="button" class="nf-drawer__step" data-nf-drawer-step="-1" aria-label="Decrease quantity">',
        '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>',
        '<span class="nf-drawer__count">' + item.quantity + '</span>',
        '<button type="button" class="nf-drawer__step" data-nf-drawer-step="1" aria-label="Increase quantity">',
        '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg></button>',
        '</div>',
        '<button type="button" class="nf-drawer__remove" data-nf-drawer-remove aria-label="Remove item">',
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>',
        '</div></div></div>'
      ].join('');
    }).join('');

    var badges = (config.trustBadges || 'UPI,VISA,MC,RAZORPAY').split(',');
    foot.innerHTML = [
      '<div class="nf-drawer__delivery">' + TRUCK + '<p>Estimated delivery: <strong>3–7 working days</strong></p></div>',
      '<div class="nf-drawer__subtotal"><span>Subtotal</span><span>' + escapeHtml(money(cart.total_price)) + '</span></div>',
      /* Same-origin checkout. The button is a submit inside a form that
         POSTs to /cart — Shopify handles the hand-off itself. */
      '<form action="' + escapeHtml(config.cartUrl || routes.cart) + '" method="post" novalidate>',
      '<button type="submit" name="checkout" class="nf-drawer__checkout">' + LOCK + ' Secure Checkout</button>',
      '</form>',
      '<div class="nf-drawer__badges">' + badges.map(function (b) {
        return '<span class="nf-drawer__badge">' + escapeHtml(b.trim()) + '</span>';
      }).join('') + '</div>',
      '<div class="nf-drawer__ssl">' + SHIELD + '<span>256-bit SSL encrypted · 100% secure</span></div>',
      '<a class="nf-drawer__continue" href="' + escapeHtml(shopUrl) + '">Continue Shopping</a>'
    ].join('');
  }

  function openDrawer() {
    var el = buildDrawer();
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { el.classList.add('is-open'); });
    var close = el.querySelector('.nf-drawer__close');
    if (close) close.focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { if (drawer) drawer.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ── Toast ───────────────────────────────────────────────────────── */
  var toastEl = null;
  var toastTimer = null;
  function toast(message) {
    injectStyles();
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'nf-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ── Cart requests ───────────────────────────────────────────────── */
  function broadcast(cart) {
    document.querySelectorAll('[data-nf-cart-count]').forEach(function (node) {
      node.textContent = cart.item_count;
      node.setAttribute('data-nf-cart-count', cart.item_count);
    });
    document.dispatchEvent(new CustomEvent('nf:cart:updated', { detail: cart }));
    refreshCartBubble();
  }

  /* Keeps whatever cart icon the header renders in step, without this
     file needing to know how that header is built. */
  function refreshCartBubble() {
    var bubble = document.getElementById('cart-icon-bubble');
    if (!bubble) return;
    fetch('?section_id=cart-icon-bubble')
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) {
        if (!html) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var next = doc.getElementById('cart-icon-bubble');
        if (next) bubble.innerHTML = next.innerHTML;
      })
      .catch(function () { /* header is another concern; never block the cart */ });
  }

  function getCart() {
    return fetch(routes.cartJs, { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
  }

  function cartSectionId() {
    var node = document.querySelector('[data-nf-cart-section]');
    return node ? node.getAttribute('data-nf-cart-section') : null;
  }

  function applySections(payload) {
    if (!payload || !payload.sections) return false;
    var applied = false;
    Object.keys(payload.sections).forEach(function (id) {
      var target = document.getElementById('shopify-section-' + id);
      if (!target) return;
      var doc = new DOMParser().parseFromString(payload.sections[id], 'text/html');
      var next = doc.getElementById('shopify-section-' + id);
      target.innerHTML = next ? next.innerHTML : payload.sections[id];
      applied = true;
    });
    return applied;
  }

  function changeLine(key, quantity) {
    var payload = { id: key, quantity: quantity };
    var sectionId = cartSectionId();
    if (sectionId) {
      payload.sections = sectionId;
      payload.sections_url = config.cartUrl || routes.cart;
    }
    return fetch(routes.change, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        applySections(cart);
        broadcast(cart);
        if (drawer && !drawer.hidden) renderDrawer(cart);
        return cart;
      });
  }

  function addToCart(form, options) {
    var data = new FormData(form);
    data.delete('nf-buy-now');
    return fetch(routes.add, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    })
      .then(function (response) {
        return response.json().then(function (json) {
          if (!response.ok) throw new Error(json.description || json.message || 'This piece could not be added.');
          return json;
        });
      })
      .then(function () { return getCart(); })
      .then(function (cart) {
        broadcast(cart);
        if (options && options.buyNow) {
          /* Same-origin. Shopify serves checkout on this storefront's
             own domain, so there is no cross-site hop for Razorpay. */
          window.location.href = '/checkout';
          return cart;
        }
        renderDrawer(cart);
        openDrawer();
        return cart;
      });
  }

  /* ── Delegated wiring ────────────────────────────────────────────── */
  var lastSubmitter = null;
  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('button[type=SUBMITQ], input[type=SUBMITQ]'.split('SUBMITQ').join(QUOTE + 'submit' + QUOTE));
    if (button) lastSubmitter = button;
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches || !form.matches('form[data-nf-add]')) return;
    event.preventDefault();

    var submitter = event.submitter || lastSubmitter;
    var buyNow = !!(submitter && submitter.hasAttribute('data-nf-buy-now'));
    var buttons = form.querySelectorAll('button[type=' + QUOTE + 'submit' + QUOTE + ']');
    var external = document.querySelectorAll('button[form=' + QUOTE + form.id + QUOTE + ']');

    function setBusy(state) {
      [].forEach.call(buttons, function (b) { b.disabled = state; });
      [].forEach.call(external, function (b) { b.disabled = state; });
    }

    setBusy(true);
    addToCart(form, { buyNow: buyNow })
      .then(function () {
        if (buyNow) return;
        setBusy(false);
        var flagged = submitter && submitter.closest ? submitter : null;
        var mark = flagged || form.querySelector('[data-nf-add-button]') || buttons[0];
        if (mark) {
          mark.classList.add('is-added');
          window.setTimeout(function () { mark.classList.remove('is-added'); }, 1500);
        }
        toast('Added to cart · ' + (form.getAttribute('data-nf-add-title') || ''));
      })
      .catch(function (error) {
        setBusy(false);
        toast(error.message || 'This piece could not be added.');
      });
  });

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target.closest) return;

    if (target.closest('[data-nf-drawer-close]')) {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (target.closest('[data-nf-cart-open]')) {
      event.preventDefault();
      getCart().then(function (cart) { renderDrawer(cart); openDrawer(); });
      return;
    }

    /* Drawer line controls */
    var step = target.closest('[data-nf-drawer-step]');
    var removeBtn = target.closest('[data-nf-drawer-remove]');
    if (step || removeBtn) {
      event.preventDefault();
      var line = (step || removeBtn).closest('[data-nf-drawer-line]');
      if (!line) return;
      var key = line.getAttribute('data-nf-key');
      var current = parseInt(line.querySelector('.nf-drawer__count').textContent, 10) || 0;
      var next = removeBtn ? 0 : current + parseInt(step.getAttribute('data-nf-drawer-step'), 10);
      if (next < 0) next = 0;
      line.classList.add('is-busy');
      changeLine(key, next).catch(function () { line.classList.remove('is-busy'); });
      return;
    }

    /* Cart page line controls */
    var pageStep = target.closest('[data-nf-line-step]');
    var pageRemove = target.closest('[data-nf-line-remove]');
    if (pageStep || pageRemove) {
      var row = (pageStep || pageRemove).closest('[data-nf-line-key]');
      if (!row) return;
      event.preventDefault();
      var rowKey = row.getAttribute('data-nf-line-key');
      var input = row.querySelector('[data-nf-line-input]');
      var qty = input ? parseInt(input.value, 10) || 0 : 0;
      var targetQty = pageRemove ? 0 : qty + parseInt(pageStep.getAttribute('data-nf-line-step'), 10);
      if (targetQty < 0) targetQty = 0;
      row.classList.add('is-busy');
      changeLine(rowKey, targetQty).catch(function () { row.classList.remove('is-busy'); });
    }
  });

  document.addEventListener('change', function (event) {
    var input = event.target;
    if (!input.matches || !input.matches('[data-nf-line-input]')) return;
    var row = input.closest('[data-nf-line-key]');
    if (!row) return;
    var qty = parseInt(input.value, 10);
    if (isNaN(qty) || qty < 0) qty = 0;
    row.classList.add('is-busy');
    changeLine(row.getAttribute('data-nf-line-key'), qty).catch(function () { row.classList.remove('is-busy'); });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeDrawer();
  });

  window.NFCart = {
    open: function () { return getCart().then(function (cart) { renderDrawer(cart); openDrawer(); }); },
    close: closeDrawer,
    get: getCart,
    change: changeLine,
    money: money,
    toast: toast
  };
})();