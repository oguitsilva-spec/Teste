# Auditoria técnica — Estratégia de Distribuição

**Conta:** 1280968204244838 — AVVENTO CONSULT (BM: avventoconsult) · Moeda: BRL
**Período:** 23/07/2026 a 29/07/2026 (7 dias, ambos inclusive)
**Campanhas auditadas:** `Fase 1 - [O7][DISTR]` e `Fase 2 - [O7][DISTR]` — nenhuma outra campanha foi analisada
**Natureza:** auditoria **somente leitura**. Nenhuma criação, edição, pausa, ativação, exclusão ou duplicação foi realizada. Nenhum orçamento, segmentação, posicionamento, otimização, criativo, URL ou rastreamento foi alterado.
**Fonte dos dados:** Meta Ads MCP — `ads_get_ad_entities`, `ads_get_creatives`, `ads_get_ad_account_custom_audiences`, `ads_get_field_context`

---

## 0. Sumário das descobertas críticas

| # | Descoberta | Severidade |
|---|---|---|
| 1 | **88% a 94% do investimento foi entregue no Facebook**, não no Instagram, numa estratégia cujo objetivo é visita ao perfil do Instagram | 🔴 Alta |
| 2 | **A Fase 2 (remarketing) está expandindo para um público semelhante (frio)** via Advantage+ — o público morno não foi respeitado | 🔴 Alta |
| 3 | **A Fase 1 tem Advantage+ público ativo** (`expansion_all`), o que descaracteriza a segmentação por interesses | 🟠 Média-alta |
| 4 | **A Fase 1 não exclui visitantes/seguidores** — 213 pessoas foram impactadas pelas duas fases | 🟠 Média-alta |
| 5 | **A conta atingiu o limite de gastos** (`account_spend_limit_reached`) — a entrega parou em 29/07 | 🟠 Média-alta |
| 6 | **Existe apenas 1 anúncio por fase** — não há teste de criativo em andamento | 🟠 Média |
| 7 | **Volume de seguidores é baixíssimo (5 e 6)** — não permite conclusão estatística sobre custo por seguidor | 🟡 Informativa |
| 8 | 45% das visitas da Fase 1 e 63% das da Fase 2 vieram da faixa **65+** | 🟡 A investigar |

---

## 1. Escopo e validação do período

Consulta ao nível de conta no período retornou **R$ 112,86** de investimento total. A soma das duas campanhas auditadas é **R$ 57,50 + R$ 55,36 = R$ 112,86**.

**Conclusão:** as duas campanhas auditadas representam 100% do investimento da conta no período. Nenhuma outra campanha veiculou. As outras duas campanhas existentes na conta (`Post: "Hoje, o empresário precisa entender..."` e `Post do Instagram: A maioria das empresas não...`) estão `PAUSED` com R$ 0,00 de gasto e foram excluídas da análise.

### Reconciliação de totais (conta ↔ soma das campanhas)

| Métrica | Nível conta (MCP) | Fase 1 + Fase 2 | Confere |
|---|---:|---:|:---:|
| Investimento | R$ 112,86 | R$ 112,86 | ✅ |
| Impressões | 4.110 | 4.110 | ✅ |
| Cliques | 331 | 331 | ✅ |
| Seguidores atribuídos | 11 | 11 | ✅ |
| Engajamento com a publicação | 1.384 | 1.384 | ✅ |
| Alcance | 3.629 | 3.842 (soma bruta) | ⚠️ ver nota |

**Nota sobre alcance:** o alcance da conta (3.629) é menor que a soma bruta das fases (1.905 + 1.937 = 3.842) porque o alcance é deduplicado por pessoa. A diferença de **213 pessoas** representa quem foi impactado **pelas duas fases** — evidência direta da ausência de exclusão mútua entre elas (ver §6.1).

### Estrutura das campanhas

Cada campanha possui **exatamente 1 conjunto e 1 anúncio**. Portanto, os números de campanha, conjunto e anúncio são idênticos por construção.

```
Fase 1 - [O7][DISTR]        (120251942438410522)
└── [DISTR] - Interesses     (120251942438430522)
    └── 00 - A maioria das empresas não perde crédito tributário por erro.
                             (120251942438420522) · criativo 1667982400948380

Fase 2 - [O7][DISTR]        (120251943436260522)
└── [DISTR] - Vperfil 30D    (120251943436250522)
    └── 00 - Pequenos detalhes podem gerar grandes impactos na carga tributária de uma empresa.
                             (120251943436240522) · criativo 1623385072780142
```

---

## 2. Apuração de seguidores — a pergunta central

### A métrica oficial existe e foi obtida

O campo `instagram_profile_follow_v2` — descrito pela API como *"The number of follows you received on your Instagram profile, attributed to your ads"* — **está disponível e retornou valores reais**. Não foi necessário estimar.

| | Fase 1 | Fase 2 | Total |
|---|---:|---:|---:|
| Investimento | R$ 57,50 | R$ 55,36 | R$ 112,86 |
| **Seguidores atribuídos** | **5** | **6** | **11** |
| **Custo por seguidor** | **R$ 11,50** | **R$ 9,23** | **R$ 10,26** |
| Participação no total de seguidores | 45,5% | 54,5% | 100% |
| Visitas ao perfil | 84 | 134 | 218 |
| **Taxa de conversão visita → seguidor** | **5,95%** | **4,48%** | **5,05%** |

**Fórmulas e origem:**
- Custo por seguidor Fase 1 = 57,50 ÷ 5 = **R$ 11,50**
- Custo por seguidor Fase 2 = 55,36 ÷ 6 = **R$ 9,2267** ≈ R$ 9,23
- Custo médio consolidado = 112,86 ÷ 11 = **R$ 10,26**
- Taxa visita → seguidor Fase 1 = 5 ÷ 84 × 100 = **5,95%**
- Taxa visita → seguidor Fase 2 = 6 ÷ 134 × 100 = **4,48%**
- Taxa consolidada = 11 ÷ 218 × 100 = **5,05%**

**Validação cruzada:** a soma 5 + 6 = 11 bate exatamente com o valor de `instagram_profile_follow_v2` retornado no nível de conta para o mesmo período.

### ⚠️ Ressalva estatística obrigatória

Com **5 e 6 seguidores**, a diferença de custo por seguidor entre as fases (R$ 11,50 vs R$ 9,23) **não é estatisticamente conclusiva**. Um único seguidor a mais ou a menos move o indicador em mais de R$ 1,50. Esses números indicam ordem de grandeza — não devem ser usados para decidir realocação de orçamento entre as fases neste ciclo.

### Como as visitas ao perfil foram obtidas

O campo `results` (rotulado pela API como *Instagram profile visits*) retornou vazio na consulta agregada, mas retornou valores ao aplicar `time_increment` e breakdowns. Os números foram confirmados por **três caminhos independentes**:

1. **Soma diária:** Fase 1 = 12+11+12+24+10+15+0 = **84** · Fase 2 = 24+22+18+33+23+13+1 = **134**
2. **Soma dos breakdowns** (idade, gênero, posicionamento, plataforma): todos somam 84 e 134 respectivamente
3. **Verificação pelo custo por resultado agregado:** 57,50 ÷ 84 = R$ 0,6845 → confere com o `cost_per_result` de **R$ 0,68** retornado pela API; 55,36 ÷ 134 = R$ 0,4131 → confere com **R$ 0,41**

Portanto as 84 e 134 visitas são **dados verificados**, não estimativas.

### Limitações de atribuição

1. **Visitas ao perfil não foram tratadas como seguidores** em nenhum ponto deste relatório. São métricas distintas e estão sempre reportadas separadamente.
2. **Não há dado de crescimento total/orgânico de seguidores do perfil.** As ferramentas `ads_get_ig_accounts` e `ads_account_get_activity_logs` retornaram *"This tool is new and is being gradually rolled out across ad accounts"* para esta conta. O número de seguidores do perfil no início e no fim do período não está disponível via este MCP — essa informação vive no Instagram Insights / IG Graph API, não na API de Anúncios.
3. **Consequência:** não é possível dizer qual percentual do crescimento total do perfil veio dos anúncios. Os 11 seguidores são os **atribuídos pelo Meta aos anúncios**; qualquer crescimento adicional do perfil no período é orgânico e **não pode ser creditado às campanhas**.
4. **Seguidores não são segmentáveis.** `instagram_profile_follow_v2` retornou `"Not available"` em todas as consultas com `time_increment` ou breakdown. Só existe no agregado do período. Por isso **não é possível** atribuir seguidores por dia, idade, gênero, posicionamento ou plataforma.
5. **Janela de atribuição:** o MCP não expôs a janela de atribuição aplicada (`action_attribution_windows`). Os números seguem o padrão da conta.

