const staticCacheName = 'site-static-v1'
const urlsToCache = [
	'/', 
	'/index.html', 
	'/main.f07b7a5f24ea1dbe9d41.js', 
	'/vendors~main.22ace46747788d1d4db6.js', 
	'/styles.22ace46747788d1d4db6.css',
	'/styles.f07b7a5f24ea1dbe9d41.css',
	'https://fonts.googleapis.com/css?family=Montserrat:300;400;700&display=swap',
	'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCs16Hw0aXpsog.woff2',
	'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCs16Hw5aXo.woff2',
	'material-icons.woff',
	'material-icons.woff2',
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