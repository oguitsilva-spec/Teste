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

// [chave do app, regex do rótulo no início da linha, tipo]
// tipo: "pct" (%), "abs" (contagem absoluta), "val" (valor direto)
const HEMO = [
  ["lin_p", /^\s*\*?\s*(LYMPH|LYM|LY|LINF)\s?%/, "pct"],
  ["mon_p", /^\s*\*?\s*(M[O0]N[O0]|M[O0]N|M[O0]|MID)\s?%/, "pct"],
  ["eos_p", /^\s*\*?\s*(E[O0]S|E[O0])\s?%/, "pct"],
  ["gra_p", /^\s*\*?\s*(GRAN|GRA|GR|NEU|NEUT)\s?%/, "pct"],
  ["lin_a", /^\s*\*?\s*(LYMPH|LYM|LY|LINF)\s?[#H4]/, "abs"],
  ["mon_a", /^\s*\*?\s*(M[O0]N[O0]|M[O0]N|M[O0]|MID)\s?[#H4]/, "abs"],
  ["eos_a", /^\s*\*?\s*(E[O0]S|E[O0])\s?[#H4]/, "abs"],
  ["gra_a", /^\s*\*?\s*(GRAN|GRA|GR|NEU|NEUT)\s?[#H4]/, "abs"],
  ["leu", /^\s*\*?\s*W\.?\s?B\.?\s?C\b/, "leu"],
  ["hem", /^\s*\*?\s*R\.?\s?B\.?\s?C\b/, "val"],
  ["hb", /^\s*\*?\s*(HGB|HG8|HB)\b/, "hb"],
  ["ht", /^\s*\*?\s*(HCT|HTC|HT)\b/, "val"],
  ["chcm", /^\s*\*?\s*MCHC\b/, "chcm"],
  ["hcm", /^\s*\*?\s*MCH\b/, "val"],
  ["vcm", /^\s*\*?\s*MCV\b/, "val"],
  ["pla", /^\s*\*?\s*PLT\b/, "pla"],
];

const BIO = [
  ["creat", /^\s*\*?\s*(CRE|CREA|CREAT)(-?P[I1L]{1,3})?\b/],
  ["ureia", /^\s*\*?\s*(UREA|UREIA|URE)\b/],
  ["bun", /^\s*\*?\s*(BUN|UN)(-?P[I1L]{1,3})?\b/],
  ["alt", /^\s*\*?\s*(GPT|ALT)(\/ALT|\/GPT)?(-?P[I1L]{1,3})?\b/],
  ["ast", /^\s*\*?\s*(GOT|AST)(\/AST|\/GOT)?(-?P[I1L]{1,3})?\b/],
  ["fa", /^\s*\*?\s*(ALP|ALKP|FA)(-?P[I1L]{1,3})?\b/],
  ["ggt", /^\s*\*?\s*(GGT|G-GT|γ-GT|Y-GT)(-?P[I1L]{1,3})?\b/],
  ["bt", /^\s*\*?\s*(TBIL|T-BIL|TBILI)(-?P[I1L]{1,3})?\b/],
  ["bd", /^\s*\*?\s*(DBIL|D-BIL)(-?P[I1L]{1,3})?\b/],
  ["pt", /^\s*\*?\s*(TP|T-PRO|TPRO)(-?P[I1L]{1,3})?\b/],
  ["alb", /^\s*\*?\s*(ALB)(-?P[I1L]{1,3})?\b/],
  ["glob", /^\s*\*?\s*(GLOB)\b/],
  ["gli", /^\s*\*?\s*(GLU|GLUC)(-?P[I1L]{1,3})?\b/],
  ["col", /^\s*\*?\s*(TCHO|T-CHO|CHOL|TCHOL)(-?P[I1L]{1,3})?\b/],
  ["tg", /^\s*\*?\s*(TG|TRIG)(-?P[I1L]{1,3})?\b/],
  ["amil", /^\s*\*?\s*(AMYL|AMY|AMS)(-?P[I1L]{1,3})?\b/],
  ["ca", /^\s*\*?\s*(CA)(-?P[I1L]{1,3})?\b/],
  ["p", /^\s*\*?\s*(IP|PHOS|IP-P)(-?P[I1L]{1,3})?\b/],
  ["na", /^\s*\*?\s*(NA)\b/],
  ["k", /^\s*\*?\s*(K)\b/],
  ["cl", /^\s*\*?\s*(CL)\b/],
];

function primeiroNumero(resto) {
  const m = resto.match(NUM);
  return m ? m[0].replace(/^[<>]/, "") : null;
}
const casas = (n, c) => String(Math.round(n * 10 ** c) / 10 ** c);

/** texto do OCR → { hemo: {chave: "valor"}, bio: {chave: "valor"}, avisos: [] } */
export function interpretar(texto) {
  const hemo = {}, bio = {}, avisos = [];
  const T = String(texto || "").toUpperCase();
  // espécie e nome, quando a impressão traz
  let especie = "";
  if (/\b(FELINE|FELINO|FELINA|CAT|GATO|GATA)\b/.test(T)) especie = "Felina";
  else if (/\b(CANINE|CANINO|CANINA|DOG|CAO|CÃO|CADELA)\b/.test(T)) especie = "Canina";
  const mNome = String(texto || "").match(/(?:^|\n)\s*(?:NAME|NOME|PACIENTE|PATIENT|ANIMAL)\s*[:.]?\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '-]{1,30})/i);
  const nome = mNome ? mNome[1].trim().replace(/\s{2,}.*$/, "").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  for (const bruta of String(texto || "").split(/\n/)) {
    const l = limparLinha(bruta);
    let achou = false;
    for (const [k, re, tipo] of HEMO) {
      const m = l.match(re);
      if (!m || hemo[k] != null) continue;
      const v = primeiroNumero(l.slice(m.index + m[0].length));
      if (v == null) continue;
      let n = parseFloat(v);
      if (tipo === "leu" || tipo === "abs") { if (n < 300) n = n * 1000; hemo[k] = String(Math.round(n)); }
      else if (tipo === "pla") { if (n > 5000) n = n / 1000; hemo[k] = String(Math.round(n)); }
      else if (tipo === "hb") { hemo[k] = n > 30 ? casas(n / 10, 1) : v; }
      else if (tipo === "chcm") { hemo[k] = n > 100 ? casas(n / 10, 1) : v; }
      else hemo[k] = v;
      achou = true; break;
    }
    if (achou) continue;
    for (const [k, re] of BIO) {
      const m = l.match(re);
      if (!m || bio[k] != null) continue;
      const v = primeiroNumero(l.slice(m.index + m[0].length));
      if (v == null) continue;
      bio[k] = v; break;
    }
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
