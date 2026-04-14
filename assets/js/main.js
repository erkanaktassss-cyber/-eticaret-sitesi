const fmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
const CART_KEY = 'lumina_cart';
const USER_KEY = 'lumina_user';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}
function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  setCart(cart);
  alert('Ürün sepete eklendi.');
}
function removeFromCart(productId) {
  setCart(getCart().filter(i => i.id !== productId));
}
function updateCartQty(productId, qty) {
  const cart = getCart().map(i => i.id === productId ? { ...i, qty: Math.max(1, qty) } : i);
  setCart(cart);
}
function findProduct(id) {
  return (window.PRODUCTS || []).find(p => p.id === id);
}
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  badge.textContent = count;
}
function renderProductCard(p) {
  return `
    <article class="card product-card">
      <a href="/pages/product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </a>
      <h3>${p.name}</h3>
      <p class="muted">${p.category}</p>
      <div class="row">
        <span class="price">${fmt.format(p.price)}</span>
        <button class="btn btn-secondary" data-add="${p.id}">Sepete Ekle</button>
      </div>
    </article>
  `;
}

function bindAddButtons(scope = document) {
  scope.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add, 1));
  });
}

function initAuthState() {
  const userName = document.getElementById('userName');
  const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  if (userName) {
    userName.textContent = user ? `Merhaba, ${user.name}` : 'Giriş Yap';
    userName.href = user ? '/pages/account.html' : '/pages/login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initAuthState();
});
