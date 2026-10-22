import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "/home/claude/shots";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const erros = [];
async function sessao(vw, nome, fn) {
  const ctx = await browser.newContext({ viewport: vw, acceptDownloads: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => erros.push(nome + ": " + e.message));
  p.on("console", (m) => m.type() === "error" && erros.push(nome + " console: " + m.text()));
  await p.goto("http://localhost:8765/");
  await p.waitForTimeout(400);
  await fn(p);
  await ctx.close();
}
const baixa = async (p, sel, arq) => {
  const [d] = await Promise.all([p.waitForEvent("download", { timeout: 20000 }), p.click(sel)]);
  await d.saveAs(`${out}/${arq}`);
  console.log("baixou", arq, await p.textContent("#dlStatus"));
};

await sessao({ width: 1400, height: 1000 }, "desktop", async (p) => {
  await p.fill("#animal", "Doce");
  await p.fill("#tutor", "Siulan");
  await p.fill("#raca", "Cocker spaniel");
  await p.selectOption("#sexo", "Fêmea");
  await p.fill("#idadeN", "9");
  await p.fill("#solicitante", "Dra. Anna Laura Cassettari");
  const v = { hem: "6.43", hb: "13", ht: "39", vcm: "60.6", hcm: "20.2", chcm: "33.3", leu: "2700", lin_p: "32", mon_p: "10", eos_p: "0", gra_p: "58", pla: "159" };
  for (const [k, x] of Object.entries(v)) await p.fill(`[data-b="ex.hemograma.v.${k}"]`, x);
  await p.click('[data-chip="bioquimico"]');
  await p.click('[data-pacote="Simples"]');
  for (const [k, x] of Object.entries({ creat: "1.9", ureia: "80", alt: "53", fa: "52", alb: "3.0" })) await p.fill(`[data-b="ex.bioquimico.itens.${k}.v"]`, x);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/desk-1.png`, fullPage: false });
  await p.screenshot({ path: `${out}/desk-full.png`, fullPage: true });
  await baixa(p, "#pdfBtn", "app.pdf");
  await baixa(p, "#dlBtn", "app.docx");
  await p.click('[data-chip="urinalise"]');
  await p.click('[data-chip="teste"]');
  await p.selectOption("#testePreset", "fivfelv");
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/desk-2.png`, fullPage: true });
});

await sessao({ width: 390, height: 844 }, "celular", async (p) => {
  await p.screenshot({ path: `${out}/cel-1.png` });
  await p.selectOption("#especie", "Felina");
  await p.click('[data-chip="leish"]');
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/cel-full.png`, fullPage: true });
  const largura = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log("scrollWidth celular", largura);
});
console.log("ERROS:", erros);
await browser.close();
