const $ = id => document.getElementById(id);
const R = v => 'R$ ' + (+v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d),)/g, '.');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TAM = ['P', 'M', 'G', 'GG', 'XG'];
const SEED = [['Caneta', 15, 'Acessórios'], ['Chaveiro de metal', 24, 'Acessórios'], ['Chaveiro de borracha', 2, 'Acessórios'], ['Pin', 15, 'Acessórios'],
  ['Pulseira de borracha / São Bento', 15, 'Pulseiras'], ['Pulseira fina de borracha', 6, 'Pulseiras'], ['Pulseira média de Jesus', 5, 'Pulseiras'],
  ['Imagem de São Miguel', 35, 'Imagens'], ['Pulseira de metal', 25.9, 'Pulseiras'], ['Pulseira de cordinha trançada', 29.9, 'Pulseiras'],
  ['Pulseira de Nossa Senhora', 19.9, 'Pulseiras'], ['Pulseira branca de Nossa Senhora', 19.9, 'Pulseiras'], ['Pulseira dos Santos', 34.9, 'Pulseiras'],
  ['Pulseira de nylon', 10, 'Pulseiras'], ['Escapulário', 39.9, 'Acessórios'], ['Terço infantil', 19.9, 'Terços'], ['Bolsinha de terço', 29.9, 'Terços'],
  ...['Padre Pio', 'Nossa Senhora de Pentecostes', 'Aviva-me 2026 (Sarça)', 'Nossa Senhora de Guadalupe', 'Totus Tuus', 'Carlo Acutis', 'Maria Passa na Frente']
    .flatMap(m => TAM.map(t => ['Camiseta ' + m + ' - ' + t, 90, 'Camisetas', 1]))];

// EAN-13 interno (prefixo 2 = uso da loja)
const ean = n => { const b = '2' + String(n).padStart(11, '0'); let s = 0; for (let i = 0; i < 12; i++) s += +b[i] * (i % 2 ? 3 : 1); return b + ((10 - s % 10) % 10); };
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
  G = L.map(x => [...x].map(c => c ^ 1).reverse().join('')), RR = L.map(x => [...x].map(c => c ^ 1).join('')),
  PAR = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
function bars(c) {
  if (!/^\d{13}$/.test(c)) return '<svg viewBox="0 0 113 20"><text x="56" y="14" font-size="10" text-anchor="middle">' + esc(c) + '</text></svg>';
  let b = '101'; for (let i = 1; i < 7; i++) b += (PAR[c[0]][i - 1] == 'L' ? L : G)[c[i]]; b += '01010'; for (let i = 7; i < 13; i++) b += RR[c[i]]; b += '101';
  let r = ''; [...b].forEach((x, i) => { if (x == '1') r += `<rect x="${i + 9}" width="1" height="${[0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94].includes(i) ? 56 : 50}"/>`; });
  return `<svg viewBox="0 0 113 66" xmlns="http://www.w3.org/2000/svg"><rect width="113" height="66" fill="#fff"/><g fill="#000">${r}</g><g font-size="9" font-family="monospace" text-anchor="middle" fill="#000"><text x="4" y="64">${c[0]}</text><text x="33" y="64">${c.slice(1, 7)}</text><text x="79" y="64">${c.slice(7)}</text></g></svg>`;
}

// dados
let db; try { db = JSON.parse(localStorage.pdvAvivados); } catch (e) { }
function novo(nome, preco, cat, qtd, repor) { db.seq++; const p = { cod: ean(db.seq), nome, preco: +preco, cat, qtd: +qtd || 0, repor }; db.prods.push(p); return p; }
if (!db || !db.prods) { db = { seq: 0, prods: [], vendas: [] }; SEED.forEach(([n, p, c, r]) => novo(n, p, c, 0, !!r)); }
else db.prods.filter(p => p.cat === 'Camisetas' && !/ - (P|M|G|GG|XG)$/.test(p.nome)).forEach(p => {
  db.prods = db.prods.filter(x => x !== p); TAM.forEach(t => novo(p.nome + ' - ' + t, p.preco, p.cat, t === 'P' ? p.qtd : 0, p.repor));
});
const BEBIDAS = [['Água', 3], ['Refrigerante Coca-Cola', 8], ['Refrigerante Coca-Cola Zero', 8], ['Energético', 15], ['Suco Del Valle', 0]]
  .map(([nome, preco], i) => ({ cod: ean(900001 + i), nome, preco, cat: 'Bebidas', qtd: 0, repor: true }));
