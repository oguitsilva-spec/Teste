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
    cacheMethod: "none", // sem IndexedDB (bloqueado em alguns iPhones); o cache offline fica com o service worker
    logger: (m) => onProg && onProg(m),
  });
  await worker.setParameters({ preserve_interword_spaces: "1", tessedit_pageseg_mode: "6" });
  return worker;
}

/* ───── preparo da foto ─────
   1) acha o papel (branco, sem cor) no meio da mesa e corta
   2) amplia para as letras da impressora térmica ficarem grandes
   3) tira sombra (divide pelo fundo borrado) e gera 2 versões: preto-e-branco (Otsu) e cinza suave */
async function abrirImagem(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  URL.revokeObjectURL(url);
  return img;
}
function acharPapel(img) {
  const k = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.drawImage(img, 0, 0, w, h);
  const p = cx.getImageData(0, 0, w, h).data;
  const m = new Uint8Array(w * h);
  let tot = 0;
  for (let i = 0, j = 0; j < m.length; i += 4, j++) {
    const mx = Math.max(p[i], p[i + 1], p[i + 2]), mn = Math.min(p[i], p[i + 1], p[i + 2]);
    if (mn > 140 && mx - mn < 50) { m[j] = 1; tot++; }
  }
  const inteiro = { x: 0, y: 0, w: 1, h: 1 };
  if (tot < m.length * 0.04) return inteiro;
  const maiorTrecho = (frac, lim) => {
    let best = [0, 0], ini = -1;
    for (let i = 0; i <= frac.length; i++) {
      if (i < frac.length && frac[i] > lim) { if (ini < 0) ini = i; }
      else if (ini >= 0) { if (i - ini > best[1] - best[0]) best = [ini, i]; ini = -1; }
    }
    return best;
  };
  const col = new Float32Array(w);
  for (let x = 0; x < w; x++) { let c = 0; for (let y = 0; y < h; y++) c += m[y * w + x]; col[x] = c / h; }
  const [x0, x1] = maiorTrecho(col, 0.25);
  const lin = new Float32Array(h);
  for (let y = 0; y < h; y++) { let c = 0; for (let x = x0; x < x1; x++) c += m[y * w + x]; lin[y] = c / Math.max(1, x1 - x0); }
  const [y0, y1] = maiorTrecho(lin, 0.5);
  if (x1 - x0 < w * 0.12 || y1 - y0 < h * 0.08) return inteiro;
  const px = 0.015 * w, py = 0.01 * h;
  const X0 = Math.max(0, x0 - px), Y0 = Math.max(0, y0 - py), X1 = Math.min(w, x1 + px), Y1 = Math.min(h, y1 + py);
  return { x: X0 / w, y: Y0 / h, w: (X1 - X0) / w, h: (Y1 - Y0) / h };
}
function boxBlur(src, w, h, r) {
  // média em janela (2r+1)² usando imagem integral
  const I = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) { let s = 0; for (let x = 0; x < w; x++) { s += src[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; } }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const ya = Math.max(0, y - r), yb = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const xa = Math.max(0, x - r), xb = Math.min(w, x + r + 1);
      out[y * w + x] = (I[yb * (w + 1) + xb] - I[ya * (w + 1) + xb] - I[yb * (w + 1) + xa] + I[ya * (w + 1) + xa]) / ((yb - ya) * (xb - xa));
    }
  }
  return out;
}
async function prepararVersoes(file, leve) {
  const img = await abrirImagem(file);
  const c = acharPapel(img);
  const sx = c.x * img.naturalWidth, sy = c.y * img.naturalHeight, sw = c.w * img.naturalWidth, sh = c.h * img.naturalHeight;
  let W = Math.round(c.w * (leve ? 2000 : 3000)), H = Math.round(W * sh / sw);
  const maxPx = leve ? 2.2e6 : 6e6;
  if (W * H > maxPx) { const f = Math.sqrt(maxPx / (W * H)); W = Math.round(W * f); H = Math.round(H * f); }
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.imageSmoothingQuality = "high";
  cx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  const d = cx.getImageData(0, 0, W, H), p = d.data, n = W * H;
  const g = new Float32Array(n);
  for (let i = 0, j = 0; j < n; i += 4, j++) g[j] = (p[i] * 299 + p[i + 1] * 587 + p[i + 2] * 114) / 1000;
  const fundo = boxBlur(g, W, H, Math.max(15, Math.round(W / 40)));
  const norm = new Float32Array(n);
  for (let j = 0; j < n; j++) norm[j] = Math.min(255, (g[j] / Math.max(1, fundo[j])) * 255);
  const suave = boxBlur(norm, W, H, 1);
  // Otsu
  const hist = new Float64Array(256);
  for (let j = 0; j < n; j++) hist[suave[j] | 0]++;
  let sum = 0; for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sB = 0, wB = 0, melhor = 0, lim = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (!wB) continue; const wF = n - wB; if (!wF) break;
    sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) ** 2;
    if (v > melhor) { melhor = v; lim = t; }
  }
  const tela = (f) => {
    const o = document.createElement("canvas"); o.width = W; o.height = H;
    const ox = o.getContext("2d"); const od = ox.createImageData(W, H);
    for (let i = 0, j = 0; j < n; i += 4, j++) { const v = f(j); od.data[i] = od.data[i + 1] = od.data[i + 2] = v; od.data[i + 3] = 255; }
    ox.putImageData(od, 0, 0); return o;
  };
  const pb = tela((j) => (suave[j] > lim ? 255 : 0));
  if (leve) return [pb];
  // 3 versões para votar valor a valor (desempata leituras como 29.8 × 29.9)
  return [pb, tela((j) => suave[j]), tela((j) => (norm[j] > lim ? 255 : 0))];
}

