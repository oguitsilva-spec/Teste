// Interpreta o texto lido (OCR) da impressão dos aparelhos e devolve os valores dos campos do app.
// Funciona com as siglas mais comuns de hematologia veterinária e de bioquímica seca (Fujifilm DRI-CHEM).

const NUM = /[<>]?\d+(?:\.\d+)?/;

// Corrige confusões comuns do OCR dentro de números e normaliza separadores
function limparLinha(l) {
  let s = " " + l.toUpperCase().replace(/[|]/g, " ").replace(/\s+/g, " ").trim() + " ";
  s = s.replace(/(\d),(\d)/g, "$1.$2"); // vírgula decimal → ponto
  // O/o/D/Q entre dígitos → 0 ; l/I entre dígitos → 1 ; S → 5
  s = s.replace(/(?<=\d)[ODQ](?=[\d.\s])/g, "0").replace(/(?<=[\d.])[ODQ](?=\d)/g, "0");
  s = s.replace(/(?<=\d)[IL](?=\d)/g, "1");
  s = s.replace(/µ|Μ/g, "U");
  return s;
}

// [chave do app, rótulo (sem âncora), tipo]
// tipo: "pct" (%), "abs" (contagem absoluta), "dif" (absoluto e % na mesma linha), "val" (valor direto)
const L_LIN = "(?:LYMPH|LYM|LY|LINF)", L_MON = "(?:M[O0]N[O0]|M[O0]N|M[O0]|MID)", L_EOS = "(?:E[O0]S|E[O0EAQ]\\.?)", L_GRA = "(?:GRAN|GRA|GR|NEUT|NEU)";
const HEMO = [
  ["lin_p", L_LIN + "\\s?%", "pct"], ["mon_p", L_MON + "\\s?%", "pct"], ["eos_p", L_EOS + "\\s?%", "pct"], ["gra_p", L_GRA + "\\s?%", "pct"],
  ["lin_a", L_LIN + "\\s?#", "abs"], ["mon_a", L_MON + "\\s?#", "abs"], ["eos_a", L_EOS + "\\s?#", "abs"], ["gra_a", L_GRA + "\\s?#", "abs"],
  ["lin", L_LIN + "\\b", "dif"], ["mon", L_MON + "\\b", "dif"], ["eos", L_EOS + "\\b", "dif"], ["gra", L_GRA + "\\b", "dif"],
  ["leu", "W\\.?\\s?B\\.?\\s?C\\b", "leu"],
  ["hem", "R\\.?\\s?B\\.?\\s?C\\b", "val"],
  ["hb", "(?:HGB|HG8|H6B|HB)\\b", "hb"],
  ["ht", "(?:HCT|HTC|HET|HT)\\b", "val"],
  ["chcm", "MCHC\\b", "chcm"],
  ["hcm", "MCH\\b", "val"],
  ["vcm", "(?:MCV|MEV|MGV|NCV)\\b", "val"],
  ["pla", "(?:PLT|PIT|PL7)\\b", "pla"],
].map(([k, r, t]) => [k, new RegExp("^" + r), t]);

const SUF = "(?:\\s?-\\s?[A-Z0-9]{1,4})?"; // sufixo do Fujifilm: -PS, -PIII, -P, -V
const BIO = [
  ["creat", "(?:CRE|CREA|CREAT)" + SUF + "\\b"],
  ["ureia", "(?:UREA|UREIA|URE)" + SUF + "\\b"],
  ["bun", "(?:BUN|UN)" + SUF + "\\b"],
  ["alt", "(?:GPT|ALT)(?:\\/ALT|\\/GPT)?" + SUF + "\\b"],
  ["ast", "(?:GOT|AST)(?:\\/AST|\\/GOT)?" + SUF + "\\b"],
  ["fa", "(?:ALPP|ALP|ALKP|FA)" + SUF + "\\b"],
  ["ggt", "(?:GGT|G-GT|Y-GT)" + SUF + "\\b"],
  ["bt", "(?:TBIL|T-BIL|TBILI)" + SUF + "\\b"],
  ["bd", "(?:DBIL|D-BIL)" + SUF + "\\b"],
  ["pt", "(?:TP|T-PRO|TPRO)" + SUF + "\\b"],
  ["alb", "ALB" + SUF + "\\b"],
  ["glob", "GLOB\\b"],
  ["gli", "(?:GLU|GLUC)" + SUF + "\\b"],
  ["col", "(?:TCHO|T-CHO|CHOL|TCHOL)" + SUF + "\\b"],
  ["tg", "(?:TG|TRIG)" + SUF + "\\b"],
  ["amil", "(?:AMYL|AMY|AMS)" + SUF + "\\b"],
  ["ca", "CA" + SUF + "\\b"],
  ["p", "(?:IP|PHOS)" + SUF + "\\b"],
  ["na", "NA" + SUF + "\\b"],
  ["k", "K" + SUF + "\\b"],
  ["cl", "CL" + SUF + "\\b"],
].map(([k, r]) => [k, new RegExp("^" + r)]);

