const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function formatPrice(value) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const cart = getCart();
  cart.push(productId);
  setCart(cart);
  alert("Ürün sepete eklendi.");
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="price">${formatPrice(product.price)}</div>
        <button class="btn" onclick="addToCart(${product.id})">Sepete Ekle</button>
      </div>
    </article>
  `;
}

function renderHomeProducts() {
  const featured = $("#featuredProducts");
  if (!featured || typeof PRODUCTS === "undefined") return;
  featured.innerHTML = PRODUCTS.slice(0, 4).map(productCard).join("");
}

function renderAllProducts() {
  const container = $("#allProducts");
  if (!container || typeof PRODUCTS === "undefined") return;

  const sortSelect = $("#sortSelect");
  const draw = (list) => {
    container.innerHTML = list.map(productCard).join("");
  };

  draw(PRODUCTS);

  sortSelect?.addEventListener("change", (e) => {
    const type = e.target.value;
    const cloned = [...PRODUCTS];
    if (type === "priceAsc") cloned.sort((a, b) => a.price - b.price);
    if (type === "priceDesc") cloned.sort((a, b) => b.price - a.price);
    draw(cloned);
  });
}

function renderCart() {
  const container = $("#cartContainer");
  const totalEl = $("#cartTotal");
  if (!container || !totalEl || typeof PRODUCTS === "undefined") return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = "<p>Sepetiniz boş. <a href='product.html'>Alışverişe başlayın</a>.</p>";
    totalEl.textContent = formatPrice(0);
    return;
  }

  const grouped = cart.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const lines = Object.entries(grouped).map(([id, qty]) => {
    const p = PRODUCTS.find((item) => item.id === Number(id));
    if (!p) return "";
    return `
      <div class="cart-item">
        <strong>${p.name}</strong>
        <span>${qty} adet</span>
        <span>${formatPrice(p.price * qty)}</span>
      </div>
    `;
  }).join("");

  const total = Object.entries(grouped).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((item) => item.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  container.innerHTML = lines;
  totalEl.textContent = formatPrice(total);
}

function initMenu() {
  const toggle = $(".menu-toggle");
  const nav = $(".nav-links");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

function initForms() {
  $("#loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Giriş başarılı (demo). Hoş geldiniz!");
  });

  $("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Mesajınız alındı. En kısa sürede dönüş yapacağız.");
    e.target.reset();
  });

  $("#checkoutBtn")?.addEventListener("click", () => {
    alert("Demo sürümde ödeme ekranı simüle edilmiştir.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  renderHomeProducts();
  renderAllProducts();
  renderCart();
  initForms();
});
