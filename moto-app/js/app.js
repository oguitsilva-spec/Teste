import { db, uid, compressImage } from './db.js';
import {
  brl, brlShort, fmtNum, parseMoney, todayISO, fmtDate, totalGastos, custoTotal, lucroPrevisto,
  lucroReal, diasEstoque, titulo, STATUS, esc, parseMotoTexto, parseGastosTexto,
} from './util.js';
import { getApiKey, setApiKey, temIA, lerFicha, lerAudio, conferirSoma } from './ai.js';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const main = $('#main');
const DIAS_ALERTA = 60;

// ---------------- infraestrutura de UI ----------------
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

function loading(on, msg = 'Processando…') {
  $('#loading-msg').textContent = msg;
  $('#loading').hidden = !on;
}

function modal(html, onMount) {
  const wrap = $('#modal');
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  wrap.hidden = false;
  const close = () => { wrap.hidden = true; wrap.innerHTML = ''; stopRecognition(); };
  wrap.onclick = (e) => { if (e.target === wrap) close(); };
  $$('[data-close]', wrap).forEach((b) => (b.onclick = close));
  onMount?.(wrap, close);
  return close;
}

const fotoURLs = new Map();
async function fotoURL(id) {
  if (!id) return null;
  if (fotoURLs.has(id)) return fotoURLs.get(id);
  const blob = await db.getFoto(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  fotoURLs.set(id, url);
  return url;
}
async function hydrateImgs(root = main) {
  await Promise.all($$('img[data-foto]', root).map(async (img) => {
    const url = await fotoURL(img.dataset.foto);
    if (url) img.src = url;
  }));
}

function pickFile({ capture = false, multiple = false } = {}) {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    if (capture) inp.capture = 'environment';
    inp.multiple = multiple;
    inp.onchange = () => resolve([...inp.files]);
    inp.click();
  });
}

const statusPill = (s) => `<span class="pill ${STATUS[s]?.cor}">${STATUS[s]?.label || s}</span>`;
const moneyInput = (name, label, val, extra = '') =>
  `<label class="field"><span>${label}</span><div class="money"><i>R$</i><input name="${name}" inputmode="decimal" autocomplete="off" value="${val || val === 0 ? fmtNum(val) : ''}" ${extra}></div></label>`;

// ---------------- reconhecimento de voz ----------------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
function stopRecognition() { try { recognition?.stop(); } catch {} recognition = null; }

// Liga o microfone; cada trecho reconhecido é anexado ao textarea.
function setupMic(btn, textarea) {
  if (!SR) {
    btn.disabled = true;
    btn.innerHTML = '🎤 Use o microfone do teclado';
    return;
  }
  btn.onclick = () => {
    if (recognition) { stopRecognition(); return; }
    recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    const base = textarea.value ? textarea.value.trim() + ' ' : '';
    let finais = '';
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finais += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      textarea.value = base + finais + interim;
    };
    const fim = () => { btn.classList.remove('rec'); btn.innerHTML = '🎤 Gravar de novo'; recognition = null; };
    recognition.onend = fim;
    recognition.onerror = (e) => { if (e.error === 'not-allowed') toast('Permita o uso do microfone.'); fim(); };
    recognition.start();
    btn.classList.add('rec');
    btn.innerHTML = '⏹️ Parar gravação';
  };
}

// ---------------- telas ----------------
const routes = {
  '': viewPainel,
  estoque: viewEstoque,
  moto: viewMoto,
  nova: viewNova,
  editar: viewEditar,
  vendas: viewVendas,
  ajustes: viewAjustes,
};