if (!db.migBebidas) { BEBIDAS.forEach(b => db.prods.some(p => p.cod === b.cod) || db.prods.push({ ...b })); db.migBebidas = 1; }
function save() { try { localStorage.pdvAvivados = JSON.stringify(db); } catch (e) { toast('Não foi possível salvar neste aparelho', 'bad'); } }
save();
const byCod = c => db.prods.find(p => p.cod === String(c).trim());
const cats = () => [...new Set(db.prods.map(p => p.cat))];

// utilidades de interface
let tt; function toast(t, k) { document.querySelector('.toast')?.remove(); const d = document.createElement('div'); d.className = 'toast ' + (k || ''); d.textContent = t; document.body.append(d); clearTimeout(tt); tt = setTimeout(() => d.remove(), 2200); }
let ac; function beep(ok = true) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = ok ? 1500 : 300; g.gain.value = .08; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + (ok ? .08 : .25)); } catch (e) { } navigator.vibrate?.(ok ? 40 : [80, 50, 80]); }
function sheet(html, onClose) { $('modal').innerHTML = `<div class="sheet"><div>${html}</div></div>`; const s = $('modal').firstChild; s.onclick = e => { if (e.target === s) close(); }; s.querySelectorAll('.x').forEach(b => b.onclick = close); function close() { onClose?.(); $('modal').innerHTML = ''; } return { el: s, close }; }
function ask(msg, okTxt, fn, danger) { const m = sheet(`<h2>${esc(msg)}<button class="x">×</button></h2><div class="two"><button class="btn x" style="width:auto;height:48px;border-radius:14px">Voltar</button><button class="btn ${danger ? 'bad' : 'pri'}" id="askOk">${okTxt}</button></div>`); $('askOk').onclick = () => { m.close(); fn(); }; }

// abas
let tab = 'venda';
document.querySelectorAll('nav button').forEach(b => b.onclick = () => go(b.dataset.t));
function go(t) { tab = t; document.querySelectorAll('nav button').forEach(x => x.classList.toggle('on', x.dataset.t === t)); document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== t); document.querySelector('main').scrollTop = 0; render(); }

