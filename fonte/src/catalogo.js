// Catálogo de exames da Zog: tabelas de referência do hospital e montagem de cada laudo
// em "blocos" genéricos, que viram PDF, .docx, prévia em HTML e texto.
import { numDec, numInt, milhar, dec, fixo, faixa, flag, idadeMeses, idadeTexto, dataBR, dataExtenso, numRef } from "./fmt.js";

export const HOSPITAL = {
  nome: "Zog Hospital Veterinário",
  endereco: ["Av. Affonso José Aiello, 6-10 · Vila Aviação", "CEP 17018-520 · Bauru-SP"],
  telefones: "(14) 3208-0723 · (14) 99888-9486",
  email: "hospitalveterinariozog@gmail.com",
  cidade: "Bauru",
};

export const VETERINARIOS = [
  { nome: "Thialla Odorício Garcia", titulo: "Médica Veterinária", crmv: "CRMV-SP 33229" },
  { nome: "Anna Laura Cassettari", titulo: "Médica Veterinária", crmv: "CRMV-SP 72047" },
];
export const SOLICITANTES = ["Dra. Ana Paula Freddi", "Dra. Anna Laura Cassettari", "Dra. Thialla Odorício Garcia", "Dr. Glauder Rocha Lago", "Dr. Gabriel Felipe", "Dra. Marina Wariss", "Dr. João Pacheco"];

/* ───────────── HEMOGRAMA ───────────── */

// [mín, máx] como aparecem no laudo; números grandes já com ponto de milhar
export const HEMO_FAIXAS = {
  Canina: [
    { id: "cao-ate3m", nome: "Filhote até 3 meses", ateMeses: 3,
      r: { hem: ["3,5", "6"], hb: ["8,5", "13"], ht: ["26", "39"], vcm: ["69", "83"], hcm: ["22", "25"], chcm: ["31", "33"], leu: ["8.000", "16.000"], lin: ["2.240", "7.200"], mon: ["100", "1.600"], eos: ["80", "800"], gra: ["3.760", "11.040"], pla: ["200", "500"], ppt: ["6,0", "8,0"] } },
    { id: "cao-3a6m", nome: "Filhote 3 a 6 meses", ateMeses: 6,
      r: { hem: ["5,5", "7"], hb: ["11", "15,5"], ht: ["36", "40"], vcm: ["65", "78"], hcm: ["20", "24"], chcm: ["30", "35"], leu: ["8.000", "16.000"], lin: ["2.240", "7.200"], mon: ["100", "1.600"], eos: ["80", "800"], gra: ["3.760", "11.040"], pla: ["200", "500"], ppt: ["6,0", "8,0"] } },
    { id: "cao-6a12m", nome: "Filhote 6 a 12 meses", ateMeses: 12,
      r: { hem: ["6", "8"], hb: ["14", "17"], ht: ["40", "47"], vcm: ["65", "78"], hcm: ["21", "25"], chcm: ["30", "35"], leu: ["8.000", "16.000"], lin: ["1.600", "6.400"], mon: ["160", "1.280"], eos: ["80", "960"], gra: ["4.400", "11.200"], pla: ["200", "500"], ppt: ["6,0", "8,0"] } },
    { id: "cao-adulto", nome: "Adulto 1 a 8 anos", ateMeses: 96,
      r: { hem: ["5,5", "8,5"], hb: ["12", "18"], ht: ["37", "55"], vcm: ["60", "77"], hcm: ["19", "23"], chcm: ["32", "36"], leu: ["6.000", "17.000"], lin: ["1.000", "4.800"], mon: ["150", "1.350"], eos: ["150", "1.250"], gra: ["3.000", "11.500"], pla: ["200", "500"], ppt: ["6,0", "8,0"] } },
    { id: "cao-idoso", nome: "Idoso acima de 8 anos", ateMeses: Infinity,
      r: { hem: ["5,7", "8,5"], hb: ["14", "18"], ht: ["38", "47"], vcm: ["63", "77"], hcm: ["21", "26"], chcm: ["31", "35"], leu: ["6.000", "16.000"], lin: ["780", "6.400"], mon: ["60", "960"], eos: ["60", "1.440"], gra: ["3.300", "12.800"], pla: ["200", "500"], ppt: ["6,0", "8,0"] } },
  ],
  Felina: [
    { id: "gato-ate6m", nome: "Filhote até 6 meses", ateMeses: 6,
      r: { hem: ["3,5", "8"], hb: ["7", "14"], ht: ["22", "38"], vcm: ["40", "55"], hcm: ["13", "17"], chcm: ["31", "35"], leu: ["6.000", "17.000"], lin: ["1.500", "7.000"], mon: ["0", "850"], eos: ["0", "1.500"], gra: ["4.400", "11.200"], pla: ["300", "800"] } },
    { id: "gato-adulto", nome: "Adulto", ateMeses: Infinity,
      r: { hem: ["5", "10"], hb: ["8", "15"], ht: ["24", "45"], vcm: ["39", "55"], hcm: ["12,5", "17,5"], chcm: ["30", "36"], leu: ["5.500", "19.500"], lin: ["1.500", "7.000"], mon: ["0", "850"], eos: ["0", "1.500"], gra: ["4.400", "11.200"], pla: ["200", "680"] } },
  ],
};