async function router() {
  stopRecognition();
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  const [name, id] = path.split('/');
  const params = new URLSearchParams(query || '');
  const view = routes[name] || viewPainel;
  $$('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === (name || 'painel')));
  main.scrollTop = 0; window.scrollTo(0, 0);
  try { await view(id, params); } catch (e) { console.error(e); main.innerHTML = `<div class="empty">Erro: ${esc(e.message)}</div>`; }
  hydrateImgs();
}

function header(title, back) {
  return `<header class="top">${back ? `<a class="back" href="${back}" aria-label="Voltar">‹</a>` : ''}<h1>${title}</h1></header>`;
}

// ===== Painel =====
async function viewPainel() {
  const motos = await db.listMotos();
  const estoque = motos.filter((m) => m.status !== 'vendida');
  const vendidas = motos.filter((m) => m.status === 'vendida');
  const mes = todayISO().slice(0, 7);
  const vendMes = vendidas.filter((m) => m.venda?.data?.startsWith(mes));
  const investido = estoque.reduce((s, m) => s + custoTotal(m), 0);
  const previsto = estoque.reduce((s, m) => s + (lucroPrevisto(m) || 0), 0);
  const lucroMes = vendMes.reduce((s, m) => s + lucroReal(m), 0);
  const paradas = estoque.filter((m) => diasEstoque(m) >= DIAS_ALERTA);
  const semPreco = estoque.filter((m) => !m.precoVenda);

  main.innerHTML = `
    <header class="top hero"><div><small>Garagem</small><h1>Olá! 👋</h1></div><a href="#/ajustes" class="icon-btn" aria-label="Ajustes">⚙️</a></header>
    <section class="add-grid">
      <a class="add-btn primary" href="#/nova?modo=foto"><b>📷</b><span>Foto da ficha</span></a>
      <a class="add-btn" href="#/nova?modo=audio"><b>🎤</b><span>Falar</span></a>
      <a class="add-btn" href="#/nova?modo=manual"><b>✍️</b><span>Digitar</span></a>
    </section>
    <section class="kpis">
      <a href="#/estoque" class="kpi"><small>Motos no estoque</small><strong>${estoque.length}</strong></a>
      <div class="kpi"><small>Dinheiro parado em motos</small><strong>${brlShort(investido)}</strong></div>
      <div class="kpi"><small>Lucro previsto do estoque</small><strong class="${previsto >= 0 ? 'pos' : 'neg'}">${brlShort(previsto)}</strong></div>
      <a href="#/vendas" class="kpi"><small>Vendidas este mês</small><strong>${vendMes.length} <em class="${lucroMes >= 0 ? 'pos' : 'neg'}">${brlShort(lucroMes)}</em></strong></a>
    </section>
    ${paradas.length || semPreco.length ? `<section class="card alerts"><h2>Atenção</h2>
      ${paradas.map((m) => `<a class="alert" href="#/moto/${m.id}">⏳ <b>${esc(titulo(m))}</b> está há ${diasEstoque(m)} dias no estoque</a>`).join('')}
      ${semPreco.map((m) => `<a class="alert" href="#/editar/${m.id}">🏷️ <b>${esc(titulo(m))}</b> está sem preço de venda</a>`).join('')}
    </section>` : ''}
    <section>
      <div class="sec-head"><h2>Últimas entradas</h2><a href="#/estoque">ver todas</a></div>
      ${estoque.length ? estoque.slice(0, 5).map(cardMoto).join('') : `<div class="empty">Nenhuma moto ainda.<br>Tire a foto de uma ficha para começar,<br>ou carregue o exemplo em <a href="#/ajustes">Ajustes</a>.</div>`}
    </section>`;
}

function cardMoto(m) {
  const lp = m.status === 'vendida' ? lucroReal(m) : lucroPrevisto(m);
  return `<a class="moto-card" href="#/moto/${m.id}">
    <div class="thumb">${m.fotos?.[0] ? `<img data-foto="${m.fotos[0]}" alt="">` : '🏍️'}</div>
    <div class="info">
      <b>${esc(titulo(m))}</b>
      <div class="row">${statusPill(m.status)}<small>${m.status === 'vendida' ? 'vendida ' + fmtDate(m.venda?.data) : diasEstoque(m) + ' dias'}</small></div>
      <div class="nums"><span>Custo <b>${brl(custoTotal(m))}</b></span>
      <span>${m.status === 'vendida' ? 'Vendeu' : 'Venda'} <b>${m.status === 'vendida' ? brl(m.venda?.valor) : m.precoVenda ? brl(m.precoVenda) : '—'}</b></span></div>
    </div>
    ${lp != null ? `<div class="lucro ${lp >= 0 ? 'pos' : 'neg'}">${lp >= 0 ? '+' : ''}${brlShort(lp)}</div>` : ''}
  </a>`;
}

// ===== Estoque =====
let filtroEstoque = 'ativas';
async function viewEstoque() {
  const motos = await db.listMotos();
  main.innerHTML = `${header('Estoque')}
    <div class="search"><input type="search" id="busca" placeholder="Buscar modelo, placa, cor…"></div>
    <div class="chips">${[['ativas', 'No estoque'], ['preparacao', 'Em preparação'], ['venda', 'À venda'], ['vendida', 'Vendidas'], ['todas', 'Todas']]
      .map(([k, l]) => `<button class="chip ${filtroEstoque === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
    <div id="lista"></div>`;
  const render = () => {
    const q = $('#busca').value.toLowerCase().trim();
    const lista = motos.filter((m) => {
      if (filtroEstoque === 'ativas' && m.status === 'vendida') return false;
      if (!['ativas', 'todas'].includes(filtroEstoque) && m.status !== filtroEstoque) return false;
      return !q || [m.modelo, m.marca, m.ano, m.cor, m.placa, m.procedencia].join(' ').toLowerCase().includes(q);
    });
    const soma = lista.reduce((s, m) => s + custoTotal(m), 0);
    $('#lista').innerHTML = lista.length
      ? `<p class="muted center">${lista.length} moto${lista.length > 1 ? 's' : ''} · custo total ${brl(soma)}</p>` + lista.map(cardMoto).join('')
      : '<div class="empty">Nada encontrado.</div>';
    hydrateImgs($('#lista'));
  };
  $('#busca').oninput = render;
  $$('.chip').forEach((c) => (c.onclick = () => { filtroEstoque = c.dataset.f; $$('.chip').forEach((x) => x.classList.toggle('on', x === c)); render(); }));
  render();
}

// ===== Detalhe da moto =====
async function viewMoto(id) {
  const m = await db.getMoto(id);
  if (!m) { main.innerHTML = header('Moto', '#/estoque') + '<div class="empty">Moto não encontrada.</div>'; return; }
  const ct = custoTotal(m), tg = totalGastos(m), lp = lucroPrevisto(m), lr = lucroReal(m);
  const vendida = m.status === 'vendida';
  const margem = (v) => (ct ? ` (${Math.round((v / ct) * 100)}%)` : '');
  const vsFipe = m.fipe && m.precoVenda ? Math.round((m.precoVenda / m.fipe) * 100) : null;

  main.innerHTML = `${header(esc(titulo(m)), '#/estoque')}
    <section class="gallery">
      ${(m.fotos || []).map((f) => `<div class="ph"><img data-foto="${f}" alt="" data-ver="${f}"><button class="del-foto" data-del="${f}" aria-label="Remover foto">×</button></div>`).join('')}
      <button class="ph add" id="add-foto">📷<span>Adicionar fotos</span></button>
    </section>
    <section class="card">
      <div class="row between">${statusPill(m.status)}<small class="muted">${vendida ? `Ficou ${diasEstoque(m)} dias` : `${diasEstoque(m)} dias no estoque`} · entrada ${fmtDate(m.dataEntrada)}</small></div>
      <dl class="specs">
        ${[['Marca', m.marca], ['Ano', m.ano], ['Cor', m.cor], ['Placa', m.placa], ['KM', m.km ? Number(m.km).toLocaleString('pt-BR') : ''], ['Procedência', m.procedencia]]
          .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    </section>
    <section class="card money-card">
      <div class="line"><span>FIPE</span><b>${m.fipe ? brl(m.fipe) : '—'}</b></div>
      <div class="line"><span>Valor de compra</span><b>${brl(m.valorCompra)}</b></div>
      <div class="line"><span>Gastos (${(m.gastos || []).length})</span><b>${brl(tg)}</b></div>
      <div class="line total"><span>Custo total</span><b>${brl(ct)}</b></div>
      ${vendida
        ? `<div class="line"><span>Vendida por</span><b>${brl(m.venda.valor)}</b></div>
           <div class="line big ${lr >= 0 ? 'pos' : 'neg'}"><span>Lucro</span><b>${brl(lr)}${margem(lr)}</b></div>`
        : `<div class="line"><span>Preço de venda</span><b>${m.precoVenda ? brl(m.precoVenda) : '<a href="#/editar/' + m.id + '">definir</a>'}</b></div>
           ${lp != null ? `<div class="line big ${lp >= 0 ? 'pos' : 'neg'}"><span>Lucro previsto</span><b>${brl(lp)}${margem(lp)}</b></div>` : ''}
           ${vsFipe ? `<p class="muted small">Preço de venda = ${vsFipe}% da FIPE</p>` : ''}
           ${!m.precoVenda && ct ? `<p class="muted small">Sugestão: com 20% de margem → ${brl(Math.ceil((ct * 1.2) / 100) * 100)}${m.fipe ? ` · FIPE ${brl(m.fipe)}` : ''}</p>` : ''}`}
    </section>
    <section class="card">
      <div class="sec-head"><h2>Gastos</h2><div class="btns"><button class="btn sm" id="gasto-voz">🎤</button><button class="btn sm primary" id="gasto-add">+ Gasto</button></div></div>
      ${(m.gastos || []).length ? `<ul class="gastos">${m.gastos.map((g) => `<li><span>${esc(g.descricao)}${g.data ? `<small>${fmtDate(g.data)}</small>` : ''}</span><b>${brl(g.valor)}</b><button data-gdel="${g.id}" aria-label="Apagar gasto">🗑</button></li>`).join('')}</ul>` : '<p class="muted">Nenhum gasto lançado.</p>'}
    </section>
    ${m.observacoes ? `<section class="card"><h2>Observações</h2><p>${esc(m.observacoes)}</p></section>` : ''}
    ${vendida && m.venda ? `<section class="card"><h2>Venda</h2><p>${fmtDate(m.venda.data)}${m.venda.comprador ? ' · ' + esc(m.venda.comprador) : ''}${m.venda.pagamento ? ' · ' + esc(m.venda.pagamento) : ''}</p></section>` : ''}
    ${m.fichaFoto ? `<section class="card"><h2>Ficha original</h2><img class="ficha" data-foto="${m.fichaFoto}" data-ver="${m.fichaFoto}" alt="Foto da ficha"></section>` : ''}
    <section class="actions">
      ${vendida ? `<button class="btn" id="desfazer">↩️ Desfazer venda</button>`
        : `<button class="btn primary big" id="vender">💰 Marcar como vendida</button>
           ${m.status === 'preparacao' ? '<button class="btn" id="pronta">✅ Pronta — colocar à venda</button>' : ''}
           <button class="btn" id="anuncio">📣 Enviar anúncio no WhatsApp</button>`}
      <a class="btn" href="#/editar/${m.id}">✏️ Editar dados</a>
      <button class="btn danger" id="excluir">Excluir moto</button>
    </section>`;

  const save = async (msg) => { await db.saveMoto(m); if (msg) toast(msg); router(); };

  $('#add-foto').onclick = async () => {
    const files = await pickFile({ multiple: true });
    if (!files.length) return;
    loading(true, 'Salvando fotos…');
    for (const f of files) m.fotos = [...(m.fotos || []), await db.putFoto(await compressImage(f))];
    loading(false);
    save(`${files.length} foto(s) adicionada(s)`);
  };
  $$('[data-del]').forEach((b) => (b.onclick = async (e) => {
    e.stopPropagation();
    if (!confirm('Remover esta foto?')) return;
    m.fotos = m.fotos.filter((f) => f !== b.dataset.del);
    await db.deleteFoto(b.dataset.del);
    save();
  }));
  $$('[data-ver]').forEach((img) => (img.onclick = async () => {
    const url = await fotoURL(img.dataset.ver);
    modal(`<img class="full" src="${url}" alt=""><button class="btn" data-close>Fechar</button>`);
  }));
  $$('[data-gdel]').forEach((b) => (b.onclick = () => {
    if (!confirm('Apagar este gasto?')) return;
    m.gastos = m.gastos.filter((g) => g.id !== b.dataset.gdel);
    save('Gasto apagado');
  }));
  $('#gasto-add').onclick = () => modal(`
    <h2>Novo gasto</h2>
    <form id="fg">
      <label class="field"><span>O que foi</span><input name="descricao" list="sug-gastos" required placeholder="Ex: pneu traseiro, mecânico…"></label>
      <datalist id="sug-gastos">${['Peças', 'Mecânico', 'Pneu', 'Lavagem', 'Pintura', 'Cartório', 'Transferência', 'Documentação', 'Garantia', 'Óleo', 'Bateria', 'Relação', 'Funilaria', 'Vistoria'].map((s) => `<option value="${s}">`).join('')}</datalist>
      ${moneyInput('valor', 'Valor', '', 'required')}
      <label class="field"><span>Data</span><input type="date" name="data" value="${todayISO()}"></label>
      <div class="row gap"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary">Salvar</button></div>
    </form>`, (w, close) => {
    $('[name=descricao]', w).focus();
    $('#fg', w).onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      m.gastos = [...(m.gastos || []), { id: uid(), descricao: fd.get('descricao'), valor: parseMoney(fd.get('valor')), data: fd.get('data') }];
      close(); save('Gasto lançado');
    };
  });
  $('#gasto-voz').onclick = () => modal(`
    <h2>Lançar gastos falando</h2>
    <p class="muted">Ex: “gastei 150 de pneu, 635 no mecânico e 50 de lavagem”.</p>
    <textarea id="tg" rows="4" placeholder="Fale ou escreva aqui…"></textarea>
    <button class="btn big mic" id="mic">🎤 Começar a falar</button>
    <div id="prev"></div>
    <div class="row gap"><button class="btn" data-close>Cancelar</button><button class="btn primary" id="ok">Lançar</button></div>`, (w, close) => {
    const ta = $('#tg', w);
    setupMic($('#mic', w), ta);
    const preview = () => {
      const gs = parseGastosTexto('gastei ' + ta.value);
      $('#prev', w).innerHTML = gs.length ? `<ul class="gastos">${gs.map((g) => `<li><span>${esc(g.descricao)}</span><b>${brl(g.valor)}</b></li>`).join('')}</ul>` : '';
      return gs;
    };
    ta.oninput = preview;
    // o reconhecimento de voz escreve no campo sem disparar "input": atualiza a prévia periodicamente
    const iv = setInterval(() => (document.body.contains(ta) ? preview() : clearInterval(iv)), 700);
    $('#ok', w).onclick = () => {
      stopRecognition();
      const gs = preview();
      if (!gs.length) { toast('Não entendi nenhum valor. Ex: "150 de pneu"'); return; }
      m.gastos = [...(m.gastos || []), ...gs.map((g) => ({ id: uid(), ...g, data: todayISO() }))];
      close(); save(`${gs.length} gasto(s) lançado(s)`);
    };
  });

  $('#vender') && ($('#vender').onclick = () => modal(`
    <h2>Registrar venda</h2>
    <form id="fv">
      ${moneyInput('valor', 'Vendida por', m.precoVenda, 'required')}
      <label class="field"><span>Data da venda</span><input type="date" name="data" value="${todayISO()}" required></label>
      <label class="field"><span>Comprador (opcional)</span><input name="comprador"></label>
      <label class="field"><span>Pagamento (opcional)</span><input name="pagamento" list="sug-pag" placeholder="À vista, financiado, troca…"></label>
      <datalist id="sug-pag"><option value="À vista"><option value="Pix"><option value="Financiado"><option value="Cartão"><option value="Troca + volta"></datalist>
      <p class="muted" id="lucro-prev"></p>
      <div class="row gap"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary">Confirmar venda</button></div>
    </form>`, (w, close) => {
    const upd = () => { const l = parseMoney($('[name=valor]', w).value) - ct; $('#lucro-prev', w).innerHTML = `Lucro nesta venda: <b class="${l >= 0 ? 'pos' : 'neg'}">${brl(l)}</b>`; };
    $('[name=valor]', w).oninput = upd; upd();
    $('#fv', w).onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      m.status = 'vendida';
      m.venda = { valor: parseMoney(fd.get('valor')), data: fd.get('data'), comprador: fd.get('comprador'), pagamento: fd.get('pagamento') };
      close(); save('Venda registrada! 🎉');
    };
  }));
  $('#pronta') && ($('#pronta').onclick = () => { m.status = 'venda'; save('Moto à venda'); });
  $('#desfazer') && ($('#desfazer').onclick = () => { if (confirm('Desfazer a venda e voltar para o estoque?')) { m.status = 'venda'; delete m.venda; save('Venda desfeita'); } });
  $('#anuncio') && ($('#anuncio').onclick = async () => {
    const txt = `🏍️ *${titulo(m)}*${m.marca ? ' – ' + m.marca : ''}\n${m.km ? `📍 ${Number(m.km).toLocaleString('pt-BR')} km\n` : ''}${m.precoVenda ? `💰 *${brl(m.precoVenda)}*\n` : ''}✅ Revisada e pronta pra rodar\n📲 Chama no WhatsApp!`;
    const files = [];
    for (const f of (m.fotos || []).slice(0, 5)) { const b = await db.getFoto(f); if (b) files.push(new File([b], `${f}.jpg`, { type: 'image/jpeg' })); }
    if (files.length && navigator.canShare?.({ files })) {
      try { await navigator.share({ text: txt, files }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
  });
  $('#excluir').onclick = async () => {
    if (!confirm(`Excluir "${titulo(m)}" e todas as fotos? Não dá para desfazer.`)) return;
    await db.deleteMoto(m.id); toast('Moto excluída'); location.hash = '#/estoque';
  };
}

// ===== Formulário (nova / editar) =====
function formMoto(m, aviso) {
  const gastos = m.gastos || [];
  return `<form id="fm" class="form">
    ${aviso ? `<div class="warn">${esc(aviso)}</div>` : ''}
    ${m._fichaURL ? `<details class="card"><summary>Ver foto da ficha</summary><img class="ficha" src="${m._fichaURL}" alt=""></details>` : ''}
    <fieldset class="card"><legend>Moto</legend>
      <label class="field"><span>Modelo *</span><input name="modelo" required value="${esc(m.modelo)}" placeholder="Ex: Fazer 150 ED"></label>
      <div class="grid2">
        <label class="field"><span>Marca</span><input name="marca" list="marcas" value="${esc(m.marca)}"></label>
        <label class="field"><span>Ano</span><input name="ano" inputmode="numeric" value="${esc(m.ano)}"></label>
        <label class="field"><span>Cor</span><input name="cor" value="${esc(m.cor)}"></label>
        <label class="field"><span>Placa</span><input name="placa" value="${esc(m.placa)}" style="text-transform:uppercase"></label>
        <label class="field"><span>KM</span><input name="km" inputmode="numeric" value="${esc(m.km)}"></label>
        <label class="field"><span>Entrada</span><input type="date" name="dataEntrada" value="${m.dataEntrada || todayISO()}"></label>
      </div>
      <datalist id="marcas">${['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'Dafra', 'Shineray', 'Haojue', 'Triumph', 'Royal Enfield'].map((x) => `<option value="${x}">`).join('')}</datalist>
      <label class="field"><span>Procedência (de quem comprou)</span><input name="procedencia" value="${esc(m.procedencia)}"></label>
      <label class="field"><span>Situação</span><select name="status">${Object.entries(STATUS).filter(([k]) => k !== 'vendida' || m.status === 'vendida').map(([k, v]) => `<option value="${k}" ${m.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
    </fieldset>
    <fieldset class="card"><legend>Valores</legend>
      <div class="grid2">${moneyInput('fipe', 'FIPE', m.fipe)}${moneyInput('valorCompra', 'Paguei na moto', m.valorCompra)}</div>
      ${moneyInput('precoVenda', 'Preço de venda', m.precoVenda)}
    </fieldset>
    <fieldset class="card"><legend>Gastos</legend>
      <div id="gastos-rows">${gastos.map(rowGasto).join('')}</div>
      <button type="button" class="btn sm" id="add-row">+ Adicionar gasto</button>
      <div class="totais" id="totais"></div>
    </fieldset>
    <fieldset class="card"><legend>Observações</legend><textarea name="observacoes" rows="3">${esc(m.observacoes)}</textarea></fieldset>
    <button class="btn primary big">💾 Salvar moto</button>
  </form>`;
}
const rowGasto = (g = {}) => `<div class="g-row"><input name="g_desc" placeholder="Descrição" value="${esc(g.descricao)}"><div class="money"><i>R$</i><input name="g_val" inputmode="decimal" placeholder="0,00" value="${g.valor ? fmtNum(g.valor) : ''}"></div><button type="button" class="x" aria-label="Remover">×</button></div>`;

function bindForm(m, onSaved) {
  const f = $('#fm');
  const calc = () => {
    const compra = parseMoney(f.valorCompra.value);
    const gastos = $$('[name=g_val]', f).reduce((s, i) => s + parseMoney(i.value), 0);
    const venda = parseMoney(f.precoVenda.value);
    const ct = compra + gastos;
    $('#totais').innerHTML = `<div class="line"><span>Soma dos gastos</span><b>${brl(gastos)}</b></div>
      <div class="line total"><span>Custo total</span><b>${brl(ct)}</b></div>
      ${venda ? `<div class="line ${venda - ct >= 0 ? 'pos' : 'neg'}"><span>Lucro previsto</span><b>${brl(venda - ct)}</b></div>` : ''}`;
  };
  const bindRows = () => $$('.g-row .x', f).forEach((b) => (b.onclick = () => { b.parentElement.remove(); calc(); }));
  $('#add-row').onclick = () => { $('#gastos-rows').insertAdjacentHTML('beforeend', rowGasto()); bindRows(); $$('[name=g_desc]', f).pop().focus(); };
  f.addEventListener('input', calc);
  bindRows(); calc();
  f.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(f);
    const descs = fd.getAll('g_desc'), vals = fd.getAll('g_val');
    const antigos = m.gastos || [];
    Object.assign(m, {
      modelo: fd.get('modelo').trim(), marca: fd.get('marca').trim(), ano: fd.get('ano').trim(), cor: fd.get('cor').trim(),
      placa: fd.get('placa').trim().toUpperCase(), km: fd.get('km') ? parseInt(String(fd.get('km')).replace(/\D/g, ''), 10) : null,
      dataEntrada: fd.get('dataEntrada'), procedencia: fd.get('procedencia').trim(), status: fd.get('status'),
      fipe: parseMoney(fd.get('fipe')) || null, valorCompra: parseMoney(fd.get('valorCompra')), precoVenda: parseMoney(fd.get('precoVenda')) || null,
      observacoes: fd.get('observacoes').trim(),
      gastos: descs.map((d, i) => ({ id: antigos[i]?.id || uid(), descricao: d.trim() || 'Gasto', valor: parseMoney(vals[i]), data: antigos[i]?.data || null }))
        .filter((g) => g.valor),
    });
    delete m._fichaURL;
    await db.saveMoto(m);
    onSaved(m);
  };
}

async function viewEditar(id) {
  const m = await db.getMoto(id);
  if (!m) { location.hash = '#/estoque'; return; }
  main.innerHTML = header('Editar moto', `#/moto/${id}`) + formMoto(m);
  bindForm(m, () => { toast('Salvo'); location.hash = `#/moto/${m.id}`; });
}

// ===== Nova moto: foto / áudio / manual =====
function novaMoto(dados = {}) {
  const m = { id: uid(), status: 'preparacao', fotos: [], gastos: [], dataEntrada: todayISO() };
  for (const [k, v] of Object.entries(dados)) if (v !== null && v !== undefined && v !== '' && k !== 'custoTotalAnotado') m[k] = v;
  m.gastos = (dados.gastos || []).map((g) => ({ id: uid(), descricao: g.descricao, valor: g.valor, data: null }));
  if (m.precoVenda) m.status = 'venda';
  return m;
}

function mostrarRevisao(m, aviso, titulo = 'Confira os dados') {
  main.innerHTML = header(titulo, '#/') + `<p class="muted pad">Revise e corrija o que precisar antes de salvar.</p>` + formMoto(m, aviso);
  bindForm(m, () => { toast('Moto cadastrada! ✅'); location.hash = `#/moto/${m.id}`; });
}

async function viewNova(_, params) {
  const modo = params.get('modo') || 'manual';
  if (modo === 'manual') return mostrarRevisao(novaMoto(), null, 'Nova moto');

  if (modo === 'foto') {
    main.innerHTML = header('Foto da ficha', '#/') + `
      <div class="capture">
        <div class="big-ico">📷</div>
        <p>Tire uma foto da ficha <b>inteira</b>, bem iluminada e reta.<br>O app lê o modelo, FIPE, custo e todos os gastos.</p>
        <button class="btn primary big" id="cam">Tirar foto</button>
        <button class="btn" id="gal">Escolher da galeria</button>
        ${temIA() ? '' : `<div class="warn">Para ler a ficha automaticamente, ${navigator.onLine ? 'configure a chave da IA em <a href="#/ajustes">Ajustes</a>' : 'é preciso internet'}. Sem isso, a foto fica salva e você digita os dados.</div>`}
      </div>`;
    const go = async (capture) => {
      const [file] = await pickFile({ capture });
      if (!file) return;
      loading(true, 'Preparando foto…');
      const blob = await compressImage(file, 2000, 0.85);
      const fichaId = await db.putFoto(blob);
      let dados = {}, aviso = null;
      if (temIA()) {
        loading(true, 'Lendo a ficha… (uns segundos)');
        try { dados = await lerFicha(blob); aviso = [conferirSoma(dados), dados.observacoes].filter(Boolean).join(' · ') || null; }
        catch (e) { console.error(e); aviso = 'Não consegui ler a ficha: ' + e.message + ' — preencha manualmente.'; }
      }
      loading(false);
      const m = novaMoto({ ...dados, observacoes: null });
      m.fichaFoto = fichaId;
      m._fichaURL = await fotoURL(fichaId);
      mostrarRevisao(m, aviso);
    };
    $('#cam').onclick = () => go(true);
    $('#gal').onclick = () => go(false);
    return;
  }

  if (modo === 'audio') {
    main.innerHTML = header('Falar sobre a moto', '#/') + `
      <div class="capture">
        <p class="muted">Fale naturalmente, por exemplo:</p>
        <blockquote>“Entrou hoje uma Fazer 150 ED 2015 preta, comprei do João por 7 mil. FIPE 11.389. Gastei 150 de pneu, 635 no mecânico, 50 de lavagem e 700 de pintura. Quero vender por 13.500.”</blockquote>
        <textarea id="fala" rows="6" placeholder="O que você falar aparece aqui (dá pra corrigir)…"></textarea>
        <button class="btn big mic" id="mic">🎤 Começar a falar</button>
        <button class="btn primary big" id="proc">Continuar ➜</button>
        ${SR ? '' : '<p class="muted small">Seu navegador não tem gravação embutida — toque no 🎤 do teclado para ditar.</p>'}
      </div>`;
    const ta = $('#fala');
    setupMic($('#mic'), ta);
    $('#proc').onclick = async () => {
      stopRecognition();
      const texto = ta.value.trim();
      if (!texto) { toast('Fale ou escreva algo primeiro'); return; }
      let dados, aviso = null;
      if (temIA()) {
        loading(true, 'Entendendo o que você falou…');
        try { dados = await lerAudio(texto); aviso = dados.observacoes || null; }
        catch (e) { console.error(e); dados = parseMotoTexto(texto); aviso = 'IA indisponível (' + e.message + '). Usei a leitura simples — confira.'; }
        loading(false);
      } else {
        dados = parseMotoTexto(texto);
        aviso = 'Leitura simples (sem IA). Confira os campos.';
      }
      const m = novaMoto({ ...dados, observacoes: null });
      m.observacoes = 'Áudio: ' + texto;
      mostrarRevisao(m, aviso);
    };
  }
}

// ===== Vendas =====
async function viewVendas() {
  const motos = (await db.listMotos()).filter((m) => m.status === 'vendida' && m.venda)
    .sort((a, b) => b.venda.data.localeCompare(a.venda.data));
  const porMes = {};
  for (const m of motos) {
    const k = m.venda.data.slice(0, 7);
    (porMes[k] ||= { n: 0, fat: 0, lucro: 0, dias: 0 });
    porMes[k].n++; porMes[k].fat += m.venda.valor; porMes[k].lucro += lucroReal(m); porMes[k].dias += diasEstoque(m);
  }
  const meses = Object.entries(porMes).slice(0, 12);
  const maxL = Math.max(1, ...meses.map(([, v]) => Math.abs(v.lucro)));
  const nomeMes = (k) => new Date(k + '-15').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  const totL = motos.reduce((s, m) => s + lucroReal(m), 0);
  const mediaDias = motos.length ? Math.round(motos.reduce((s, m) => s + diasEstoque(m), 0) / motos.length) : 0;

  main.innerHTML = `${header('Vendas')}
    <section class="kpis">
      <div class="kpi"><small>Motos vendidas</small><strong>${motos.length}</strong></div>
      <div class="kpi"><small>Lucro total</small><strong class="${totL >= 0 ? 'pos' : 'neg'}">${brlShort(totL)}</strong></div>
      <div class="kpi"><small>Lucro médio por moto</small><strong>${brlShort(motos.length ? totL / motos.length : 0)}</strong></div>
      <div class="kpi"><small>Tempo médio p/ vender</small><strong>${mediaDias} dias</strong></div>
    </section>
    ${meses.length ? `<section class="card"><h2>Lucro por mês</h2><div class="bars">
      ${meses.map(([k, v]) => `<div class="bar-row"><span>${nomeMes(k)}</span><div class="bar"><i class="${v.lucro >= 0 ? '' : 'neg'}" style="width:${(Math.abs(v.lucro) / maxL) * 100}%"></i></div><b>${brlShort(v.lucro)}</b><small>${v.n} moto${v.n > 1 ? 's' : ''}</small></div>`).join('')}
    </div></section>` : ''}
    <section><h2 class="pad">Histórico</h2>${motos.length ? motos.map(cardMoto).join('') : '<div class="empty">Nenhuma venda registrada ainda.</div>'}</section>`;
}

// ===== Ajustes =====
async function viewAjustes() {
  const key = getApiKey();
  main.innerHTML = `${header('Ajustes')}
    <section class="card">
      <h2>Leitura inteligente (IA)</h2>
      <p class="muted">Usada para ler a foto da ficha e entender o áudio. A chave fica salva só neste aparelho.</p>
      <label class="field"><span>Chave da API Claude</span><input id="key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(key)}"></label>
      <div class="row gap"><button class="btn primary" id="salvar-key">Salvar chave</button>${key ? '<button class="btn" id="tirar-key">Remover</button>' : ''}</div>
      <p class="small ${key ? 'pos' : 'muted'}">${key ? '✓ IA configurada' : 'Sem chave: o áudio usa uma leitura simples e a ficha precisa ser digitada.'}</p>
    </section>
    <section class="card">
      <h2>Backup</h2>
      <p class="muted">Os dados ficam no celular. Faça backup de vez em quando e guarde no Drive/WhatsApp.</p>
      <div class="row gap"><button class="btn" id="exp">⬇️ Salvar backup</button><button class="btn" id="imp">⬆️ Restaurar backup</button></div>
    </section>
    <section class="card">
      <h2>Demonstração</h2>
      <div class="row gap"><button class="btn" id="exemplo">Carregar motos de exemplo</button><button class="btn danger" id="limpar">Apagar tudo</button></div>
    </section>
    <p class="muted center small">Garagem · MVP v0.1</p>`;

  $('#salvar-key').onclick = () => { setApiKey($('#key').value); toast('Chave salva'); router(); };
  $('#tirar-key') && ($('#tirar-key').onclick = () => { setApiKey(''); toast('Chave removida'); router(); });
  $('#exp').onclick = async () => {
    loading(true, 'Gerando backup…');
    const data = await db.exportAll();
    loading(false);
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const name = `garagem-backup-${todayISO()}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Backup Garagem' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  };
  $('#imp').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = async () => {
      try { loading(true, 'Restaurando…'); await db.importAll(JSON.parse(await inp.files[0].text())); toast('Backup restaurado'); }
      catch (e) { toast('Erro: ' + e.message); } finally { loading(false); }
    };
    inp.click();
  };
  $('#exemplo').onclick = async () => { await carregarExemplo(); toast('Exemplos carregados'); location.hash = '#/'; };
  $('#limpar').onclick = async () => {
    if (!confirm('Apagar TODAS as motos e fotos deste aparelho?')) return;
    if (!confirm('Tem certeza? Faça um backup antes.')) return;
    await db.clearAll(); toast('Tudo apagado'); location.hash = '#/';
  };
}

async function carregarExemplo() {
  const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  const g = (pares) => pares.map(([descricao, valor]) => ({ id: uid(), descricao, valor, data: null }));
  const exemplos = [
    { modelo: 'Fazer 150 ED', marca: 'Yamaha', ano: '2015', cor: 'Preta', procedencia: 'Particular', dataEntrada: d(73), fipe: 11389, valorCompra: 7000, precoVenda: 12900, status: 'venda',
      gastos: g([['Pneu Biz dianteiro/traseiro', 150], ['Corrente / relação', 500], ['Recibo', 35], ['Cartório', 23], ['Peças', 442], ['Peças', 304], ['Garantia Fan 2012', 97], ['Peças', 45], ['Mecânico', 635], ['Lavagem', 50], ['Pintor', 700]]) },
    { modelo: 'CG 160 Fan', marca: 'Honda', ano: '2019', cor: 'Vermelha', km: 38200, procedencia: 'Troca na loja', dataEntrada: d(12), fipe: 13950, valorCompra: 10500, status: 'preparacao',
      gastos: g([['Revisão mecânico', 380], ['Kit relação', 260], ['Lavagem', 50]]) },
    { modelo: 'Biz 125', marca: 'Honda', ano: '2018', cor: 'Branca', km: 21000, procedencia: 'Leilão', dataEntrada: d(40), fipe: 10200, valorCompra: 7200, precoVenda: 9900, status: 'venda',
      gastos: g([['Bateria', 220], ['Transferência', 180], ['Lavagem', 50]]) },
    { modelo: 'Factor 150', marca: 'Yamaha', ano: '2020', cor: 'Azul', km: 30500, procedencia: 'Particular', dataEntrada: d(55), fipe: 12800, valorCompra: 9000, status: 'vendida',
      gastos: g([['Pneu traseiro', 230], ['Mecânico', 300], ['Cartório', 23]]), venda: { valor: 11800, data: d(9), comprador: 'Carlos', pagamento: 'Financiado' } },
    { modelo: 'Titan 160', marca: 'Honda', ano: '2021', cor: 'Prata', km: 18900, procedencia: 'Particular', dataEntrada: d(80), fipe: 16300, valorCompra: 12500, status: 'vendida',
      gastos: g([['Peças', 410], ['Lavagem', 50]]), venda: { valor: 15200, data: d(38), comprador: 'Ana', pagamento: 'À vista' } },
  ];
  for (const e of exemplos) await db.saveMoto({ id: uid(), fotos: [], ...e });
}

// ---------------- boot ----------------
window.addEventListener('hashchange', router);
window.addEventListener('online', () => toast('Conectado'));
window.addEventListener('offline', () => toast('Sem internet — tudo continua funcionando, menos a leitura por IA'));
router();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}