### Dados adicionais necessários para medir conversão visita → seguidor com segurança

- Série diária de seguidores do perfil (Instagram Insights: `follower_count` / `follows_and_unfollows`) para o período e para uma janela de controle anterior
- Métrica `profile_views` orgânica do Instagram Insights, para separar visitas pagas de orgânicas
- Volume de seguidores ganhos em dias sem veiculação (baseline orgânico)
- Janela de atribuição explícita das campanhas
- Volume por fase suficiente para significância — na ordem de 50 a 100 seguidores por fase, não 5

---

## 3. Dados coletados — nível campanha, conjunto e anúncio

Como cada campanha tem 1 conjunto e 1 anúncio, a tabela abaixo vale simultaneamente para os três níveis.

| Métrica | Fase 1 — Atração | Fase 2 — Proximidade |
|---|---:|---:|
| **ID campanha** | 120251942438410522 | 120251943436260522 |
| **ID conjunto** | 120251942438430522 | 120251943436250522 |
| **ID anúncio** | 120251942438420522 | 120251943436240522 |
| Investimento | R$ 57,50 | R$ 55,36 |
| Alcance | 1.905 | 1.937 |
| Impressões | 2.012 | 2.098 |
| Frequência | 1,06 | 1,08 |
| CPM | R$ 28,58 | R$ 26,39 |
| CPP (custo por mil pessoas) | R$ 30,18 | R$ 28,58 |
| Cliques (todos) | 159 | 172 |
| Cliques no link | 149 | 171 |
| Cliques únicos no link | 146 | 166 |
| Cliques de saída (outbound) | 4 | 10 |
| CTR (todos) | 7,90% | 8,20% |
| CTR único no link | 7,66% | 8,57% |
| CTR de saída | 0,199% | 0,477% |
| CPC (todos) | R$ 0,36 | R$ 0,32 |
| CPC no link | R$ 0,39 | R$ 0,32 |
| **Visitas ao perfil do Instagram** | **84** | **134** |
| **Custo por visita ao perfil** | **R$ 0,68** | **R$ 0,41** |
| **Seguidores atribuídos** | **5** | **6** |
| **Custo por seguidor** | **R$ 11,50** | **R$ 9,23** |
| Visualizações da página de destino | n/a¹ | n/a¹ |
| Engajamento com a publicação | 593 | 791 |
| Reações | 20 | 14 |
| Comentários | 1 | 1 |
| Compartilhamentos | 1 | 2 |
| Salvamentos | 1 | 3 |
| Engajamento com a Página | 605 | 798 |
| Reproduções de vídeo | 1.943 | 2.020 |
| Vídeo 25% | 93 | 228 |
| Vídeo 50% | 65 | 180 |
| Vídeo 75% | 52 | 142 |
| Vídeo 95% | 40 | 105 |
| Vídeo 100% | 39 | 97 |
| ThruPlays | 129 | 240 |
| Tempo médio assistido | 5 s | 8 s |
| Orçamento | R$ 10,00/dia (na campanha — CBO) | R$ 10,00/dia (na campanha — CBO) |
| Estratégia de lance | Maior volume (sem teto de custo) | Maior volume (sem teto de custo) |
| Objetivo | LINK_CLICKS (Tráfego) | LINK_CLICKS (Tráfego) |
| Otimização | PROFILE_VISIT | PROFILE_VISIT |
| Tipo de compra | AUCTION | AUCTION |
| Status | ACTIVE | ACTIVE |
| **Status de veiculação** | **off — `account_spend_limit_reached`** | **off — `account_spend_limit_reached`** |
| Início | 23/07/2026 13:30 UTC | 23/07/2026 13:37 UTC |

¹ `landing_page_view` e `omni_landing_page_view` retornaram `null` nas duas campanhas. Isso é **correto e esperado**: o destino é o perfil do Instagram (CTA `VIEW_INSTAGRAM_PROFILE`), não um site. Não existe página de destino, logo não existe visualização de página de destino, nem URL ou parâmetro de rastreamento a auditar.

### Métricas de retenção de vídeo (calculadas)

| Indicador | Fórmula | Fase 1 | Fase 2 |
|---|---|---:|---:|
| Hook rate (25% ÷ reproduções) | 93÷1943 / 228÷2020 | 4,79% | **11,29%** |
| Meio (50% ÷ reproduções) | 65÷1943 / 180÷2020 | 3,35% | **8,91%** |
| Conclusão (100% ÷ reproduções) | 39÷1943 / 97÷2020 | 2,01% | **4,80%** |
| Retenção do 25% ao 100% | 39÷93 / 97÷228 | 41,9% | 42,5% |
| Taxa de ThruPlay | 129÷1943 / 240÷2020 | 6,64% | **11,88%** |
| Tempo médio | (API) | 5 s | **8 s** |

**Leitura:** a Fase 2 tem **hook rate 2,4× melhor** e tempo médio 60% maior. Isso é exatamente o que se espera de um público morno assistindo a um conteúdo de conexão — é um sinal de que a lógica da estratégia está correta. Já a retenção do 25% ao 100% é praticamente idêntica (41,9% vs 42,5%): quem passa dos 3 segundos termina o vídeo na mesma proporção nas duas fases. **A diferença está inteiramente no início do vídeo, não no corpo dele.**

---

## 4. Evolução diária

### Fase 1 — Atração

| Data | Invest. | Alcance | Impr. | Freq. | Cliques | CTR | CPM | Visitas | Custo/visita |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 23/07 | R$ 11,24 | 246 | 251 | 1,02 | 30 | 11,95% | R$ 44,78 | 12 | R$ 0,94 |
| 24/07 | R$ 7,19 | 228 | 233 | 1,02 | 20 | 8,58% | R$ 30,86 | 11 | R$ 0,65 |
| 25/07 | R$ 7,13 | 257 | 258 | 1,00 | 22 | 8,53% | R$ 27,64 | 12 | R$ 0,59 |
| 26/07 | R$ 13,41 | 494 | 505 | 1,02 | 39 | 7,72% | R$ 26,55 | 24 | R$ 0,56 |
| 27/07 | R$ 10,96 | 344 | 356 | 1,03 | 27 | 7,58% | R$ 30,79 | 10 | R$ 1,10 |
| 28/07 | R$ 7,46 | 380 | 383 | 1,01 | 21 | 5,48% | R$ 19,48 | 15 | R$ 0,50 |
| 29/07 | R$ 0,11 | 26 | 26 | 1,00 | 0 | 0,00% | R$ 4,23 | 0 | — |
| **Total** | **R$ 57,50** | **1.905** | **2.012** | **1,06** | **159** | **7,90%** | **R$ 28,58** | **84** | **R$ 0,68** |

### Fase 2 — Proximidade

| Data | Invest. | Alcance | Impr. | Freq. | Cliques | CTR | CPM | Visitas | Custo/visita |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 23/07 | R$ 7,21 | 227 | 227 | 1,00 | 23 | 10,13% | R$ 31,76 | 24 | R$ 0,30 |
| 24/07 | R$ 11,04 | 278 | 284 | 1,02 | 26 | 9,15% | R$ 38,87 | 22 | R$ 0,50 |
| 25/07 | R$ 7,16 | 316 | 323 | 1,02 | 24 | 7,43% | R$ 22,17 | 18 | R$ 0,40 |
| 26/07 | R$ 13,13 | 478 | 478 | 1,00 | 49 | 10,25% | R$ 27,47 | 33 | R$ 0,40 |
| 27/07 | R$ 9,70 | 412 | 412 | 1,00 | 30 | 7,28% | R$ 23,54 | 23 | R$ 0,42 |
| 28/07 | R$ 6,96 | 353 | 361 | 1,02 | 19 | 5,26% | R$ 19,28 | 13 | R$ 0,54 |
| 29/07 | R$ 0,16 | 13 | 13 | 1,00 | 1 | 7,69% | R$ 12,31 | 1 | R$ 0,16 |
| **Total** | **R$ 55,36** | **1.937** | **2.098** | **1,08** | **172** | **8,20%** | **R$ 26,39** | **134** | **R$ 0,41** |

