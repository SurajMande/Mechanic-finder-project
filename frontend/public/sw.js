// Service Worker for push notifications
const CACHE_NAME = "mechanic-finder-v1"
const urlsToCache = ["/", "/static/js/bundle.js", "/static/css/main.css", "/favicon.ico"]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})

// Push event
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/view-icon.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/close-icon.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("MechanicFinder", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  } else if (event.action === "close") {
    event.notification.close()
  } else {
    event.waitUntil(clients.openWindow("/"))
  }
})
