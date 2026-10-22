// App de laudos da Zog: paciente → exames → laudo (PDF, .docx ou texto).
import {
  TIPOS, HEMO_FAIXAS, HEMO_ERITRO, HEMO_DIF, BIO_ANALITOS, BIO_GRUPOS, BIO_PACOTES, URINA, TESTES, VETERINARIOS, SOLICITANTES,
  faixaHemograma, absolutoDif, refPadrao, refNumerica, bioCalculados, refDeTexto, especieDe,
} from "./catalogo.js";
import { numDec, numInt, milhar, flag, dataHojeISO } from "./fmt.js";
import { previaHTML, textoLaudo } from "./saidas.js";
import { interpretar } from "./leitor.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ORDEM = ["hemograma", "bioquimico", "urinalise", "teste", "leish"];

/* ───── armazenamento local (só conveniência; o app funciona sem) ───── */
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } },
};

let cfg = ls.get("zog.cfg", null) || { assinante: { ...VETERINARIOS[0] }, solicitante: "" };
let foto = null; // foto do teste rápido (fica só na memória)
const lidos = new Set(); // campos preenchidos pela leitura da foto, destacados até serem conferidos

function numeroNovo(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
function estadoNovo() {
  return {
    numero: numeroNovo(), data: dataHojeISO(),
    paciente: { animal: "", tutor: "", especie: "Canina", raca: "", sexo: "Macho", idadeN: "", idadeU: "anos", solicitante: cfg.solicitante || "" },
    sel: ["hemograma"],
    ex: {
      hemograma: { faixa: "auto", v: {}, obs: {} },
      bioquimico: { itens: {}, extras: [], obs: "" },
      urinalise: { obtencao: "Cistocentese", v: {}, obs: "" },
      teste: { preset: "fpv", nome: TESTES[0].nome, material: TESTES[0].material, kit: "", lote: "", validade: "", linhas: TESTES[0].linhas.map((n) => ({ nome: n, res: "" })), obs: "" },
      leish: { cpf: "", endereco: "", resultado: "", sinais: true, metodo: "teste rápido", obs: "" },
    },
  };
}
let st = ls.get("zog.rascunho", null) || estadoNovo();

function laudoAtual(assinadoEm) {
  const exames = ORDEM.filter((t) => st.sel.includes(t)).map((t) => {
    const e = { tipo: t, ...st.ex[t] };
    if (t === "teste" && foto) e.foto = foto;
    return e;
  });
  return { numero: st.numero, data: st.data, paciente: st.paciente, assinante: cfg.assinante, assinadoEm, exames };
}

/* ───── caminho "a.b.c" no estado ───── */
function setPath(obj, path, val) {
  const ks = path.split(".");
  let o = obj;
  ks.slice(0, -1).forEach((k) => { if (o[k] == null) o[k] = /^\d+$/.test(k) ? [] : {}; o = o[k]; });
  o[ks.at(-1)] = val;
}
function getPath(obj, path) { return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); }
const campo = (path, attrs = "") => `data-b="${path}" value="${esc(getPath(st, path) ?? "")}" ${attrs}`;

