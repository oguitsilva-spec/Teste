// Laudo em .docx (Word) com o mesmo visual do PDF.
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  ImageRun, Header, Footer, AlignmentType, TabStopType, PageNumber, VerticalAlign, TableLayoutType,
} from "docx";
import { HOSPITAL, cabecalhoPaciente, montarLaudo } from "./catalogo.js";
import { dataBR, horaBR } from "./fmt.js";
import { COR } from "./cores.js";

const c = (h) => h.slice(1);
const FONTE = "Montserrat";
const PT = 20; // twips por ponto
const LARG = 11906 - 2 * 840; // A4 menos margens (twips)
const SEM = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const SEM_BORDAS = { top: SEM, bottom: SEM, left: SEM, right: SEM, insideHorizontal: SEM, insideVertical: SEM };

const run = (text, o = {}) => new TextRun({ text: String(text ?? ""), font: FONTE, size: Math.round((o.pt || 8.2) * 2), bold: !!o.b, italics: !!o.i, color: c(o.cor || COR.tinta), allCaps: !!o.caps });
const par = (runs, o = {}) => new Paragraph({ children: runs, alignment: o.al, spacing: { before: o.antes || 0, after: o.depois || 0, line: o.linha }, border: o.borda, tabStops: o.tabs, indent: o.recuo, keepNext: o.keepNext });

function celula(filhos, o = {}) {
  return new TableCell({
    children: Array.isArray(filhos) ? filhos : [filhos],
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fundo ? { type: ShadingType.CLEAR, color: "auto", fill: c(o.fundo) } : undefined,
    margins: { top: o.mt ?? 40, bottom: o.mb ?? 40, left: o.ml ?? 110, right: 80 },
    borders: o.bordas || { top: SEM, bottom: SEM, left: SEM, right: SEM },
    verticalAlign: o.va || VerticalAlign.CENTER,
    columnSpan: o.span,
  });
}
const linhasTexto = (t, o, kn) => String(t ?? "").split("\n").map((l) => par([run(l, o)], { keepNext: kn }));

function tabelaResultados(b) {
  const ws = b.cols.map((col) => Math.round(col.w * LARG));
  const rows = [];
  rows.push(new TableRow({
    tableHeader: true,
    children: b.cols.map((col, i) => celula(par([run(col.h, { pt: 6.4, b: true, cor: COR.suave, caps: true })]), {
      w: ws[i], mt: 60, mb: 50, bordas: { top: SEM, left: SEM, right: SEM, bottom: { style: BorderStyle.SINGLE, size: 4, color: c(COR.linha) } },
    })),
  }));
  let z = 0;
  b.linhas.forEach((ln, idx) => {
    const kn = idx < b.linhas.length - 1; // mantém a tabela inteira na mesma página quando possível
    if (ln.tipo === "sec") {
      rows.push(new TableRow({ children: [celula(par([run(ln.texto, { pt: 7, b: true, cor: COR.indigo, caps: true })], { keepNext: true }), { w: LARG, span: b.cols.length, mt: 140, mb: 30 })] }));
      z = 0; return;
    }
    const fundo = z % 2 === 0 ? COR.faixa : undefined;
    if (ln.tipo === "obs") {
      const w0 = Math.round(LARG * 0.3);
      rows.push(new TableRow({ children: [
        celula(par([run(ln.rotulo, { pt: 7.6, b: true })], { keepNext: kn }), { w: w0, fundo, va: VerticalAlign.TOP }),
        celula(linhasTexto(ln.texto, { pt: 8.2 }, kn), { w: LARG - w0, fundo, span: b.cols.length - 1 }),
      ] }));
    } else {
      rows.push(new TableRow({ cantSplit: true, children: ln.c.map((t, i) => celula(linhasTexto(t, { pt: 8.2, b: !!b.cols[i].forte, cor: i === 0 || b.cols[i].forte ? COR.tinta : COR.suave }, kn), { w: ws[i], fundo })) }));
    }
    z++;
  });
  return new Table({ rows, width: { size: LARG, type: WidthType.DXA }, columnWidths: ws, borders: SEM_BORDAS, layout: TableLayoutType.FIXED });
}

function caixaPaciente(cab, traco = "—") {
  const w = [1500, Math.round(LARG * 0.6) - 1500, 900, LARG - Math.round(LARG * 0.6) - 900];
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const e = cab.esquerda[i], d = cab.direita[i];
    const o = { fundo: COR.caixa, mt: i === 0 ? 110 : 25, mb: i === 3 ? 110 : 25 };
    const borda = { top: SEM, bottom: SEM, right: SEM, left: { style: BorderStyle.SINGLE, size: 18, color: c(COR.ceu) } };
    rows.push(new TableRow({ children: [
      celula(par([run(e ? e[0] : "", { pt: 7.4, cor: COR.suave })]), { ...o, w: w[0], bordas: borda, ml: 220 }),
      celula(par([run(e ? e[1] || traco : "", { pt: 8.6, b: true })]), { ...o, w: w[1] }),
      celula(par([run(d[0], { pt: 7.4, cor: COR.suave })]), { ...o, w: w[2] }),
      celula(par([run(d[1] || traco, { pt: 8.6, b: true })]), { ...o, w: w[3] }),
    ] }));
  }
  return new Table({ rows, width: { size: LARG, type: WidthType.DXA }, columnWidths: w, borders: SEM_BORDAS, layout: TableLayoutType.FIXED });
}

