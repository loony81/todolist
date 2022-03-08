const staticCacheName = 'site-static-v1'
const urlsToCache = [
	'/', 
	'/index.html', 
	'/main.2c7637e8b20351ba148a.js', 
	'/vendors~main.6d5321426aed366ff64c.js', 
	'/styles.2c7637e8b20351ba148a.css',
	'https://fonts.googleapis.com/css?family=Montserrat:300;400;700&display=swap'
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