/* ───── cartões de cada exame ───── */
function cartaoHemograma() {
  const esp = especieDe(st.paciente);
  const opts = HEMO_FAIXAS[esp].map((f) => `<option value="${f.id}" ${st.ex.hemograma.faixa === f.id ? "selected" : ""}>${f.nome}</option>`).join("");
  const p = "ex.hemograma.v.";
  let rows = `<tr><th>Parâmetro</th><th>Valor</th><th></th><th>Referência</th></tr><tr class="g"><td colspan="4">Eritrograma</td></tr>`;
  for (const x of HEMO_ERITRO) rows += `<tr><td class="n">${x.nome}</td><td><input inputmode="decimal" ${campo(p + x.k)}><span class="flag" data-fl="${x.k}"></span></td><td class="u">${x.u}</td><td class="r" data-rf="${x.k}"></td></tr>`;
  rows += `<tr><td class="n">Proteína plasm. total</td><td><input inputmode="decimal" ${campo(p + "ppt")} placeholder="opcional"><span class="flag" data-fl="ppt"></span></td><td class="u">g/dL</td><td class="r" data-rf="ppt"></td></tr>`;
  rows += `<tr class="g"><td colspan="4">Leucograma</td></tr>`;
  rows += `<tr><td class="n">Leucócitos totais</td><td><input inputmode="numeric" ${campo(p + "leu")}><span class="flag" data-fl="leu"></span></td><td class="u">/µL</td><td class="r" data-rf="leu"></td></tr>`;
  for (const x of HEMO_DIF) rows += `<tr><td class="n">${x.nome}</td><td><input inputmode="decimal" ${campo(p + x.k + "_p")} placeholder="%"></td><td><input inputmode="numeric" ${campo(p + x.k + "_a")} data-abs="${x.k}" placeholder="/µL"><span class="flag" data-fl="${x.k}"></span></td><td class="r" data-rf="${x.k}"></td></tr>`;
  rows += `<tr class="g"><td colspan="4">Plaquetograma</td></tr>`;
  rows += `<tr><td class="n">Plaquetas</td><td><input inputmode="numeric" ${campo(p + "pla")}><span class="flag" data-fl="pla"></span></td><td class="u">x10³/µL</td><td class="r" data-rf="pla"></td></tr>`;
  const o = "ex.hemograma.obs.";
  return `<section class="card" data-tipo="hemograma"><h2>Hemograma</h2>
    <div class="refbar"><span class="lbl">Referência</span><select data-b="ex.hemograma.faixa" data-re="1"><option value="auto" ${st.ex.hemograma.faixa === "auto" ? "selected" : ""}>Automática pela idade</option>${opts}</select><span class="pill" id="hemoPill"></span></div>
    <p class="note" id="hemoNote" hidden></p>
    <div class="tbl"><table class="vals">${rows}</table></div>
    <p class="small">Diferencial: digite o % e, se tiver, o absoluto do aparelho. Em branco, o absoluto é calculado por leucócitos × %, arredondado à centena.</p>
    <details ${Object.values(st.ex.hemograma.obs || {}).some(Boolean) ? "open" : ""}><summary>Observações</summary><div class="fields">
      <div class="f s3"><label>Série vermelha</label><input ${campo(o + "verm")} list="obsMorf"></div>
      <div class="f s3"><label>Série branca</label><input ${campo(o + "branca")} list="obsMorf"></div>
      <div class="f s3"><label>Plaquetas</label><input ${campo(o + "plaq")}></div>
      <div class="f s3"><label>Geral</label><input ${campo(o + "geral")}></div>
    </div><datalist id="obsMorf"><option>Morfologia celular normal.</option><option>Anisocitose discreta.</option><option>Policromasia discreta.</option><option>Presença de agregados plaquetários.</option></datalist></details>
  </section>`;
}

