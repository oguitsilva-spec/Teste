# Auditoria Meta Ads — [O7][Vendas][PERSONAL]

**Conta:** 211170495674706 · **Período:** 26, 27 e 28 de julho · **Ticket:** R$49,90 · **Metodologia:** Tráfego Perpétuo

---

# 📊 Dashboard Executivo

| Indicador | Valor | Benchmark | Status |
|---|---|---|---|
| 💰 Gasto | **R$76,67** | — | — |
| 🛒 Compras | **0** | — | 🔴 |
| 💵 Receita | **R$0,00** | — | 🔴 |
| 📈 ROAS | **0,00** | 2,5–3,0 | 🔴 |
| 🎯 CPA | **— (sem venda)** | ≤ R$49,90 | 🔴 |
| 📡 CPM | R$28,96 | — | 🟡 |
| 🖱️ CPC (todos) | R$0,76 · **link R$1,42** | — | 🟡 |
| 👆 CTR (todos) | 3,82% · **link 2,04%** | ≥ 0,8% | 🟢 |
| 🌐 LPV | 29 · CLPV R$2,64 | — | 🟡 |
| 🛍️ ATC | 7 · CPATC R$10,95 | — | 🟡 |
| 🧾 IC | **3** · CPIC **R$25,56** | — | 🔴 |
| 🔁 Conversão do funil (LPV→Compra) | **0%** | — | 🔴 |
| 🎫 Ticket médio | — | R$49,90 | — |
| 📶 Frequência | 1,51 | < 3 | 🟢 |

**Resultado do período: −R$76,67** (prejuízo integral, R$25,56/dia).

### Principais gargalos

1. 🔴 **Custo por checkout de R$25,56** — cada checkout iniciado custa metade do preço do produto. Mesmo com taxa de compra no topo do benchmark (20%), o CPA projetado seria R$127,80: **2,5× o ticket**. Essa é a etapa que trava o ROAS.
2. 🔴 **LPV → IC despencou para 10,3%** (era 27,5% no período lucrativo de 20–23/07). O tráfego chega na página e não avança.
3. 🔴 **93% da verba no anúncio 03**, que não gerou nenhuma venda em 3 dias.
4. 🔴 **Connect Rate 53,7%** — quase metade do clique pago não vira visita. Correção pendente desde a auditoria anterior.
5. 🔴 **Anúncios 05 e 06 (novos) com entrega ZERO** — foram criados mas não receberam uma única impressão.
6. 🟡 **Campanha rodando com 1 único conjunto ativo** — sem redundância estrutural.

---

# 🩺 Diagnóstico Geral

## Classificação: 🔴 CRÍTICO

Três dias consecutivos, R$76,67 investidos, **zero vendas**. A campanha passou de ROAS 4,89 (20–23/07) para 0,62 (24–26/07) e agora 0,00. A deterioração é contínua e tem causa identificável — não é oscilação estatística.

**Diagnóstico de baixo para cima:** o checkout não recebeu volume suficiente para ser julgado (3 ICs). A página perdeu capacidade de gerar checkout (10,3% vs 27,5% no período bom) — mas a página não mudou. **O que mudou foi quem chega nela.** Em 20–23/07 o tráfego vinha de um mix de 5 anúncios; hoje 93% vem de um único criativo (o 03), que tem o pior hook do conjunto (18,0%) e nenhuma venda no histórico recente. O funil não quebrou: ele está sendo alimentado com tráfego de baixa intenção.

### Pontos fortes
- ✅ CTR de 3,82% e CPC de R$0,76 — os criativos ainda prendem atenção
- ✅ Frequência 1,51 — sem fadiga de público, há espaço para escalar
- ✅ CPM R$28,96 — competitivo para o nicho
- ✅ Estrutura ABO e orçamento de R$25/dia (50% do ticket) estão corretos pela metodologia
- ✅ Carrinhos de alto valor sendo montados (R$301,20 e R$304,20 em 27 e 28/07) — a esteira de upsell atrai

### Pontos de perda de eficiência
- ❌ Concentração de 93% da verba num criativo sem conversão
- ❌ Anúncio 04 (ROAS histórico 14,03) recebendo 7% da verba
- ❌ Anúncios 05 e 06 criados e sem nenhuma entrega
- ❌ Conjunto 01 pausado — o anúncio 00 (ROAS histórico 14,73) segue fora do ar há 5 dias
- ❌ Connect Rate 53,7%: ~R$35 dos R$77 pagos por cliques que não viraram visita
- ❌ **Audience Network com `rewarded_video` ativo** — posicionamento que gera clique acidental de alto volume e baixa intenção. Explica CTR alto convivendo com Connect Rate baixo
- ❌ Sem campanha de remarketing: 7 ATCs e 3 ICs no período sem nenhuma tentativa de recuperação

