import { createWorker } from "tesseract.js";
import { interpretar } from "../src/leitor.js";
const w = await createWorker("eng", 1, { langPath: new URL("../node_modules/@tesseract.js-data/eng/4.0.0_best_int", import.meta.url).pathname, gzip: true, cacheMethod: "none" });
await w.setParameters({ preserve_interword_spaces: "1", tessedit_pageseg_mode: process.env.PSM || "6" });
for (const f of process.argv.slice(2)) {
  const { data } = await w.recognize(f);
  console.log("=== " + f + "\n" + data.text.split("\n").slice(0, process.env.LINHAS ? +process.env.LINHAS : 99).join("\n"));
  const r = interpretar(data.text); console.log(JSON.stringify({ hemo: r.hemo, bio: r.bio, nome: r.nome, esp: r.especie }));
}
await w.terminate();