export const HEMO_ERITRO = [
  { k: "hem", nome: "Hemácias", u: "x10⁶/µL", tipo: "dec" },
  { k: "hb", nome: "Hemoglobina", u: "g/dL", tipo: "dec" },
  { k: "ht", nome: "Hematócrito", u: "%", tipo: "dec" },
  { k: "vcm", nome: "VCM", u: "fL", tipo: "dec" },
  { k: "hcm", nome: "HCM", u: "pg", tipo: "dec" },
  { k: "chcm", nome: "CHCM", u: "g/dL", tipo: "dec" },
];
export const HEMO_DIF = [
  { k: "lin", nome: "Linfócitos" },
  { k: "mon", nome: "Monócitos" },
  { k: "eos", nome: "Eosinófilos" },
  { k: "gra", nome: "Granulócitos" },
];

export function especieDe(p) {
  const e = (p?.especie || "").toLowerCase();
  return e.startsWith("fel") || e.startsWith("gat") ? "Felina" : "Canina";
}

/** Escolhe a faixa pela idade; devolve {faixa, aviso} */
export function faixaHemograma(paciente, escolha = "auto") {
  const lista = HEMO_FAIXAS[especieDe(paciente)];
  if (escolha && escolha !== "auto") {
    const f = lista.find((x) => x.id === escolha);
    if (f) return { faixa: f, aviso: "" };
  }
  const m = idadeMeses(paciente?.idadeN, paciente?.idadeU);
  if (!Number.isFinite(m)) {
    const adulto = lista.find((x) => x.id.endsWith("adulto"));
    return { faixa: adulto, aviso: "Idade não informada em número: usando a tabela de adulto. Confira antes de liberar." };
  }
  return { faixa: lista.find((x) => m <= x.ateMeses), aviso: "" };
}

/** Absoluto do diferencial: o do aparelho, ou leucócitos × %, arredondado à centena */
export function absolutoDif(leu, pct, digitado) {
  const a = numInt(digitado);
  if (Number.isFinite(a)) return { v: a, calculado: false };
  const L = numInt(leu), p = numDec(pct);
  if (Number.isFinite(L) && Number.isFinite(p)) return { v: Math.round((L * p) / 100 / 100) * 100, calculado: true };
  return { v: NaN, calculado: false };
}

const vazio = (s) => s == null || String(s).trim() === "";