### Maior oportunidade de ganho de ROAS
**Recuperar a taxa LPV → IC de 10,3% para os 27,5% do período lucrativo.** Com os mesmos 29 LPV, isso significa 8 checkouts em vez de 3 → ~2,4 vendas → ROAS ~3,2 sem gastar R$1 a mais. Combinado com a correção do Connect Rate para 75%, o ROAS projetado sobe para **~4,4**.

O caminho para isso não é mexer na página: **é trocar o criativo que alimenta a página.**

---

# 🎯 Análise da Campanha

**Resumo executivo:** Campanha de vendas (OUTCOME_SALES), leilão, lance por volume máximo, estrutura **ABO**. Apenas **1 conjunto ativo** (02 - Aberto BR, R$25/dia), com público 100% aberto BR 18–65 sob Advantage+ Audience e posicionamentos automáticos — incluindo Audience Network classic e rewarded_video. O conjunto 01 permanece pausado desde 24/07, mantendo fora do ar o anúncio 00, que tem o melhor ROAS histórico da conta.

Dentro do conjunto ativo há 4 anúncios com status ativo, mas apenas 2 entregam: o **03** absorve 93% do orçamento e o **04** recebe 7%. Os anúncios **05** e **06**, recém-criados, estão com **zero impressões** — o leilão não os iniciou, sintoma clássico de anúncio novo competindo com um criativo já consolidado dentro de um orçamento pequeno.

A campanha está tecnicamente correta na estrutura e errada na alocação. Não há problema de configuração: há problema de distribuição de verba e de mix criativo.

### Evolução diária

| Dia | Gasto | Impr. | CTR | CPC | CPM | LPV | ATC | IC | Compras | ROAS |
|---|---|---|---|---|---|---|---|---|---|---|
| 26/07 | R$25,89 | 855 | 3,63% | R$0,84 | R$30,28 | 11 | 1 | 1 | 0 | 0 |
| 27/07 | R$23,86 | 788 | **2,79%** | **R$1,08** | R$30,28 | 8 | 1 | 0 | 0 | 0 |
| 28/07 | R$26,92 | 1.004 | **4,78%** | **R$0,56** | R$26,81 | 10 | 5 | 2 | 0 | 0 |

O dia 28 mostra recuperação de eficiência no topo (CTR 4,78%, CPC R$0,56, 5 ATCs) sem conversão no fundo — reforça que o problema está na qualificação do tráfego, não no volume.

## Conjuntos

| Nome | Gasto | ROAS | CPA | CTR | CPC | CPM | LPV | ATC | IC | Purchase | Diagnóstico | Ação recomendada |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **02 - Aberto BR** 🟢 Ativo · R$25/dia | R$76,67 | **0,00** | — | 3,82% | R$0,76 | R$28,96 | 29 | 4 | 2 | **0** | 🔴 Único conjunto entregando. Concentra 100% do risco. CPIC R$25,56 inviabiliza o ticket de R$49,90 | **Reduzir para R$18/dia** + forçar rotação de criativo (pausar 03) |
| **01 - Aberto BR** ⏸️ Pausado · R$15/dia | R$0,00 | — | — | — | — | — | 0 | 3* | 1* | 0 | 🟡 Pausado há 5 dias. Mantém fora do ar o anúncio 00 (ROAS histórico 14,73) | **Reativar com R$10/dia**, apenas com o anúncio 00 |

*ATC e IC atribuídos a cliques anteriores à pausa (janela de 7 dias).

⚠️ **Sobreposição:** ambos os conjuntos usam targeting idêntico (Aberto BR 18–65 + Advantage+). Ao reativar o 01, a sobreposição volta — aceitável neste patamar de verba, mas impede leitura limpa de público.

## Anúncios

