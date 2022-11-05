const staticCacheName = 'site-static-v1'
const urlsToCache = [
	'/', 
	'/index.html', 
	'/main.7b71bd74cd7603de3974.js', 
	'/vendors~main.55bd848a3d4270621187.js', 
	'/styles.7b71bd74cd7603de3974.css',
	'https://fonts.googleapis.com/css?family=Montserrat:300;400;700&display=swap',
	'/manifest.json'
	]
// install service worker
self.addEventListener('install', e =>{
	e.waitUntil(caches.open(staticCacheName).then(cache => {
		console.log('Caching shell assets ...')
		cache.addAll(urlsToCache)
	}))
})

// activate service worker
self.addEventListener('activate', e =>{
	e.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(keys.filter(key => key !== staticCacheName).map(key => caches.delete(key)))
		})
	)
})

self.addEventListener('fetch', e =>{
	e.respondWith(
		caches.match(e.request)
			.then(cacheRes => {
				return cacheRes || fetch(e.request)
			})
			.catch(() => {
				if(!e.request.url.endsWith('.json')){
					return caches.match('/')
				}
			})
	)
})