function construirHemograma(ex, laudo) {
  const v = ex.v || {}, obs = ex.obs || {};
  const { faixa: F } = faixaHemograma(laudo.paciente, ex.faixa);
  const R = F.r;
  const L = [];
  const linha = (nome, res, abs, ref, flg) => L.push({ tipo: "linha", c: [nome, res, abs || "", ref || ""], flag: flg || "" });

  L.push({ tipo: "sec", texto: "Eritrograma" });
  for (const p of HEMO_ERITRO) {
    linha(p.nome, vazio(v[p.k]) ? "" : `${dec(v[p.k])} ${p.u}`, "", R[p.k] ? `${faixa(R[p.k])} ${p.u}` : "", flag(numDec(v[p.k]), R[p.k]));
  }
  if (!vazio(v.ppt)) linha("Proteína plasmática total", `${dec(v.ppt)} g/dL`, "", R.ppt ? `${faixa(R.ppt)} g/dL` : "", flag(numDec(v.ppt), R.ppt));
  if (!vazio(obs.verm)) L.push({ tipo: "obs", rotulo: "Observação série vermelha", texto: obs.verm });

  L.push({ tipo: "sec", texto: "Leucograma" });
  const leu = numInt(v.leu);
  linha("Leucócitos totais", Number.isFinite(leu) ? `${milhar(leu)} /µL` : "", "", `${faixa(R.leu)} /µL`, flag(leu, R.leu));
  for (const p of HEMO_DIF) {
    const pct = v[p.k + "_p"];
    const abs = absolutoDif(v.leu, pct, v[p.k + "_a"]);
    linha(p.nome, vazio(pct) ? "" : `${dec(pct)} %`, Number.isFinite(abs.v) ? `${milhar(abs.v)} /µL` : "", `${faixa(R[p.k])} /µL`, flag(abs.v, R[p.k]));
  }
  if (!vazio(obs.branca)) L.push({ tipo: "obs", rotulo: "Observação série branca", texto: obs.branca });

  L.push({ tipo: "sec", texto: "Plaquetograma" });
  const pla = numInt(v.pla);
  linha("Plaquetas", Number.isFinite(pla) ? `${milhar(pla)} x10³/µL` : "", "", `${faixa(R.pla)} x10³/µL`, flag(pla, R.pla));
  if (!vazio(obs.plaq)) L.push({ tipo: "obs", rotulo: "Observação plaquetas", texto: obs.plaq });
  if (!vazio(obs.geral)) L.push({ tipo: "obs", rotulo: "Observações", texto: obs.geral, sep: true });

  return {
    titulo: "Hemograma",
    meta: [["Material", "Sangue"], ["Metodologia", "Automatizada"], ["Referência", `${especieDe(laudo.paciente) === "Felina" ? "Felino" : "Canino"} · ${F.nome.toLowerCase()}`]],
    conteudo: [{ t: "tabela", cols: [
      { h: "Parâmetro", w: 0.27 }, { h: "Resultado", w: 0.23, forte: true }, { h: "Absoluto", w: 0.18, forte: true }, { h: "Valores de referência", w: 0.32 },
    ], linhas: L }],
  };
}

/* ───────────── BIOQUÍMICO ───────────── */

export const BIO_GRUPOS = ["Função renal", "Função hepática", "Proteínas", "Metabolismo e pâncreas", "Eletrólitos e minerais"];