**Observações:**

- **29/07 é um dia perdido.** As duas campanhas gastaram R$ 0,11 e R$ 0,16 e praticamente não entregaram. A causa está no status de veiculação: `account_spend_limit_reached` — **a conta bateu o limite de gastos configurado**. Na prática, o período teve **6 dias úteis de veiculação, não 7**. Todas as médias diárias deste relatório estão diluídas por esse dia.
- **CTR em queda nas duas fases** ao longo da semana: Fase 1 de 11,95% para 5,48%; Fase 2 de 10,13% para 5,26%. Queda de mais de 50% em 6 dias, com apenas 1 criativo rodando em cada fase.
- **Frequência jamais passou de 1,03/dia** e ficou em 1,06 e 1,08 no acumulado. **Não há saturação por repetição** — a queda de CTR não é fadiga de frequência, é fadiga de criativo único (ver §7).
- 26/07 foi o melhor dia das duas fases em volume absoluto.

---

## 5. Recortes de entrega

### 5.1 Plataforma — a descoberta mais grave

| Campanha | Plataforma | Investimento | % do invest. | Alcance | Impressões | CTR | CPM | Visitas | Custo/visita |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Fase 1 | **Facebook** | R$ 50,84 | **88,4%** | 1.236 | 1.371 | 10,87% | R$ 37,08 | 73 | R$ 0,70 |
| Fase 1 | Instagram | R$ 6,66 | 11,6% | 636 | 641 | 1,56% | R$ 10,39 | 11 | R$ 0,61 |
| Fase 2 | **Facebook** | R$ 51,78 | **93,5%** | 1.837 | 2.007 | 8,37% | R$ 25,80 | 127 | R$ 0,41 |
| Fase 2 | Instagram | R$ 3,58 | 6,5% | 88 | 91 | 4,40% | R$ 39,34 | 7 | R$ 0,51 |

**Diagnóstico:** a estratégia inteira é sobre **visitas ao perfil do Instagram e ganho de seguidores no Instagram**. No entanto, **R$ 102,62 dos R$ 112,86 (90,9%) foram gastos no Facebook**. Apenas **R$ 10,24 (9,1%)** foram gastos no Instagram.

Isso não invalida os resultados — o Meta consegue levar um usuário do Facebook para o perfil do Instagram, e de fato levou (200 das 218 visitas vieram do Facebook). Mas cria três problemas concretos:

1. **Qualidade do seguidor.** O público que consome conteúdo no Facebook Stories não é necessariamente o mesmo que segue e interage com perfis no Instagram. A estratégia pede "seguidores mais qualificados" — este caminho não favorece isso.
2. **A Fase 2 fica logicamente inconsistente.** O público de remarketing é `ig_business_profile_visit` (visitantes do perfil do Instagram), mas 93,5% da entrega acontece no Facebook. Estamos impactando visitantes do Instagram através do Facebook.
3. **O aprendizado fica enviesado.** Qualquer conclusão sobre criativo, público ou custo está sendo tirada de um ambiente (Facebook) que não é o ambiente-alvo (Instagram).

### 5.2 Posicionamento

| Campanha | Posicionamento | Investimento | % | Alcance | Impr. | CTR | Visitas | **Custo/visita** |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Fase 1 | **Facebook Stories** | R$ 24,94 | 43,4% | 816 | 838 | 9,19% | **70** | **R$ 0,36** ✅ |
| Fase 1 | Feed (FB+IG) | R$ 14,79 | 25,7% | 267 | 313 | 12,14% | 6 | R$ 2,47 ⚠️ |
| Fase 1 | **Facebook Reels** | R$ 12,79 | 22,2% | 255 | 297 | 12,12% | **1** | **R$ 12,79** 🔴 |
| Fase 1 | Instagram Stories | R$ 4,50 | 7,8% | 480 | 491 | 1,02% | 6 | R$ 0,75 |
| Fase 1 | Instagram Reels | R$ 0,48 | 0,8% | 71 | 73 | 4,11% | 1 | R$ 0,48 |
| Fase 2 | **Facebook Stories** | R$ 37,13 | 67,1% | 1.164 | 1.210 | 10,00% | **114** | **R$ 0,33** ✅ |
| Fase 2 | Facebook Reels | R$ 8,63 | 15,6% | 605 | 676 | 4,59% | 9 | R$ 0,96 ⚠️ |
| Fase 2 | Feed (FB+IG) | R$ 6,66 | 12,0% | 108 | 132 | 12,12% | 7 | R$ 0,95 ⚠️ |
| Fase 2 | Instagram Stories | R$ 1,65 | 3,0% | 38 | 38 | 7,89% | 3 | R$ 0,55 |
| Fase 2 | Instagram Reels | R$ 1,29 | 2,3% | 40 | 42 | 2,38% | 1 | R$ 1,29 |

**Facebook Stories é o motor da operação:** R$ 62,07 (55% do investimento total) gerou **184 das 218 visitas (84,4%)**, ao custo de R$ 0,34 por visita.

**A Fase 1 tem o pior desperdício identificado na auditoria:**
- Facebook Reels: R$ 12,79 (22,2% do orçamento da fase) → **1 única visita** → R$ 12,79 por visita
- Feed: R$ 14,79 (25,7% do orçamento) → 6 visitas → R$ 2,47 por visita
- **Somados: R$ 27,58 — quase metade (48%) do orçamento da Fase 1 — produziram 7 visitas (8,3% do total da fase).**

Note o contraste revelador no Facebook Reels da Fase 1: **CTR de 12,12%, o mais alto da campanha, mas apenas 1 visita ao perfil.** As pessoas clicam e não chegam ao perfil. Isso indica clique acidental ou de baixa intenção — típico de Reels, onde o clique compete com o gesto de rolagem. **CTR alto sem resultado não é sinal de bom criativo, é sinal de tráfego ruim.**

O Instagram Stories da Fase 1 mostra o padrão inverso: CTR de apenas 1,02%, mas custo por visita de R$ 0,75 — abaixo da média da fase. Poucos cliques, mas com intenção real.

### 5.3 Faixa etária

| Campanha | Faixa | Investimento | % | Alcance | Impr. | CTR | Visitas | % visitas | Custo/visita |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Fase 1 | 18-24 | R$ 2,11 | 3,7% | 296 | 306 | 1,31% | 2 | 2,4% | R$ 1,06 |
| Fase 1 | 25-34 | R$ 4,15 | 7,2% | 178 | 191 | 5,76% | 3 | 3,6% | R$ 1,38 |
| Fase 1 | 35-44 | R$ 8,32 | 14,5% | 189 | 206 | 11,17% | 7 | 8,3% | R$ 1,19 |
| Fase 1 | 45-54 | R$ 11,09 | 19,3% | 303 | 318 | 6,92% | 11 | 13,1% | R$ 1,01 |
| Fase 1 | 55-64 | R$ 14,86 | 25,8% | 481 | 520 | 7,69% | 22 | 26,2% | R$ 0,68 |
| Fase 1 | **65+** | R$ 16,97 | **29,5%** | 441 | 471 | 12,53% | **38** | **45,2%** | R$ 0,45 |
| Fase 1 | Desconhecida | R$ 0,00 | 0% | 0 | 0 | — | 1 | 1,2% | — |
| Fase 2 | 18-24 | R$ 0,24 | 0,4% | 13 | 13 | 7,69% | 0 | 0% | — |
| Fase 2 | 25-34 | R$ 4,24 | 7,7% | 53 | 55 | 12,73% | 5 | 3,7% | R$ 0,85 |
| Fase 2 | 35-44 | R$ 2,93 | 5,3% | 75 | 83 | 7,23% | 2 | 1,5% | R$ 1,47 |
| Fase 2 | 45-54 | R$ 9,23 | 16,7% | 335 | 356 | 7,87% | 19 | 14,2% | R$ 0,49 |
| Fase 2 | 55-64 | R$ 13,55 | 24,5% | 468 | 518 | 6,76% | 21 | 15,7% | R$ 0,65 |
| Fase 2 | **65+** | R$ 25,17 | **45,5%** | 992 | 1.073 | 8,85% | **84** | **62,7%** | R$ 0,30 |
| Fase 2 | Desconhecida | R$ 0,00 | 0% | 0 | 0 | — | 3 | 2,2% | — |