function cartaoBioquimico() {
  const esp = especieDe(st.paciente);
  const B = st.ex.bioquimico;
  const pac = Object.keys(BIO_PACOTES[esp]).map((n) => `<button type="button" class="mini" data-pacote="${n}">${n}</button>`).join("");
  let rows = `<tr><th></th><th>Analito</th><th>Valor</th><th></th><th>Referência</th></tr>`;
  BIO_GRUPOS.forEach((g, gi) => {
    rows += `<tr class="g"><td colspan="5">${g}</td></tr>`;
    for (const a of BIO_ANALITOS.filter((x) => x.g === gi)) {
      const it = B.itens[a.k] || {};
      const ref = it.ref != null ? it.ref : refPadrao(a, esp);
      rows += `<tr><td><input type="checkbox" data-b="ex.bioquimico.itens.${a.k}.on" ${it.on ? "checked" : ""} aria-label="Incluir ${a.nome}"></td><td class="n">${a.nome}</td>
        <td><input inputmode="decimal" data-b="ex.bioquimico.itens.${a.k}.v" data-liga="${a.k}" value="${esc(it.v ?? "")}" ${a.calc ? 'placeholder="auto"' : ""}><span class="flag" data-bfl="${a.k}"></span></td><td class="u">${a.u}</td>
        <td><input class="ref" data-b="ex.bioquimico.itens.${a.k}.ref" value="${esc(ref)}" ${ref.includes("\n") ? 'title="Muda conforme a idade"' : ""}></td></tr>`;
    }
  });
  rows += `<tr class="g"><td colspan="5">Outros</td></tr>`;
  (B.extras || []).forEach((x, i) => {
    const p = `ex.bioquimico.extras.${i}.`;
    rows += `<tr><td><button type="button" class="mini" data-rmextra="${i}" aria-label="Remover">×</button></td><td><input class="nm" ${campo(p + "nome")} placeholder="Analito"></td><td><input inputmode="decimal" ${campo(p + "v")}></td><td><input ${campo(p + "u")} placeholder="unid." style="width:4.5em;text-align:left"></td><td><input class="ref" ${campo(p + "ref")} placeholder="mín a máx"></td></tr>`;
  });
  return `<section class="card" data-tipo="bioquimico"><h2>Bioquímico</h2>
    <div class="refbar"><span class="lbl">Marcar</span>${pac}<button type="button" class="mini" data-pacote="">Limpar</button></div>
    <div class="tbl"><table class="vals">${rows}</table></div>
    <div class="row"><button type="button" class="mini" id="addExtra">+ Outro analito</button></div>
    <p class="small" style="margin-top:8px">Só os marcados entram no laudo. Digitar um valor já marca. Globulinas, relação A/G e bilirrubina indireta são calculadas se ficarem em branco. A referência pode ser ajustada neste laudo.</p>
    <div class="f" style="margin-top:12px"><label>Observações</label><input ${campo("ex.bioquimico.obs")}></div>
  </section>`;
}

function cartaoUrinalise() {
  const U = st.ex.urinalise;
  const dl = (k, op) => op.length ? `list="dl_${k}"` : "";
  const dls = [];
  const linha = (x) => {
    if (x.op?.length) dls.push(`<datalist id="dl_${x.k}">${x.op.map((o) => `<option>${o}</option>`).join("")}</datalist>`);
    return `<tr><td class="n">${x.nome}</td><td><input class="tx" ${campo("ex.urinalise.v." + x.k)} ${dl(x.k, x.op || [])} ${x.k === "volume" || x.k === "dens" || x.k === "ph" ? 'inputmode="decimal"' : ""}></td><td class="r">${x.u || ""} ${x.ref ? "· ref. " + x.ref : ""}</td></tr>`;
  };
  let rows = `<tr class="g"><td colspan="3">Exame físico</td></tr>${URINA.fisico.map(linha).join("")}<tr class="g"><td colspan="3">Exame químico</td></tr>${URINA.quimico.map(linha).join("")}<tr class="g"><td colspan="3">Sedimentoscopia (opcional)</td></tr>${URINA.sedimento.map(linha).join("")}`;
  return `<section class="card" data-tipo="urinalise"><h2>Urinálise</h2>
    <div class="fields" style="margin-bottom:10px"><div class="f s3"><label>Método de obtenção</label><select data-b="ex.urinalise.obtencao">${URINA.obtencao.map((o) => `<option ${U.obtencao === o ? "selected" : ""}>${o}</option>`).join("")}</select></div></div>
    <div class="tbl"><table class="vals">${rows}</table></div>${dls.join("")}
    <p class="small">Campos em branco não aparecem no laudo.</p>
    <div class="f" style="margin-top:12px"><label>Observações</label><input ${campo("ex.urinalise.obs")} placeholder="ex.: Amostra com volume inferior a 5 mL."></div>
  </section>`;
}