// ref: { Canina: [mín, máx] | texto, Felina: ... }; ausência = sem referência do hospital
export const BIO_ANALITOS = [
  { k: "creat", nome: "Creatinina", u: "mg/dL", g: 0, ref: { Canina: ["0,50", "1,50"], Felina: { idade: [["< 1 ano", "0,00", "1,20"], ["≥ 1 ano", "0,80", "1,80"]] } } },
  { k: "ureia", nome: "Ureia", u: "mg/dL", g: 0, ref: { Canina: ["21,0", "59,9"], Felina: ["20,0", "65,0"] } },
  { k: "alt", nome: "ALT (TGP)", u: "UI/L", g: 1, ref: { Canina: ["21,0", "86,0"], Felina: ["10,0", "80,0"] } },
  { k: "ast", nome: "AST (TGO)", u: "UI/L", g: 1, ref: { Canina: ["10,0", "88,0"], Felina: ["10,0", "80,0"] } },
  { k: "fa", nome: "Fosfatase alcalina", u: "UI/L", g: 1, ref: { Canina: ["20,0", "156,0"], Felina: ["25,0", "93,0"] } },
  { k: "ggt", nome: "Gama-GT (GGT)", u: "UI/L", g: 1, ref: { Felina: ["0", "10,0"] } },
  { k: "bt", nome: "Bilirrubina total", u: "mg/dL", g: 1, ref: { Felina: ["0,15", "0,50"] } },
  { k: "bd", nome: "Bilirrubina direta", u: "mg/dL", g: 1, ref: {} },
  { k: "bi", nome: "Bilirrubina indireta", u: "mg/dL", g: 1, ref: {}, calc: "bi" },
  { k: "pt", nome: "Proteínas totais", u: "g/dL", g: 2, ref: { Felina: ["5,4", "7,8"] } },
  { k: "alb", nome: "Albumina", u: "g/dL", g: 2, ref: { Canina: ["2,6", "3,3"], Felina: ["2,1", "3,3"] } },
  { k: "glob", nome: "Globulinas", u: "g/dL", g: 2, ref: { Felina: ["2,6", "5,1"] }, calc: "glob" },
  { k: "ag", nome: "Relação albumina/globulina", u: "", g: 2, ref: {}, calc: "ag" },
  { k: "col", nome: "Colesterol", u: "mg/dL", g: 3, ref: { Canina: ["100", "270"], Felina: ["95", "130"] } },
  { k: "tg", nome: "Triglicerídeos", u: "mg/dL", g: 3, ref: { Canina: ["50", "100"], Felina: ["50", "100"] } },
  { k: "gli", nome: "Glicose", u: "mg/dL", g: 3, ref: { Felina: ["70", "110"] } },
  { k: "amil", nome: "Amilase", u: "U/L", g: 3, int: true, ref: { Felina: ["860", "2.315"] } },
  { k: "na", nome: "Sódio (Na)", u: "mEq/L", g: 4, ref: { Canina: ["141", "152"], Felina: ["147", "156"] } },
  { k: "k", nome: "Potássio (K)", u: "mEq/L", g: 4, ref: { Canina: ["4,37", "5,65"], Felina: ["4,0", "4,5"] } },
  { k: "cl", nome: "Cloreto (Cl)", u: "mEq/L", g: 4, ref: { Canina: ["96", "113"] } },
  { k: "ca", nome: "Cálcio", u: "mg/dL", g: 4, ref: { Felina: ["6,2", "10,2"] } },
  { k: "p", nome: "Fósforo", u: "mg/dL", g: 4, ref: { Felina: ["4,51", "8,10"] } },
];

export const BIO_PACOTES = {
  Canina: {
    "Simples": ["creat", "ureia", "alt", "fa", "alb"],
    "Completo": ["creat", "ureia", "alt", "ast", "fa", "alb", "col", "tg"],
    "Renal": ["creat", "ureia"],
    "Eletrólitos": ["na", "k", "cl"],
  },
  Felina: {
    "Simples": ["creat", "ureia", "alt", "ggt", "alb"],
    "Completo": ["alt", "ast", "fa", "creat", "ureia", "bt", "bd", "bi", "ca", "ggt", "k", "pt", "alb", "glob", "ag", "na", "p", "amil", "col", "gli", "tg"],
    "Renal": ["creat", "ureia"],
    "Eletrólitos": ["na", "k"],
  },
};

/** Texto da referência padrão de um analito para a espécie */
export function refPadrao(a, especie) {
  const r = a.ref[especie];
  if (!r) return "";
  if (Array.isArray(r)) return `${faixa(r)}${a.u ? " " + a.u : ""}`;
  if (r.idade) return r.idade.map(([q, x, y]) => `${q}: ${x} a ${y}${a.u ? " " + a.u : ""}`).join("\n");
  return String(r);
}
/** Faixa numérica aplicável (considera idade na creatinina felina) */
export function refNumerica(a, especie, paciente) {
  const r = a.ref[especie];
  if (!r) return null;
  if (Array.isArray(r)) return r;
  if (r.idade) {
    const m = idadeMeses(paciente?.idadeN, paciente?.idadeU);
    if (!Number.isFinite(m)) return null;
    const x = r.idade[m < 12 ? 0 : 1];
    return [x[1], x[2]];
  }
  return null;
}

