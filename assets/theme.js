/* ===========================
   MALBON-INSPIRED THEME JS
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initSearchOverlay();
  initCartDrawer();
  initGenderToggle();
  initMobileNav();
});

// ===========================
// HERO SLIDER
// ===========================
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.hero-dot');
  const prevBtn = slider.querySelector('.hero-prev');
  const nextBtn = slider.querySelector('.hero-next');
  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function autoPlay() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); autoPlay(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); autoPlay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); autoPlay(); }));

  // Touch/swipe
  let startX = 0;
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); autoPlay(); }
  });

  goTo(0);
  autoPlay();
}

// ===========================
// SEARCH OVERLAY
// ===========================
function initSearchOverlay() {
  const overlay = document.querySelector('.search-overlay');
  const openBtns = document.querySelectorAll('[data-open-search]');
  const closeBtn = overlay?.querySelector('.search-close');
  const input = overlay?.querySelector('.search-input');

  openBtns.forEach(btn => btn.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => input?.focus(), 100);
  }));

  closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));

  overlay?.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay?.classList.remove('open');
  });
}

// ===========================
// CART DRAWER
// ===========================
function initCartDrawer() {
  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-drawer-overlay');
  const openBtns = document.querySelectorAll('[data-open-cart]');
  const closeBtn = drawer?.querySelector('.cart-drawer-close');

  function openCart() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openCart));
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
}

// ===========================
// GENDER TOGGLE (product grid)
// ===========================
function initGenderToggle() {
  const toggles = document.querySelectorAll('.gender-toggle button');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.gender-toggle');
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const gender = btn.dataset.gender;
      const section = btn.closest('[data-product-section]');
      if (!section) return;

      section.querySelectorAll('.product-card[data-gender]').forEach(card => {
        card.style.display = (!gender || card.dataset.gender === gender) ? '' : 'none';
      });
    });
  });
}

// ===========================
// MOBILE NAV
// ===========================
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
}

// ===========================
// QUICK ADD (minimal stub)
// ===========================
document.addEventListener('click', async e => {
  const btn = e.target.closest('.product-quick-add');
  if (!btn) return;

  const variantId = btn.dataset.variantId;
  if (!variantId) return;

  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    });
    if (!res.ok) throw new Error();
    btn.textContent = '✓';
    updateCartCount();
    setTimeout(() => {
      document.querySelector('.cart-drawer')?.classList.add('open');
      document.querySelector('.cart-drawer-overlay')?.classList.add('open');
    }, 400);
  } catch {
    btn.textContent = '!';
  } finally {
    setTimeout(() => { btn.textContent = '+'; btn.disabled = false; }, 2000);
  }
});

async function updateCartCount() {
  try {
    const res = await fetch('/cart.js');
    const cart = await res.json();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = `(${cart.item_count})`;
    });
  } catch {}
}