function cartaoTeste() {
  const T = st.ex.teste;
  const rows = T.linhas.map((l, i) => `<tr><td><input class="nm" ${campo(`ex.teste.linhas.${i}.nome`)} placeholder="Pesquisa"></td><td><select data-b="ex.teste.linhas.${i}.res"><option value="" ${!l.res ? "selected" : ""}>—</option><option ${l.res === "Negativo" ? "selected" : ""}>Negativo</option><option ${l.res === "Positivo" ? "selected" : ""}>Positivo</option></select></td></tr>`).join("");
  return `<section class="card" data-tipo="teste"><h2>Teste rápido</h2>
    <div class="fields">
      <div class="f s6"><label>Teste</label><select id="testePreset">${TESTES.map((t) => `<option value="${t.id}" ${T.preset === t.id ? "selected" : ""}>${t.nome}</option>`).join("")}</select></div>
      ${T.preset === "outro" ? `<div class="f s6"><label>Nome do teste</label><input ${campo("ex.teste.nome")}></div>` : ""}
      <div class="f s3"><label>Material</label><input ${campo("ex.teste.material")} list="dlMat"></div>
      <div class="f s3"><label>Kit / fabricante</label><input ${campo("ex.teste.kit")} placeholder="ex.: IDEXX SNAP"></div>
      <div class="f s3 half"><label>Lote</label><input ${campo("ex.teste.lote")}></div>
      <div class="f s3 half"><label>Validade</label><input ${campo("ex.teste.validade")} placeholder="ex.: ABR/27"></div>
    </div>
    <datalist id="dlMat"><option>Sangue</option><option>Soro</option><option>Plasma</option><option>Fezes</option><option>Secreção conjuntival</option><option>Swab</option></datalist>
    <div class="tbl" style="margin-top:12px"><table class="vals"><tr><th>Pesquisa</th><th>Resultado</th></tr>${rows}</table></div>
    <div class="row foto"><button type="button" class="mini" id="fotoBtn">${foto ? "Trocar foto do teste" : "Adicionar foto do teste"}</button>${foto ? `<button type="button" class="mini" id="fotoRm">Remover foto</button><img src="${foto.url}" alt="Foto do teste">` : ""}<input type="file" id="fotoIn" accept="image/*" capture="environment" hidden></div>
    <div class="f" style="margin-top:12px"><label>Observações</label><input ${campo("ex.teste.obs")}></div>
  </section>`;
}

function cartaoLeish() {
  const L = st.ex.leish;
  return `<section class="card" data-tipo="leish"><h2>Atestado de leishmaniose</h2>
    <p class="small" style="margin-bottom:10px">Usa os dados do paciente acima. Preencha os dados do tutor exigidos para o atestado.</p>
    <div class="fields">
      <div class="f s2"><label>CPF do tutor</label><input ${campo("ex.leish.cpf")} inputmode="numeric"></div>
      <div class="f s4"><label>Endereço do tutor</label><input ${campo("ex.leish.endereco")}></div>
      <div class="f s3"><label>Exame realizado</label><input ${campo("ex.leish.metodo")} list="dlMet"></div>
      <div class="f s3"><label>Resultado</label><select data-b="ex.leish.resultado"><option value="" ${!L.resultado ? "selected" : ""}>—</option><option ${L.resultado === "Positivo" ? "selected" : ""}>Positivo</option><option ${L.resultado === "Negativo" ? "selected" : ""}>Negativo</option></select></div>
      <div class="f s6"><label class="row" style="text-transform:none;letter-spacing:0;font-size:.88rem;color:var(--ink)"><input type="checkbox" data-b="ex.leish.sinais" ${L.sinais ? "checked" : ""} style="width:18px;height:18px"> Apresenta sinais clínicos compatíveis</label></div>
      <div class="f s6"><label>Observações</label><input ${campo("ex.leish.obs")}></div>
    </div>
    <datalist id="dlMet"><option>teste rápido</option><option>teste rápido (DPP)</option><option>sorologia (ELISA)</option><option>RIFI</option><option>PCR</option></datalist>
  </section>`;
}

const CARTOES = { hemograma: cartaoHemograma, bioquimico: cartaoBioquimico, urinalise: cartaoUrinalise, teste: cartaoTeste, leish: cartaoLeish };