/** Valores calculados (bilirrubina indireta, globulinas, relação A/G) quando não digitados */
export function bioCalculados(itens) {
  const g = (k) => numDec(itens?.[k]?.v);
  const out = {};
  if (Number.isFinite(g("bt")) && Number.isFinite(g("bd"))) out.bi = fixo(g("bt") - g("bd"), 2);
  if (Number.isFinite(g("pt")) && Number.isFinite(g("alb"))) out.glob = fixo(g("pt") - g("alb"), 1);
  const glob = Number.isFinite(g("glob")) ? g("glob") : numDec(out.glob);
  if (Number.isFinite(g("alb")) && Number.isFinite(glob) && glob > 0) out.ag = fixo(g("alb") / glob, 2);
  return out;
}

function construirBioquimico(ex, laudo) {
  const esp = especieDe(laudo.paciente);
  const itens = ex.itens || {};
  const calc = bioCalculados(itens);
  const L = [];
  BIO_GRUPOS.forEach((grupo, gi) => {
    const doGrupo = BIO_ANALITOS.filter((a) => a.g === gi && itens[a.k]?.on);
    if (!doGrupo.length) return;
    L.push({ tipo: "sec", texto: grupo });
    for (const a of doGrupo) {
      const it = itens[a.k];
      const val = !vazio(it.v) ? (a.int ? milhar(numInt(it.v)) : dec(it.v)) : a.calc ? calc[a.k] || "" : "";
      const ref = it.ref != null ? it.ref : refPadrao(a, esp);
      const rn = it.ref != null ? refDeTexto(it.ref) : refNumerica(a, esp, laudo.paciente);
      L.push({ tipo: "linha", c: [a.nome, val ? `${val}${a.u ? " " + a.u : ""}` : "", ref], flag: flag(a.int ? numInt(it.v) : numDec(val), rn) });
    }
  });
  const extras = (ex.extras || []).filter((x) => !vazio(x.nome));
  if (extras.length) {
    L.push({ tipo: "sec", texto: "Outros" });
    for (const x of extras) L.push({ tipo: "linha", c: [x.nome, vazio(x.v) ? "" : `${dec(x.v)}${x.u ? " " + x.u : ""}`, x.ref || ""], flag: flag(numDec(x.v), refDeTexto(x.ref)) });
  }
  if (!vazio(ex.obs)) L.push({ tipo: "obs", rotulo: "Observações", texto: ex.obs, sep: true });
  return {
    titulo: "Bioquímico",
    meta: [["Material", "Soro"], ["Equipamento", ex.equipamento || "Fujifilm DRI-CHEM NX600"]],
    conteudo: [{ t: "tabela", cols: [{ h: "Analito", w: 0.38 }, { h: "Resultado", w: 0.24, forte: true }, { h: "Valores de referência", w: 0.38 }], linhas: L }],
  };
}

/** Extrai [mín, máx] de um texto livre "21,0 a 59,9 mg/dL" */
export function refDeTexto(s) {
  const m = String(s || "").match(/([\d.,]+)\s*(?:a|-|–)\s*([\d.,]+)/);
  return m ? [m[1], m[2]] : null;
}

/* ───────────── URINÁLISE ───────────── */

