// Laudo em PDF (A4, vetorial) no padrão visual da Zog.
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { HOSPITAL, cabecalhoPaciente, montarLaudo } from "./catalogo.js";
import { dataBR, horaBR } from "./fmt.js";

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
import { COR } from "./cores.js";
export { COR };
const C = Object.fromEntries(Object.entries(COR).map(([k, v]) => [k, hex(v)]));

const W = 595.28, H = 841.89, ML = 42, MR = 42, CW = W - ML - MR, TOPO = 34, RODAPE = 56;

export async function gerarPDF(laudo, assets) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Laudo ${laudo.numero || ""} · ${laudo.paciente?.animal || ""}`.trim());
  doc.setAuthor(HOSPITAL.nome);
  doc.setCreator("Laudos Zog");
  doc.setProducer("Laudos Zog");
  const F = {
    r: await doc.embedFont(assets.fonts.regular, { subset: true }),
    i: await doc.embedFont(assets.fonts.italic, { subset: true }),
    m: await doc.embedFont(assets.fonts.medium, { subset: true }),
    s: await doc.embedFont(assets.fonts.semibold, { subset: true }),
    b: await doc.embedFont(assets.fonts.bold, { subset: true }),
  };
  const logo = assets.logoTipo === "png" ? await doc.embedPng(assets.logo) : await doc.embedJpg(assets.logo);
  const cab = cabecalhoPaciente(laudo);
  const exames = montarLaudo(laudo);
  const assinadoEm = laudo.assinadoEm ? new Date(laudo.assinadoEm) : new Date();

  let page, y; // y medido de cima para baixo
  const paginas = [];
  const larg = (t, f, s) => f.widthOfTextAtSize(String(t), s);
  const texto = (t, x, yy, f, s, cor = C.tinta) => { if (t !== "" && t != null) page.drawText(String(t), { x, y: H - yy, size: s, font: f, color: cor }); };
  const textoDir = (t, xd, yy, f, s, cor) => texto(t, xd - larg(t, f, s), yy, f, s, cor);
  const ret = (x, yy, w, h, cor) => page.drawRectangle({ x, y: H - yy - h, width: w, height: h, color: cor });
  const traco = (x1, yy, x2, esp, cor) => page.drawLine({ start: { x: x1, y: H - yy }, end: { x: x2, y: H - yy }, thickness: esp, color: cor });

  function quebrar(t, f, s, max) {
    const out = [];
    for (const par of String(t ?? "").split("\n")) {
      let atual = "";
      for (const p of par.split(/\s+/).filter(Boolean)) {
        const tent = atual ? atual + " " + p : p;
        if (larg(tent, f, s) <= max || !atual) atual = tent;
        else { out.push(atual); atual = p; }
      }
      out.push(atual);
    }
    return out;
  }

  function novaPagina() {
    page = doc.addPage([W, H]);
    paginas.push(page);
    // logo + contato
    const lw = 104, lh = (lw * logo.height) / logo.width;
    page.drawImage(logo, { x: ML, y: H - TOPO - lh, width: lw, height: lh });
    const linhas = [...HOSPITAL.endereco, HOSPITAL.telefones, HOSPITAL.email];
    linhas.forEach((l, i) => textoDir(l, W - MR, TOPO + 9 + i * 10.5, i === 2 ? F.s : F.r, 7.3, i === 2 ? C.indigo : C.suave));
    y = TOPO + lh + 16;
    // nº e data
    texto("LAUDO Nº", ML, y, F.s, 6.8, C.suave);
    texto(cab.numero || "—", ML + larg("LAUDO Nº", F.s, 6.8) + 5, y, F.b, 8.5, C.indigo);
    const dt = `Data do exame  ${cab.data}`;
    textoDir(cab.data, W - MR, y, F.b, 8.5, C.indigo);
    textoDir("DATA DO EXAME", W - MR - larg(cab.data, F.b, 8.5) - 6, y, F.s, 6.8, C.suave);
    void dt;
    y += 8;
    // caixa do paciente
    const lh2 = 13.2, alt = 4 * lh2 + 12;
    page.drawRectangle({ x: ML, y: H - y - alt, width: CW, height: alt, color: C.caixa });
    ret(ML, y, 2.4, alt, C.ceu);
    const xD = ML + CW * 0.6;
    cab.esquerda.forEach(([r, v], i) => {
      const yy = y + 15 + i * lh2;
      texto(r, ML + 14, yy, F.r, 7.4, C.suave);
      texto(v || "—", ML + 92, yy, F.s, 8.6, C.tinta);
    });
    cab.direita.forEach(([r, v], i) => {
      const yy = y + 15 + i * lh2;
      texto(r, xD, yy, F.r, 7.4, C.suave);
      texto(v || "—", xD + 44, yy, F.s, 8.6, C.tinta);
    });
    y += alt + 20;
  }

  const LIMITE = H - RODAPE - 8;
  const cabe = (h) => y + h <= LIMITE;

  function tituloExame(ex, cont = false) {
    texto(ex.titulo.toUpperCase() + (cont ? "  (continuação)" : ""), ML, y + 10, F.b, 11.5, C.indigo);
    y += 17;
    traco(ML, y, W - MR, 0.6, C.linha);
    ret(ML, y - 1, 34, 2, C.ceu);
    y += 6;
    if (!cont && ex.meta?.length) {
      // metadados numa linha (quebra se precisar), estilo nota técnica
      let x = ML;
      y += 8;
      ex.meta.forEach(([k, v], i) => {
        const a = `${k}: `, b = String(v), sep = i < ex.meta.length - 1 ? "   ·   " : "";
        const w = larg(a, F.m, 7.3) + larg(b + sep, F.i, 7.3);
        if (x + w > W - MR && x > ML) { x = ML; y += 10.5; }
        texto(a, x, y, F.m, 7.3, C.suave); x += larg(a, F.m, 7.3);
        texto(b + sep, x, y, F.i, 7.3, C.suave); x += larg(b + sep, F.i, 7.3);
      });
      y += 6;
    }
    y += 4;
  }

  function cabecalhoTabela(cols) {
    let x = ML;
    y += 4;
    cols.forEach((c) => { texto(c.h.toUpperCase(), x + 6, y + 8, F.s, 6.4, C.suave); x += c.w * CW; });
    y += 13;
    traco(ML, y, W - MR, 0.6, C.linha);
    y += 1;
  }

  function tabela(ex, b) {
    cabecalhoTabela(b.cols);
    let zebra = 0;
    for (const ln of b.linhas) {
      if (ln.tipo === "sec") {
        if (!cabe(18 + 15)) { novaPagina(); tituloExame(ex, true); cabecalhoTabela(b.cols); }
        y += 7;
        texto(ln.texto.toUpperCase(), ML + 6, y + 8, F.b, 7, C.indigo);
        y += 12; zebra = 0;
        continue;
      }
      if (ln.tipo === "obs") {
        const max = CW * 0.7 - 12;
        const ls = quebrar(ln.texto, F.r, 8.2, max);
        const h = Math.max(15, ls.length * 10.6 + 5);
        if (!cabe(h + (ln.sep ? 8 : 0))) { novaPagina(); tituloExame(ex, true); cabecalhoTabela(b.cols); }
        if (ln.sep) y += 8;
        if (zebra % 2 === 0) ret(ML, y, CW, h, C.faixa);
        const lr = quebrar(ln.rotulo, F.s, 7.6, CW * 0.3 - 10);
        lr.forEach((t, i) => texto(t, ML + 6, y + 10.2 + i * 10.6, F.s, 7.6, C.tinta));
        ls.forEach((t, i) => texto(t, ML + CW * 0.3 + 6, y + 10.2 + i * 10.6, F.r, 8.2, C.tinta));
        y += Math.max(h, lr.length * 10.6 + 5); zebra++;
        continue;
      }
      // linha comum
      const partes = ln.c.map((t, i) => quebrar(t, b.cols[i]?.forte ? F.s : F.r, 8.2, b.cols[i].w * CW - 12));
      const nl = Math.max(...partes.map((p) => p.length));
      const h = nl * 10.6 + 4.4;
      if (!cabe(h)) { novaPagina(); tituloExame(ex, true); cabecalhoTabela(b.cols); zebra = 0; }
      if (zebra % 2 === 0) ret(ML, y, CW, h, C.faixa);
      let x = ML;
      partes.forEach((p, i) => {
        const col = b.cols[i];
        const f = col.forte ? F.s : F.r;
        const cor = i === 0 ? C.tinta : col.forte ? C.tinta : C.suave;
        p.forEach((t, j) => texto(t, x + 6, y + 10 + j * 10.6, f, 8.2, cor));
        x += col.w * CW;
      });
      y += h; zebra++;
    }
    y += 2;
  }

  function paragrafo(b) {
    const s = b.grande ? 10.2 : 8.6, lhp = b.grande ? 16.5 : 12.5;
    // monta palavras com estilo para quebrar mantendo negrito
    const palavras = [];
    for (const r of b.runs) {
      const f = r.bold ? F.b : F.r;
      String(r.text).split(/(\s+)/).forEach((p) => { if (p) palavras.push({ t: p, f }); });
    }
    const linhas = [[]];
    let w = 0;
    for (const p of palavras) {
      const pw = larg(p.t, p.f, s);
      if (/^\s+$/.test(p.t)) { if (linhas.at(-1).length) { linhas.at(-1).push(p); w += pw; } continue; }
      if (w + pw > CW && linhas.at(-1).length) { while (linhas.at(-1).length && /^\s+$/.test(linhas.at(-1).at(-1).t)) linhas.at(-1).pop(); linhas.push([]); w = 0; }
      linhas.at(-1).push(p); w += pw;
    }
    y += b.grande ? 10 : 8;
    for (const l of linhas) {
      if (!cabe(lhp)) novaPagina();
      let x = ML;
      for (const p of l) { if (!/^\s+$/.test(p.t)) texto(p.t, x, y + s, p.f, s, C.tinta); x += larg(p.t, p.f, s); }
      y += lhp;
    }
  }

  async function imagem(b) {
    const img = /png/i.test(b.type) ? await doc.embedPng(b.data) : await doc.embedJpg(b.data);
    const maxW = 250, maxH = 175;
    const k = Math.min(maxW / img.width, maxH / img.height, 1);
    const w = img.width * k, h = img.height * k;
    if (!cabe(h + 30)) novaPagina();
    y += 12;
    page.drawImage(img, { x: ML, y: H - y - h, width: w, height: h });
    y += h + 10;
    texto(b.legenda || "", ML, y, F.i, 7, C.suave);
    y += 4;
  }

  function local(b) {
    y += 22;
    if (!cabe(14)) novaPagina();
    textoDir(b.texto, W - MR, y, F.r, 9.5, C.tinta);
    y += 4;
  }

  function assinatura() {
    const a = laudo.assinante || {};
    if (!cabe(48)) novaPagina();
    y += 20;
    ret(ML, y - 2, 2, 33, C.ceu);
    const pre = "Assinado eletronicamente por ";
    texto(pre, ML + 9, y + 7, F.r, 7.8, C.suave);
    texto(a.nome || "", ML + 9 + larg(pre, F.r, 7.8), y + 7, F.b, 8.2, C.tinta);
    texto([a.titulo, a.crmv].filter(Boolean).join(" · "), ML + 9, y + 18.5, F.r, 7.4, C.suave);
    texto(`em ${dataBR(isoLocal(assinadoEm))} às ${horaBR(assinadoEm)}`, ML + 9, y + 29, F.r, 7.4, C.suave);
    y += 34;
  }

  novaPagina();
  for (let i = 0; i < exames.length; i++) {
    const ex = exames[i];
    if (i > 0) {
      y += 26;
      // mantém o exame inteiro na mesma página quando ele cabe numa página nova
      const h = estimarAltura(ex), util = LIMITE - (TOPO + 160);
      if (!cabe(Math.min(h, 110)) || (!cabe(h) && h <= util)) novaPagina();
    }
    tituloExame(ex);
    for (const b of ex.conteudo) {
      if (b.t === "tabela") tabela(ex, b);
      else if (b.t === "par") paragrafo(b);
      else if (b.t === "img") await imagem(b);
      else if (b.t === "local") local(b);
    }
    assinatura();
  }

  // rodapés com total de páginas
  paginas.forEach((pg, i) => {
    page = pg;
    traco(ML, H - 40, W - MR, 0.5, C.linha);
    texto(`${HOSPITAL.nome}  ·  Laudo nº ${laudo.numero || "—"}`, ML, H - 28, F.r, 6.8, C.suave);
    textoDir(`Pág. ${i + 1} de ${paginas.length}`, W - MR, H - 28, F.s, 6.8, C.suave);
  });

  return doc.save();
}

function estimarAltura(ex) {
  let h = 27 + (ex.meta?.length ? 18 : 0) + 54;
  for (const b of ex.conteudo) {
    if (b.t === "tabela") {
      h += 18;
      for (const l of b.linhas) h += l.tipo === "sec" ? 19 : l.tipo === "obs" ? 16 + String(l.texto).length / 6 : 15 * Math.max(...l.c.map((t) => String(t).split("\n").length));
    } else if (b.t === "par") h += 12 + (b.runs.map((r) => r.text).join("").length / 95) * (b.grande ? 16.5 : 12.5);
    else if (b.t === "img") h += 200;
    else h += 26;
  }
  return h;
}

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
