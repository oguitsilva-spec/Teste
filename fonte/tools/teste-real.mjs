// Lê as fotos reais pelo app (mesmo pipeline do celular) e mostra o texto lido e os campos preenchidos.
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:8777/";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
if (process.env.SEMWASM) await ctx.addInitScript(() => { delete window.WebAssembly; });
const p = await ctx.newPage();
const erros = []; p.on("pageerror", (e) => erros.push(e.message));
await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
for (const [tile, f] of [["hemograma", "hemo.jpg"], ["bioquimico", "bio.jpg"]]) {
  await p.evaluate(() => history.pushState({ v: "inicio" }, "", "#inicio"));
  await p.evaluate(() => window.dispatchEvent(new PopStateEvent("popstate", { state: { v: "inicio" } })));
  await p.click(`[data-tile="${tile}"]`);
  await p.setInputFiles("#camIn", "/home/claude/fotos-reais/" + f);
  await p.waitForTimeout(600);
  if (await p.isVisible("#isolamento")) await p.click("#lerAssimBtn");
  await Promise.race([p.waitForSelector("#v-laudo:not([hidden])", { timeout: 150000 }), p.waitForFunction(() => /Não/.test(document.querySelector("#ocrStatus").textContent), null, { timeout: 150000 })]);
  const txt = await p.evaluate(() => document.querySelector("#ocrTxt pre").textContent);
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem("zog.rascunho")));
  console.log("=====", f, "\n" + txt);
  console.log("animal:", st?.paciente?.animal, "| espécie:", st?.paciente?.especie);
  console.log("hemo:", JSON.stringify(st?.ex?.hemograma?.v));
  console.log("bio:", JSON.stringify(Object.fromEntries(Object.entries(st?.ex?.bioquimico?.itens || {}).map(([k, v]) => [k, v.v]))));
  console.log("status:", await p.textContent("#ocrStatus"));
}
console.log("erros", erros);
await b.close();