export const URINA = {
  fisico: [
    { k: "volume", nome: "Volume", u: "mL", ref: "", op: [] },
    { k: "aspecto", nome: "Aspecto", ref: "", op: ["Límpido", "Levemente turvo", "Turvo"] },
    { k: "cor", nome: "Cor", ref: "Amarelo", op: ["Amarelo-claro", "Amarelo", "Amarelo-escuro", "Âmbar", "Avermelhado", "Castanho"] },
    { k: "odor", nome: "Odor", ref: "Sui generis", op: ["Sui generis", "Amoniacal", "Pútrido"] },
    { k: "dens", nome: "Densidade", ref: "1,015 a 1,040", op: [] },
  ],
  quimico: [
    { k: "ph", nome: "pH", ref: "5,5 a 7,5", op: ["5,0", "5,5", "6,0", "6,5", "7,0", "7,5", "8,0", "8,5", "9,0"] },
    { k: "bili", nome: "Bilirrubina", ref: "Ausente", op: ["Ausente", "1+", "2+", "3+"] },
    { k: "prot", nome: "Proteína", ref: "Ausente", op: ["Ausente", "Traços", "1+", "2+", "3+", "4+"] },
    { k: "urob", nome: "Urobilinogênio", ref: "Normal", op: ["Normal", "Aumentado"] },
    { k: "glic", nome: "Glicose", ref: "Ausente", op: ["Ausente", "Traços", "1+", "2+", "3+", "4+"] },
    { k: "sangue", nome: "Sangue oculto", ref: "Ausente", op: ["Ausente", "Traços", "1+", "2+", "3+", "4+"] },
    { k: "cet", nome: "Corpos cetônicos", ref: "Ausente", op: ["Ausente", "Traços", "1+", "2+", "3+"] },
    { k: "nitrito", nome: "Nitrito", ref: "Negativo", op: ["Negativo", "Positivo"] },
    { k: "leuc", nome: "Leucócitos", ref: "Negativo", op: ["Negativo", "Traços", "1+", "2+", "3+"] },
  ],
  sedimento: [
    { k: "s_hem", nome: "Hemácias", op: ["Ausentes", "Raras", "1+", "2+", "3+"] },
    { k: "s_leu", nome: "Leucócitos", op: ["Ausentes", "Raros", "1+", "2+", "3+"] },
    { k: "s_cil", nome: "Cilindros", op: ["Ausentes", "Raros", "Hialinos", "Granulosos"] },
    { k: "s_cri", nome: "Cristais", op: ["Ausentes", "Estruvita", "Oxalato de cálcio", "Urato amorfo", "Bilirrubina"] },
    { k: "s_epi", nome: "Células epiteliais", op: ["Ausentes", "Raras", "Escamosas", "Transição", "Renais"] },
    { k: "s_bac", nome: "Bactérias", op: ["Ausentes", "Raras", "1+", "2+", "3+"] },
    { k: "s_muc", nome: "Muco", op: ["Ausente", "Presente"] },
  ],
  obtencao: ["Cistocentese", "Cateterismo", "Micção espontânea", "Compressão vesical"],
};

function construirUrinalise(ex, laudo) {
  const v = ex.v || {};
  const L = [];
  const bloco = (titulo, lista) => {
    const com = laudo.modelo ? lista : lista.filter((x) => !vazio(v[x.k]));
    if (!com.length) return;
    L.push({ tipo: "sec", texto: titulo });
    for (const x of com) L.push({ tipo: "linha", c: [x.nome, vazio(v[x.k]) ? "" : `${dec(v[x.k])}${x.u ? " " + x.u : ""}`, x.ref || ""] });
  };
  bloco("Exame físico", URINA.fisico);
  bloco("Exame químico", URINA.quimico);
  bloco("Sedimentoscopia", URINA.sedimento);
  if (!vazio(ex.obs)) L.push({ tipo: "obs", rotulo: "Observações", texto: ex.obs, sep: true });
  const meta = [["Material", "Urina"]];
  if (!vazio(ex.obtencao) || laudo.modelo) meta.push(["Método de obtenção", ex.obtencao || "__________"]);
  return {
    titulo: "Urinálise (Urina I)",
    meta,
    conteudo: [{ t: "tabela", cols: [{ h: "Exame", w: 0.38 }, { h: "Resultado", w: 0.3, forte: true }, { h: "Valores de referência", w: 0.32 }], linhas: L }],
  };
}

