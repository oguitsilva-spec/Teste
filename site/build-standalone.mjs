/**
 * Gera `rubra-standalone.html`: o site inteiro em um arquivo unico, que abre
 * com duplo clique via file:// sem precisar de servidor.
 *
 * O site normal usa ES modules, e navegador nenhum carrega module por file://
 * (CORS). Aqui o modulo e empacotado com esbuild, as fontes viram data: URI e
 * tudo entra inline. Nao ha nenhuma requisicao de rede no resultado.
 *
 *   npm i esbuild && node build-standalone.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, p), "utf8");
const dataUri = (p, mime) =>
  `data:${mime};base64,${readFileSync(resolve(here, p)).toString("base64")}`;

/* Fontes: cada url(./x.woff2) do CSS gerado vira o binario embutido. */
const inlineFontCss = (css, dir) =>
  css.replace(/url\(\.\/([^)]+\.woff2)\)/g, (_, file) =>
    `url(${dataUri(`${dir}/${file}`, "font/woff2")})`
  );

const fonts = inlineFontCss(read("assets/fonts/fonts.css"), "assets/fonts");
const phosphor = read("assets/vendor/phosphor.css").replace(
  'url("./phosphor-regular.woff2") format("woff2")',
  `url(${dataUri("assets/vendor/phosphor-regular.woff2", "font/woff2")}) format("woff2")`
);
const style = read("assets/css/style.css");

/* main.js importa three; esbuild resolve e remove o que a cena nao usa. */
const bundled = await build({
  entryPoints: [resolve(here, "assets/js/main.js")],
  bundle: true,
  // No navegador quem resolve "three" e o importmap do index.html.
  alias: { three: resolve(here, "assets/vendor/three.module.js") },
  minify: true,
  format: "iife",
  target: "es2020",
  write: false,
  legalComments: "none",
});
const app = bundled.outputFiles[0].text;

/* O <head> e o <body> vem do index.html, sem as tags que apontam para arquivo. */
const source = read("index.html");
const head = source.slice(0, source.indexOf("<!-- WebGL stage"));
const body = source.slice(
  source.indexOf("<!-- WebGL stage"),
  source.indexOf('<script type="importmap">')
);

const title = /<title>([^<]*)<\/title>/.exec(head)?.[1] ?? "RUBRA";
const meta = head
  .split("\n")
  .filter((l) => l.trim().startsWith("<meta"))
  .join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
${meta}
<title>${title}</title>
<style>${fonts}</style>
<style>${phosphor}</style>
<style>${style}</style>
<script>
  document.documentElement.classList.add("js");
  setTimeout(function () {
    if (!document.documentElement.classList.contains("anim-ready")) {
      document.documentElement.classList.add("no-anim");
    }
  }, 3000);
</script>
</head>
<body>
${body}
<script>${read("assets/vendor/gsap.min.js")}</script>
<script>${read("assets/vendor/ScrollTrigger.min.js")}</script>
<script>${read("assets/vendor/lenis.min.js")}</script>
<script>${app}</script>
</body>
</html>
`;

const out = resolve(here, "rubra-standalone.html");
writeFileSync(out, html);
console.log(`${out}  ${(html.length / 1024 / 1024).toFixed(2)} MB`);