// ===== venda =====
let cart = [], vCat = 'Todos';
function addCart(c) {
  const p = byCod(c); if (!p) { beep(false); return toast('Código não encontrado: ' + c, 'bad'); }
  if (!(p.preco > 0)) { beep(false); return toast(p.nome + ' está sem preço. Defina no Estoque.', 'bad'); }
  const it = cart.find(i => i.cod === p.cod); it ? it.q++ : cart.unshift({ cod: p.cod, nome: p.nome, preco: p.preco, q: 1 });
  beep(); if ((it ? it.q : 1) > p.qtd) toast(p.nome + ': estoque insuficiente (' + p.qtd + ')', 'bad'); else toast('+ ' + p.nome + '  ' + R(p.preco));
  rCart();
}
const tot = () => cart.reduce((a, i) => a + i.preco * i.q, 0);
function rCart() {
  const n = cart.reduce((a, i) => a + i.q, 0);
  $('cart').innerHTML = cart.length ? cart.map((i, k) => `<div class="ci"><div class="nm"><b>${esc(i.nome)}</b><small>${R(i.preco)} cada</small></div>
    <div class="qty"><button data-k="${k}" data-d="-1">−</button><span>${i.q}</span><button data-k="${k}" data-d="1">+</button></div><div class="sub">${R(i.preco * i.q)}</div></div>`).join('')
    : `<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M17 8v8"/></svg>Bipe um produto para começar a venda</div>`;
  $('cart').querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const i = cart[b.dataset.k]; i.q += +b.dataset.d; if (i.q < 1) cart.splice(b.dataset.k, 1); rCart(); });
  $('total').textContent = R(tot()); $('nItens').textContent = n + (n === 1 ? ' item' : ' itens');
}
function rQuick() {
  const cs = ['Todos', ...cats()]; $('vChips').innerHTML = cs.map(c => `<button class="chip ${c === vCat ? 'on' : ''}">${esc(c)}</button>`).join('');
  $('vChips').querySelectorAll('.chip').forEach((b, i) => b.onclick = () => { vCat = cs[i]; rQuick(); });
  const s = $('scan').value.trim().toLowerCase();
  const ps = db.prods.filter(p => (vCat === 'Todos' || p.cat === vCat) && (!s || (p.nome + ' ' + p.cod).toLowerCase().includes(s)));
  $('quick').innerHTML = ps.map(p => `<button class="pt ${p.qtd <= 0 ? 'zero' : ''}" data-c="${p.cod}"><b>${esc(p.nome)}</b><span>${p.qtd} un.<i>${R(p.preco)}</i></span></button>`).join('') || '<p style="color:var(--mu)">Nenhum produto encontrado.</p>';
  $('quick').querySelectorAll('.pt').forEach(b => b.onclick = () => addCart(b.dataset.c));
}
$('scan').addEventListener('keydown', e => { if (e.key === 'Enter') { const v = $('scan').value.trim(); if (!v) return; if (byCod(v)) { addCart(v); $('scan').value = ''; rQuick(); } else { const m = db.prods.filter(p => p.nome.toLowerCase().includes(v.toLowerCase())); if (m.length === 1) { addCart(m[0].cod); $('scan').value = ''; rQuick(); } else toast(m.length ? 'Toque no produto abaixo' : 'Não encontrado: ' + v, m.length ? '' : 'bad'); } } });
$('scan').addEventListener('input', rQuick);
$('camV').onclick = () => scanner(c => addCart(c), false);
$('cobrar').onclick = () => {
  if (!cart.length) return toast('A conta está vazia', 'bad');
  const t = tot(); let pag = 'Pix';
  const m = sheet(`<h2>Finalizar venda<button class="x">×</button></h2><div class="big">${R(t)}</div>
   <div class="pays">${['Pix', 'Dinheiro', 'Débito', 'Crédito'].map(x => `<button class="${x === pag ? 'on' : ''}">${x}</button>`).join('')}</div>
   <div class="fld" id="recF" hidden><label for="rec">Valor recebido</label><input class="in" id="rec" type="number" inputmode="decimal" step="0.01"></div>
   <div class="troco" id="troco"></div>
   <div class="two" style="margin-top:8px"><button class="btn bad" id="cancV">Cancelar venda</button><button class="btn ok" id="okV">Confirmar</button></div>`);
  m.el.querySelectorAll('.pays button').forEach(b => b.onclick = () => { pag = b.textContent; m.el.querySelectorAll('.pays button').forEach(x => x.classList.toggle('on', x === b)); $('recF').hidden = pag !== 'Dinheiro'; $('troco').textContent = ''; if (pag === 'Dinheiro') $('rec').focus(); });
  $('rec').oninput = () => { const r = +$('rec').value; $('troco').textContent = r ? (r >= t ? 'Troco: ' + R(r - t) : 'Faltam ' + R(t - r)) : ''; };
  $('cancV').onclick = () => { m.close(); ask('Cancelar esta venda?', 'Sim, cancelar', () => { cart = []; rCart(); }, 1); };
  $('okV').onclick = () => {
    const v = { d: new Date().toISOString(), itens: cart, total: t, pag }; v.id = v.d.replace(/\W/g, '');
    cart.forEach(i => { const p = byCod(i.cod); if (p) p.qtd -= i.q; });
    db.vendas.push(v); save(); cloudVenda(v);
    cart = []; m.close(); render(); toast('Venda registrada: ' + R(t), 'ok'); beep();
  };
};