/* ───────────── TESTE RÁPIDO ───────────── */

export const TESTES = [
  { id: "fpv", nome: "Panleucopenia felina", material: "Fezes", linhas: ["Antígeno do parvovírus felino (FPV)"] },
  { id: "cpv", nome: "Parvovirose canina", material: "Fezes", linhas: ["Antígeno do parvovírus canino (CPV)"] },
  { id: "cdv", nome: "Cinomose", material: "Secreção conjuntival", linhas: ["Antígeno do vírus da cinomose (CDV)"] },
  { id: "fivfelv", nome: "FIV / FeLV", material: "Sangue", linhas: ["Anticorpo FIV", "Antígeno FeLV"] },
  { id: "leish", nome: "Leishmaniose visceral canina", material: "Sangue", linhas: ["Anticorpo anti-Leishmania"] },
  { id: "giardia", nome: "Giardíase", material: "Fezes", linhas: ["Antígeno de Giardia"] },
  { id: "4dx", nome: "4Dx (hemoparasitoses e dirofilariose)", material: "Sangue", linhas: ["Dirofilaria immitis (antígeno)", "Ehrlichia spp. (anticorpo)", "Anaplasma spp. (anticorpo)", "Borrelia burgdorferi (anticorpo)"] },
  { id: "outro", nome: "Outro", material: "", linhas: [""] },
];

function construirTeste(ex, laudo) {
  const linhas = (ex.linhas || []).filter((l) => !vazio(l.nome) || laudo.modelo);
  const L = linhas.map((l) => ({ tipo: "linha", c: [l.nome, (l.res || "").toUpperCase(), "Negativo"], flag: /positivo|reagente/i.test(l.res || "") && !/não/i.test(l.res) ? "alto" : "" }));
  const meta = [];
  if (!vazio(ex.material) || laudo.modelo) meta.push(["Material", ex.material || "__________"]);
  meta.push(["Metodologia", "Imunocromatografia (teste rápido)"]);
  if (!vazio(ex.kit) || laudo.modelo) meta.push(["Kit", ex.kit || "__________"]);
  const lv = [!vazio(ex.lote) ? `Lote ${ex.lote}` : "", !vazio(ex.validade) ? `validade ${ex.validade}` : ""].filter(Boolean).join(" · ");
  if (lv) meta.push(["Lote", lv.replace(/^Lote /, "")]);
  else if (laudo.modelo) meta.push(["Lote", "__________ · validade ______"]);
  const conteudo = [{ t: "tabela", cols: [{ h: "Pesquisa", w: 0.5 }, { h: "Resultado", w: 0.25, forte: true }, { h: "Referência", w: 0.25 }], linhas: L }];
  const nomeTeste = ex.nome || "";
  if (linhas.length && linhas.every((l) => !vazio(l.res))) {
    const res = linhas.length === 1
      ? `O teste rápido realizado em ${dataBR(laudo.data)} apresentou resultado ${linhas[0].res.toUpperCase()} para ${nomeTeste.toLowerCase().startsWith("outro") ? linhas[0].nome : nomeTeste}.`
      : `O teste rápido para ${nomeTeste} realizado em ${dataBR(laudo.data)} apresentou: ${linhas.map((l) => `${l.nome} ${l.res.toUpperCase()}`).join("; ")}.`;
    conteudo.push({ t: "par", runs: [{ text: "Conclusão: ", bold: true }, { text: res }] });
  }
  else if (laudo.modelo) conteudo.push({ t: "par", runs: [{ text: "Conclusão: ", bold: true }, { text: "O teste rápido apresentou resultado __________ para __________________." }] });
  if (!vazio(ex.obs)) conteudo.push({ t: "par", runs: [{ text: "Observações: ", bold: true }, { text: ex.obs }] });
  if (ex.foto?.data) conteudo.push({ t: "img", data: ex.foto.data, type: ex.foto.type, w: ex.foto.w, h: ex.foto.h, legenda: "Registro fotográfico do teste" });
  const sub = nomeTeste.startsWith("Outro") ? linhas[0]?.nome || "" : nomeTeste;
  return { titulo: sub ? `Teste rápido · ${sub}` : "Teste rápido", meta, conteudo };
}

