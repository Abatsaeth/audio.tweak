/*!
 * coi-serviceworker v0.1.7 — dual-context COOP/COEP injector
 * Enables crossOriginIsolated on GitHub Pages and other static hosts.
 * Based on https://github.com/gzuidhof/coi-serviceworker
 */
(function () {

  /* ── Running as Service Worker ──────────────────────────────── */
  if (typeof window === 'undefined') {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener('fetch', (event) => {
      if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Skip opaque responses
            if (response.status === 0) return response;
            const newHeaders = new Headers(response.headers);
            newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
            newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
            newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders,
            });
          })
          .catch(() => fetch(event.request))
      );
    });

    self.addEventListener('message', (event) => {
      if (event.data === 'deregister') {
        self.registration.unregister().then(() => {
          self.clients.matchAll().then((clients) => {
            clients.forEach((c) => c.navigate(c.url));
          });
        });
      }
    });
    return;
  }

  /* ── Running as Regular Script ────────────────────────────────── */
  if (!('serviceWorker' in navigator)) return;

  // Already isolated — nothing to do
  if (window.crossOriginIsolated !== false) return;

  const swSrc = document.currentScript && document.currentScript.src;
  if (!swSrc) return;

  navigator.serviceWorker.register(swSrc).then(
    (registration) => {
      const sw = registration.installing || registration.waiting || registration.active;
      if (!sw) return;
      if (sw.state === 'activated') {
        // SW was already active — reload to gain isolation
        window.location.reload();
        return;
      }
      sw.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') {
          window.location.reload();
        }
      });
    },
    (err) => console.warn('[coi-sw] Service worker registration failed:', err)
  );

})();
