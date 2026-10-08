// The complete game is in index.html. Cache the shell; never answer a script
// request with that HTML, which can make service-worker updates fail offline.
const C='musket-crown-f2835f64';
const FILES=['index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('musket-crown-')&&key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.endsWith('/sw.js'))return;
  // Pages: newest build from the network first, the saved copy only when offline.
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(response=>{
      if(response.ok)e.waitUntil(caches.open(C).then(cache=>cache.put('index.html',response.clone())));
      return response;
    }).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
    if(response.ok)e.waitUntil(caches.open(C).then(cache=>cache.put(req,response.clone())));
    return response;
  })));
});
