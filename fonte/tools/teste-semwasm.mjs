// Simula aparelho sem WebAssembly (página e workers) e testa a leitura da foto.
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:8771/";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => {
  delete window.WebAssembly;
  const W = window.Worker;
  window.Worker = function (url, opts) {
    const abs = new URL(url, location.href).href;
    const src = `self.WebAssembly = undefined; delete self.WebAssembly; importScripts(${JSON.stringify(abs)});`;
    return new W(URL.createObjectURL(new Blob([src], { type: "text/javascript" })), opts);
  };
});
const p = await ctx.newPage();
const erros = []; p.on("pageerror", (e) => erros.push(e.message)); p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
const t0 = Date.now();
await p.goto(base);
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
console.log("WebAssembly na página:", await p.evaluate(() => typeof WebAssembly));
await p.click('[data-tile="hemograma"]');
await p.setInputFiles("#camIn", "/home/claude/ocrteste/hemo.jpg");
await Promise.race([
  p.waitForSelector("#v-laudo:not([hidden])", { timeout: 300000 }),
  p.waitForFunction(() => /Não/.test(document.querySelector("#ocrStatus").textContent), null, { timeout: 300000 }),
]);
console.log({
  tela: await p.evaluate(() => ["inicio", "laudo"].find((v) => !document.querySelector("#v-" + v).hidden)),
  aviso: await p.textContent("#laudoAvisos").catch(() => ""), ocrStatus: await p.textContent("#ocrStatus"),
  segundos: Math.round((Date.now() - t0) / 1000), erros,
});
await b.close();
