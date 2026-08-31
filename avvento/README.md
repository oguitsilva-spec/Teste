# Avvento — captura de leads da landing page

## Fluxo

```
index.html (modal "Liberar Calculadora Sistema S")
  → POST { tipo: 'lead_apresentacao_calculadora', nome, email, telefone, dataHora }
  → Apps Script (endpoint AKfycbwOKuAJ583B.../exec)
  → Planilha "Leads LP Avvento - Sistema S", aba "Leads - Apresentação"
  → Meta Conversions API (evento Lead)
```

## Planilhas

| Uso | Planilha | ID |
|---|---|---|
| Leads da landing page | Leads LP Avvento - Sistema S | `1As-skRG_z0iYyBFZjH2hCYRGwyX_JnYq4DfwPAjq01o` |
| Funil da calculadora | Calculadora \| Avvento | `1qXL9welTai3rjiQiUZRe5AlS-v4ciS5vyo6DFevwJyg` |

Colunas da aba `Leads - Apresentação` (ordem fixa, casada com o `appendRow`):

`Data/Hora` · `Nome Completo` · `E-mail Corporativo` · `Telefone / WhatsApp` · `Origem` · `Status`

## Como publicar o Code.gs

1. Abra a planilha **Calculadora | Avvento** → **Extensões > Apps Script**.
2. Substitua todo o conteúdo do arquivo `Code.gs` pelo desta pasta.
3. **Configurações do projeto** (engrenagem) → **Propriedades do script** → adicione:
   - `FB_PIXEL_ID` = `2906741552284508`
   - `FB_ACCESS_TOKEN` = token **novo** gerado no Meta Business
4. Rode `verificarConfiguracao()` uma vez e confira o log.
5. **Implantar > Gerenciar implantações** → editar (lápis) → **Nova versão** → **Implantar**.
   A URL do endpoint não muda, então o `index.html` continua igual.
6. Na planilha nova, renomeie a aba `Untitled` para `Leads - Apresentação`.

## Segurança

A versão anterior do `Code.gs` (e do `Code_LandingPage.gs`) trazia o access token da
Meta Conversions API em texto puro, e esses arquivos estão salvos no Google Drive.
**Invalide aquele token no Meta Business e gere um novo** antes de publicar.
Nesta versão o token sai do código e passa a ser lido das Propriedades do script.
