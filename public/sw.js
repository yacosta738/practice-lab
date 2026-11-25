const CACHE_NAME = "practice-lab-v1";
const APP_SCOPE = new URL(self.registration.scope);
const OFFLINE_URL = new URL("./", self.location.href).href;

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.add(OFFLINE_URL))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter(
							(cacheName) => cacheName.startsWith("practice-lab-") && cacheName !== CACHE_NAME,
						)
						.map((cacheName) => caches.delete(cacheName)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const requestUrl = new URL(request.url);

	if (
		request.method !== "GET" ||
		requestUrl.origin !== APP_SCOPE.origin ||
		!requestUrl.pathname.startsWith(APP_SCOPE.pathname)
	)
		return;

	event.respondWith(
		(async () => {
			try {
				const response = await fetch(request);
				if (response.ok && response.type === "basic") {
					const cache = await caches.open(CACHE_NAME);
					await cache.put(request, response.clone()).catch(() => undefined);
				}
				return response;
			} catch {
				const cachedResponse = await caches.match(request);
				if (cachedResponse) return cachedResponse;

				if (request.mode === "navigate") {
					const offlinePage = await caches.match(OFFLINE_URL);
					if (offlinePage) return offlinePage;
				}

				return Response.error();
			}
		})(),
	);
});
