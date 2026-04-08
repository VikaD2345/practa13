// ============================================================
// VOLTEX — Магазин ноутбуков
// Практическое занятие №13 — Service Worker + Офлайн доступ
// ============================================================

// --- Данные ---
const PRODUCTS = [
  {
    id: 1,
    brand: 'Apple',
    name: 'MacBook Pro 14" M3 Pro',
    price: 249900,
    oldPrice: null,
    badge: 'TOP',
    emoji: '💻',
    specs: ['M3 Pro', '18 GB RAM', '512 GB SSD', '14.2"'],
    category: 'apple',
  },
  {
    id: 2,
    brand: 'Apple',
    name: 'MacBook Air 15" M3',
    price: 179900,
    oldPrice: 199900,
    badge: 'SALE',
    emoji: '🖥️',
    specs: ['M3', '16 GB RAM', '256 GB SSD', '15.3"'],
    category: 'apple',
  },
  {
    id: 3,
    brand: 'ASUS',
    name: 'ROG Zephyrus G16',
    price: 189900,
    oldPrice: null,
    badge: 'NEW',
    emoji: '🎮',
    specs: ['RTX 4080', 'i9-14900H', '32 GB RAM', '16"'],
    category: 'gaming',
  },
  {
    id: 4,
    brand: 'Lenovo',
    name: 'ThinkPad X1 Carbon Gen 12',
    price: 159900,
    oldPrice: null,
    badge: null,
    emoji: '⌨️',
    specs: ['Ultra 7 165U', '32 GB RAM', '1 TB SSD', '14"'],
    category: 'business',
  },
  {
    id: 5,
    brand: 'MSI',
    name: 'Titan GT77 HX',
    price: 349900,
    oldPrice: 399900,
    badge: 'SALE',
    emoji: '🔥',
    specs: ['RTX 4090', 'i9-13980HX', '64 GB RAM', '17.3"'],
    category: 'gaming',
  },
  {
    id: 6,
    brand: 'Dell',
    name: 'XPS 15 OLED',
    price: 219900,
    oldPrice: null,
    badge: null,
    emoji: '✨',
    specs: ['RTX 4060', 'i7-13700H', '32 GB RAM', '15.6" OLED'],
    category: 'creative',
  },
  {
    id: 7,
    brand: 'Samsung',
    name: 'Galaxy Book4 Pro',
    price: 134900,
    oldPrice: 149900,
    badge: 'SALE',
    emoji: '📱',
    specs: ['Ultra 7 155H', '16 GB RAM', '512 GB SSD', '16"'],
    category: 'business',
  },
  {
    id: 8,
    brand: 'ASUS',
    name: 'ProArt Studiobook 16',
    price: 279900,
    oldPrice: null,
    badge: 'NEW',
    emoji: '🎨',
    specs: ['RTX 4070', 'i9-13980HX', '32 GB RAM', '16" OLED'],
    category: 'creative',
  },
  {
    id: 9,
    brand: 'HP',
    name: 'Spectre x360 14',
    price: 124900,
    oldPrice: null,
    badge: null,
    emoji: '💎',
    specs: ['Ultra 5 125H', '16 GB RAM', '512 GB SSD', '14"'],
    category: 'business',
  },
  {
    id: 10,
    brand: 'Razer',
    name: 'Blade 16 2024',
    price: 319900,
    oldPrice: 349900,
    badge: 'SALE',
    emoji: '🐍',
    specs: ['RTX 4080', 'i9-14900HX', '32 GB RAM', '16" MiniLED'],
    category: 'gaming',
  },
  {
    id: 11,
    brand: 'Xiaomi',
    name: 'Book Pro 16 2024',
    price: 89900,
    oldPrice: null,
    badge: 'NEW',
    emoji: '🚀',
    specs: ['Ultra 5 125H', '16 GB RAM', '1 TB SSD', '16"'],
    category: 'budget',
  },
  {
    id: 12,
    brand: 'Acer',
    name: 'Predator Helios 18',
    price: 199900,
    oldPrice: 229900,
    badge: 'SALE',
    emoji: '⚔️',
    specs: ['RTX 4070 Ti', 'i9-13900HX', '32 GB RAM', '18"'],
    category: 'gaming',
  },
];

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'gaming', label: 'Игровые' },
  { id: 'apple', label: 'Apple' },
  { id: 'business', label: 'Бизнес' },
  { id: 'creative', label: 'Творчество' },
  { id: 'budget', label: 'Бюджет' },
];

// --- Состояние ---
let cart = JSON.parse(localStorage.getItem('voltex-cart') || '[]');
let activeFilter = 'all';
let searchQuery = '';
let currentSection = 'catalog';

// --- Утилиты ---
function formatPrice(p) {
  return p.toLocaleString('ru-RU') + ' ₽';
}