// ===== câmera =====
let qr;
function scanner(onCode, cont) {
  const m = sheet(`<h2>${cont ? 'Bipar produtos' : 'Ler código'}<button class="x">×</button></h2><div id="reader"></div><p class="scanhint" id="sh">Aponte a câmera para o código de barras</p><button class="btn ink x" style="width:100%;margin-top:10px;border-radius:14px;height:48px">Concluir</button>`, stop);
  let last = '', lt = 0;
  try {
    const F = Html5QrcodeSupportedFormats;
    qr = new Html5Qrcode('reader', { formatsToSupport: [F.EAN_13, F.EAN_8, F.CODE_128, F.UPC_A, F.CODE_39], experimentalFeatures: { useBarCodeDetectorIfSupported: true }, verbose: false });
    qr.start({ facingMode: 'environment' }, { fps: 12, qrbox: (w, h) => ({ width: Math.min(w * .85, 320), height: Math.min(h * .45, 140) }) }, txt => {
      const n = Date.now(); if (txt === last && n - lt < 1800) return; last = txt; lt = n;
      onCode(txt); $('sh') && ($('sh').textContent = 'Lido: ' + txt); if (!cont) m.close();
    }).catch(err => { $('sh').textContent = 'Não foi possível abrir a câmera. Permita o acesso à câmera nas configurações do navegador e tente de novo.'; $('sh').style.color = 'var(--bad)'; console.warn(err); });
  } catch (e) { $('sh').textContent = 'Câmera indisponível: ' + e.message; }
  function stop() { try { qr && qr.isScanning && qr.stop().then(() => qr.clear()); } catch (e) { } }
}

// ===== estoque =====
let eCat = 'Todos';
function rEstoque() {
  const cs = ['Todos', ...cats(), 'Sem estoque']; $('eChips').innerHTML = cs.map(c => `<button class="chip ${c === eCat ? 'on' : ''}">${esc(c)}</button>`).join('');
  $('eChips').querySelectorAll('.chip').forEach((b, i) => b.onclick = () => { eCat = cs[i]; rEstoque(); });
  const s = $('busca').value.trim().toLowerCase();
  const ps = db.prods.filter(p => (eCat === 'Todos' || p.cat === eCat || (eCat === 'Sem estoque' && p.qtd <= 0)) && (!s || (p.nome + ' ' + p.cod + ' ' + p.cat).toLowerCase().includes(s)));
  $('lista').innerHTML = ps.map(p => `<div class="it" data-c="${p.cod}"><div class="nm"><b>${esc(p.nome)}${p.repor ? '' : '<span class="tag">não repor</span>'}</b><small>${p.cod} · ${esc(p.cat)}</small></div><span class="pr">${R(p.preco)}</span><span class="bdg ${p.qtd <= 0 ? 'z' : p.qtd <= 3 ? 'l' : ''}">${p.qtd}</span></div>`).join('') || '<div class="empty">Nenhum produto aqui.</div>';
  $('lista').querySelectorAll('.it').forEach(r => r.onclick = () => editar(byCod(r.dataset.c)));
  let q = 0, v = 0; db.prods.forEach(p => { if (p.qtd > 0) { q += p.qtd; v += p.qtd * p.preco; } });
  $('sP').textContent = db.prods.length; $('sQ').textContent = q; $('sV').textContent = R(v).replace(',00', '');
}
$('busca').oninput = rEstoque;
$('novoP').onclick = () => editar(null);
$('camE').onclick = () => scanner(c => { const p = byCod(c); if (p) setTimeout(() => editar(p), 50); else toast('Código não cadastrado: ' + c, 'bad'); }, false);
function editar(p) {
  const n = !p;
  const m = sheet(`<h2>${n ? 'Novo produto' : 'Editar produto'}<button class="x">×</button></h2>
   ${n ? '' : `<div style="background:#fff;border-radius:12px;padding:8px;margin-bottom:12px;max-width:260px">${bars(p.cod)}</div>`}
   <div class="fld"><label for="fN">Nome</label><input class="in" id="fN" value="${n ? '' : esc(p.nome)}"></div>
   <div class="two"><div class="fld"><label for="fP">Preço (R$)</label><input class="in" id="fP" type="number" inputmode="decimal" step="0.01" value="${n ? '' : p.preco}"></div>
   <div class="fld"><label for="fQ">Estoque</label><input class="in" id="fQ" type="number" inputmode="numeric" value="${n ? 0 : p.qtd}"></div></div>
   <div class="fld"><label>Entrada rápida</label><div class="row">${[1, 5, 10, 20].map(x => `<button class="btn sm" data-a="${x}">+${x}</button>`).join('')}<button class="btn sm" data-a="-1">−1</button></div></div>
   <div class="fld"><label for="fC">Categoria</label><input class="in" id="fC" list="dlC" value="${n ? '' : esc(p.cat)}"><datalist id="dlC">${cats().map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>
   <label class="row" style="margin-bottom:14px"><input type="checkbox" id="fR" ${n || p.repor ? 'checked' : ''}> Repor quando acabar</label>
   <div class="two">${n ? '<button class="btn x" style="width:auto;height:48px;border-radius:14px">Cancelar</button>' : '<button class="btn bad" id="fDel">Excluir</button>'}<button class="btn pri" id="fOk">Salvar</button></div>`);
  m.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { $('fQ').value = Math.max(0, (+$('fQ').value || 0) + +b.dataset.a); });
  $('fOk').onclick = async () => {
    const nome = $('fN').value.trim(), preco = +String($('fP').value).replace(',', '.');
    if (!nome || !(preco > 0)) return toast('Preencha nome e preço', 'bad');
    let x = p;
    if (n) { try { await proxSeq(); } catch (e) { return toast('Sem internet: conecte para cadastrar produto novo', 'bad'); } x = novo(nome, preco, $('fC').value.trim() || 'Geral', $('fQ').value, $('fR').checked); toast('Cadastrado · código ' + x.cod, 'ok'); }
    else Object.assign(p, { nome, preco, qtd: +$('fQ').value || 0, cat: $('fC').value.trim() || 'Geral', repor: $('fR').checked }), toast('Salvo', 'ok');
    save(); cloudProd(x); m.close(); render();
  };
  if (!n) $('fDel').onclick = () => { m.close(); ask('Excluir ' + p.nome + '?', 'Excluir', () => { db.prods = db.prods.filter(x => x !== p); save(); cloudDel(p); render(); }, 1); };
  if (n) setTimeout(() => $('fN').focus(), 250);
}

