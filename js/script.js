// ==========================================================
// GHALIB RESTAURANT — SITE SCRIPTS
// Shared across index.html, menu.html and order.html.
// Every block checks that its elements exist before running,
// since not every page has a reservation form, gallery, or cart.
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('loaded'), 300);
    });
    if (document.readyState === 'complete') {
      setTimeout(() => preloader.classList.add('loaded'), 300);
    }
  }

  /* ---------- Navbar scroll state + scroll progress + back-to-top ---------- */
  const nav = document.getElementById('mainNav');
  const scrollBar = document.getElementById('scrollBar');
  const backBtn = document.getElementById('backToTop');

  const onScroll = () => {
    const scrollTop = window.scrollY;

    if (nav) {
      if (scrollTop > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }

    if (scrollBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollBar.style.width = pct + '%';
    }

    if (backBtn) {
      if (scrollTop > 500) backBtn.classList.add('show');
      else backBtn.classList.remove('show');
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backBtn) {
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Collapse mobile nav on link click ---------- */
  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    document.querySelectorAll('#navMenu .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('show') && typeof bootstrap !== 'undefined') {
          bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
        }
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Gallery lightbox (index.html only) ---------- */
  const lightbox = document.getElementById('lightbox');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (lightbox && galleryItems.length) {
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        lightboxImg.src = item.dataset.full;
        lightboxImg.alt = item.dataset.caption || '';
        lightboxCaption.textContent = item.dataset.caption || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };
    const closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ---------- Reservation form (index.html only) ---------- */
  const form = document.getElementById('reserveForm');
  const successBox = document.getElementById('formSuccess');

  if (form && successBox) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const name = document.getElementById('fName').value.trim() || 'friend';
      const payload = {
        name,
        phone: document.getElementById('fPhone').value.trim(),
        email: document.getElementById('fEmail').value.trim(),
        date: document.getElementById('fDate').value,
        time: document.getElementById('fTime').value,
        guests: document.getElementById('fGuests').value,
        note: document.getElementById('fNote').value.trim()
      };

      try {
        // Sends the reservation to the PHP backend, which inserts it into
        // MySQL (see backend/save-reservation.php and the admin dashboard).
        const response = await fetch('backend/save-reservation.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) console.error('Reservation save failed:', result.message);
      } catch (err) {
        console.warn('Could not reach backend/save-reservation.php:', err.message);
      }

      document.getElementById('successName').textContent = name;
      form.classList.add('d-none');
      successBox.classList.remove('d-none');
    });

    const dateInput = document.getElementById('fDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
  }

  /* ---------- Footer year (every page) ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ======================================================
     CART / ORDER ONLINE  (order.html only)
     Stored in localStorage under "ghalib_cart" as an array
     of { name, price, qty }. Final orders are POSTed to
     backend/save-order.php, which inserts them into MySQL —
     see the admin dashboard to view placed orders.
     ====================================================== */
  const CART_KEY = 'ghalib_cart';
  const DELIVERY_FEE = 100;

  const getCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  };
  const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const formatRs = (n) => 'Rs. ' + n.toLocaleString('en-PK');

  const cartItemsBox = document.getElementById('cartItems');
  const cartCountBadge = document.getElementById('cartCount');

  // Cart badge (count) can appear even on pages without the full drawer,
  // so update it independently whenever the elements exist.
  function updateCartBadge() {
    if (!cartCountBadge) return;
    const cart = getCart();
    cartCountBadge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
  }
  updateCartBadge();

  if (cartItemsBox) {
    const emptyBox = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');

    function renderCart() {
      const cart = getCart();
      updateCartBadge();

      if (cart.length === 0) {
        cartItemsBox.innerHTML = '';
        if (emptyBox) emptyBox.style.display = 'flex';
        if (cartFooter) cartFooter.classList.add('d-none');
        return;
      }

      if (emptyBox) emptyBox.style.display = 'none';
      if (cartFooter) cartFooter.classList.remove('d-none');

      cartItemsBox.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <h6>${item.name}</h6>
            <span>${formatRs(item.price)} each</span>
          </div>
          <div class="cart-qty">
            <button type="button" data-action="dec" data-idx="${idx}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button type="button" data-action="inc" data-idx="${idx}" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="cart-remove" data-action="remove" data-idx="${idx}" aria-label="Remove item">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join('');

      const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
      const total = subtotal + (subtotal > 0 ? DELIVERY_FEE : 0);
      const subtotalEl = document.getElementById('cartSubtotal');
      const deliveryEl = document.getElementById('cartDelivery');
      const totalEl = document.getElementById('cartTotal');
      if (subtotalEl) subtotalEl.textContent = formatRs(subtotal);
      if (deliveryEl) deliveryEl.textContent = formatRs(DELIVERY_FEE);
      if (totalEl) totalEl.textContent = formatRs(total);
    }

    function addToCart(name, price) {
      const cart = getCart();
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty += 1;
      else cart.push({ name, price, qty: 1 });
      saveCart(cart);
      renderCart();
    }

    // Add-to-cart buttons on the order page's menu
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        addToCart(name, price);

        const original = btn.innerHTML;
        btn.classList.add('added');
        btn.innerHTML = 'Added <i class="fa-solid fa-check"></i>';
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = original;
        }, 1100);
      });
    });

    // Cart item qty/remove controls (event delegation)
    cartItemsBox.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      const cart = getCart();
      if (!cart[idx]) return;

      if (btn.dataset.action === 'inc') cart[idx].qty += 1;
      if (btn.dataset.action === 'dec') {
        cart[idx].qty -= 1;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      if (btn.dataset.action === 'remove') cart.splice(idx, 1);

      saveCart(cart);
      renderCart();
    });

    renderCart();

    /* ---------- Checkout form ---------- */
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutSuccess = document.getElementById('checkoutSuccess');

    if (checkoutForm && checkoutSuccess) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!checkoutForm.checkValidity()) {
          checkoutForm.classList.add('was-validated');
          return;
        }

        const cart = getCart();
        if (cart.length === 0) return;

        const name = document.getElementById('coName').value.trim();
        const phone = document.getElementById('coPhone').value.trim();
        const address = document.getElementById('coAddress').value.trim();
        const payment = document.querySelector('input[name="payment"]:checked').value;
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        const total = subtotal + DELIVERY_FEE;
        const orderId = 'GH-' + Date.now().toString().slice(-6);

        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Placing Order…';

        try {
          // Sends the order to the PHP backend, which inserts it into MySQL
          // (see backend/save-order.php and the admin dashboard to view it).
          const response = await fetch('backend/save-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId, name, phone, address, payment,
              cart, subtotal, deliveryFee: DELIVERY_FEE, total
            })
          });
          const result = await response.json();
          if (!result.success) console.error('Order save failed:', result.message);
        } catch (err) {
          console.warn('Could not reach backend/save-order.php:', err.message);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        document.getElementById('orderName').textContent = name;
        document.getElementById('orderId').textContent = orderId;

        checkoutForm.classList.add('d-none');
        checkoutSuccess.classList.remove('d-none');

        saveCart([]);
        renderCart();
      });

      const checkoutModalEl = document.getElementById('checkoutModal');
      if (checkoutModalEl) {
        checkoutModalEl.addEventListener('hidden.bs.modal', () => {
          checkoutForm.reset();
          checkoutForm.classList.remove('was-validated', 'd-none');
          checkoutSuccess.classList.add('d-none');
        });
      }
    }
  }

});