function saveCart() {
  localStorage.setItem('voltex-cart', JSON.stringify(cart));
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// --- Корзина ---
function getCartCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  renderCart();
  showToast(`${product.name} добавлен в корзину`);

  // Подсветить кнопку
  const btn = document.querySelector(`[data-add="${id}"]`);
  if (btn) {
    btn.textContent = '✓ ДОБАВЛЕН';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ В КОРЗИНУ';
      btn.classList.remove('added');
    }, 1500);
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else {
    saveCart();
    updateCartBadge();
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🛒</span>
        Корзина пуста.<br>Добавьте ноутбук!
      </div>`;
    footer.style.display = 'none';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return '';
    const subtotal = p.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <div class="cart-item-icon">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
            <button class="remove-item" onclick="removeFromCart(${p.id})">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');

  totalEl.textContent = formatPrice(total);
  footer.style.display = 'block';
}

function toggleCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('show');
}

function checkout() {
  cart = [];
  saveCart();
  updateCartBadge();
  renderCart();
  toggleCart();
  showToast('🎉 Заказ оформлен! Спасибо за покупку.');
}

// --- Каталог ---
function getFiltered() {
  let list = PRODUCTS;
  if (activeFilter !== 'all') list = list.filter(p => p.category === activeFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.specs.some(s => s.toLowerCase().includes(q))
    );
  }
  return list;
}

function renderCatalog() {
  const filtered = getFiltered();
  const content = document.getElementById('main-content');

  const cardsHTML = filtered.length === 0
    ? `<div class="no-results"><span class="no-icon">🔍</span>Ничего не найдено.<br>Попробуйте другой запрос.</div>`
    : `<div class="products-grid">${filtered.map((p, i) => renderCard(p, i)).join('')}</div>`;

  content.innerHTML = `
    <div class="hero">
      <div class="hero-tag">⚡ Лучшие ноутбуки 2024</div>
      <h1>Мощь в каждом<br>пикселе</h1>
      <p>Профессиональные, игровые и ультрапортативные ноутбуки с гарантией и быстрой доставкой</p>
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Искать по названию, бренду, характеристикам..." 
               value="${searchQuery}"
               oninput="onSearch(this.value)"
               autocomplete="off">
      </div>
    </div>

    <div class="section-title">Категории</div>
    <div class="filters">
      ${FILTERS.map(f => `
        <button class="filter-chip ${activeFilter === f.id ? 'active' : ''}"
                onclick="setFilter('${f.id}')">
          ${f.label}
        </button>`).join('')}
    </div>

    <div class="section-title">Каталог — ${filtered.length} товар${ending(filtered.length)}</div>
    ${cardsHTML}
  `;
}

function ending(n) {
  if (n % 100 >= 11 && n % 100 <= 14) return 'ов';
  const r = n % 10;
  if (r === 1) return '';
  if (r >= 2 && r <= 4) return 'а';
  return 'ов';
}

function renderCard(p, i) {
  const badgeClass = p.badge === 'SALE' ? 'sale' : p.badge === 'NEW' ? 'new' : '';
  return `
    <div class="product-card" style="animation-delay:${i * 0.05}s">
      <div class="card-img">
        ${p.badge ? `<div class="card-badge ${badgeClass}">${p.badge}</div>` : ''}
        ${p.emoji}
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-specs">
          ${p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
        <div class="card-footer">
          <div>
            <span class="price">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="btn-add" data-add="${p.id}" onclick="addToCart(${p.id})">+ В КОРЗИНУ</button>
        </div>
      </div>
    </div>`;
}

function setFilter(id) {
  activeFilter = id;
  renderCatalog();
}

function onSearch(val) {
  searchQuery = val;
  renderCatalog();
}

// --- Разделы ---
function showSection(name) {
  currentSection = name;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  if (name === 'catalog') {
    renderCatalog();
  } else if (name === 'about') {
    renderAbout();
  }
}

function renderAbout() {
  document.getElementById('main-content').innerHTML = `
    <div style="max-width:720px; margin: 4rem auto; animation: fadeUp 0.5s ease;">
      <div class="hero-tag">О КОМПАНИИ</div>
      <h2 style="font-family:'Syne',sans-serif; font-size:2.5rem; font-weight:800; margin:1.5rem 0; 
                 background:linear-gradient(135deg,#fff,rgba(0,229,255,0.8)); 
                 -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
        VOLTEX — ваш<br>эксперт по технике
      </h2>
      <p style="color:var(--muted); line-height:1.9; margin-bottom:1.5rem; font-size:0.9rem;">
        Мы основаны в 2019 году командой энтузиастов, которые устали от скучных магазинов с плохими консультантами. 
        VOLTEX — это другой подход: только актуальные модели, честные обзоры и поддержка 24/7.
      </p>
      <p style="color:var(--muted); line-height:1.9; margin-bottom:2.5rem; font-size:0.9rem;">
        Более <strong style="color:var(--text)">12 000 довольных клиентов</strong>, официальная гарантия производителя 
        и доставка по всей России за 1–3 дня.
      </p>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem;">
        ${[['⚡','12 000+','Клиентов'],['🛡️','2 года','Гарантия'],['🚀','1-3 дня','Доставка']].map(([i,v,l]) => `
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:1.5rem; text-align:center;">
            <div style="font-size:1.8rem; margin-bottom:0.5rem;">${i}</div>
            <div style="font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:700; color:var(--accent);">${v}</div>
            <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em;">${l}</div>
          </div>`).join('')}
      </div>
      <p style="color:var(--muted); font-size:0.75rem; line-height:1.6; border-top:1px solid var(--border); padding-top:1rem;">
        Это приложение работает оффлайн благодаря <strong style="color:var(--accent)">Service Worker</strong> — 
        каталог и корзина доступны даже без подключения к интернету.
      </p>
    </div>`;
}

// --- Service Worker ---
function updateSWStatus(text, active) {
  document.getElementById('sw-text').textContent = text;
  document.getElementById('sw-dot').classList.toggle('active', active);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      updateSWStatus('SW: АКТИВЕН', true);
      console.log('[VOLTEX] Service Worker зарегистрирован:', reg.scope);
    } catch (err) {
      updateSWStatus('SW: ОШИБКА', false);
      console.error('[VOLTEX] Ошибка регистрации SW:', err);
    }
  });
} else {
  updateSWStatus('SW: НЕ ПОДДЕРЖИВАЕТСЯ', false);
}

// --- Инициализация ---
updateCartBadge();
renderCart();
renderCatalog();
