# Avvento — Landing Page + Calculadora Sistema S

## Como o lead chega na planilha

```
index.html  (modal "Liberar Calculadora Sistema S")
   |  POST tipo = lead_apresentacao_calculadora
   v
Apps Script  .../AKfycbwOKuAJ583B.../exec        <- Code_LandingPage.gs
   |
   v
Planilha "Leads Calculadora | AVVENTO"  (aba "Leads - Apresentação")
1H_okuU0Fj_DWarYs6pOrzPqKAy1eaisaTPU38CkrMQM


calculadora.html
   |  POST tipo = cnpj_imediato | parcial | bloqueado | completo
   v
Apps Script  .../AKfycbwrbeJ3aHP9.../exec        <- Code.gs
   |
   v
Planilha do funil (abas Leads Parciais / Bloqueados / Leads Completos)
```

São **dois deployments de Apps Script diferentes** — um por página. Por isso os
dois arquivos `.gs` declaram `doPost`: eles vivem em projetos separados e
**não podem ser colados no mesmo projeto** (daria erro de declaração duplicada).

## Aba de destino: `Leads - Apresentação`

| Data/Hora | Nome Completo | E-mail Corporativo | Telefone / WhatsApp | Origem | Status |
|---|---|---|---|---|---|

Criada automaticamente na primeira gravação, com cabeçalho em negrito.

## Publicar `Code_LandingPage.gs`

1. Abra a planilha **Leads Calculadora | AVVENTO**
2. `Extensões > Apps Script`
3. Cole o conteúdo de `Code_LandingPage.gs` (substituindo o que estiver lá)
4. `Executar > testarGravacao` — deve aparecer uma linha de teste na aba
   `Leads - Apresentação`. Apague a linha depois.
5. `Implantar > Gerenciar implantações > (lápis) > Versão: Nova versão > Implantar`
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
6. Confira que a URL `/exec` continua igual à constante `GOOGLE_SHEETS_ENDPOINT`
   no `index.html` (linha ~1092). Se mudou, atualize o HTML.

> Reimplantar com **"Nova versão"** na implantação existente mantém a mesma URL.
> Criar uma **"Nova implantação"** gera uma URL nova e quebra o `index.html`.

## Token do Meta (Conversions API)

O token **não fica no código** — este repositório é público. Configure em
`Apps Script > Configurações do projeto > Propriedades do script`:

| Propriedade | Valor |
|---|---|
| `FB_PIXEL_ID` | id do pixel |
| `FB_ACCESS_TOKEN` | token da Conversions API |

Sem essas propriedades o lead **continua sendo gravado na planilha**; apenas o
evento para o Meta é ignorado.

O token que estava hardcoded nos arquivos originais do Drive deve ser
**revogado e gerado de novo** no Gerenciador de Eventos do Meta.
