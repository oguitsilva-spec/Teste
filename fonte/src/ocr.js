// Leitura da foto no próprio aparelho (Tesseract, sem internet depois do primeiro uso).
import { createWorker } from "tesseract.js";

let worker = null;

async function preparar(onProg) {
  if (worker) return worker;
  worker = await createWorker("eng", 1, {
    workerPath: new URL("ocr/worker.min.js", location.href).href,
    corePath: new URL("ocr/", location.href).href,
    langPath: new URL("ocr", location.href).href,
    gzip: true,
    logger: (m) => onProg && onProg(m),
  });
  await worker.setParameters({ preserve_interword_spaces: "1", tessedit_pageseg_mode: "6" });
  return worker;
}

/** Ajusta a foto para o OCR: tons de cinza, contraste e tamanho bom para leitura */
async function tratarImagem(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  const maior = Math.max(img.naturalWidth, img.naturalHeight);
  const k = Math.min(2400 / maior, 2.2);
  const cv = document.createElement("canvas");
  cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.drawImage(img, 0, 0, cv.width, cv.height);
  URL.revokeObjectURL(url);
  const d = cx.getImageData(0, 0, cv.width, cv.height), p = d.data;
  // cinza + esticar contraste (percentis 2% e 98%)
  const hist = new Uint32Array(256), g = new Uint8ClampedArray(p.length / 4);
  for (let i = 0, j = 0; i < p.length; i += 4, j++) { const y = (p[i] * 299 + p[i + 1] * 587 + p[i + 2] * 114) / 1000; g[j] = y; hist[g[j]]++; }
  const tot = g.length; let acc = 0, lo = 0, hi = 255;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > tot * 0.02) { lo = v; break; } }
  acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > tot * 0.02) { hi = v; break; } }
  const esc = 255 / Math.max(1, hi - lo);
  for (let i = 0, j = 0; i < p.length; i += 4, j++) { const v = Math.max(0, Math.min(255, (g[j] - lo) * esc)); p[i] = p[i + 1] = p[i + 2] = v; }
  cx.putImageData(d, 0, 0);
  return cv;
}

export async function lerFoto(file, onProg) {
  const w = await preparar(onProg);
  const cv = await tratarImagem(file);
  const { data } = await w.recognize(cv);
  return data.text || "";
}
