const swVersion = 1.0;
const appName = 'gradr';
const appCache = `${appName}-static-v${swVersion}`;
const allCaches = [appCache];

const staticAssets = [];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(appCache).then(cache => {
      return cache.addAll(staticAssets);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(
            cacheName =>
              cacheName.startsWith(appName) && !allCaches.includes(cacheName)
          )
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

const fetchResource = async (event, opts = {}) => {
    const response = await fetch(event.request);
    
    if(!opts.nocache) {
        const cache = await caches.open(appCache);
        cache.put(event.request, response.clone());
    }

    if(opts.notifyApp === true) {
        console.log(`response from ${event.request.url} is back!`, response);
    }

    return response;
};

self.addEventListener('fetch', event => {

    const requestUrl = new URL(event.request.url);
    if (requestUrl.hostname === 'randomapi.com') {
        event.respondWith(fetchResource(event, {notifyApp: true, nocache: true}));
        return;
    }

    event.respondWith(
      caches
        .match(event.request)
        .then(cached => cached || fetchResource(event))
    );
  });
