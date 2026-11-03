// Consulta da Tabela FIPE de motos (API pública e gratuita: parallelum.com.br/fipe).
const BASE = 'https://parallelum.com.br/fipe/api/v1/motos';

async function get(path) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(BASE + path, { signal: ctrl.signal });
    if (res.status === 429) throw new Error('Muitas consultas à FIPE hoje. Tente mais tarde.');
    if (!res.ok) throw new Error('A consulta da FIPE falhou (' + res.status + ').');
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError' || e instanceof TypeError) throw new Error('Não consegui acessar a FIPE. Verifique a internet.');
    throw e;
  } finally {
    clearTimeout(t);
  }
}

const cache = (key, ms, fn) => async () => {
  try {
    const c = JSON.parse(localStorage.getItem(key) || 'null');
    if (c && Date.now() - c.t < ms) return c.v;
  } catch {}
  const v = await fn();
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch {}
  return v;
};

export const marcas = cache('garagem.fipe.marcas', 7 * 864e5, () => get('/marcas'));
export const modelos = async (marca) => (await get(`/marcas/${marca}/modelos`)).modelos;
export const anos = (marca, modelo) => get(`/marcas/${marca}/modelos/${modelo}/anos`);

// Retorna { valor, mesReferencia, codigoFipe, marca, modelo, ano, combustivel }
export async function valor(marca, modelo, ano) {
  const r = await get(`/marcas/${marca}/modelos/${modelo}/anos/${ano}`);
  return {
    valor: Number(String(r.Valor).replace(/[^\d,]/g, '').replace(',', '.')),
    mesReferencia: (r.MesReferencia || '').trim().replace(/^./, (c) => c.toUpperCase()),
    codigoFipe: r.CodigoFipe,
    marca: r.Marca,
    modelo: r.Modelo,
    ano: String(r.AnoModelo === 32000 ? 'Zero km' : r.AnoModelo),
    combustivel: r.Combustivel,
  };
}

// Normaliza para comparar nomes: "Fazer 150 ED" ~ "YS 150 FAZER ED/ SED Flex"
export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Pontua quão parecido o nome FIPE é com o que foi digitado (palavras em comum).
export function score(nomeFipe, digitado) {
  const a = norm(nomeFipe).split(' ');
  const b = norm(digitado).split(' ').filter(Boolean);
  if (!b.length) return 0;
  return b.reduce((s, w) => s + (a.includes(w) ? 2 : a.some((x) => x.startsWith(w) || w.startsWith(x)) ? 1 : 0), 0) / b.length;
}