// Número "limpo" logo depois do rótulo; recusa leituras duvidosas (ex.: "8Y.6") para não preencher errado
const TOKEN_NUM = /^[<>]?(\d+(?:\.\d+)?)[HL*]?[,;:)\]]*$/;
function numeroApos(resto) {
  for (const t of resto.trim().split(/\s+/)) {
    if (!/\d/.test(t)) continue; // pula "=", "-PS", unidades sem número
    // primeira letra trocada pelo OCR num número: s6.5 → 56.5, O.9 → 0.9, l61 → 161
    const tt = t.replace(/^[=:(\[]+/, "").replace(/^[S](?=[\d.])/, "5").replace(/^[OD](?=[\d.])/, "0").replace(/^[IL](?=\d)/, "1").replace(/^B(?=\d)/, "8");
    const m = tt.match(TOKEN_NUM);
    return m ? m[1] : null;
  }
  return null;
}
// Procura o rótulo no começo da linha, tolerando sujeira antes (bordas do papel, "|", "1.", "©")
function acharRotulo(l, re) {
  const ini = [];
  const lim = Math.min(l.length, 14);
  for (let i = 0; i < lim; i++) if (/[A-Z]/.test(l[i]) && (i === 0 || !/[A-Z0-9]/.test(l[i - 1]))) ini.push(i);
  for (const i of ini) {
    const m = l.slice(i).match(re);
    if (m) return { resto: l.slice(i + m[0].length) };
  }
  return null;
}
// limites do que um aparelho pode imprimir; fora disso é erro de leitura
const FAIXA_POSSIVEL = {
  hem: [0.3, 20], hb: [1, 30], ht: [3, 90], vcm: [25, 130], hcm: [5, 45], chcm: [15, 50], leu: [100, 300000], pla: [1, 3000],
  lin_p: [0, 100], mon_p: [0, 100], eos_p: [0, 100], gra_p: [0, 100], lin_a: [0, 200000], mon_a: [0, 100000], eos_a: [0, 100000], gra_a: [0, 200000],
  creat: [0.05, 25], ureia: [1, 450], bun: [1, 200], alt: [1, 5000], ast: [1, 5000], fa: [1, 5000], ggt: [0, 1000], bt: [0, 40], bd: [0, 30],
  pt: [1, 15], alb: [0.3, 8], glob: [0.3, 12], gli: [5, 900], col: [20, 1500], tg: [5, 3000], amil: [50, 10000], ca: [2, 20], p: [0.5, 25],
  na: [90, 200], k: [1, 12], cl: [60, 160],
};
const casas = (n, c) => String(Math.round(n * 10 ** c) / 10 ** c);
const mil = (v) => { let n = parseFloat(v); if (n < 300) n *= 1000; return String(Math.round(n)); };

/** texto do OCR → { hemo: {chave: "valor"}, bio: {chave: "valor"}, avisos: [], especie, nome } */
export function interpretar(texto) {
  const hemo = {}, bio = {}, avisos = [];
  const T = String(texto || "").toUpperCase();
  // espécie e nome, quando a impressão traz
  let especie = "";
  if (/\b(FELINE|FELINO|FELINA|CAT|GATO|GATA)\b/.test(T)) especie = "Felina";
  else if (/\b(CANINE|CANINO|CANINA|DOG|CAO|CÃO|CADELA|CACHORRO)\b/.test(T)) especie = "Canina";
  let nome = "";
  for (const linha of T.split("\n")) {
    const m = linha.match(/(?:^|[^A-Z0-9])(?:[I1L][D0O]|NAME|NOME|PACIENTE|PATIENT)\s*[=:.]?\s*([A-ZÀ-Ý]{2,20}(?: [A-ZÀ-Ý]{2,20})?)(?=\s{2,}|\s*\d|\s*$|\s+\W)/);
    const m2 = m && m.index < 14 ? m : linha.slice(0, 18).match(/[I1L{(\[|]D\s*(?:[=:]|E(?=[A-Z]{3}))\s*([A-ZÀ-Ý]{2,20})/) && linha.match(/[I1L{(\[|]D\s*(?:[=:]|E(?=[A-Z]{3}))\s*([A-ZÀ-Ý]{2,20})/);
    if (m2 && !/^(TYPE|MODE|NO)$/.test(m2[1])) { nome = m2[1].toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()); break; }
  }
  for (const bruta of String(texto || "").split(/\n/)) {
    const l = limparLinha(bruta).trim();
    if (/\/\s?CRE|RATIO|A\/G/.test(l)) continue; // relações (UREA/CRE) não são o analito
    let achou = false;
    for (const [k, re, tipo] of HEMO) {
      const r = acharRotulo(l, re);
      if (!r) continue;
      if (tipo === "dif") {
        // "LY 3.9 [27.4 %]": absoluto (×10³) e % entre colchetes
        if (hemo[k + "_a"] != null || hemo[k + "_p"] != null) continue;
        const toks = r.resto.trim().split(/\s+/).filter((t) => /\d/.test(t));
        const a = toks[0] ? numeroApos(toks[0]) : null;
        const p = toks[1] ? numeroApos(toks[1].replace(/^[\[({|]+/, "").replace(/%.*/, "")) : null;
        // exige o % entre colchetes: evita confundir texto solto do papel com diferencial
        if (p == null || !/[\[(%{]/.test(r.resto)) continue;
        if (a != null) hemo[k + "_a"] = mil(a);
        hemo[k + "_p"] = p;
        achou = true; break;
      }
      if (hemo[k] != null) continue;
      const v = numeroApos(r.resto);
      if (v == null) { achou = true; break; } // rótulo achado, número ilegível: não chuta
      const n = parseFloat(v);
      if (tipo === "leu" || tipo === "abs") hemo[k] = mil(v);
      else if (tipo === "pla") hemo[k] = String(Math.round(n > 5000 ? n / 1000 : n));
      else if (tipo === "hb") hemo[k] = n > 30 ? casas(n / 10, 1) : v;
      else if (tipo === "chcm") hemo[k] = n > 100 ? casas(n / 10, 1) : v;
      else hemo[k] = v;
      achou = true; break;
    }
    if (achou) continue;
    for (const [k, re] of BIO) {
      const r = acharRotulo(l, re);
      if (!r || bio[k] != null) continue;
      const v = numeroApos(r.resto);
      if (v != null) bio[k] = v;
      break;
    }
  }
  // descarta leituras impossíveis (OCR trocou dígito), para não preencher errado
  for (const [g, obj] of [["hemo", hemo], ["bio", bio]]) for (const k of Object.keys(obj)) {
    const f = FAIXA_POSSIVEL[k], n = parseFloat(obj[k]);
    if (f && !(n >= f[0] && n <= f[1])) delete obj[k];
  }
  // BUN (nitrogênio ureico) → ureia, quando o aparelho só imprime BUN
  if (bio.bun != null) {
    if (bio.ureia == null) { bio.ureia = casas(parseFloat(bio.bun) * 2.14, 1); avisos.push(`O aparelho imprimiu BUN ${bio.bun.replace(".", ",")}; convertido para ureia (× 2,14).`); }
    delete bio.bun;
  }
  // Hematócrito em fração (0,39) → %
  if (hemo.ht != null && parseFloat(hemo.ht) < 1.5) hemo.ht = casas(parseFloat(hemo.ht) * 100, 1);
  return { hemo, bio, avisos, especie, nome };
}

const NOMES = { leu: "Leucócitos", hem: "Hemácias", hb: "Hemoglobina", ht: "Hematócrito", vcm: "VCM", hcm: "HCM", chcm: "CHCM", pla: "Plaquetas",
  lin_p: "Linfócitos %", mon_p: "Monócitos %", eos_p: "Eosinófilos %", gra_p: "Granulócitos %", lin_a: "Linfócitos", mon_a: "Monócitos", eos_a: "Eosinófilos", gra_a: "Granulócitos",
  creat: "Creatinina", ureia: "Ureia", alt: "ALT", ast: "AST", fa: "Fosfatase alcalina", ggt: "GGT", bt: "Bilirrubina total", bd: "Bilirrubina direta", pt: "Proteínas totais", alb: "Albumina",
  glob: "Globulinas", gli: "Glicose", col: "Colesterol", tg: "Triglicerídeos", amil: "Amilase", ca: "Cálcio", p: "Fósforo", na: "Sódio", k: "Potássio", cl: "Cloreto" };

/** Junta leituras de versões diferentes da mesma foto. Valores que divergem viram aviso para conferir. */
export function interpretarVarios(textos) {
  const rs = textos.map(interpretar);
  const out = { hemo: {}, bio: {}, avisos: [], especie: "", nome: "", conferir: [] };
  for (const g of ["hemo", "bio"]) {
    const ks = new Set(rs.flatMap((r) => Object.keys(r[g])));
    for (const k of ks) {
      const vs = rs.map((r) => r[g][k]).filter((v) => v != null);
      // mais votado; empate fica com a primeira versão (binarizada)
      const cont = {}; vs.forEach((v) => (cont[v] = (cont[v] || 0) + 1));
      const melhor = vs.slice().sort((a, b) => cont[b] - cont[a])[0];
      out[g][k] = melhor;
      if (new Set(vs).size > 1) out.conferir.push(`${g}.${k}`);
    }
  }
  out.especie = rs.map((r) => r.especie).find(Boolean) || "";
  out.nome = rs.map((r) => r.nome).find(Boolean) || "";
  out.avisos = [...new Set(rs.flatMap((r) => r.avisos))];
  // diferencial tem que fechar perto de 100%
  const pcts = ["lin_p", "mon_p", "eos_p", "gra_p"].map((k) => parseFloat(out.hemo[k])).filter(Number.isFinite);
  if (pcts.length >= 3) {
    const soma = pcts.reduce((a, b) => a + b, 0);
    if (soma < 90 || soma > 110) out.avisos.push(`Confira o diferencial: a soma dos % lidos deu ${String(Math.round(soma * 10) / 10).replace(".", ",")}%.`);
  }
  if (out.conferir.length) out.avisos.push("Confira com atenção: " + out.conferir.map((c) => NOMES[c.split(".")[1]] || c).join(", ") + ".");
  return out;
}