/* ───── desenhar ───── */
function desenharChips() {
  $("#chips").innerHTML = ORDEM.map((t) => `<button type="button" class="chip" data-chip="${t}" aria-pressed="${st.sel.includes(t)}">${TIPOS[t].nome}</button>`).join("");
}
function desenharCartoes() {
  $("#exames").innerHTML = ORDEM.filter((t) => st.sel.includes(t)).map((t) => CARTOES[t]()).join("");
  lidos.forEach((p) => { const el = $(`[data-b="${p}"]`); if (el) el.classList.add("lido"); });
  atualizarDerivados();
}
function preencherPaciente() {
  for (const id of ["animal", "tutor", "especie", "raca", "sexo", "idadeN", "idadeU", "solicitante"]) $("#" + id).value = st.paciente[id] ?? "";
  $("#data").value = st.data; $("#numero").value = st.numero;
}

function atualizarDerivados() {
  const esp = especieDe(st.paciente);
  // hemograma: referência, sinalização e absolutos calculados
  if (st.sel.includes("hemograma") && $("[data-tipo=hemograma]")) {
    const H = st.ex.hemograma, v = H.v || {};
    const { faixa: F, aviso } = faixaHemograma(st.paciente, H.faixa);
    $("#hemoPill").textContent = `${esp === "Felina" ? "Felino" : "Canino"} · ${F.nome}`;
    $("#hemoNote").hidden = !aviso; $("#hemoNote").textContent = aviso;
    const R = F.r;
    const marca = (k, val) => { const el = $(`[data-fl="${k}"]`); if (!el) return; const f = flag(val, R[k]); el.className = "flag " + f; el.textContent = f === "alto" ? "↑" : f === "baixo" ? "↓" : ""; };
    const unid = { leu: "/µL", lin: "/µL", mon: "/µL", eos: "/µL", gra: "/µL", pla: "x10³/µL" };
    document.querySelectorAll("[data-rf]").forEach((el) => { const k = el.dataset.rf; el.textContent = R[k] ? `${R[k][0]} a ${R[k][1]}${unid[k] ? " " + unid[k] : ""}` : "—"; });
    HEMO_ERITRO.forEach((x) => marca(x.k, numDec(v[x.k])));
    marca("ppt", numDec(v.ppt)); marca("leu", numInt(v.leu)); marca("pla", numInt(v.pla));
    HEMO_DIF.forEach((x) => {
      const a = absolutoDif(v.leu, v[x.k + "_p"], v[x.k + "_a"]);
      const inp = $(`[data-abs="${x.k}"]`);
      if (inp) inp.placeholder = a.calculado ? milhar(a.v) : "/µL";
      marca(x.k, a.v);
    });
  }
  if (st.sel.includes("bioquimico") && $("[data-tipo=bioquimico]")) {
    const itens = st.ex.bioquimico.itens;
    const calc = bioCalculados(itens);
    for (const a of BIO_ANALITOS) {
      const it = itens[a.k] || {};
      const el = $(`[data-bfl="${a.k}"]`);
      if (a.calc) { const inp = $(`[data-liga="${a.k}"]`); if (inp) inp.placeholder = calc[a.k] || "auto"; }
      if (!el) continue;
      const val = it.v ? (a.int ? numInt(it.v) : numDec(it.v)) : numDec(calc[a.k]);
      const rn = it.ref != null ? refDeTexto(it.ref) : refNumerica(a, esp, st.paciente);
      const f = flag(val, rn);
      el.className = "flag " + f; el.textContent = f === "alto" ? "↑" : f === "baixo" ? "↓" : "";
    }
  }
}

let tPrevia = 0;
function atualizarPrevia() {
  clearTimeout(tPrevia);
  tPrevia = setTimeout(() => {
    const l = laudoAtual(new Date());
    $("#paper").innerHTML = previaHTML(l, foto ? { [l.exames.findIndex((e) => e.tipo === "teste")]: foto.url } : {});
    ls.set("zog.rascunho", st);
  }, 60);
}
function tudo() { desenharChips(); desenharCartoes(); atualizarPrevia(); }

