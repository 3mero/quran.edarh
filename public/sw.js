const CACHE_NAME = "quran-app-v2"
const STATIC_CACHE = "static-v2"
const DYNAMIC_CACHE = "dynamic-v2"

// الملفات الأساسية التي يجب تخزينها مسبقاً
const STATIC_ASSETS = [
  "/",
  "/search",
  "/share",
  "/manage",
  "/settings",
  "/quran-icon.png",
  "/manifest.json",
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
]

// الملفات التي لا يجب تخزينها
const EXCLUDE_URLS = ["/api/", "chrome-extension://", "moz-extension://", "safari-extension://", ".hot-update."]

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  console.log("SW: Installing...")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("SW: Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// تنشيط Service Worker وحذف الكاش القديم
self.addEventListener("activate", (event) => {
  console.log("SW: Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("SW: Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// التحقق من استبعاد الرابط
function shouldExclude(url) {
  return EXCLUDE_URLS.some((excludeUrl) => url.includes(excludeUrl))
}

// استراتيجية Cache First للملفات الثابتة
function cacheFirst(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      console.log("SW: Serving from cache:", request.url)
      return cachedResponse
    }

    return fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone()
        caches.open(STATIC_CACHE).then((cache) => {
          console.log("SW: Caching static file:", request.url)
          cache.put(request, responseClone)
        })
      }
      return networkResponse
    })
  })
}

// استراتيجية Network First للصفحات الديناميكية
function networkFirst(request) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          console.log("SW: Caching dynamic content:", request.url)
          cache.put(request, responseClone)
        })
      }
      return networkResponse
    })
    .catch(() => {
      console.log("SW: Network failed, trying cache:", request.url)
      return caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("SW: Serving from cache (offline):", request.url)
          return cachedResponse
        }

        // إذا لم توجد الصفحة في الكاش، إرجاع صفحة offline
        if (request.destination === "document") {
          return caches.match("/").then((fallback) => {
            return (
              fallback ||
              new Response("الصفحة غير متاحة بدون اتصال", {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "text/html; charset=utf-8" },
              })
            )
          })
        }

        return new Response("المحتوى غير متاح", {
          status: 503,
          statusText: "Service Unavailable",
        })
      })
    })
}

// معالجة طلبات الشبكة
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // تجاهل الطلبات المستبعدة
  if (shouldExclude(request.url)) {
    return
  }

  // تجاهل طلبات غير HTTP/HTTPS
  if (!request.url.startsWith("http")) {
    return
  }

  event.respondWith(
    (async () => {
      try {
        // للملفات الثابتة (CSS, JS, الصور)
        if (
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "image" ||
          request.url.includes("/_next/static/") ||
          request.url.includes("/quran-icon.png") ||
          request.url.includes("/manifest.json")
        ) {
          return cacheFirst(request)
        }

        // للصفحات HTML
        if (request.destination === "document" || request.headers.get("accept")?.includes("text/html")) {
          return networkFirst(request)
        }

        // للطلبات الأخرى
        return networkFirst(request)
      } catch (error) {
        console.error("SW: Error handling request:", error)
        return caches.match(request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response("خطأ في الخدمة", {
              status: 500,
              statusText: "Internal Server Error",
            })
          )
        })
      }
    })(),
  )
})

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_CACHE_SIZE") {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ type: "CACHE_SIZE", size })
    })
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ type: "CACHE_CLEARED" })
    })
  }
})

// حساب حجم الكاش
async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()

    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    }
  }

  return totalSize
}

// مسح جميع الكاش
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  console.log("SW: All caches cleared")
}

// إشعار عند توفر تحديث جديد
self.addEventListener("updatefound", () => {
  console.log("SW: Update found!")
})