**Diagnóstico:** a concentração em 65+ é acentuada — **45,2% das visitas da Fase 1 e 62,7% das da Fase 2**. Somando 55-64 e 65+: **71,4% das visitas da Fase 1 e 78,4% da Fase 2**.

Isso exige interpretação cuidadosa e **não é automaticamente um problema**:

- **A favor:** o nicho é consultoria tributária para empresários. Donos de empresa consolidados tendem a ser mais velhos. O Facebook — onde 91% da verba foi — tem base demográfica mais velha, o que reforça naturalmente esse padrão. E o 65+ tem o **melhor custo por visita das duas fases** (R$ 0,45 e R$ 0,30).
- **Contra:** o algoritmo otimiza para "visitas ao perfil ao menor custo", e usuários 65+ no Facebook são inventário barato. Existe risco real de o algoritmo estar comprando o resultado mais fácil, não o mais valioso. Para uma estratégia que busca **seguidores qualificados**, volume barato em 65+ pode não se converter em audiência de negócio.
- **Não é possível decidir com os dados atuais:** como `instagram_profile_follow_v2` não é segmentável por idade, **não sabemos de quais faixas vieram os 11 seguidores.** Esta é a informação que resolveria a questão, e ela não está disponível.

**Ambiguidade de configuração:** o campo `targeting` retorna `age_min: 18` e `age_max: 65`, mas também um campo legado `age_range: [35, 65]`. Os dois não concordam. A entrega efetiva foi de 18 a 65+, o que é consistente com `age_min: 18`. **Recomenda-se conferir visualmente no Gerenciador de Anúncios qual faixa está de fato configurada** — o MCP não permite desambiguar. Se a intenção era 35-65, houve entrega indevida em 18-34 (R$ 6,26 na Fase 1 e R$ 4,48 na Fase 2 — R$ 10,74 no total, ~9,5% da verba).

### 5.4 Gênero

| Campanha | Gênero | Investimento | % | Alcance | CTR | Visitas | Custo/visita |
|---|---|---:|---:|---:|---:|---:|---:|
| Fase 1 | Masculino | R$ 39,99 | 69,5% | 1.098 | 8,80% | 58 | R$ 0,69 |
| Fase 1 | Feminino | R$ 17,27 | 30,0% | 794 | 6,42% | 25 | R$ 0,69 |
| Fase 1 | Desconhecido | R$ 0,24 | 0,4% | 8 | 22,22% | 1 | R$ 0,24 |
| Fase 2 | Feminino | R$ 31,89 | 57,6% | 1.271 | 8,08% | 91 | R$ 0,35 |
| Fase 2 | Masculino | R$ 23,31 | 42,1% | 686 | 8,45% | 40 | R$ 0,58 |
| Fase 2 | Desconhecido | R$ 0,16 | 0,3% | 5 | 0,00% | 3 | R$ 0,05 |

Nenhum gênero foi restringido na configuração (entrega aberta). **Inversão relevante:** a Fase 1 entregou majoritariamente para homens (69,5%) com custo por visita idêntico entre gêneros (R$ 0,69), enquanto a Fase 2 entregou majoritariamente para mulheres (57,6%), que converteram bem melhor (R$ 0,35 vs R$ 0,58).

Isso é um indício de que **o público que efetivamente visita o perfil tem perfil feminino mais forte do que a Fase 1 está capturando** — a base de remarketing (que reflete quem realmente visitou o perfil) é 65% feminina em visitas geradas.

---

## 6. Validação da implementação — planejado vs. configurado

### 6.1 Fase 1 — Atração

| Item verificado | Planejado | Configurado de fato | Veredito |
|---|---|---|---|
| Público predominantemente frio | Sim | Nenhum público personalizado incluído; segmentação por interesses | ✅ Conforme |
| Interesses do nicho | Sim | Empresa (negócios e finanças); Empreendedorismo; Negócios | ✅ Conforme |
| Comportamentos/cargos | — | Comportamento: *Small business owners*; Setor: *Business and Finance*; Cargos: Proprietário, Founder/Director/CEO, Dono | ✅ Bem construído |
| Públicos quentes incluídos indevidamente | Não deveria haver | Nenhum público personalizado incluído | ✅ Conforme |
| **Exclusão de seguidores/visitantes/engajados** | **Esperada** | **Nenhuma exclusão configurada** | 🔴 **Divergência** |
| Criativo de atração | Sim | Vídeo com abertura de perda/urgência sobre crédito tributário e Reforma | ✅ Conforme |
| Otimização por visitas ao perfil | Sim | `optimization_goal: PROFILE_VISIT` | ✅ Conforme |
| **Expansão / Advantage+** | **Não deveria descaracterizar interesses** | **`targeting_optimization: "expansion_all"` + `targeting_automation: {advantage_audience: 1}`** | 🔴 **Divergência** |
| Localização | — | Brasil (home + recent) | ✅ |
| Posicionamentos | — | Automáticos: FB + IG, feed/stories/reels/explore/profile_feed, mobile + desktop | ⚠️ Ver §5.1 |

**Divergência 1 — Advantage+ público ativo.** O campo `targeting_optimization` está em `expansion_all` e `targeting_automation.advantage_audience` está em `1`. Isso autoriza o Meta a entregar **fora do conjunto de interesses configurado** sempre que julgar que encontra resultado mais barato. Os interesses viram sugestão, não restrição.

*Impacto provável:* os interesses cuidadosamente escolhidos (empreendedorismo, cargos de decisão) perdem força como filtro. Combinado com a otimização por "visita ao perfil ao menor custo", isso empurra a entrega para o inventário mais barato disponível — o que é consistente com os 45,2% de visitas vindas de 65+ e os 88,4% de verba no Facebook. **Não é possível afirmar que a Fase 1 testou de fato a segmentação por interesses neste período.**

**Divergência 2 — ausência de exclusões.** Não há `excluded_custom_audiences`. A Fase 1, que deveria alcançar **pessoas novas**, pode impactar quem já visitou o perfil ou já segue.

*Evidência quantificada:* o alcance somado das duas fases é 3.842, mas o alcance deduplicado da conta é 3.629. **213 pessoas (5,5%) foram impactadas pelas duas fases simultaneamente** — pagas duas vezes, uma como público frio e outra como público morno.

*Impacto provável:* desperdício de verba na sobreposição, contaminação do aprendizado da Fase 1 (parte do resultado "frio" vem de gente morna, inflando artificialmente a performance) e concorrência entre as próprias campanhas no leilão.

### 6.2 Fase 2 — Proximidade

| Item verificado | Planejado | Configurado de fato | Veredito |
|---|---|---|---|
| Público de visitantes/engajados do perfil | Sim | Público `[O7] VPerfil 30D`, origem `IG_BUSINESS_EVENTS`, evento `ig_business_profile_visit` | ✅ Conforme |
| **Janela de 30 dias** | **Sim** | **`retention_seconds: 2592000` = exatamente 30 dias** | ✅ **Conforme** |
| Configurado como remarketing | Sim | `subtype: PLATFORM`, `data_source.type: EVENT_BASED` | ✅ Conforme |
| **Públicos frios incluídos indevidamente** | **Não deveria** | **Semelhante 1% incluído automaticamente via expansão** | 🔴 **Divergência grave** |
| Criativo de proximidade/conexão | Sim | Vídeo reflexivo, encerrando em pergunta consultiva | ✅ Conforme |
| Otimização por visitas ao perfil | Sim | `optimization_goal: PROFILE_VISIT` | ✅ Conforme |
| Exclusões excessivas | Não deveria haver | Nenhuma exclusão | ✅ Conforme |
| Posicionamentos | — | Automáticos (idem Fase 1) | ⚠️ Ver §5.1 |