// ===== etiquetas =====
let lCat = 'Todos';
function rLabels() {
  const cs = ['Todos', ...cats()]; $('lChips').innerHTML = cs.map(c => `<button class="chip ${c === lCat ? 'on' : ''}">${esc(c)}</button>`).join('');
  $('lChips').querySelectorAll('.chip').forEach((b, i) => b.onclick = () => { lCat = cs[i]; rLabels(); });
  const cp = Math.max(1, +$('copias').value || 1), so = $('soEst').checked; let h = '';
  db.prods.filter(p => lCat === 'Todos' || p.cat === lCat).forEach(p => { const k = so ? Math.max(0, p.qtd) : cp; for (let i = 0; i < k; i++) h += `<div class="lbl"><b>${esc(p.nome)}</b>${bars(p.cod)}<b class="p">${R(p.preco)}</b></div>`; });
  $('labels').innerHTML = h || '<div class="empty">Nenhuma etiqueta para imprimir.</div>';
}
$('copias').oninput = $('soEst').onchange = rLabels;
$('imprimir').onclick = () => window.print();

// ===== vendas =====
const dstr = d => new Date(d).toLocaleDateString('sv');
function rVendas() {
  if (!$('dia').value) $('dia').value = dstr(Date.now());
  const vs = db.vendas.filter(v => dstr(v.d) === $('dia').value).reverse();
  const t = vs.reduce((a, v) => a + v.total, 0), por = {}; vs.forEach(v => por[v.pag] = (por[v.pag] || 0) + v.total);
  $('vStats').innerHTML = `<div class="st"><small>Total</small><b>${R(t)}</b></div><div class="st"><small>Vendas</small><b>${vs.length}</b></div><div class="st"><small>Ticket médio</small><b>${R(vs.length ? t / vs.length : 0)}</b></div>` +
    Object.entries(por).map(([k, v]) => `<div class="st"><small>${k}</small><b>${R(v)}</b></div>`).join('');
  $('hist').innerHTML = vs.map(v => `<div class="vd" data-id="${esc(vid(v))}"><div class="nm">${v.itens.map(i => i.q + '× ' + esc(i.nome)).join('<br>')}<br><small>${new Date(v.d).toLocaleTimeString('pt-BR').slice(0, 5)} · ${v.pag}</small></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><b>${R(v.total)}</b><button class="btn sm bad" data-del>Excluir</button></div></div>`).join('') || '<div class="empty">Nenhuma venda neste dia.</div>';
  $('hist').querySelectorAll('[data-del]').forEach(b => b.onclick = () => excluirVenda(b.closest('.vd').dataset.id));
}
$('dia').onchange = rVendas;
const vid = v => v.id || v.d.replace(/\W/g, '');
function excluirVenda(id) {
  const v = db.vendas.find(x => vid(x) === id); if (!v) return;
  ask('Excluir esta venda de ' + R(v.total) + '? Os itens voltam para o estoque.', 'Excluir venda', () => {
    v.itens.forEach(i => { const p = byCod(i.cod); if (p) p.qtd += i.q; });
    db.vendas = db.vendas.filter(x => x !== v); save(); render(); toast('Venda excluída e estoque devolvido', 'ok');
    if (FB && au.currentUser) {
      const b = fs.batch(), inc = firebase.firestore.FieldValue.increment;
      v.itens.forEach(i => byCod(i.cod) && b.update(fs.collection('produtos').doc(i.cod), { qtd: inc(i.q) }));
      b.delete(fs.collection('vendas').doc(id)); b.commit().catch(erroNuvem);
    }
  }, 1);
}
$('exp').onclick = async () => {
  const f = new File([JSON.stringify(db)], 'pdv-avivados-' + dstr(Date.now()) + '.json', { type: 'application/json' });
  if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: 'Backup PDV Avivados' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; a.click();
};
$('imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { let d; try { d = JSON.parse(t); } catch (x) { return toast('Arquivo inválido', 'bad'); } if (!d.prods) return toast('Arquivo inválido', 'bad'); ask('Substituir todos os dados por este backup?', 'Substituir', () => { db = d; save(); cloudSubir(true); render(); toast('Backup restaurado', 'ok'); }, 1); }); e.target.value = ''; };

function render() {
  $('hoje').textContent = R(db.vendas.filter(v => dstr(v.d) === dstr(Date.now())).reduce((a, v) => a + v.total, 0));
  if (tab === 'venda') { rCart(); rQuick(); } else if (tab === 'estoque') rEstoque(); else if (tab === 'etiquetas') rLabels(); else rVendas();
}
render();
// leitor USB/Bluetooth: qualquer digitação rápida terminada em Enter vira bipe, mesmo fora do campo
let buf = '', bt = 0;
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || $('modal').innerHTML) return;
  const n = Date.now(); if (n - bt > 80) buf = ''; bt = n;
  if (e.key === 'Enter' && buf.length >= 6) { if (tab !== 'venda') go('venda'); addCart(buf); buf = ''; } else if (e.key.length === 1) buf += e.key;
});
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js'));