/* ───────────── ATESTADO DE LEISHMANIOSE ───────────── */

function construirLeish(ex, laudo) {
  const p = laudo.paciente || {};
  const femea = /^f/i.test(p.sexo || "");
  const o = (m, f) => (femea ? f : m);
  const gato = especieDe(p) === "Felina";
  const esp = gato ? "felina" : "canina";
  const bicho = laudo.modelo && !p.sexo ? "o(a) animal" : gato ? o("o gato", "a gata") : o("o cão", "a cadela");
  const runs = [
    { text: `Atesto, para os devidos fins, que ${bicho} ` },
    { text: p.animal || "______________", bold: true },
    { text: `, raça ${p.raca || "______"}, ${idadeTexto(p.idadeN, p.idadeU) || (laudo.modelo ? "______ de idade" : "idade não informada")}, sob responsabilidade de ` },
    { text: p.tutor || "______________________", bold: true },
  ];
  if (!vazio(ex.cpf) || laudo.modelo) runs.push({ text: `, CPF ${ex.cpf || "______________"}` });
  if (!vazio(ex.endereco) || laudo.modelo) runs.push({ text: `, residente em ${ex.endereco || "________________________________"}` });
  if (laudo.modelo && ex.sinais == null) runs.push({ text: `, apresenta sinais clínicos compatíveis com leishmaniose visceral ${esp}` });
  else runs.push({ text: ex.sinais ? `, apresenta sinais clínicos compatíveis com leishmaniose visceral ${esp}` : `, foi avaliad${o("o", "a")} clinicamente` });
  runs.push({ text: ` e foi submetid${o("o", "a")} a ${ex.metodo || "teste rápido"} realizado nesta clínica em ${dataBR(laudo.data) || "____/____/______"}, com resultado ` });
  runs.push({ text: (ex.resultado || "__________").toUpperCase(), bold: true });
  runs.push({ text: " para leishmaniose visceral." });
  const conteudo = [{ t: "par", runs, grande: true }];
  if (!vazio(ex.obs)) conteudo.push({ t: "par", runs: [{ text: "Observações: ", bold: true }, { text: ex.obs }], grande: true });
  conteudo.push({ t: "local", texto: `${HOSPITAL.cidade}, ${dataExtenso(laudo.data) || "____ de ______________ de ______"}.` });
  return { titulo: "Atestado clínico-epidemiológico · Leishmaniose", meta: [], conteudo };
}

/* ───────────── LISTA DE TIPOS ───────────── */

export const TIPOS = {
  hemograma: { nome: "Hemograma", construir: construirHemograma },
  bioquimico: { nome: "Bioquímico", construir: construirBioquimico },
  urinalise: { nome: "Urinálise", construir: construirUrinalise },
  teste: { nome: "Teste rápido", construir: construirTeste },
  leish: { nome: "Atestado de leishmaniose", construir: construirLeish },
};

/** Cabeçalho do paciente em pares rótulo/valor (coluna esquerda e direita) */
export function cabecalhoPaciente(laudo) {
  const p = laudo.paciente || {};
  return {
    esquerda: [["Paciente", p.animal], ["Tutor(a)", p.tutor], ["Veterinário(a)", p.solicitante]],
    direita: [["Espécie", p.especie], ["Raça", p.raca], ["Sexo", p.sexo], ["Idade", idadeTexto(p.idadeN, p.idadeU)]],
    numero: laudo.numero,
    data: dataBR(laudo.data),
  };
}

/** Monta o documento inteiro: lista de exames prontos para os renderizadores */
export function montarLaudo(laudo) {
  return (laudo.exames || []).map((ex) => ({ ...TIPOS[ex.tipo].construir(ex, laudo), tipo: ex.tipo }));
}

export { dataBR, numRef };