**O acerto:** a construção do público de remarketing está **exatamente como planejado**. A regra retornada pela API é inequívoca:

```json
{"inclusions":{"operator":"or","rules":[{
  "event_sources":[{"type":"ig_business","id":4986496944763460}],
  "retention_seconds":2592000,
  "filter":{"operator":"and","filters":[
    {"field":"event","operator":"eq","value":"ig_business_profile_visit"}]}}]}}
```

`2592000` segundos = 30 dias exatos. O evento é visita ao perfil do Instagram. **Janela e definição confirmadas.**

**Divergência grave — o público morno virou público frio.** A configuração do conjunto contém:

```
expanded_implicit_custom_audiences: "Semelhante (BR, 1%) - [O7] VPerfil 30D"
                                    (LOOKALIKE, is_hidden: true)
targeting_relaxation_types: {"lookalike": 0, "custom_audience": 1}
targeting_automation: {"advantage_audience": 1}
```

O `custom_audience: 1` autoriza o Meta a **relaxar a restrição do público personalizado** e entregar para um público semelhante de 1% — que é, por definição, **público frio**. Esse semelhante foi criado automaticamente pelo sistema (`is_hidden: true`), não pelo gestor.

**Prova quantitativa de que a expansão realmente aconteceu:**

- O público `[O7] VPerfil 30D` tem `approximate_count_lower_bound = 1000` e `approximate_count_upper_bound = 1000` — o piso de exibição do Meta, indicando um público **de no máximo ~1.000 pessoas**.
- A Fase 2 alcançou **1.937 pessoas únicas** em 7 dias, com frequência de apenas 1,08.
- **É aritmeticamente impossível alcançar 1.937 pessoas distintas dentro de um público de ~1.000.** No mínimo ~937 pessoas alcançadas (48% do alcance da fase) estavam **fora** do público de remarketing.

*Impacto provável:* aproximadamente metade do investimento da Fase 2 (~R$ 26) não foi remarketing — foi prospecção fria disfarçada. Três consequências:

1. **O custo por seguidor da Fase 2 (R$ 9,23) não é o custo real do remarketing.** Está misturado com público frio e não pode ser comparado de forma limpa com a Fase 1.
2. **A ausência de saturação é falsa.** A frequência de 1,08 sugere um público confortável, mas isso só ocorreu porque o público foi ampliado. Um remarketing puro de ~1.000 pessoas com R$ 55 em 7 dias teria mostrado frequência muito superior e saturação real.
3. **As duas fases estão parcialmente disputando o mesmo público frio** — Fase 1 por interesses, Fase 2 por semelhante — competindo entre si no leilão e elevando o CPM de ambas.

**Observação adicional:** existe um segundo público semelhante na conta, `Semelhante (1%) - [O7] VPerfil 30D` (ID 120251943160810522, `delivery_status: ACTIVE`), criado manualmente 6 minutos antes do automático. **Ele não está sendo usado em nenhum conjunto.** O que está em uso é o gerado automaticamente pela expansão.

### 6.3 Criativos

| | Fase 1 | Fase 2 |
|---|---|---|
| ID do criativo | 1667982400948380 | 1623385072780142 |
| Tipo | VÍDEO | VÍDEO |
| ID do vídeo | 1594771905400334 | 1010540498616366 |
| CTA | `VIEW_INSTAGRAM_PROFILE` ✅ | `VIEW_INSTAGRAM_PROFILE` ✅ |
| Título | (vazio) | (vazio) |
| URL de destino | nenhuma (destino = perfil IG) | nenhuma (destino = perfil IG) |
| Publicação de origem | 1080217278499582_1594771905400334 | 1080217278499582_1010540498616366 |
| Mídia IG | 18062857877449728 | 17981193843021829 |

**Fase 1 — texto:**
> "A maioria das empresas não perde crédito tributário por erro, perde por não revisar no tempo certo. A Reforma não cria o problema, ela apenas expõe quem não se antecipou. Créditos não levantados e escriturados dentro do prazo deixam de existir, e isso significa dinheiro que sai do caixa e não volta. 2026 é o momento de agir, porque depois disso o que resta não é oportunidade, é apenas tentativa de ajuste."

*Avaliação:* ✅ **adequado para atração.** Abre com quebra de expectativa ("não perde por erro, perde por não revisar"), usa aversão à perda ("dinheiro que sai do caixa e não volta") e ancora urgência temporal (Reforma, 2026). É conteúdo de chamar atenção, como planejado.

*Ressalva:* o hook rate de 4,79% é baixo. O texto é denso e conceitual para um público frio que decide em 2 segundos. A tese está certa, a execução do gancho inicial do vídeo não está prendendo.

**Fase 2 — texto:**
> "Pequenos detalhes podem gerar grandes impactos na carga tributária de uma empresa. Uma classificação fiscal correta, aliada a um planejamento tributário estratégico, pode representar economia, segurança jurídica e mais competitividade. E sua empresa está pagando apenas o imposto que realmente deve?"

*Avaliação:* ✅ **adequado para proximidade.** Tom consultivo, entrega conhecimento técnico (classificação fiscal, planejamento) e encerra com pergunta reflexiva dirigida ao leitor. É conteúdo de aprofundamento e conexão, como planejado. O hook rate de 11,29% confirma que ressoa melhor com quem já conhece o perfil.

**Ambos os CTAs estão corretos** (`VIEW_INSTAGRAM_PROFILE`), coerentes com a otimização `PROFILE_VISIT`. Não há URL nem parâmetros de rastreamento a auditar, pois o destino é o próprio perfil do Instagram.

### 6.4 Orçamento e lance

| Item | Fase 1 | Fase 2 |
|---|---|---|
| Orçamento | R$ 10,00/dia na campanha (CBO) | R$ 10,00/dia na campanha (CBO) |
| Estratégia de lance | Maior volume, sem teto de custo | Maior volume, sem teto de custo |
| Gasto médio/dia (6 dias úteis) | R$ 9,57 | R$ 9,20 |
| Participação no investimento | 50,9% | 49,1% |

**Diagnóstico de proporcionalidade:** a divisão é praticamente 50/50. Considerando os papéis das fases, isso é desequilibrado:

- A Fase 2 tem um público endereçável de **~1.000 pessoas**. R$ 55 em 7 dias para ~1.000 pessoas é um orçamento que aquele público **não comporta** — e a prova é que só foi possível gastar isso expandindo para 1.937 pessoas.
- A Fase 1, que precisa **renovar continuamente a entrada de pessoas no funil** (e portanto abastecer a própria Fase 2), recebeu apenas metade da verba.

O resultado é um sistema que se alimenta pouco: a base de remarketing cresce devagar porque a Fase 1 é pequena, e a Fase 2 compensa a falta de público comprando tráfego frio via semelhante. **O orçamento está desproporcional ao papel de cada fase.**

**`Maior volume` sem teto de custo** é uma escolha defensável em fase de aprendizado, mas combinada com Advantage+ ativo e otimização por visita ao perfil, ela maximiza a busca pelo resultado mais barato — reforçando a concentração em 65+ e Facebook.

---

## 7. Análise de desempenho comparada

> Conforme solicitado, as fases **não** são avaliadas apenas pelo menor custo. Cada uma cumpre função distinta.

| Pergunta | Resposta | Dado |
|---|---|---|
| Qual fase gerou mais visitas ao perfil? | **Fase 2** | 134 vs 84 (+59,5%) |
| Qual fase gerou mais seguidores? | **Fase 2**, por 1 | 6 vs 5 — diferença sem significância |
| Menor custo por visita? | **Fase 2** | R$ 0,41 vs R$ 0,68 (−40%) |
| Menor custo por seguidor? | **Fase 2** | R$ 9,23 vs R$ 11,50 — sem significância |
| Melhor CTR? | **Fase 2** | 8,20% vs 7,90% (todos); 8,57% vs 7,66% (link único) |
| Melhor CPC? | **Fase 2** | R$ 0,32 vs R$ 0,36 |
| Melhor CPM? | **Fase 2** | R$ 26,39 vs R$ 28,58 |
| Melhor retenção de vídeo? | **Fase 2** | hook 11,29% vs 4,79%; tempo médio 8s vs 5s |
| Melhor engajamento? | **Fase 2** em volume | 791 vs 593 (+33%); salvamentos 3 vs 1; compart. 2 vs 1 |
| Mais reações? | **Fase 1** | 20 vs 14 |
| Maior frequência? | **Fase 2**, marginalmente | 1,08 vs 1,06 — irrelevante |
| Melhor taxa visita → seguidor? | **Fase 1** | 5,95% vs 4,48% |

