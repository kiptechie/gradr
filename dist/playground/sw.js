const swVersion = 1.2;
const appName = 'gradr';
const appCache = `${appName}-static-v${swVersion}`;
const allCaches = [appCache];

let gradrClient;
const staticAssets = [
  '/',
  'index.html',
  'favicon.8747d0eb.png',
  'apps.0a697ba6.svg',
  'phone-chrome.40401697.png',
  'main.ce2de5da.css',
  'fb-init.77e6c068.js',
  'GARelay.71bce292.js',
  'js.8803359f.js',
  'playground.3ef86f5f.js',
  'dist.f61e6673.js',
];

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

  // TODO not sure we need the 'GET' check?
  if (!opts.nocache && event.request.method === 'GET') {
    const cache = await caches.open(appCache);
    cache.put(event.request, response.clone());
  }

  if (opts.notifyApp === true && gradrClient) {
    const cloned = response.clone();
    const json = await cloned.json();
    console.log('SW notifying Gradr ...');
    gradrClient.postMessage({
      type: 'api-returned',
      apiResponse: json
    });
  }

  return response;
};

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.hostname === 'randomapi.com') {
    event.respondWith(fetchResource(event, { notifyApp: true, nocache: true }));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetchResource(event))
  );
});

self.addEventListener('message', (event) => {
  if(event.data.type === 'ping') {
    gradrClient = event.source;
    console.log('SW got PING from Gradr');
  }
});