// ===== nuvem (Firebase): estoque e vendas compartilhados entre os aparelhos =====
const FB = window.FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey;
let fs, au, unsub = [];
async function proxSeq() { // no modo nuvem o contador de códigos é único para todos os aparelhos
  if (!FB) return;
  const ref = fs.doc('meta/contador');
  db.seq = await fs.runTransaction(async t => { const s = await t.get(ref); const v = Math.max(s.exists ? s.data().seq : 0, db.seq) + 1; t.set(ref, { seq: v }, { merge: true }); return v; }) - 1;
}
function cloudProd(p) { if (FB && au.currentUser) fs.collection('produtos').doc(p.cod).set(p).catch(erroNuvem); }
function cloudDel(p) { if (FB && au.currentUser) fs.collection('produtos').doc(p.cod).delete().catch(erroNuvem); }
function cloudVenda(v) {
  if (!FB || !au.currentUser) return;
  const b = fs.batch(), inc = firebase.firestore.FieldValue.increment;
  v.itens.forEach(i => byCod(i.cod) && b.update(fs.collection('produtos').doc(i.cod), { qtd: inc(-i.q) }));
  const { id, ...dados } = v; b.set(fs.collection('vendas').doc(id), dados); b.commit().catch(erroNuvem);
}
async function cloudSubir(tudo) { // envia os dados deste aparelho (primeira vez ou backup importado)
  const ops = [];
  db.prods.forEach(p => ops.push(b => b.set(fs.collection('produtos').doc(p.cod), p)));
  if (tudo) { const ex = await fs.collection('produtos').get(); ex.docs.forEach(d => !byCod(d.id) && ops.push(b => b.delete(d.ref))); }
  db.vendas.forEach(v => ops.push(b => { const { id, ...dados } = v; b.set(fs.collection('vendas').doc(id || v.d.replace(/\W/g, '')), dados); }));
  ops.push(b => b.set(fs.doc('meta/contador'), { seq: db.seq }, { merge: true }));
  for (let i = 0; i < ops.length; i += 400) { const b = fs.batch(); ops.slice(i, i + 400).forEach(f => f(b)); await b.commit(); }
}
function erroNuvem(e) { console.warn(e); toast(e.code === 'permission-denied' ? 'Sem permissão no banco. Entre novamente.' : 'Erro ao sincronizar: ' + (e.message || e), 'bad'); }
function login() {
  const m = sheet(`<div style="background:#fff;border-radius:18px;padding:14px;margin-bottom:14px;text-align:center"><img src="icons/logo-completo.png" alt="Avivados em Pentecostes" style="height:150px"></div><p style="margin:0 0 16px;color:var(--mu);text-align:center">Entre com sua conta Google para acessar o estoque compartilhado da loja.</p>
   <button class="btn" id="gBtn" style="width:100%;height:52px;background:#fff;color:#1f1f1f;border-color:#dadce0"><svg viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>Entrar com Google</button>
   <p id="lErr" style="color:var(--bad);min-height:20px;margin:10px 0 0;text-align:center"></p>`);
  m.el.onclick = null;
  $('gBtn').onclick = () => {
    const pv = new firebase.auth.GoogleAuthProvider(); pv.setCustomParameters({ prompt: 'select_account' }); $('lErr').textContent = '';
    au.signInWithPopup(pv).then(() => m.close()).catch(e => {
      if (e.code === 'auth/popup-blocked') return $('lErr').textContent = 'O navegador bloqueou a janela do Google. Permita pop-ups para este site e toque de novo.';
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') $('lErr').textContent = 'Não foi possível entrar (' + e.code + ').';
    });
  };
}
function iniciarNuvem() {
  $('nuvem').hidden = !FB; if (!FB) return;
  firebase.initializeApp(FIREBASE_CONFIG);
  firebase.auth().getRedirectResult().catch(e => toast('Erro no login: ' + e.code, 'bad'));
  fs = firebase.firestore(); au = firebase.auth();
  fs.enablePersistence({ synchronizeTabs: true }).catch(() => { });
  $('sair').onclick = () => ask('Sair da conta neste aparelho?', 'Sair', () => au.signOut(), 1);
  au.onAuthStateChanged(async u => {
    unsub.forEach(f => f()); unsub = [];
    $('nuvemSt').textContent = u ? 'Conectado como ' + u.email : 'Desconectado';
    if (!u) return login();
    try { const c = await fs.doc('meta/contador').get(); if (!c.exists) { await cloudSubir(false); toast('Estoque enviado para a nuvem', 'ok'); }
      if (!(c.exists && c.data().bebidas)) { const b = fs.batch(); BEBIDAS.forEach(x => b.set(fs.collection('produtos').doc(x.cod), x)); b.set(fs.doc('meta/contador'), { bebidas: true }, { merge: true }); await b.commit(); } } catch (e) { erroNuvem(e); }
    unsub.push(fs.collection('produtos').onSnapshot(s => { db.prods = s.docs.map(d => d.data()).sort((a, b) => a.cod.localeCompare(b.cod)); save(); render(); }, erroNuvem));
    const desde = new Date(Date.now() - 400 * 864e5).toISOString();
    unsub.push(fs.collection('vendas').where('d', '>=', desde).onSnapshot(s => { db.vendas = s.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => a.d.localeCompare(b.d)); save(); render(); }, erroNuvem));
  });
}
iniciarNuvem();
