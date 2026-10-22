// Cache do app para abrir rápido e sem internet (gerado pelo build).
const VERSAO = "laudos-zog-mvjzjyi7";
const ARQUIVOS = ["./","app.js","c-5QIUYZ53.js","c-BFWAQVX3.js","c-CAJC6ZND.js","c-JP2VJPJA.js","c-LXJFISYW.js","c-RO2B22TI.js","fonts/Montserrat_400Regular.ttf","fonts/Montserrat_400Regular_Italic.ttf","fonts/Montserrat_500Medium.ttf","fonts/Montserrat_600SemiBold.ttf","fonts/Montserrat_700Bold.ttf","index.html","logo-header.png","logo-laudo.jpg","manifest.webmanifest","zog-apple-touch-icon.png","zog-icon-192.png","zog-icon-512.png","zog-icon-maskable-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // rede primeiro (pega atualizações), cache se estiver sem internet
  e.respondWith(
    fetch(e.request).then((r) => { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