| Nome | Gasto | % verba | CTR | CPC | CPM | LPV | ATC | IC | Purchase | ROAS | Hook | Retenção | Diagnóstico | Ação recomendada |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **03** | R$71,55 | **93%** | 3,77% | R$0,79 | R$29,65 | 24 | 4 | 2 | **0** | **0,00** | 18,0% | 21,0% | 🔴 Concentra quase toda a verba, 0 vendas em 3 dias, pior hook do conjunto. Gera clique e visita, não gera intenção | **PAUSAR hoje** |
| **04** | R$5,12 | 7% | **4,27%** | **R$0,51** | **R$21,88** | 5 | 0 | 0 | 0 | — | **26,1%** | 18,0% | 🟢 Melhor hook, CPC e CPM do conjunto. ROAS histórico 14,03. Sufocado pelo 03 | **Liberar verba** — deve assumir a entrega com o 03 pausado |
| **05** | R$0,00 | 0% | — | — | — | 0 | 0 | 0 | 0 | — | — | — | 🔴 Criado e sem nenhuma impressão | **Duplicar em conjunto novo** para forçar entrega |
| **06** | R$0,00 | 0% | — | — | — | 0 | 0 | 0 | 0 | — | — | — | 🔴 Criado e sem nenhuma impressão | **Duplicar em conjunto novo** para forçar entrega |
| **00** | R$0,00 | 0% | — | — | — | 0 | 0 | 0 | 0 | — | — | — | 🟡 Fora do ar (conjunto pausado). ROAS histórico 14,73, melhor CTR da conta | **Reativar** junto com o conjunto 01 |
| **01** | R$0,00 | 0% | — | — | — | 0 | 3* | 1* | 0 | — | — | — | 🟡 Fora do ar (conjunto pausado). Sem venda no histórico | Manter pausado |
| **02** (×2) | R$0,00 | 0% | — | — | — | — | — | — | — | — | — | — | ✅ Pausados corretamente (0 vendas históricas) | Manter pausado |

---

# 🔻 Diagnóstico do Funil

```
Impressões        2.647        CPM R$28,96
   ↓  2,04%   🟢 acima do benchmark
Cliques (link)       54        CPC R$1,42
   ↓  53,7%   🔴 GARGALO #2 — benchmark ≥ 75%
LPV                  29        CLPV R$2,64
   ↓  24,1%   🟢
ATC                   7        CPATC R$10,95
   ↓  42,9%   🔴 GARGALO #3 — 4 de 7 carrinhos abandonam antes do checkout
Initiate Checkout     3        CPIC R$25,56  🔴 GARGALO #1
   ↓  0%      🔴 sem volume para julgar
Purchase              0        CPA —
```

**Taxa consolidada LPV → IC: 10,3%** (benchmark 15–30%) — era 27,5% em 20–23/07.

### Gargalos, causa e impacto estimado

| # | Gargalo | Etapa | Causa provável | Impacto estimado |
|---|---|---|---|---|
| 🔴 **1** | **CPIC R$25,56** | LPV → IC | 93% do tráfego vem do anúncio 03, criativo de baixa intenção. Página inalterada, taxa caiu 62% | **É a etapa que limita o ROAS.** Recuperar para 27,5% → 8 ICs → ~2,4 vendas → ROAS ~3,2 no mesmo gasto |
| 🔴 **2** | **Connect Rate 53,7%** | Clique → LPV | Página lenta/redirecionamento + Audience Network `rewarded_video` gerando clique acidental | ~R$35 de R$77 desperdiçados. Corrigir para 75% → +11 LPV → +1,1 IC |
| 🔴 **3** | **ATC → IC 42,9%** | Carrinho → Checkout | Carrinhos de R$301,20/R$304,20 montados e abandonados — atrito ou desconfiança na etapa do combo | 4 checkouts perdidos no período; recuperáveis via remarketing |
| 🟡 **4** | **Verba em 1 criativo** | Estrutura | Leilão travado no 03; anúncios 05 e 06 sem entrega | Bloqueia a renovação do mix criativo — causa raiz dos gargalos 1 e 3 |
| 🟡 **5** | **1 conjunto ativo** | Estrutura | Conjunto 01 pausado há 5 dias | Concentra 100% do risco e remove o anúncio 00 (ROAS 14,73) |

**Conclusão:** a página de vendas e o checkout não foram alterados e mantiveram taxa saudável enquanto recebiam tráfego diversificado. A perda de eficiência começou exatamente quando a verba se concentrou no anúncio 03. **O gargalo que limita o ROAS é o LPV → IC, e sua causa está a montante: o criativo que alimenta o funil.**

---

# 🛠️ Plano de Otimização

## 🔴 Prioridade Alta — executar hoje

