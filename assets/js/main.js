(function () {
  const CART_KEY = "eticaret_cart_v1";
  const currency = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  });

  const products = Array.isArray(window.SHOP_PRODUCTS) ? window.SHOP_PRODUCTS : [];

  const byId = (id) => document.getElementById(id);
  const qsa = (selector) => Array.from(document.querySelectorAll(selector));

  const getCart = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const setCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
  };

  const findProduct = (productId) => products.find((item) => item.id === Number(productId));

  const cartDetailed = () =>
    getCart()
      .map((item) => {
        const product = findProduct(item.id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean);

  const updateCartCount = () => {
    const count = getCart().reduce((acc, item) => acc + item.qty, 0);
    qsa("[data-cart-count]").forEach((el) => {
      el.textContent = count;
    });
  };

  const addToCart = (productId, qty = 1) => {
    const current = getCart();
    const existing = current.find((item) => item.id === Number(productId));

    if (existing) {
      existing.qty += qty;
    } else {
      current.push({ id: Number(productId), qty });
    }

    setCart(current);
  };

  const removeFromCart = (productId) => {
    const current = getCart().filter((item) => item.id !== Number(productId));
    setCart(current);
  };

  const updateQuantity = (productId, delta) => {
    const current = getCart();
    const target = current.find((item) => item.id === Number(productId));
    if (!target) return;

    target.qty += delta;
    if (target.qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(current);
  };

  const productCardTemplate = (product) => `
    <article class="card">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-content">
        <p class="small">${product.category}</p>
        <h3 class="product-title">${product.name}</h3>
        <p class="small">${product.description}</p>
        <div class="product-meta">
          <span>⭐ ${product.rating}</span>
          <span class="price">${currency.format(product.price)}</span>
        </div>
        <button class="btn btn-primary" data-add-to-cart="${product.id}">Sepete Ekle</button>
      </div>
    </article>
  `;

  const renderFeatured = () => {
    const container = byId("featured-products");
    if (!container) return;

    const featured = products.slice(0, 4).map(productCardTemplate).join("");
    container.innerHTML = featured;
  };

  const renderProductsPage = () => {
    const grid = byId("products-grid");
    if (!grid) return;

    const searchInput = byId("product-search");
    const categoryFilter = byId("category-filter");
    const sortSelect = byId("sort-products");

    const categories = ["Tümü", ...new Set(products.map((item) => item.category))];
    categoryFilter.innerHTML = categories
      .map((category) => `<option value="${category}">${category}</option>`)
      .join("");

    const render = () => {
      const search = (searchInput.value || "").trim().toLowerCase();
      const category = categoryFilter.value;
      const sort = sortSelect.value;

      let list = [...products].filter((product) => {
        const matchSearch = `${product.name} ${product.description}`.toLowerCase().includes(search);
        const matchCategory = category === "Tümü" || product.category === category;
        return matchSearch && matchCategory;
      });

      if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
      if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

      grid.innerHTML = list.length
        ? list.map(productCardTemplate).join("")
        : '<div class="notice">Aradığınız kriterlerde ürün bulunamadı.</div>';
    };

    [searchInput, categoryFilter, sortSelect].forEach((el) => {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    render();
  };

  const renderCartPage = () => {
    const cartItems = byId("cart-items");
    const summary = byId("cart-summary");

    if (!cartItems || !summary) return;

    const render = () => {
      const entries = cartDetailed();

      if (!entries.length) {
        cartItems.innerHTML = '<div class="notice">Sepetiniz şu an boş. Ürün sayfasından ürün ekleyin.</div>';
        summary.innerHTML = `
          <h3>Sepet Özeti</h3>
          <p class="small">Ara Toplam: ${currency.format(0)}</p>
          <p class="small">Kargo: ${currency.format(0)}</p>
          <hr />
          <p><strong>Genel Toplam: ${currency.format(0)}</strong></p>
          <a href="product.html" class="btn btn-primary">Alışverişe Başla</a>
        `;
        return;
      }

      const subtotal = entries.reduce((acc, item) => acc + item.qty * item.product.price, 0);
      const shipping = subtotal >= 3000 ? 0 : 99;
      const total = subtotal + shipping;

      cartItems.innerHTML = entries
        .map(
          (item) => `
            <article class="cart-item">
              <img src="${item.product.image}" alt="${item.product.name}" />
              <div>
                <h4 style="margin: 0 0 6px;">${item.product.name}</h4>
                <p class="small" style="margin: 0 0 8px;">${item.product.category}</p>
                <div class="quantity-box">
                  <button class="qty-btn" data-action="dec" data-id="${item.product.id}">-</button>
                  <span>${item.qty}</span>
                  <button class="qty-btn" data-action="inc" data-id="${item.product.id}">+</button>
                </div>
              </div>
              <div>
                <p class="price" style="margin: 0 0 8px;">${currency.format(item.product.price * item.qty)}</p>
                <button class="btn btn-outline" data-action="remove" data-id="${item.product.id}">Kaldır</button>
              </div>
            </article>
          `
        )
        .join("");

      summary.innerHTML = `
        <h3>Sepet Özeti</h3>
        <p class="small">Ara Toplam: ${currency.format(subtotal)}</p>
        <p class="small">Kargo: ${currency.format(shipping)}</p>
        <hr />
        <p><strong>Genel Toplam: ${currency.format(total)}</strong></p>
        <button class="btn btn-primary" id="checkout-btn">Ödemeye Geç</button>
      `;

      const checkoutBtn = byId("checkout-btn");
      checkoutBtn?.addEventListener("click", () => {
        alert("Demo sürümde ödeme altyapısı yoktur. Siparişiniz simüle edildi.");
      });
    };

    cartItems.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const id = Number(button.dataset.id);
      const action = button.dataset.action;

      if (action === "inc") updateQuantity(id, 1);
      if (action === "dec") updateQuantity(id, -1);
      if (action === "remove") removeFromCart(id);
      render();
    });

    render();
  };

  const setupForms = () => {
    const loginForm = byId("login-form");
    const loginMessage = byId("login-message");

    loginForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = byId("login-email").value.trim();
      const password = byId("login-password").value.trim();

      if (!email || !password || !email.includes("@")) {
        loginMessage.textContent = "Lütfen geçerli e-posta ve şifre girin.";
        loginMessage.className = "message error";
        return;
      }

      loginMessage.textContent = "Giriş başarılı! Demo hesabınız açıldı.";
      loginMessage.className = "message";
      loginForm.reset();
    });

    const contactForm = byId("contact-form");
    const contactMessage = byId("contact-message");

    contactForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      contactMessage.textContent = "Mesajınız alındı. 24 saat içinde dönüş yapacağız.";
      contactMessage.className = "message";
      contactForm.reset();
    });

    const newsletterForm = byId("newsletter-form");
    const newsletterMessage = byId("newsletter-message");

    newsletterForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      newsletterMessage.textContent = "Bülten aboneliğiniz tamamlandı.";
      newsletterMessage.className = "message";
      newsletterForm.reset();
    });
  };

  const setupNavigation = () => {
    const toggle = byId("nav-toggle");
    const links = byId("nav-links");

    toggle?.addEventListener("click", () => links?.classList.toggle("open"));

    const current = location.pathname.split("/").pop() || "index.html";
    qsa("[data-nav-link]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.endsWith(current)) {
        link.classList.add("active");
      }
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) return;

    const productId = Number(button.dataset.addToCart);
    addToCart(productId, 1);
    button.textContent = "Eklendi ✓";
    setTimeout(() => {
      button.textContent = "Sepete Ekle";
    }, 900);
  });

  qsa("[data-current-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  updateCartCount();
  setupNavigation();
  setupForms();
  renderFeatured();
  renderProductsPage();
  renderCartPage();
})();
