// Leitura inteligente da ficha (foto) e do áudio (texto transcrito) com o Claude.
// MVP: a chave da API fica salva só neste aparelho (Ajustes). Em produção, mover
// a chamada para um backend para não expor a chave no navegador.
import { blobToDataURL } from './db.js';

const SDK_URL = './vendor/anthropic-sdk.js'; // @anthropic-ai/sdk 0.136.0 empacotado (esbuild)
const MODEL = 'claude-opus-5-5';
const KEY_STORAGE = 'garagem.apiKey';

export const getApiKey = () => { try { return localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; } };
export const setApiKey = (k) => { try { k ? localStorage.setItem(KEY_STORAGE, k.trim()) : localStorage.removeItem(KEY_STORAGE); } catch {} };
export const temIA = () => !!getApiKey() && navigator.onLine;

let clientPromise;
async function getClient() {
  const key = getApiKey();
  if (!key) throw new Error('Configure a chave da IA em Ajustes.');
  if (!clientPromise || clientPromise.key !== key) {
    clientPromise = import(SDK_URL).then(({ default: Anthropic }) => new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true }));
    clientPromise.key = key;
  }
  return clientPromise;
}

const num = { type: ['number', 'null'] };
const str = { type: ['string', 'null'] };
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['modelo', 'marca', 'ano', 'cor', 'placa', 'km', 'procedencia', 'dataEntrada', 'fipe', 'valorCompra', 'precoVenda', 'gastos', 'custoTotalAnotado', 'observacoes'],
  properties: {
    modelo: { ...str, description: 'Modelo/versão da moto, ex: "Fazer 150 ED"' },
    marca: { ...str, description: 'Marca, ex: Yamaha, Honda (deduza pelo modelo se não estiver escrito)' },
    ano: str,
    cor: str,
    placa: str,
    km: num,
    procedencia: { ...str, description: 'De quem/onde a moto foi comprada' },
    dataEntrada: { ...str, description: 'Data de entrada no formato AAAA-MM-DD' },
    fipe: { ...num, description: 'Valor da tabela FIPE em reais' },
    valorCompra: { ...num, description: 'Quanto a loja pagou pela moto (custo de compra, sem os gastos)' },
    precoVenda: { ...num, description: 'Preço de venda pretendido, se informado' },
    gastos: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['descricao', 'valor'],
        properties: { descricao: { type: 'string' }, valor: { type: 'number' } },
      },
    },
    custoTotalAnotado: { ...num, description: 'Custo total escrito na ficha (compra + gastos), se houver' },
    observacoes: { ...str, description: 'Qualquer coisa ilegível ou duvidosa, em português, curta' },
  },
};

const SYSTEM = `Você ajuda o dono de uma loja de motos usadas no Brasil a registrar cada moto que entra.
Ele anota numa ficha de papel: data de entrada, modelo/ano/cor, valor FIPE, procedência,
"Custo" (quanto pagou na moto), a lista de "Gastos" (valor + descrição: peças, mecânico, pneu,
cartório, lavagem, pintura, garantia etc.) e o custo total (compra + soma dos gastos).
Extraia os dados com cuidado. Valores estão em reais no formato brasileiro (11.389,00 = 11389).
A letra é de mão e pode estar torta ou girada. Se a soma dos gastos não bater com o total anotado,
releia os números duvidosos e registre a dúvida em "observacoes". Datas com ano de 2 dígitos são 20xx.
Não invente: use null quando a informação não existir.`;

async function extrair(content, { esforco = 'medium' } = {}) {
  const client = await getClient();
  const res = await client.beta.messages.create(params(content, esforco)).catch((e) => {
    if (e.status === 401) throw new Error('Chave da IA inválida — confira em Ajustes.');
    if (e.status === 429) throw new Error('Muitas leituras seguidas, espere um minuto.');
    if (e.status >= 500 || !e.status) throw new Error('Serviço de IA fora do ar ou sem internet.');
    throw e;
  });
  if (res.stop_reason === 'refusal') throw new Error('A IA não conseguiu processar este conteúdo.');
  if (res.stop_reason === 'max_tokens') throw new Error('Resposta da IA incompleta. Tente de novo.');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(text);
}

function params(content, esforco) {
  return ({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: esforco, format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content }],
  });
}

export async function lerFicha(blob) {
  const dataUrl = await blobToDataURL(blob);
  const [meta, data] = dataUrl.split(',');
  const media_type = meta.match(/data:(.*?);/)[1];
  return extrair([
    { type: 'image', source: { type: 'base64', media_type, data } },
    { type: 'text', text: `Esta é a foto de uma ficha de controle de moto. Hoje é ${new Date().toLocaleDateString('pt-BR')}. Extraia os dados.` },
  ], { esforco: 'high' });
}

export async function lerAudio(texto) {
  return extrair([
    { type: 'text', text: `O dono da loja falou isto (transcrição automática de áudio, pode ter erros de reconhecimento). Hoje é ${new Date().toLocaleDateString('pt-BR')}; se ele não disser a data, use hoje.\n\n"""${texto}"""` },
  ]);
}

// Diferenças com a soma dos gastos para avisar o usuário.
export function conferirSoma(r) {
  const soma = (r.gastos || []).reduce((s, g) => s + (g.valor || 0), 0);
  if (r.custoTotalAnotado && r.valorCompra != null) {
    const diff = r.custoTotalAnotado - (r.valorCompra + soma);
    if (Math.abs(diff) > 1) return `Atenção: a ficha diz custo total ${r.custoTotalAnotado.toLocaleString('pt-BR')}, mas compra + gastos dá ${(r.valorCompra + soma).toLocaleString('pt-BR')} (diferença de ${diff.toLocaleString('pt-BR')}). Confira os valores.`;
  }
  return null;
}