**A Fase 2 vence em quase todos os indicadores de eficiência.** Isso é o esperado — público morno sempre performa melhor que frio. Mas há três ressalvas que mudam a leitura:

1. **A Fase 2 não foi um remarketing puro** (§6.2). Cerca de metade do seu alcance veio de público semelhante frio. Sua eficiência superior está inflada por um público que não era o dela.
2. **A Fase 1 converte melhor visita em seguidor** (5,95% vs 4,48%). Isso é contraintuitivo e importante: a Fase 2 traz mais gente ao perfil, mas a Fase 1 traz gente que **decide seguir com mais frequência**. Pessoas novas que se interessam o suficiente para visitar tendem a seguir; visitantes recorrentes já decidiram antes que não seguiriam.
3. **Comparar custo por seguidor com n=5 e n=6 não é análise, é ruído.**

### A Fase 2 demonstrou saturação?

**Não — mas o dado é enganoso.** Frequência de 1,08 e nenhum pico diário acima de 1,03 indicariam público confortável. Porém, isso só foi possível porque o público foi expandido para quase o dobro do seu tamanho real. **Um remarketing genuinamente restrito a ~1.000 pessoas, com R$ 55 em 7 dias, teria saturado.** A ausência de saturação é sintoma da divergência, não sinal de saúde.

### A Fase 1 conseguiu renovar a entrada de pessoas no funil?

**Parcialmente.** Alcançou 1.905 pessoas e gerou 84 visitas ao perfil — que alimentarão o público `VPerfil 30D` dos próximos 30 dias. É entrada real de gente nova no funil. Mas:
- Sem exclusões, parte do alcance foi para gente que já conhecia o perfil (213 pessoas em sobreposição)
- Com Advantage+ ativo, não sabemos se as pessoas novas correspondem ao perfil de nicho desejado
- 48% do orçamento da fase foi para posicionamentos que quase não geraram visita

### A Fase 2 conseguiu aprofundar a relação?

**Sim, nos sinais de conteúdo.** Hook rate 2,4× superior, tempo médio 60% maior, mais salvamentos (3 vs 1) e mais compartilhamentos (2 vs 1). Salvamento e compartilhamento são os sinais mais fortes de conteúdo que gerou valor percebido — e a Fase 2 lidera nos dois. **O criativo de proximidade está cumprindo seu papel.** A ressalva é que parte desse público não era o público-alvo da fase.

### Os resultados se complementam?

**Sim, e é a principal razão para não avaliar as fases isoladamente.** Cada visita da Fase 1 entra no público de 30 dias que a Fase 2 usa. Os 84 visitantes gerados pela Fase 1 são matéria-prima da Fase 2 no ciclo seguinte. Analisar as duas como campanhas independentes levaria à conclusão errada de "desligar a Fase 1 porque é mais cara" — o que secaria a Fase 2 em 30 dias.

**O que quebra essa complementaridade hoje:** sem exclusão na Fase 1, e com expansão na Fase 2, as fases não estão em camadas limpas — estão parcialmente sobrepostas e competindo entre si.

---

## 8. Diagnóstico por conjunto e por anúncio

### 8.1 Conjunto `[DISTR] - Interesses` (Fase 1)

| Item | Valor |
|---|---|
| **Público** | Frio, por interesses. Brasil. Interesses: Empresa, Empreendedorismo, Negócios. Comportamento: Small business owners. Setor: Business and Finance. Cargos: Proprietário, Founder/Director/CEO, Dono. **Sem exclusões.** **Advantage+ público ativo (`expansion_all`).** |
| **Tamanho estimado** | Não retornado pelo MCP (segmentação por interesses não gera público com contagem) |
| **Idade / Gênero** | `age_min` 18 / `age_max` 65 (campo legado indica 35-65 — ambíguo); todos os gêneros |
| **Posicionamentos** | Automáticos: FB + IG; feed, stories, reels, explore, profile feed; mobile + desktop |
| **Investimento** | R$ 57,50 |
| **Resultado** | 84 visitas ao perfil |
| **Custo por resultado** | R$ 0,68 |
| **Frequência** | 1,06 |
| **CTR** | 7,90% |
| **CPC** | R$ 0,36 |
| **Visitas ao perfil** | 84 |
| **Seguidores atribuídos** | 5 |
| **Custo por seguidor** | R$ 11,50 |

**Diagnóstico:** o conjunto está **bem construído na intenção e comprometido na execução**. A combinação de interesses, comportamento e cargos é precisa para o nicho de consultoria tributária — provavelmente o melhor elemento de toda a estrutura. Mas o Advantage+ ativo permite ao Meta ignorar essa precisão, e a ausência de exclusões deixa a fase impactar público morno. O resultado é que **não se pode afirmar que os interesses foram testados**. Ainda assim, cumpriu o papel de trazer 84 pessoas novas ao perfil e apresenta a melhor taxa de conversão visita → seguidor da conta (5,95%).

**Maior problema:** R$ 27,58 (48% da verba) em Facebook Reels + Feed para 7 visitas.

### 8.2 Conjunto `[DISTR] - Vperfil 30D` (Fase 2)

| Item | Valor |
|---|---|
| **Público** | `[O7] VPerfil 30D` — visitantes do perfil do Instagram nos últimos 30 dias (evento `ig_business_profile_visit`, `retention_seconds` 2592000). **Expandido automaticamente com `Semelhante (BR, 1%)` — público frio.** Sem exclusões. |
| **Tamanho estimado** | `approximate_count`: 1.000 – 1.000 (piso de exibição do Meta → público ≤ ~1.000 pessoas) |
| **Idade / Gênero** | Idem Fase 1 |
| **Posicionamentos** | Idem Fase 1 |
| **Investimento** | R$ 55,36 |
| **Resultado** | 134 visitas ao perfil |
| **Custo por resultado** | R$ 0,41 |
| **Frequência** | 1,08 |
| **CTR** | 8,20% |
| **CPC** | R$ 0,32 |
| **Visitas ao perfil** | 134 |
| **Seguidores atribuídos** | 6 |
| **Custo por seguidor** | R$ 9,23 |

**Diagnóstico:** a **definição do público é exemplar** — janela de 30 dias exata, evento correto, origem correta. É o item mais bem executado da estratégia. Mas a expansão automática anulou a natureza de remarketing: alcançar 1.937 pessoas com um público de ~1.000 significa que **~48% do alcance foi público frio**. Os indicadores de eficiência (R$ 0,41 por visita, hook rate 11,29%) são reais, mas **não são atribuíveis exclusivamente ao remarketing**.

**Segundo problema:** o orçamento é grande demais para o tamanho do público — foi a pressão de gasto que forçou a expansão.

### 8.3 Anúncios

**Cada fase possui exatamente 1 anúncio.** Isso tem consequência direta na análise solicitada:

> **Não é possível eleger "melhor" e "pior" anúncio dentro de cada fase — não há com o que comparar.** Qualquer classificação seria uma comparação de um anúncio consigo mesmo. Abaixo estão os diagnósticos individuais e, na sequência, a comparação entre fases, que é a única comparação legítima disponível.

#### Anúncio Fase 1 — `00 - A maioria das empresas não perde crédito tributário por erro.`

| Item | Valor |
|---|---|
| Tipo de criativo | Vídeo · CTA "Ver perfil do Instagram" |
| Conteúdo | Perda de crédito tributário por falta de revisão no prazo; Reforma; urgência 2026 |
| Investimento | R$ 57,50 |
| Alcance | 1.905 |
| Frequência | 1,06 |
| CTR | 7,90% |
| CPC | R$ 0,36 |
| Visitas ao perfil | 84 |
| Custo por visita | R$ 0,68 |
| Seguidores atribuídos | 5 |
| Custo por seguidor | R$ 11,50 |
| Engajamento | 593 (20 reações · 1 comentário · 1 compart. · 1 salvamento) |
| Retenção | Hook 4,79% · 50%: 3,35% · 100%: 2,01% · ThruPlay 6,64% · tempo médio 5s |

