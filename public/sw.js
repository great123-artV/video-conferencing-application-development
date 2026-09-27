const VERSION = "meetly-shell-v1"
const SHELL = ["/", "/sign-in", "/sign-up", "/manifest.webmanifest", "/icon.svg", "/icon-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/meeting/")) return

  if (url.pathname.startsWith("/_next/static/") || /\.(?:css|js|png|jpg|jpeg|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(VERSION).then((cache) => cache.put(request, copy))
      }
      return response
    })))
    return
  }

  event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("/"))))
})