| O que fazer | Onde | Motivo | Impacto esperado |
|---|---|---|---|
| **Pausar o anúncio 03** | Conjunto 02 | R$71,55 e 0 vendas em 3 dias; pior hook (18,0%); é a fonte do tráfego de baixa intenção | Libera 93% da verba e destrava o leilão para 04, 05 e 06 |
| **Reativar o conjunto 01 com R$10/dia, somente com o anúncio 00** | Conjunto 01 | ROAS histórico 14,73, melhor CTR (5,42%) e melhor CPC (R$0,46) da conta. Fora do ar há 5 dias sem justificativa de performance | Recoloca no ar o melhor ativo da campanha |
| **Reduzir o conjunto 02 para R$18/dia** | Conjunto 02 | Não se mantém verba de escala com ROAS 0. R$18 ≈ 36% do ticket, dentro da regra de 30–50% | Corta a sangria enquanto o mix criativo é renovado |
| **Desativar Audience Network** (manter só Facebook + Instagram) | Ambos os conjuntos | `rewarded_video` e `classic` geram clique acidental. Explica CTR alto com Connect Rate 53,7% | Connect Rate deve subir para 65–75% sem nenhum custo adicional |
| **Auditar velocidade da página + Pixel/CAPI via GTM** | Página de vendas | Connect Rate 53,7% pendente desde a auditoria anterior | +11 LPV no mesmo gasto |

## 🟡 Prioridade Média — 48 a 72h

| O que fazer | Onde | Motivo | Impacto esperado |
|---|---|---|---|
| **Duplicar os anúncios 05 e 06 num conjunto novo de teste (R$12/dia)** | Novo conjunto "03 - Teste Criativos" | Estão ativos há dias com zero impressão. Anúncio novo não vence leilão contra criativo consolidado em orçamento pequeno | Força entrega e gera leitura real dos criativos novos |
| **Subir campanha de remarketing ABO R$6/dia** | Nova campanha | 7 ATCs e 3 ICs no período sem recuperação; carrinhos de R$301,20 abandonados | Vendas a CPA muito baixo — público já qualificado |
| **Investigar o atrito ATC → IC** | Checkout | 4 de 7 carrinhos abandonados antes do checkout, todos com combo de alto valor | Recupera até 4 checkouts por período |
| **Revisar alinhamento anúncio → página** | Criativos + LP | Taxa LPV→IC caiu 62% sem alteração na página | Restaura a expectativa correta no visitante |

## 🟢 Prioridade Baixa — próxima semana

| O que fazer | Onde | Motivo | Impacto esperado |
|---|---|---|---|
| Criar públicos LAL 1% (compradores, checkout, viu PV) | Novos conjuntos | Hoje 100% do tráfego é público aberto; sem plano B se o aberto saturar | Diversificação de leilão para escala |
| Testar posicionamentos manuais (Reels + Stories isolados) | Conjunto vencedor | Identificar onde o CPM e a conversão são melhores | Redução de CPM e melhora de qualificação |
| Consolidar estrutura se a sobreposição limitar entrega | Campanha | Conjuntos 01 e 02 com targeting idêntico | Aprendizado mais rápido |

---

# 🚀 Plano para Aumentar o ROAS — produto R$49,90

### Ajustes de orçamento e redistribuição

| Item | Hoje | Proposto | Racional |
|---|---|---|---|
| Conjunto 02 - Aberto BR | R$25/dia | **R$18/dia** | Reduzir com ROAS 0; 36% do ticket, dentro da regra |
| Conjunto 01 - Aberto BR (só anúncio 00) | R$0 (pausado) | **R$10/dia** | Recolocar o melhor ROAS histórico no ar |
| Conjunto 03 - Teste Criativos (05 e 06) | — | **R$12/dia** | Isolar os criativos novos para forçar entrega |
| Remarketing (Viu Checkout 7D + Viu PV 14D) | — | **R$6/dia** | Recuperar carrinhos e checkouts abandonados |
| **Total** | R$25/dia | **R$46/dia** | Mesma ordem de grandeza, distribuído em 4 frentes em vez de 1 |

> A verba total sobe pouco, mas deixa de estar 93% concentrada num criativo sem conversão. Em produto de R$49,90 a lucratividade vem da distribuição, não do volume.

### Otimização da campanha
Estrutura ABO e objetivo OUTCOME_SALES estão corretos — **não alterar**. O erro não é de configuração. Manter lance por volume máximo até haver 50 eventos/semana; só então testar custo máximo.

