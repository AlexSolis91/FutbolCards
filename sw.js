// Service worker de Futbol Cards: permite instalar el juego como app y abrirlo
// aunque falle la conexión.
// - Código (html, css, js): primero la red (así siempre llega la última
//   versión publicada) y, si no hay conexión, la copia guardada. Se salta la
//   caché HTTP (GitHub Pages guarda 10 min) para no mezclar archivos viejos y nuevos.
// - Imágenes y fuentes: primero la copia guardada (cargan al instante).
// - Música: siempre de la red (los mp3 se piden por partes y no conviene guardarlos).
// Subir VERSION cuando cambie la lista de archivos base o cuando se reemplace
// o renombre una foto existente (las imágenes se sirven desde la caché).

const VERSION = 'fc-v5';
const BASE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/estilos.css',
  './assets/fondos/lobby.webp',
  './assets/iconos/icono-192.png',
  './assets/iconos/icono-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function primeroRed(peticion) {
  const cache = await caches.open(VERSION);
  try {
    const resp = await fetch(peticion, { cache: 'no-cache' });
    if (resp.ok) cache.put(peticion, resp.clone());
    return resp;
  } catch (err) {
    const guardada = await cache.match(peticion, { ignoreSearch: true });
    if (guardada) return guardada;
    if (peticion.mode === 'navigate') return cache.match('./index.html');
    throw err;
  }
}

async function primeroCache(peticion) {
  const url = new URL(peticion.url);
  const cache = await caches.open(VERSION);
  const guardada = await cache.match(peticion);
  if (guardada) return guardada;
  // Al bajarla por primera vez, sin usar la caché HTTP (podría ser una foto vieja).
  const resp = await fetch(peticion, url.origin === self.location.origin ? { cache: 'no-cache' } : undefined);
  if (resp.ok || resp.type === 'opaque') cache.put(peticion, resp.clone());
  return resp;
}

self.addEventListener('fetch', (e) => {
  const peticion = e.request;
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);
  if (url.pathname.endsWith('.mp3') || peticion.headers.has('range')) return; // música: red
  const esFuente = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const esImagen = /\.(webp|png|jpg|jpeg|svg|woff2?)$/i.test(url.pathname);
  if (esFuente || (url.origin === self.location.origin && esImagen)) {
    e.respondWith(primeroCache(peticion));
  } else if (url.origin === self.location.origin) {
    e.respondWith(primeroRed(peticion));
  }
});