export async function gerarDOCX(laudo, assets) {
  const cab = cabecalhoPaciente(laudo);
  const exames = montarLaudo(laudo);
  const a = laudo.assinante || {};
  const quando = laudo.assinadoEm ? new Date(laudo.assinadoEm) : new Date();
  const iso = `${quando.getFullYear()}-${String(quando.getMonth() + 1).padStart(2, "0")}-${String(quando.getDate()).padStart(2, "0")}`;

  // cabeçalho: logo à esquerda, contato à direita
  const lw = 104 * (96 / 72), lh = lw * (assets.logoAlt || 397) / (assets.logoLarg || 756);
  const cabTab = new Table({
    width: { size: LARG, type: WidthType.DXA }, columnWidths: [LARG / 2, LARG / 2], borders: SEM_BORDAS, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [
      celula(par([new ImageRun({ type: assets.logoTipo || "jpg", data: assets.logo, transformation: { width: Math.round(lw), height: Math.round(lh) } })]), { w: LARG / 2, ml: 0, va: VerticalAlign.TOP }),
      celula([...HOSPITAL.endereco, HOSPITAL.telefones, HOSPITAL.email].map((l, i) => par([run(l, { pt: 7.3, b: i === 2, cor: i === 2 ? COR.indigo : COR.suave })], { al: AlignmentType.RIGHT, linha: 250 })), { w: LARG / 2, va: VerticalAlign.TOP, mt: 60 }),
    ] })],
  });
  const linhaNum = par([
    run("LAUDO Nº  ", { pt: 6.8, b: true, cor: COR.suave }), run(cab.numero || (laudo.modelo ? "" : "—"), { pt: 8.5, b: true, cor: COR.indigo }),
    run("\tDATA DO EXAME  ", { pt: 6.8, b: true, cor: COR.suave }), run(cab.data, { pt: 8.5, b: true, cor: COR.indigo }),
  ], { tabs: [{ type: TabStopType.RIGHT, position: LARG }], antes: 200, depois: 120 });

  const corpo = [linhaNum, caixaPaciente(cab, laudo.modelo ? "" : "—"), par([], { depois: 200 })];

  exames.forEach((ex, i) => {
    corpo.push(par([run(ex.titulo, { pt: 11.5, b: true, cor: COR.indigo, caps: true })], {
      antes: i ? 480 : 120, depois: 100, keepNext: true, borda: { bottom: { style: BorderStyle.SINGLE, size: 8, color: c(COR.ceu), space: 4 } },
    }));
    if (ex.meta?.length) {
      const rs = [];
      ex.meta.forEach(([k, v], j) => { rs.push(run(`${k}: `, { pt: 7.3, cor: COR.suave })); rs.push(run(String(v) + (j < ex.meta.length - 1 ? "   ·   " : ""), { pt: 7.3, i: true, cor: COR.suave })); });
      corpo.push(par(rs, { depois: 120, keepNext: true }));
    }
    for (const b of ex.conteudo) {
      if (b.t === "tabela") corpo.push(tabelaResultados(b));
      else if (b.t === "par") corpo.push(par(b.runs.map((r) => run(r.text, { pt: b.grande ? 10.2 : 8.6, b: r.bold })), { antes: b.grande ? 200 : 160, linha: b.grande ? 380 : 300, al: b.grande ? AlignmentType.JUSTIFIED : undefined }));
      else if (b.t === "img" && b.w && b.h) {
        const k = Math.min(250 / b.w, 175 / b.h, 1) * (96 / 72);
        corpo.push(par([new ImageRun({ type: /png/i.test(b.type) ? "png" : "jpg", data: b.data, transformation: { width: Math.round(b.w * k), height: Math.round(b.h * k) } })], { antes: 200, depois: 60 }));
        corpo.push(par([run(b.legenda, { pt: 7, i: true, cor: COR.suave })]));
      } else if (b.t === "local") corpo.push(par([run(b.texto, { pt: 9.5 })], { al: AlignmentType.RIGHT, antes: 400 }));
    }
    const borda = { left: { style: BorderStyle.SINGLE, size: 12, color: c(COR.ceu), space: 6 } };
    corpo.push(par([run("Assinado eletronicamente por ", { pt: 7.8, cor: COR.suave }), run(a.nome, { pt: 8.2, b: true })], { antes: 400, borda, recuo: { left: 120 }, keepNext: true }));
    corpo.push(par([run([a.titulo, a.crmv].filter(Boolean).join(" · "), { pt: 7.4, cor: COR.suave })], { borda, recuo: { left: 120 }, keepNext: true }));
    corpo.push(par([run(laudo.modelo ? "em ____/____/______ às ____:____" : `em ${dataBR(iso)} às ${horaBR(quando)}`, { pt: 7.4, cor: COR.suave })], { borda, recuo: { left: 120 } }));
  });

  const doc = new Document({
    creator: HOSPITAL.nome, title: `Laudo ${laudo.numero || ""}`,
    styles: { default: { document: { run: { font: FONTE, size: 17, color: c(COR.tinta) } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 640, bottom: 900, left: 840, right: 840, header: 500, footer: 420 } } },
      headers: { default: new Header({ children: [cabTab] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: c(COR.linha), space: 6 } },
        tabStops: [{ type: TabStopType.RIGHT, position: LARG }],
        children: [
          run(`${HOSPITAL.nome}  ·  Laudo nº ${laudo.numero || (laudo.modelo ? "________" : "—")}`, { pt: 6.8, cor: COR.suave }),
          new TextRun({ children: ["\tPág. ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES], font: FONTE, size: 14, bold: true, color: c(COR.suave) }),
        ],
      })] }) },
      children: corpo,
    }],
  });
  return Packer.toBlob ? (typeof window !== "undefined" ? Packer.toBlob(doc) : Packer.toBuffer(doc)) : Packer.toBuffer(doc);
}
export { PT };
