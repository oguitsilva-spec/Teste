import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const erros = []; p.on("pageerror", (e) => erros.push(e.message)); p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
await p.goto(process.argv[2] || "http://localhost:8766/");
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
for (const f of ["hemo.jpg", "bio.jpg"]) {
  await p.setInputFiles("#fotoExame", "/home/claude/ocrteste/" + f);
  await p.waitForFunction(() => /^Li |Não/.test(document.querySelector("#ocrStatus").textContent), null, { timeout: 150000 });
  console.log(f, "→", await p.textContent("#ocrStatus"));
}
console.log("hem:", await p.inputValue('[data-b="ex.hemograma.v.hem"]'), "creat:", await p.inputValue('[data-b="ex.bioquimico.itens.creat.v"]'), "lidos:", await p.locator("input.lido").count());
await p.locator("section.card").nth(2).screenshot({ path: "/home/claude/shots/ocr-btn.png" });
await p.locator("[data-tipo=hemograma]").scrollIntoViewIfNeeded();
await p.screenshot({ path: "/home/claude/shots/ocr-cel.png" });
console.log("erros", erros);
await b.close();