/* ───── eventos ───── */
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.closest("#setup")) return;
  if (el.id && el.closest(".card") && ["animal", "tutor", "raca", "idadeN", "solicitante"].includes(el.id)) { st.paciente[el.id] = el.value; atualizarDerivados(); atualizarPrevia(); return; }
  if (el.id === "numero") { st.numero = el.value; atualizarPrevia(); return; }
  const path = el.dataset.b;
  if (!path) return;
  if (lidos.delete(path)) el.classList.remove("lido");
  setPath(st, path, el.type === "checkbox" ? el.checked : el.value);
  const liga = el.dataset.liga;
  if (liga && el.value.trim()) { setPath(st, `ex.bioquimico.itens.${liga}.on`, true); const cb = $(`[data-b="ex.bioquimico.itens.${liga}.on"]`); if (cb) cb.checked = true; }
  atualizarDerivados(); atualizarPrevia();
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.closest("#setup")) return;
  if (["especie", "sexo", "idadeU"].includes(el.id)) {
    st.paciente[el.id] = el.value;
    if (el.id === "especie") st.ex.hemograma.faixa = "auto";
    if (el.id === "especie") { desenharCartoes(); } else atualizarDerivados();
    atualizarPrevia(); return;
  }
  if (el.id === "data") { st.data = el.value; atualizarPrevia(); return; }
  if (el.id === "testePreset") {
    const t = TESTES.find((x) => x.id === el.value);
    Object.assign(st.ex.teste, { preset: t.id, nome: t.id === "outro" ? "" : t.nome, material: t.material, linhas: t.linhas.map((n) => ({ nome: n, res: "" })) });
    desenharCartoes(); atualizarPrevia(); return;
  }
  if (el.dataset.b && el.tagName === "SELECT") { setPath(st, el.dataset.b, el.value); if (el.dataset.re) atualizarDerivados(); atualizarPrevia(); }
  if (el.id === "fotoIn" && el.files[0]) carregarFoto(el.files[0]);
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.chip) {
    const t = b.dataset.chip;
    st.sel = st.sel.includes(t) ? st.sel.filter((x) => x !== t) : [...st.sel, t];
    tudo(); return;
  }
  if (b.dataset.pacote != null) {
    const ks = b.dataset.pacote ? BIO_PACOTES[especieDe(st.paciente)][b.dataset.pacote] : [];
    for (const a of BIO_ANALITOS) { st.ex.bioquimico.itens[a.k] = { ...(st.ex.bioquimico.itens[a.k] || {}), on: ks.includes(a.k) }; }
    desenharCartoes(); atualizarPrevia(); return;
  }
  if (b.id === "addExtra") { st.ex.bioquimico.extras.push({ nome: "", v: "", u: "", ref: "" }); desenharCartoes(); return; }
  if (b.dataset.rmextra != null) { st.ex.bioquimico.extras.splice(+b.dataset.rmextra, 1); desenharCartoes(); atualizarPrevia(); return; }
  if (b.id === "fotoBtn") { $("#fotoIn").click(); return; }
  if (b.id === "fotoRm") { foto = null; desenharCartoes(); atualizarPrevia(); return; }
});

async function carregarFoto(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  const k = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
  const cv = document.createElement("canvas");
  cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  URL.revokeObjectURL(url);
  const blob = await new Promise((r) => cv.toBlob(r, "image/jpeg", 0.85));
  foto = { data: new Uint8Array(await blob.arrayBuffer()), type: "image/jpeg", w: cv.width, h: cv.height, url: URL.createObjectURL(blob) };
  desenharCartoes(); atualizarPrevia();
}

$("#newBtn").addEventListener("click", () => {
  if (!confirmarLimpar()) return;
  st = estadoNovo(); foto = null; preencherPaciente(); tudo();
  $("#animal").focus();
});
function confirmarLimpar() {
  const b = $("#newBtn");
  if (b.dataset.armado) { delete b.dataset.armado; b.textContent = "Novo laudo"; return true; }
  b.dataset.armado = "1"; b.textContent = "Toque de novo para limpar";
  setTimeout(() => { delete b.dataset.armado; b.textContent = "Novo laudo"; }, 3000);
  return false;
}