**Diagnóstico:** o anúncio funciona, mas o **gancho inicial é o elo fraco**. Hook rate de 4,79% significa que 95 de cada 100 pessoas abandonam antes dos 25% do vídeo. Quem passa dessa barreira retém bem (41,9% do 25% ao 100%, praticamente igual à Fase 2), o que indica que **o problema é a abertura, não o conteúdo**. A queda de CTR de 11,95% (23/07) para 5,48% (28/07) com frequência de apenas 1,06 é o padrão clássico de **criativo único perdendo eficácia por esgotamento do público mais responsivo**, não por repetição. Precisa de variação de gancho, não de mais verba.

#### Anúncio Fase 2 — `00 - Pequenos detalhes podem gerar grandes impactos na carga tributária de uma empresa.`

| Item | Valor |
|---|---|
| Tipo de criativo | Vídeo · CTA "Ver perfil do Instagram" |
| Conteúdo | Classificação fiscal e planejamento tributário; pergunta reflexiva final |
| Investimento | R$ 55,36 |
| Alcance | 1.937 |
| Frequência | 1,08 |
| CTR | 8,20% |
| CPC | R$ 0,32 |
| Visitas ao perfil | 134 |
| Custo por visita | R$ 0,41 |
| Seguidores atribuídos | 6 |
| Custo por seguidor | R$ 9,23 |
| Engajamento | 791 (14 reações · 1 comentário · 2 compart. · 3 salvamentos) |
| Retenção | Hook 11,29% · 50%: 8,91% · 100%: 4,80% · ThruPlay 11,88% · tempo médio 8s |

**Diagnóstico:** **é o melhor ativo criativo da conta.** Hook rate de 11,29% é 2,4× o da Fase 1, tempo médio 60% maior, e lidera em salvamentos (3) e compartilhamentos (2) — os sinais mais qualificados de conteúdo com valor percebido. A abertura por "pequenos detalhes / grandes impactos" prende melhor que a abertura conceitual da Fase 1. Sofre a mesma queda de CTR ao longo da semana (10,13% → 5,26%), pelo mesmo motivo: criativo único.

#### Comparação entre fases (única comparação legítima)

| | Fase 1 | Fase 2 | Vencedor |
|---|---:|---:|---|
| Custo por visita | R$ 0,68 | R$ 0,41 | Fase 2 |
| Hook rate | 4,79% | 11,29% | Fase 2 |
| ThruPlay | 6,64% | 11,88% | Fase 2 |
| Salvamentos + compart. | 2 | 5 | Fase 2 |
| Taxa visita → seguidor | 5,95% | 4,48% | Fase 1 |
| Reações | 20 | 14 | Fase 1 |

### 8.4 Sinais de fadiga

**Ambos os criativos apresentam fadiga**, apesar da frequência baixíssima:

| Fase | CTR 23/07 | CTR 28/07 | Queda |
|---|---:|---:|---:|
| Fase 1 | 11,95% | 5,48% | **−54%** |
| Fase 2 | 10,13% | 5,26% | **−48%** |

Com frequência acumulada de 1,06 e 1,08, **não é fadiga de repetição** (as pessoas viram o anúncio pouco mais de uma vez). É **esgotamento da parcela mais responsiva do público** com um criativo único. A solução não é reduzir frequência — é **adicionar variações criativas**.

### 8.5 Criativos com potencial para mais distribuição

**O criativo da Fase 2** é o candidato claro: melhor hook rate, melhor retenção, melhor custo por visita e maior geração de salvamentos. Recomenda-se testá-lo também em público frio na Fase 1 — o gancho dele é mais eficiente e pode elevar o hook rate da atração.

**Facebook Stories** é o posicionamento com potencial subaproveitado: 55% da verba gerou 84,4% das visitas a R$ 0,34.

### 8.6 Anúncios com investimento insuficiente para conclusão confiável

**Todos.** Nenhum elemento desta auditoria atingiu volume para conclusão estatisticamente segura:

| Elemento | Volume | Situação |
|---|---|---|
| Anúncio Fase 1 | R$ 57,50 · 5 seguidores | Insuficiente para conclusão sobre seguidores |
| Anúncio Fase 2 | R$ 55,36 · 6 seguidores | Insuficiente para conclusão sobre seguidores |
| Instagram Reels (F1) | R$ 0,48 · 1 visita | Volume desprezível — ignorar |
| Instagram Reels (F2) | R$ 1,29 · 1 visita | Volume desprezível — ignorar |
| Instagram Stories (F2) | R$ 1,65 · 3 visitas | Volume desprezível — ignorar |
| Instagram Stories (F1) | R$ 4,50 · 6 visitas | Indicativo apenas |
| Facebook Reels (F1) | R$ 12,79 · 1 visita | **Suficiente para concluir que é ruim** |
| Facebook Stories (ambas) | R$ 62,07 · 184 visitas | **Único elemento com volume confiável** |

**Conclusões seguras:** apenas duas — Facebook Stories é o melhor posicionamento, e Facebook Reels na Fase 1 é ineficiente. Todo o resto é indicativo.

---

## 9. Diagnóstico técnico consolidado

### ✅ Configurações corretas

1. Objetivo de tráfego com otimização `PROFILE_VISIT` nas duas fases — **alinhado à estratégia**
2. CTA `VIEW_INSTAGRAM_PROFILE` nos dois criativos — coerente com a otimização
3. Público de remarketing da Fase 2 com **janela de 30 dias exata** (2.592.000 s) e evento `ig_business_profile_visit` — implementação impecável
4. Interesses, comportamentos e cargos da Fase 1 bem alinhados ao nicho tributário/empresarial
5. Criativo da Fase 1 com característica de atração (perda/urgência) — conforme planejado
6. Criativo da Fase 2 com característica de proximidade (consultivo/reflexivo) — conforme planejado
7. Nenhuma exclusão excessiva limitando a audiência da Fase 2
8. Nomenclatura padronizada e organizada (`[O7][DISTR]`, `[DISTR] - Interesses`, `[DISTR] - Vperfil 30D`)
9. Geolocalização correta (Brasil)

### 🔴 Divergências encontradas

| # | Divergência | Onde | Impacto provável |
|---|---|---|---|
| 1 | Advantage+ público ativo (`expansion_all` + `advantage_audience: 1`) | Fase 1 | Interesses deixam de restringir; entrega migra para inventário barato |
| 2 | Expansão para público semelhante 1% (frio) | Fase 2 | ~48% do alcance fora do remarketing; métricas contaminadas |
| 3 | Ausência de exclusões na Fase 1 | Fase 1 | 213 pessoas impactadas em duplicidade; aprendizado contaminado |
| 4 | 90,9% do investimento no Facebook | Ambas | Estratégia de Instagram executada no Facebook |
| 5 | Orçamento 50/50 desproporcional aos papéis | Ambas | Fase 2 grande demais para seu público; Fase 1 pequena demais para abastecer o funil |
| 6 | Apenas 1 anúncio por fase | Ambas | Sem teste de criativo; fadiga sem alternativa de rotação |
| 7 | Ambiguidade de faixa etária (18-65 vs 35-65) | Ambas | Possível entrega indevida em 18-34 (R$ 10,74) |

### Problemas de público

- Fase 1 sem exclusão de visitantes/seguidores/engajados → sobreposição de 213 pessoas
- Fase 2 com público frio injetado por expansão automática → descaracteriza o remarketing
- Público de remarketing muito pequeno (~1.000) para o orçamento aplicado (R$ 55/semana)
- Duas fases parcialmente disputando o mesmo público frio no leilão
- Público semelhante criado manualmente (`Semelhante (1%) - [O7] VPerfil 30D`) está ocioso, sem uso

### Problemas de otimização

- `Maior volume` sem teto de custo, combinado a Advantage+, empurra a entrega para o resultado mais barato (65+, Facebook) em vez do mais qualificado
- Posicionamentos automáticos sem controle → 90,9% da verba fora do Instagram
- Nenhum controle de custo por resultado configurado

### Problemas de atribuição

