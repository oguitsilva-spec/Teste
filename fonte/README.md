# Laudos Zog

App (PWA) de laudos do Zog Hospital Veterinário: hemograma (cão por 5 faixas etárias, gato por 2), bioquímico (cão e gato), urinálise, testes rápidos e atestado de leishmaniose. Gera PDF, .docx e texto, com "Assinado eletronicamente por…" no fim de cada exame.

## Publicar
O site pronto fica em `dist/`. Para o GitHub Pages, copie **o conteúdo de `dist/`** para a raiz da branch `gh-pages` do repositório (substituindo os arquivos antigos, inclusive `app.js` e `sw.js`).

## Editar
- Tabelas de referência e textos dos laudos: `src/catalogo.js`
- Visual do PDF: `src/pdf.js` · do Word: `src/docx.js` · prévia: `src/saidas.js` + `web/index.html`
- Telas do app: `web/index.html` e `src/app.js`

Depois de editar: `npm install` (uma vez) e `node tools/build.mjs`.
`node tools/modelos.mjs <pasta>` gera os modelos em branco (.docx).