/* ───── leitura da foto do exame ───── */
function ocrStatus(t, err) { const s = $("#ocrStatus"); s.textContent = t; s.className = "status" + (err ? " err" : ""); }
$("#fotoExameBtn").addEventListener("click", () => $("#fotoExame").click());
$("#fotoExame").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const btn = $("#fotoExameBtn");
  btn.disabled = true;
  ocrStatus("Preparando a leitura…");
  try {
    const { lerFoto } = await import("./ocr.js");
    const texto = await lerFoto(file, (m) => {
      if (m.status === "recognizing text") ocrStatus(`Lendo a foto… ${Math.round((m.progress || 0) * 100)}%`);
      else if (/load/i.test(m.status)) ocrStatus("Preparando a leitura (na primeira vez baixa uns 7 MB; depois funciona sem internet)…");
    });
    $("#ocrTxt").hidden = false; $("#ocrTxt pre").textContent = texto.trim() || "(nada legível)";
    const r = interpretar(texto);
    const nh = Object.keys(r.hemo).length, nb = Object.keys(r.bio).length;
    if (nh) {
      if (!st.sel.includes("hemograma")) st.sel.push("hemograma");
      for (const [k, v] of Object.entries(r.hemo)) { st.ex.hemograma.v[k] = v; lidos.add(`ex.hemograma.v.${k}`); }
    }
    if (nb) {
      if (!st.sel.includes("bioquimico")) st.sel.push("bioquimico");
      for (const [k, v] of Object.entries(r.bio)) { st.ex.bioquimico.itens[k] = { ...(st.ex.bioquimico.itens[k] || {}), on: true, v }; lidos.add(`ex.bioquimico.itens.${k}.v`); }
    }
    tudo();
    if (!nh && !nb) ocrStatus("Não reconheci valores nesta foto. Tente com o papel reto, bem iluminado, sem sombra e ocupando a tela toda.", true);
    else {
      ocrStatus(`Li ${nh + nb} valor${nh + nb > 1 ? "es" : ""} da foto. Confira os campos em amarelo antes de gerar o laudo.${r.avisos.length ? " " + r.avisos.join(" ") : ""}`);
      const alvo = $(nh ? "[data-tipo=hemograma]" : "[data-tipo=bioquimico]");
      if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (err) {
    console.error(err);
    ocrStatus("Não consegui ler a foto: " + (err?.message || err) + ". Na primeira vez é preciso estar com internet.", true);
  } finally { btn.disabled = false; }
});

/* ───── configurações ───── */
function desenharSetup() {
  $("#cfgAss").innerHTML = VETERINARIOS.map((v, i) => `<option value="${i}">${v.nome} · ${v.crmv}</option>`).join("") + `<option value="x">Outro(a)…</option>`;
  const i = VETERINARIOS.findIndex((v) => v.nome === cfg.assinante.nome);
  $("#cfgAss").value = i >= 0 ? String(i) : "x";
  $("#cfgNome").value = cfg.assinante.nome; $("#cfgTitulo").value = cfg.assinante.titulo; $("#cfgCrmv").value = cfg.assinante.crmv;
  $("#cfgSol").value = cfg.solicitante || "";
}
$("#gearBtn").addEventListener("click", () => { const s = $("#setup"); s.hidden = !s.hidden; if (!s.hidden) desenharSetup(); });
$("#cfgAss").addEventListener("change", (e) => {
  const v = VETERINARIOS[+e.target.value];
  if (v) { $("#cfgNome").value = v.nome; $("#cfgTitulo").value = v.titulo; $("#cfgCrmv").value = v.crmv; }
  else { $("#cfgNome").value = ""; $("#cfgCrmv").value = ""; $("#cfgNome").focus(); }
});
$("#saveSetup").addEventListener("click", () => {
  cfg = { assinante: { nome: $("#cfgNome").value.trim(), titulo: $("#cfgTitulo").value.trim(), crmv: $("#cfgCrmv").value.trim() }, solicitante: $("#cfgSol").value.trim() };
  ls.set("zog.cfg", cfg);
  if (!st.paciente.solicitante) { st.paciente.solicitante = cfg.solicitante; $("#solicitante").value = cfg.solicitante; }
  $("#setupStatus").textContent = "Salvo.";
  setTimeout(() => { $("#setupStatus").textContent = ""; $("#setup").hidden = true; }, 900);
  atualizarPrevia();
});