### Otimização dos conjuntos
- Conjunto 02 vira o conjunto do criativo validado (o 04), com 4–6 anúncios ativos
- Conjunto 01 volta como conjunto do anúncio 00
- Conjunto 03 nasce como laboratório permanente de criativos (1×N, um criativo por vez)
- Frequência ideal: manter **< 2,5** no frio (atual 1,51 — há folga para escalar quando o ROAS voltar)

### Criativos que devem ser PAUSADOS
- 🔴 **Anúncio 03** — R$71,55 sem venda, pior hook, é a causa direta da queda de LPV→IC
- ✅ Anúncios 02 (ambos) — manter pausados, 0 vendas históricas

### Criativos que devem RECEBER MAIS VERBA
- 🟢 **Anúncio 04** — melhor hook (26,1%), melhor CPC (R$0,51), melhor CPM (R$21,88), ROAS histórico 14,03
- 🟢 **Anúncio 00** — melhor CTR (5,42%), melhor CPC (R$0,46), ROAS histórico 14,73

### Testes A/B sugeridos
*(1 variável por vez · início à meia-noite · avaliar após 48h)*

| # | Teste | Hipótese |
|---|---|---|
| 1 | Anúncio 04 vs. 05 vs. 06 (conjunto isolado) | Identificar o próximo criativo validado antes que o 04 sature |
| 2 | Com Audience Network vs. sem Audience Network | Connect Rate sobe de 53,7% para 70%+ |
| 3 | Página atual vs. página com preço na primeira dobra | Qualifica o visitante antes do checkout, eleva LPV→IC |
| 4 | Criativo camuflado (react/depoimento) vs. explícito | Público aberto é majoritariamente nível 1–3 de consciência |

### Novos hooks a produzir
*(modelados no anúncio 04, que tem o melhor hook da conta — 26,1%)*

| Tipo | Hook |
|---|---|
| **Pergunta** | "Você já tentou resolver isso sozinha e desistiu na primeira semana?" |
| **Contraintuitivo** | "O que te ensinaram sobre isso é exatamente o que está te travando." |
| **Prova** | Abre com print/depoimento real: "Ela conseguiu em 14 dias — e custou menos que uma pizza." |
| **Dualidade** | "Quem resolve por R$49,90 vs. quem continua adiando: a diferença em 30 dias." |
| **História** | "Era domingo à noite. Ela abriu o celular pela quinta vez procurando a mesma resposta…" |

### Melhorias de copy
- **Ancorar o preço já no criativo** ("menos de R$50"). Filtra o clique curioso — causa provável do Connect Rate de 53,7% e da queda de LPV→IC
- **Segmentação por dor no primeiro segundo** — o anúncio é filtro, não ímã
- **Alinhar a promessa do anúncio com a headline da página**: a taxa LPV→IC caiu 62% sem alteração na página, sinal clássico de desalinhamento anúncio → LP
- **Reforçar a promessa dentro do checkout** — 4 de 7 carrinhos abandonam antes do IC

### Públicos
Manter Aberto BR enquanto o CPM estiver ≤ R$30. Preparar LAL 1% de compradores para quando a base atingir ~100 vendas. Testar interesses fora da caixa (relacionados à persona, não ao nicho) somente após ter 2 criativos validados.

### Posicionamentos
🔴 **Desativar Audience Network** (`classic` e `rewarded_video`). Manter Facebook + Instagram automáticos. Reavaliar Threads e WhatsApp Status após 7 dias.

### Escala e duplicações
- **Não escalar agora.** Escala só com **CPA ≤ R$30 por 3 dias consecutivos**
- Quando liberar: **+20% a cada 48–72h** (nunca +67% como foi feito em 24/07)
- Escala horizontal primeiro: duplicar o conjunto vencedor com o criativo validado
- CBO (vertical) apenas com 4+ criativos validados e orçamento ≥ R$50/dia

### Estrutura ideal proposta

```
CAMPANHA [O7][Vendas][PERSONAL] — ABO — OUTCOME_SALES

├─ 01 - Aberto BR ............... R$10/dia  → anúncio 00
├─ 02 - Aberto BR ............... R$18/dia  → anúncio 04 + novos validados
└─ 03 - Teste Criativos ......... R$12/dia  → anúncios 05 e 06

CAMPANHA [RMKT][PERSONAL] — ABO — OUTCOME_SALES
└─ 00 - Viu Checkout 7D + Viu PV 14D ... R$6/dia  (excluir compradores)
```

Meta de criativos: **mínimo 6 ativos simultâneos** · **5 a 10 novos por semana** · regra "pausou 1, sobe outro".

