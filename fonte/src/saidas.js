// Prévia em HTML (mesmo desenho do PDF) e versão em texto para copiar.
import { HOSPITAL, cabecalhoPaciente, montarLaudo } from "./catalogo.js";
import { dataBR, horaBR, dataHojeISO } from "./fmt.js";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const br = (s) => esc(s).replace(/\n/g, "<br>");

function assinaturaTxt(laudo) {
  const a = laudo.assinante || {};
  const q = laudo.assinadoEm ? new Date(laudo.assinadoEm) : new Date();
  return { nome: a.nome || "", linha2: [a.titulo, a.crmv].filter(Boolean).join(" · "), quando: `em ${dataBR(dataHojeISO(q))} às ${horaBR(q)}` };
}

export function previaHTML(laudo, urlsFotos = {}) {
  const cab = cabecalhoPaciente(laudo);
  const ass = assinaturaTxt(laudo);
  const exames = montarLaudo(laudo);
  let h = `<div class="lz-top"><img src="logo-laudo.jpg" alt="Zog Hospital Veterinário"><div class="lz-ct">${[...HOSPITAL.endereco].map(esc).join("<br>")}<br><b>${esc(HOSPITAL.telefones)}</b><br>${esc(HOSPITAL.email)}</div></div>`;
  h += `<div class="lz-num"><span><small>LAUDO Nº</small> ${esc(cab.numero || "—")}</span><span><small>DATA DO EXAME</small> ${esc(cab.data || "—")}</span></div>`;
  h += `<div class="lz-pac"><dl>${cab.esquerda.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v || "—")}</dd>`).join("")}</dl><dl>${cab.direita.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v || "—")}</dd>`).join("")}</dl></div>`;
  if (!exames.length) h += `<p class="lz-vazio">Escolha ao menos um exame para montar o laudo.</p>`;
  exames.forEach((ex, idx) => {
    h += `<h3 class="lz-tit">${esc(ex.titulo)}</h3>`;
    if (ex.meta?.length) h += `<p class="lz-meta">${ex.meta.map(([k, v]) => `${esc(k)}: <i>${esc(v)}</i>`).join(" &nbsp;·&nbsp; ")}</p>`;
    for (const b of ex.conteudo) {
      if (b.t === "tabela") {
        h += `<table class="lz-tab"><colgroup>${b.cols.map((c) => `<col style="width:${c.w * 100}%">`).join("")}</colgroup><thead><tr>${b.cols.map((c) => `<th>${esc(c.h)}</th>`).join("")}</tr></thead><tbody>`;
        let z = 0;
        for (const l of b.linhas) {
          if (l.tipo === "sec") { h += `<tr class="sec"><td colspan="${b.cols.length}">${esc(l.texto)}</td></tr>`; z = 0; continue; }
          const cls = z++ % 2 === 0 ? "z" : "";
          if (l.tipo === "obs") h += `<tr class="${cls}${l.sep ? " sep" : ""}"><td class="ob">${esc(l.rotulo)}</td><td colspan="${b.cols.length - 1}">${br(l.texto)}</td></tr>`;
          else h += `<tr class="${cls}">${l.c.map((t, i) => `<td class="${b.cols[i].forte ? "fo" : i ? "r" : ""}${i === 1 && l.flag ? " fl-" + l.flag : ""}">${br(t)}</td>`).join("")}</tr>`;
        }
        h += `</tbody></table>`;
      } else if (b.t === "par") h += `<p class="lz-par${b.grande ? " g" : ""}">${b.runs.map((r) => (r.bold ? `<b>${esc(r.text)}</b>` : esc(r.text))).join("")}</p>`;
      else if (b.t === "img") h += `<figure class="lz-img"><img src="${urlsFotos[idx] || ""}" alt=""><figcaption>${esc(b.legenda)}</figcaption></figure>`;
      else if (b.t === "local") h += `<p class="lz-local">${esc(b.texto)}</p>`;
    }
    h += `<div class="lz-ass">Assinado eletronicamente por <b>${esc(ass.nome)}</b><br>${esc(ass.linha2)}<br>${esc(ass.quando)}</div>`;
  });
  h += `<div class="lz-rod"><span>${esc(HOSPITAL.nome)} · Laudo nº ${esc(cab.numero || "—")}</span><b>Pág. 1</b></div>`;
  return h;
}

export function textoLaudo(laudo) {
  const cab = cabecalhoPaciente(laudo);
  const ass = assinaturaTxt(laudo);
  const L = [`${HOSPITAL.nome.toUpperCase()}`, `Laudo nº ${cab.numero || "—"} · ${cab.data}`, ""];
  [...cab.esquerda, ...cab.direita].forEach(([k, v]) => v && L.push(`${k}: ${v}`));
  for (const ex of montarLaudo(laudo)) {
    L.push("", `*${ex.titulo.toUpperCase()}*`);
    if (ex.meta?.length) L.push(ex.meta.map(([k, v]) => `${k}: ${v}`).join(" · "));
    for (const b of ex.conteudo) {
      if (b.t === "tabela") {
        for (const l of b.linhas) {
          if (l.tipo === "sec") L.push("", l.texto.toUpperCase());
          else if (l.tipo === "obs") L.push(`${l.rotulo}: ${l.texto}`);
          else {
            const [n, r, ...resto] = l.c;
            const ref = resto.at(-1), abs = resto.length > 1 ? resto[0] : "";
            if (!r && !abs) continue;
            L.push(`${n}: ${r}${abs ? " = " + abs : ""}${ref ? `  (ref. ${ref.replace(/\n/g, "; ")})` : ""}`);
          }
        }
      } else if (b.t === "par" || b.t === "local") L.push("", b.t === "par" ? b.runs.map((r) => r.text).join("") : b.texto);
    }
    L.push("", `Assinado eletronicamente por ${ass.nome}`, ass.linha2, ass.quando);
  }
  return L.join("\n");
}