// Aparelhos sem WebAssembly (ex.: iPhone no Modo de Isolamento): Tesseract 2 em JavaScript puro
let workerAsm = null;
function carregarScript(src) {
  return new Promise((ok, erro) => {
    if (window.Tesseract) return ok();
    const s = document.createElement("script");
    s.src = src; s.onload = () => ok(); s.onerror = () => erro(new Error("não baixou o leitor"));
    document.head.appendChild(s);
  });
}
async function prepararAsm(onProg) {
  if (workerAsm) return workerAsm;
  const base = new URL("ocr2/", location.href).href;
  await carregarScript(base + "tesseract.min.js");
  const w = window.Tesseract.createWorker({
    workerPath: base + "worker.min.js",
    corePath: base + "tesseract-core.asm.js",
    langPath: base.replace(/\/$/, ""), // modelo "fast": bem mais leve sem JIT
    gzip: true,
    cacheMethod: "none",
    logger: (m) => onProg && onProg(m),
  });
  await w.load();
  await w.loadLanguage("eng");
  await w.initialize("eng");
  await w.setParameters({ preserve_interword_spaces: "1", tessedit_pageseg_mode: "6" });
  workerAsm = w;
  return w;
}

export const semWasm = () => typeof WebAssembly === "undefined";

export async function lerFoto(file, onProg) {
  const leve = semWasm();
  const w = leve ? await prepararAsm(onProg) : await preparar(onProg);
  const versoes = await prepararVersoes(file, leve);
  const textos = [];
  for (let i = 0; i < versoes.length; i++) {
    const parcial = (m) => onProg && onProg({ ...m, progress: (i + (m.progress || 0)) / versoes.length });
    if (!leve) w.logger = parcial; // v5 não troca logger depois de criado; o progresso geral fica pela contagem
    const { data } = await w.recognize(versoes[i]);
    textos.push(data.text || "");
    onProg && onProg({ status: "recognizing text", progress: (i + 1) / versoes.length });
  }
  return textos;
}
