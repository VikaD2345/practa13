// ============================================================
// VOLTEX — Service Worker
// Практическое занятие №13 — Кэширование ресурсов для офлайн-доступа
// ============================================================

const CACHE_NAME = 'voltex-cache-v1';

// Список ресурсов для предварительного кэширования (App Shell)
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
];

// ——— Установка (install) ———
// Предварительно кэшируем все статические ресурсы
self.addEventListener('install', event => {
  console.log('[SW] Установка...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Кэшируем статику:', ASSETS);
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log('[SW] Установка завершена, активируем сразу');
        return self.skipWaiting(); // Активировать немедленно без ожидания
      })
  );
});

// ——— Активация (activate) ———
// Удаляем устаревшие кэши от предыдущих версий SW
self.addEventListener('activate', event => {
  console.log('[SW] Активация...');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME) // Удаляем все кэши кроме текущего
            .map(key => {
              console.log('[SW] Удаляем устаревший кэш:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Активирован, контролирует страницы');
        return self.clients.claim(); // Контролируем открытые вкладки сразу
      })
  );
});

// ——— Перехват запросов (fetch) ———
// Стратегия: Cache First — сначала кэш, потом сеть
// Это обеспечивает работу оффлайн
self.addEventListener('fetch', event => {
  // Пропускаем запросы к сторонним ресурсам (Google Fonts, CDN)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Ресурс найден в кэше — возвращаем его
          console.log('[SW] Из кэша:', event.request.url);
          return cachedResponse;
        }

        // Ресурса нет в кэше — загружаем из сети и кэшируем
        return fetch(event.request)
          .then(networkResponse => {
            // Кэшируем только успешные GET-ответы
            if (
              networkResponse.ok &&
              event.request.method === 'GET' &&
              !event.request.url.includes('chrome-extension')
            ) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
                console.log('[SW] Закэшировано:', event.request.url);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Сеть недоступна и ресурса нет в кэше
            console.log('[SW] Оффлайн, ресурс недоступен:', event.request.url);
            // Возвращаем главную страницу как fallback для навигации
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
