// Monta o site em dist/: bundle com divisão (PDF e .docx só carregam quando usados) + lista do cache offline.
import { build } from "esbuild";
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const raiz = new URL("..", import.meta.url).pathname;
const dist = join(raiz, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "fonts"), { recursive: true });

await build({
  entryPoints: [join(raiz, "src/app.js")], bundle: true, splitting: true, format: "esm", minify: true,
  outdir: dist, entryNames: "[name]", chunkNames: "c-[hash]", target: ["es2020", "safari15"], legalComments: "none",
});
cpSync(join(raiz, "web"), dist, { recursive: true });
for (const f of readdirSync(join(raiz, "assets"))) {
  if (f.endsWith(".ttf")) cpSync(join(raiz, "assets", f), join(dist, "fonts", f));
}
cpSync(join(raiz, "assets/logo-laudo.jpg"), join(dist, "logo-laudo.jpg"));
cpSync(join(raiz, "assets/logo-header.png"), join(dist, "logo-header.png"));

// leitura de foto (OCR): baixada só quando usada, não entra no cache inicial
mkdirSync(join(dist, "ocr"), { recursive: true });
const nm = join(raiz, "node_modules");
cpSync(join(nm, "tesseract.js/dist/worker.min.js"), join(dist, "ocr/worker.min.js"));
for (const f of ["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js"]) cpSync(join(nm, "tesseract.js-core", f), join(dist, "ocr", f));
cpSync(join(nm, "@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz"), join(dist, "ocr/eng.traineddata.gz"));

const lista = [];
(function walk(d, pre = "") {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p, pre + f + "/");
    else if (f !== "sw.js" && !f.startsWith(".") && !pre.startsWith("ocr/")) lista.push(pre + f);
  }
})(dist);
const versao = "laudos-zog-" + Date.now().toString(36);
writeFileSync(join(dist, "sw.js"), `// Cache do app para abrir rápido e sem internet (gerado pelo build).
const VERSAO = "${versao}";
const ARQUIVOS = ${JSON.stringify(["./", ...lista])};
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
`);
console.log(versao, lista.length, "arquivos");
for (const f of lista) console.log(" ", f, statSync(join(dist, f)).size);
