# VOLTEX — Магазин ноутбуков

**Практическое занятие №13 — Service Worker + Офлайн-доступ**

## Описание

Веб-приложение — магазин ноутбуков с поддержкой работы в оффлайн-режиме через Service Worker.

## Функциональность

- 🛍️ **Каталог** — 12 ноутбуков с фильтрами по категориям и поиском
- 🛒 **Корзина** — добавление/удаление товаров, изменение количества
- 💾 **Сохранение** — корзина сохраняется в `localStorage`
- 📡 **Оффлайн** — Service Worker кэширует все ресурсы

## Структура проекта

```
laptop-store/
├── index.html      # Разметка + стили
├── app.js          # Логика каталога, корзины, SW-регистрация
├── sw.js           # Service Worker (стратегия Cache First)
├── manifest.json   # Web App Manifest
└── README.md
```

## Service Worker

Реализована стратегия **Cache First**:
1. При установке (`install`) — кэшируем `index.html`, `app.js`, `manifest.json`
2. При каждом запросе (`fetch`) — сначала ищем в кэше, потом в сети
3. Новые ресурсы автоматически добавляются в кэш
4. При активации (`activate`) — удаляем устаревшие кэши

## Код сохраниения в LocalStorage

```bash
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
```

## Запуск

```bash
# Через http-server (npm install -g http-server)
http-server . -p 3000

# Открыть: http://localhost:3000
```

> ⚠️ Service Worker работает только при запуске через HTTP-сервер (не через `file://`)

<img width="1897" height="931" alt="image" src="https://github.com/user-attachments/assets/0fec8e22-2831-4646-854e-37d48d87b166" />
<img width="1805" height="918" alt="image" src="https://github.com/user-attachments/assets/ff77c150-e10d-4e27-bddc-3c56eea7426c" />
<img width="1852" height="929" alt="image" src="https://github.com/user-attachments/assets/aa095f70-aa22-4f75-9a64-3a31892e4b1e" />