- `instagram_profile_follow_v2` **não é segmentável** — indisponível por dia, idade, gênero, posicionamento ou plataforma. Só existe no agregado do período. Impede saber de onde vieram os 11 seguidores.
- `results` (visitas ao perfil) retorna vazio na consulta agregada; só funciona com `time_increment` ou breakdown
- Sem dado de crescimento total de seguidores do perfil (ferramentas `ads_get_ig_accounts` e `ads_account_get_activity_logs` indisponíveis para esta conta)
- Impossível calcular quanto do crescimento do perfil foi orgânico vs. pago
- Janela de atribuição não exposta pelo MCP

### Problemas de criativo

- Hook rate da Fase 1 em 4,79% — 95% do público abandona antes dos 25%
- Um único criativo por fase → fadiga (queda de CTR de ~50% em 6 dias) sem alternativa de rotação
- Nenhuma variação de gancho, formato ou duração em teste
- Títulos vazios nos dois criativos (impacto baixo neste formato, mas é um campo desperdiçado)

### Problemas de orçamento

- **Limite de gastos da conta atingido** (`account_spend_limit_reached`) — entrega interrompida em 29/07, perdendo 1 dos 7 dias
- Divisão 50/50 inadequada aos papéis das fases
- 48% do orçamento da Fase 1 (R$ 27,58) em posicionamentos que geraram 7 visitas
- Orçamento diário de R$ 10 é baixo demais para gerar aprendizado confiável em prazo razoável

### Limitações dos dados disponíveis

1. **Volume baixo:** 5 e 6 seguidores não sustentam conclusão sobre custo por seguidor
2. **Seguidores não segmentáveis** por nenhuma dimensão
3. **Sem baseline orgânico** de seguidores do perfil
4. **Período efetivo de 6 dias**, não 7, devido ao limite de gastos
5. **1 anúncio por fase** — impede ranqueamento de criativos dentro da fase
6. **Histórico de alterações indisponível** (`ads_account_get_activity_logs` não liberado para esta conta) — não foi possível verificar se houve mudanças de configuração durante o período
7. **Ambiguidade de faixa etária** não resolvível via MCP
8. **`platform_position: "feed"`** não distingue feed do Facebook do feed do Instagram. Por subtração via `publisher_platform`: na Fase 1, ~R$ 1,68 dos R$ 14,79 de "feed" foram Instagram; na Fase 2, ~R$ 0,64 dos R$ 6,66.

---

## 10. Próximos passos recomendados

> **Nenhuma destas recomendações foi executada.** São sugestões para decisão do gestor.

### Manter

1. **A estrutura de duas fases.** A lógica está correta e as fases se complementam.
2. **A definição do público `[O7] VPerfil 30D`** — janela de 30 dias e evento estão perfeitos.
3. **A otimização `PROFILE_VISIT` e o CTA `VIEW_INSTAGRAM_PROFILE`** nas duas fases.
4. **O conjunto de interesses/comportamentos/cargos da Fase 1** — é preciso e adequado ao nicho.
5. **O criativo da Fase 2** — melhor ativo da conta.

### Ajustar

1. **Desativar a expansão de público da Fase 2** (`targeting_relaxation_types.custom_audience` → 0 e Advantage+ off). Sem isso, a Fase 2 não é remarketing e nenhuma métrica dela é confiável. **Prioridade máxima.**
2. **Desativar Advantage+ na Fase 1** para que os interesses realmente restrinjam a entrega e a segmentação possa ser avaliada.
3. **Excluir o público `[O7] VPerfil 30D` (e seguidores/engajados) da Fase 1**, eliminando a sobreposição de 213 pessoas.
4. **Revisar os posicionamentos.** Concentrar em Facebook Stories (84,4% das visitas a R$ 0,34) e avaliar a remoção de Facebook Reels na Fase 1 (R$ 12,79 por 1 visita). Se o objetivo é audiência no Instagram, considerar um conjunto exclusivo de Instagram para medir o custo real nesse ambiente.
5. **Rebalancear o orçamento.** Sugestão para o próximo ciclo: **70% Fase 1 / 30% Fase 2**. A Fase 2 não tem público para absorver R$ 55/semana sem expandir; a Fase 1 precisa abastecer o funil.
6. **Verificar e corrigir o limite de gastos da conta** para não perder dias de veiculação.
7. **Confirmar a faixa etária no Gerenciador** (18-65 ou 35-65) e alinhar à intenção estratégica.

### Testar

1. **Mínimo 3 variações de criativo por fase**, rotacionando semanalmente — a fadiga observada exige alternativas.
2. **O gancho da Fase 2 aplicado à Fase 1.** O padrão "pequenos detalhes → grandes impactos" gerou hook rate 2,4× maior. Vale testar em público frio.
3. **Reescrever a abertura do criativo da Fase 1** para atacar os 4,79% de hook rate — a retenção depois do 25% já é boa, o problema está nos primeiros segundos.
4. **Um conjunto exclusivo de Instagram** (Stories + Reels + Feed) em paralelo, para medir o custo real por visita e por seguidor no ambiente-alvo.
5. **Restringir idade para 35-65** em um conjunto de teste, comparando qualidade do seguidor com a versão aberta — resolveria a dúvida sobre a concentração em 65+.
6. **Elevar o orçamento diário** para acelerar o aprendizado. Com R$ 10/dia, atingir volume estatisticamente confiável de seguidores levaria meses.

### Pausar (apenas como recomendação — não executado)

1. **Facebook Reels na Fase 1** — R$ 12,79 para 1 visita ao perfil é o pior desempenho identificado.
2. **Avaliar a pausa do Feed na Fase 1** — R$ 14,79 para 6 visitas (R$ 2,47/visita, 3,6× a média da fase).
3. **Considerar excluir o público semelhante ocioso** `Semelhante (1%) - [O7] VPerfil 30D`, que não é usado por nenhum conjunto.

### Dados que precisam ser acompanhados

1. **Seguidores diários do perfil** (Instagram Insights) — indispensável para separar crescimento pago de orgânico
2. **`instagram_profile_follow_v2` por fase**, semanalmente, acumulando volume até significância
3. **Taxa de conversão visita → seguidor** por fase (hoje 5,95% e 4,48%)
4. **Tamanho do público `VPerfil 30D`** ao longo do tempo — mede se a Fase 1 está abastecendo o funil
5. **Hook rate por criativo** — melhor indicador antecedente de fadiga
6. **Distribuição por plataforma** — confirmar se ajustes de posicionamento levaram verba ao Instagram
7. **Frequência da Fase 2 após desativar a expansão** — deve subir; monitorar saturação real
8. **Saldo e limite de gastos da conta**

---

## 11. Checklist de validação da auditoria

| Item | Status |
|---|---|
| Período correto (23/07/2026 a 29/07/2026, ambos inclusos) | ✅ Confirmado nos 7 registros diários por campanha |
| Somente as duas campanhas solicitadas foram analisadas | ✅ As outras 2 campanhas da conta estão pausadas com R$ 0,00 |
| Totais consolidados = soma dos níveis inferiores | ✅ Investimento, impressões, cliques, seguidores e engajamento batem exatamente com o nível de conta |
| Breakdowns reconciliam com o total | ✅ 10 verificações (diário, idade, gênero, posicionamento, plataforma × 2 fases) — todas conferem |
| Nenhuma visita ao perfil apresentada como seguidor | ✅ Métricas sempre reportadas separadamente |
| Todo cálculo com fórmula e origem verificáveis | ✅ Fórmulas explicitadas em §2 e no CSV |
| Limitações de atribuição informadas | ✅ §2 e §9 |
| Nenhuma alteração realizada na conta | ✅ Somente ferramentas de leitura foram utilizadas |

**Ferramentas utilizadas (todas somente leitura):** `ads_get_ad_accounts`, `ads_get_ad_entities`, `ads_get_field_context`, `ads_get_creatives`, `ads_get_ad_account_custom_audiences`, `ads_get_ig_accounts` (indisponível), `ads_account_get_activity_logs` (indisponível).

**Nenhuma ferramenta de escrita foi invocada em nenhum momento.**

---

*Auditoria gerada em 30/07/2026 · Dados extraídos via Meta Ads MCP · Conta 1280968204244838*
