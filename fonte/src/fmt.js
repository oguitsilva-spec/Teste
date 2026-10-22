// Formatação no padrão brasileiro e leitura de números digitados no celular.

/** Lê decimal aceitando vírgula ou ponto: "6,9" / "6.9" → 6.9 */
export function numDec(s) {
  if (s == null) return NaN;
  const t = String(s).trim().replace(/\s/g, "").replace(",", ".");
  if (!t || !/^[<>]?-?\d*\.?\d+$/.test(t)) return NaN;
  return parseFloat(t.replace(/^[<>]/, ""));
}

/** Lê contagem inteira ignorando separador de milhar: "29.700" → 29700 */
export function numInt(s) {
  if (s == null) return NaN;
  const t = String(s).trim().replace(/[.\s]/g, "").replace(",", ".");
  if (!t || !/^[<>]?\d+(\.\d+)?$/.test(t)) return NaN;
  return Math.round(parseFloat(t.replace(/^[<>]/, "")));
}

/** Milhar com ponto: 29700 → "29.700" */
export function milhar(n) {
  if (!Number.isFinite(n)) return "";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Mostra decimal como foi digitado, só trocando ponto por vírgula */
export function dec(s) {
  if (s == null) return "";
  const t = String(s).trim();
  if (/^\d{4,}$/.test(t)) return milhar(parseInt(t, 10)); // 1200 → 1.200
  return t.replace(".", ",");
}

/** Número calculado com casas fixas: 0.7123 → "0,71" */
export function fixo(n, casas = 2) {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(casas).replace(".", ",");
}

/** Lê "5,5" ou "8.000" de uma tabela de referência */
export function numRef(s) {
  if (s == null || s === "") return NaN;
  const t = String(s).trim();
  // "8.000" (milhar) × "12.5" (decimal antigo): milhar quando há exatamente 3 dígitos após o ponto
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return parseInt(t.replace(/\./g, ""), 10);
  return parseFloat(t.replace(",", "."));
}

export function faixa(r) {
  return r ? `${r[0]} a ${r[1]}` : "";
}

/** "alto" | "baixo" | "" comparando valor com [min, max] */
export function flag(v, r) {
  if (!r || !Number.isFinite(v)) return "";
  const a = numRef(r[0]), b = numRef(r[1]);
  if (Number.isFinite(b) && v > b) return "alto";
  if (Number.isFinite(a) && v < a) return "baixo";
  return "";
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function dataBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
export function dataExtenso(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}
export function horaBR(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export function dataHojeISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Idade em meses a partir de número + unidade */
export function idadeMeses(n, u) {
  const v = numDec(n);
  if (!Number.isFinite(v)) return NaN;
  if (u === "dias") return v / 30;
  return u === "meses" ? v : v * 12;
}
export function idadeTexto(n, u) {
  const t = String(n ?? "").trim();
  if (!t) return "";
  if (!/^\d+([.,]\d+)?$/.test(t)) return t; // "Adulta", "Aprox. 2 meses"
  const v = numDec(t);
  const un = u === "anos" ? (v === 1 ? "ano" : "anos") : u === "meses" ? (v === 1 ? "mês" : "meses") : v === 1 ? "dia" : "dias";
  return `${dec(t)} ${un}`;
}