/* ───── saídas ───── */
let assetsCache = null;
async function carregarAssets() {
  if (assetsCache) return assetsCache;
  const get = async (u) => new Uint8Array(await (await fetch(u)).arrayBuffer());
  const [regular, italic, medium, semibold, bold, logo] = await Promise.all([
    get("fonts/Montserrat_400Regular.ttf"), get("fonts/Montserrat_400Regular_Italic.ttf"), get("fonts/Montserrat_500Medium.ttf"),
    get("fonts/Montserrat_600SemiBold.ttf"), get("fonts/Montserrat_700Bold.ttf"), get("logo-laudo.jpg"),
  ]);
  assetsCache = { fonts: { regular, italic, medium, semibold, bold }, logo, logoTipo: "jpg", logoLarg: 756, logoAlt: 397 };
  return assetsCache;
}
function nomeArquivo(ext) {
  const p = st.paciente;
  const ex = ORDEM.filter((t) => st.sel.includes(t)).map((t) => TIPOS[t].nome).join(" + ");
  const [y, m, d] = (st.data || "").split("-");
  return `Laudo ${p.animal || "paciente"} - ${ex} - ${d}-${m}-${y}.${ext}`.replace(/[\\/:*?"<>|]/g, "");
}
function validar() {
  const falta = [];
  if (!st.sel.length) falta.push("escolha um exame");
  if (!st.paciente.animal.trim()) falta.push("nome do animal");
  if (!cfg.assinante?.nome) falta.push("quem assina (em Configurações)");
  if (falta.length) { status("Falta: " + falta.join(", ") + ".", true); return false; }
  return true;
}
function status(t, err) { const s = $("#dlStatus"); s.textContent = t; s.className = "status" + (err ? " err" : ""); }
function baixar(blob, nome) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function fazerPDF() {
  const [{ gerarPDF }, assets] = await Promise.all([import("./pdf.js"), carregarAssets()]);
  const bytes = await gerarPDF(laudoAtual(new Date()), assets);
  return new Blob([bytes], { type: "application/pdf" });
}
$("#shareBtn").addEventListener("click", async () => {
  if (!validar()) return;
  status("Gerando PDF…");
  try {
    const blob = await fazerPDF();
    const file = new File([blob], nomeArquivo("pdf"), { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: file.name });
      status("Pronto.");
    } else { baixar(blob, file.name); status("Este aparelho não compartilha arquivos daqui: o PDF foi baixado."); }
  } catch (err) { if (err?.name === "AbortError") status(""); else { console.error(err); status("Não consegui gerar o PDF: " + err.message, true); } }
});
$("#pdfBtn").addEventListener("click", async () => {
  if (!validar()) return;
  status("Gerando PDF…");
  try { baixar(await fazerPDF(), nomeArquivo("pdf")); status("PDF baixado."); } catch (err) { console.error(err); status("Não consegui gerar o PDF: " + err.message, true); }
});
$("#dlBtn").addEventListener("click", async () => {
  if (!validar()) return;
  status("Gerando .docx…");
  try {
    const [{ gerarDOCX }, assets] = await Promise.all([import("./docx.js"), carregarAssets()]);
    const blob = await gerarDOCX(laudoAtual(new Date()), assets);
    baixar(blob, nomeArquivo("docx")); status(".docx baixado.");
  } catch (err) { console.error(err); status("Não consegui gerar o .docx: " + err.message, true); }
});
$("#copyBtn").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(textoLaudo(laudoAtual(new Date()))); status("Texto copiado."); } catch { status("Não consegui copiar neste navegador.", true); }
});

/* ───── início ───── */
$("#listaSol").innerHTML = SOLICITANTES.map((s) => `<option>${s}</option>`).join("");
preencherPaciente();
tudo();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
