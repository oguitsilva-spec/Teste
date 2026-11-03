// Formatação, cálculos e o "leitor" de valores falados/escritos em português.
export const brl = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const brlShort = (n) => {
  n = Number(n) || 0;
  if (Math.abs(n) >= 1000) return 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
  return brl(n);
};

export const fmtNum = (n) => (n || n === 0 ? Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');

// Aceita "11.389,00", "11389", "11.389", "R$ 9.981,00", "1780.50", "7 mil"
export function parseMoney(v) {
  if (typeof v === 'number') return v;
  if (v == null) return 0;
  let s = String(v).toLowerCase().replace(/r\$|\s/g, '');
  if (!s) return 0;
  const mil = s.match(/^(\d+(?:[.,]\d+)?)mil(?:e?(\d+))?$/);
  if (mil) return parseFloat(mil[1].replace(',', '.')) * 1000 + (mil[2] ? parseInt(mil[2], 10) : 0);
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function daysBetween(fromISO, toISO) {
  if (!fromISO) return 0;
  const a = new Date(fromISO + 'T12:00:00');
  const b = toISO ? new Date(toISO + 'T12:00:00') : new Date();
  return Math.max(0, Math.round((b - a) / 86400000));
}

export const totalGastos = (m) => (m.gastos || []).reduce((s, g) => s + (Number(g.valor) || 0), 0);
export const custoTotal = (m) => (Number(m.valorCompra) || 0) + totalGastos(m);
export const lucroPrevisto = (m) => (m.precoVenda ? m.precoVenda - custoTotal(m) : null);
export const lucroReal = (m) => (m.venda ? (Number(m.venda.valor) || 0) - custoTotal(m) : null);
export const diasEstoque = (m) => daysBetween(m.dataEntrada, m.venda?.data);
export const titulo = (m) => [m.modelo, m.ano, m.cor].filter(Boolean).join(' ') || 'Moto sem nome';

export const STATUS = {
  preparacao: { label: 'Em preparação', cor: 'amber' },
  venda: { label: 'À venda', cor: 'green' },
  vendida: { label: 'Vendida', cor: 'slate' },
};

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Leitura de texto falado sem IA (modo offline / sem chave) ----------
const NUM_PALAVRAS = {
  zero: 0, dois: 2, duas: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
  cem: 100, cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400, quinhentos: 500, seiscentos: 600,
  setecentos: 700, oitocentos: 800, novecentos: 900,
};

// "onze mil trezentos e oitenta e nove" -> "11389"; "7 mil e 500" -> "7500"; "R$ 11.389,00" -> "11389.00"
export function normalizarNumeros(texto) {
  let t = ' ' + texto.toLowerCase() + ' ';
  t = t.replace(/r\$\s*/g, '');
  // números por extenso
  const palavras = Object.keys(NUM_PALAVRAS).sort((a, b) => b.length - a.length).join('|');
  const re = new RegExp(`((?:\\b(?:${palavras}|mil|e)\\b\\s*)+)`, 'g');
  t = t.replace(re, (trecho) => {
    const toks = trecho.trim().split(/\s+/).filter((w) => w !== 'e');
    if (!toks.length || !toks.some((w) => w in NUM_PALAVRAS || w === 'mil')) return trecho;
    if (toks.every((w) => w === 'mil')) return trecho;
    let total = 0, atual = 0;
    for (const w of toks) {
      if (w === 'mil') { total += (atual || 1) * 1000; atual = 0; }
      else atual += NUM_PALAVRAS[w] ?? 0;
    }
    return ' ' + (total + atual) + ' ';
  });
  // "7 mil e 500" / "7 mil 500" / "7 mil"
  t = t.replace(/(\d+(?:[.,]\d+)?)\s*mil(?:\s*e)?\s*(\d{1,3})?(?!\d)/g, (_, a, b) =>
    String(Math.round(parseFloat(a.replace(',', '.')) * 1000 + (b ? parseInt(b, 10) : 0))));
  // "11.389,00" -> 11389.00 ; "11.389" -> 11389
  t = t.replace(/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+,\d{1,2}/g, (n) => String(parseMoney(n)));
  return t.replace(/\s+/g, ' ').trim();
}

const NUM = '(\\d+(?:\\.\\d+)?)';
const cap = (s) => s.split(' ').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');

// Extrai dados de uma moto a partir de um texto ditado. Heurístico — a IA faz melhor.
export function parseMotoTexto(texto) {
  const t = normalizarNumeros(texto);
  const pega = (re) => { const m = t.match(re); return m ? parseFloat(m[1]) : null; };
  const r = { gastos: [] };
  r.fipe = pega(new RegExp(`fip[ea]?\\s*(?:de|é|e|:|da)?\\s*${NUM}`));
  r.valorCompra = pega(new RegExp(`(?:comprei|compra|paguei|custo|custou|peguei)\\D{0,25}?${NUM}`));
  r.precoVenda = pega(new RegExp(`(?:vender|venda|vendo|anunciar|pedir)\\D{0,25}?${NUM}`));
  const ano = t.match(/\b(19[89]\d|20[0-4]\d)\b/);
  if (ano) r.ano = ano[1];
  const km = t.match(/(\d+)\s*(?:km|quil[oô]metros)/);
  if (km) r.km = parseInt(km[1], 10);
  const cores = ['preta', 'preto', 'branca', 'branco', 'vermelha', 'vermelho', 'azul', 'prata', 'cinza', 'amarela', 'verde', 'laranja', 'grafite', 'vinho', 'roxa'];
  const cor = cores.find((c) => new RegExp(`\\b${c}\\b`).test(t));
  if (cor) r.cor = cor[0].toUpperCase() + cor.slice(1);
  const proc = t.match(/(?:comprei|peguei) (?:d[oae]|com) ([a-zà-ú ]{3,30}?)(?: por| a | de \d|,|\.|$)/);
  if (proc) r.procedencia = cap(proc[1].trim());
  // modelo: palavras depois de "moto" / "uma" até o ano
  const mod = t.match(/(?:moto|uma|um)\s+([a-z0-9à-ú ]{3,40}?)\s+(?:19|20)\d\d/);
  if (mod) r.modelo = cap(mod[1]);
  r.gastos = parseGastosTexto(t, true);
  return r;
}

// "gastei 150 de pneu, 635 no mecânico e 50 de lavagem"
export function parseGastosTexto(texto, jaNormalizado = false) {
  const t = jaNormalizado ? texto : normalizarNumeros(texto);
  const out = [];
  const trechoGastos = t.split(/gast(?:ei|os?|o)|despesas?/).slice(1).join(' ') || (jaNormalizado ? '' : t);
  const re = /(\d+(?:\.\d+)?)\s*(?:reais)?\s*(?:de|do|da|no|na|com|em|pra|para)\s+([a-zà-ú ]{3,30}?)(?=\s*(?:,|\.|;| e \d| e mais|\d|$))/g;
  let m;
  while ((m = re.exec(trechoGastos))) {
    const desc = m[2].trim();
    if (/^(fipe|venda|vender|compra)/.test(desc)) continue;
    out.push({ descricao: desc[0].toUpperCase() + desc.slice(1), valor: parseFloat(m[1]) });
  }
  return out;
}