---

# ⏱️ Próximas Ações (72 horas)

### 🔵 HOJE (29/07)
1. ⏸️ Pausar o anúncio **03**
2. ▶️ Reativar o conjunto **01** com R$10/dia, somente com o anúncio **00**
3. 🔽 Reduzir o conjunto **02** para R$18/dia
4. 🚫 Desativar **Audience Network** em ambos os conjuntos
5. 🆕 Criar o conjunto **03 - Teste Criativos** (R$12/dia) com os anúncios 05 e 06 duplicados
6. 🔧 Rodar PageSpeed na LP + validar disparo de Pixel e API de Conversões
7. 🕛 Programar tudo para iniciar à **meia-noite**

### 🟢 AMANHÃ (30/07) — monitorar sem alterar
| Métrica | Meta |
|---|---|
| Connect Rate | ≥ 65% (efeito da saída do Audience Network) |
| Entrega dos anúncios 05 e 06 | > 0 impressões — confirmar que o conjunto isolado destravou |
| Entrega do anúncio 04 | ≥ 50% da verba do conjunto 02 |
| CPIC | ≤ R$15 |

### 🟡 ATÉ 01/08 — validar
| Métrica | Sucesso | Nova intervenção |
|---|---|---|
| **LPV → IC** | ≥ 20% | < 12% → problema é a página, não o criativo: testar nova headline |
| **Connect Rate** | ≥ 75% | < 65% → problema é servidor/checkout externo |
| **CPA** | ≤ R$30 | > R$50 → pausar o criativo em maior gasto e rodar novo teste |
| **ROAS** | ≥ 2,5 | 0 por mais 3 dias → revisar oferta e página antes de investir mais |
| **Vendas** | ≥ 2 em dias distintos | 0 vendas em 72h → parar a veiculação e revisar oferta |

### 🚦 Regra de decisão
- ✅ **Escalar** (+20%): CPA ≤ R$30 **e** ROAS ≥ 2,5 **e** Connect Rate ≥ 75%, por 3 dias seguidos
- ⏸️ **Segurar**: ROAS entre 1,0 e 2,5 — manter verba, continuar rotação de criativos
- 🛑 **Parar e revisar oferta**: mais 72h com ROAS 0 — o problema deixa de ser tráfego

---

# 💬 Mensagem para a Yasmim (WhatsApp)

> Oi Yasmim! Passando o status da campanha (26 a 28/07):
>
> ⚠️ Foram 3 dias sem venda, com R$77 investidos. Preciso ser direto: a campanha está no vermelho e já identifiquei o motivo.
>
> **O que está acontecendo:** 93% da verba estava indo para um único anúncio que traz clique mas não traz comprador. Os 2 anúncios que mais venderam no mês estavam praticamente sem orçamento, e os 2 criativos novos que subimos não chegaram a rodar nem uma vez.
>
> **O que vou fazer hoje:**
> 1. Pausar o anúncio que está consumindo a verba sem vender
> 2. Reativar o anúncio de melhor retorno, que estava desligado
> 3. Criar um conjunto separado para os criativos novos rodarem de verdade
> 4. Desativar um posicionamento que está gerando clique acidental
> 5. Corrigir o carregamento da página — hoje metade de quem clica não chega nela
>
> **Expectativa:** com a verba redistribuída, a meta é voltar a ter venda em 48h e fechar a semana com ROAS acima de 2,5. Se em 72h não houver venda, aí paramos e revisamos a oferta antes de investir mais.
>
> Te atualizo quinta com os números 🚀

---

## ⚠️ Observações técnicas

- Os dias **27 e 28/07 ainda recebem atribuição** (janela de 7 dias de clique). O dia 26/07 já está maduro e confirmou 0 vendas. Os números de 27 e 28 podem melhorar marginalmente.
- Com 3 checkouts iniciados, a taxa de compra de 0% **não tem volume estatístico** para ser interpretada isoladamente. O diagnóstico se apoia em **CPIC, taxa LPV→IC, hook rate, retenção e alocação de verba** — indicadores com volume suficiente.
- O período analisado (R$76,67 / 2.647 impressões) está abaixo do volume ideal de leitura. As ações propostas são reversíveis e priorizam redistribuição em vez de mudanças estruturais irreversíveis.

---

*Auditoria gerada em 29/07/2026 · Dados via Meta Ads API · Metodologia Tráfego Perpétuo · Funil analisado de baixo para cima*
