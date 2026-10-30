// Simula aparelho sem WebAssembly (página e workers) e testa a leitura da foto.
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:8771/";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: process.env.JITLESS ? ["--js-flags=--jitless"] : [] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => {
  const SEMWASM = !location.search.includes("comwasm");
  if (SEMWASM) delete window.WebAssembly;
  delete window.indexedDB; try { Object.defineProperty(window, "indexedDB", { value: undefined }); } catch {}
  const W = window.Worker;
  window.Worker = function (url, opts) {
    const abs = new URL(url, location.href).href;
    const src = `${SEMWASM ? "self.WebAssembly = undefined; delete self.WebAssembly;" : ""} delete self.indexedDB; try { Object.defineProperty(self, "indexedDB", { value: undefined }); } catch (e) {} importScripts(${JSON.stringify(abs)});`;
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
await p.waitForTimeout(800);
if (await p.isVisible("#isolamento")) {
  await p.screenshot({ path: "/home/claude/shots/isolamento.png" });
  console.log("tela de orientação: sim");
  await p.click("#lerAssimBtn");
}
await Promise.race([
  p.waitForSelector("#v-laudo:not([hidden])", { timeout: 900000 }),
  p.waitForFunction(() => /Não/.test(document.querySelector("#ocrStatus").textContent), null, { timeout: 900000 }),
]);
console.log({
  tela: await p.evaluate(() => ["inicio", "laudo"].find((v) => !document.querySelector("#v-" + v).hidden)),
  aviso: await p.textContent("#laudoAvisos").catch(() => ""), ocrStatus: await p.textContent("#ocrStatus"),
  segundos: Math.round((Date.now() - t0) / 1000), erros,
});
await b.close();
