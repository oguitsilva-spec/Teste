import { createWorker } from "tesseract.js";
import { interpretar } from "../src/leitor.js";
const w = await createWorker("eng", 1, { langPath: new URL("../node_modules/@tesseract.js-data/eng/4.0.0_best_int", import.meta.url).pathname, gzip: true, cachePath: "/tmp/tess" });
await w.setParameters({ preserve_interword_spaces: "1", tessedit_pageseg_mode: "6" });
for (const f of process.argv.slice(2)) {
  const { data } = await w.recognize(f);
  console.log("=== " + f + "\n" + data.text);
  console.log(JSON.stringify(interpretar(data.text), null, 1));
}
await w.terminate();
