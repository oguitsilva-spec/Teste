# REGRAS DE ALOCAÇÃO DE VERBA — CIVILITÁ

**Conta:** Civilitá `485827814343326` · BM `810267537957924` · BRL · America/Sao_Paulo
**Registrado em:** 21/08/2026 · **Origem:** conhecimento operacional do cliente
**Status:** ⚠️ **REGRA PERMANENTE — aplicar a todo planejamento mensal desta conta**

---

## 1. A REGRA

> **70%** da verba total do mês nos **primeiros 15 dias**.
> Desses 70%, **80%** distribuídos nos **dias-chave: sábado, domingo, segunda e terça**.

### Decomposição

| Bloco | % da verba total | Dias típicos |
|---|---|---|
| **D1–D15 · dias-chave** (sáb/dom/seg/ter) | **56,0%** | ~9 dias |
| **D1–D15 · dias normais** (qua/qui/sex) | **14,0%** | ~6 dias |
| **D16–D30 · todos os dias** | **30,0%** | 15 dias |

### Fórmula paramétrica

Sendo **B** a verba total do mês e **n_chave** a quantidade de dias-chave em D1–D15:

```
Verba por dia-chave (D1-15)   = B × 0,56 / n_chave        ≈ 0,0622 × B
Verba por dia normal (D1-15)  = B × 0,14 / (15 - n_chave) ≈ 0,0233 × B
Verba por dia (D16-30)        = B × 0,30 / 15             =  0,0200 × B
```

**Razões resultantes:** dia-chave é **2,67×** um dia normal da 1ª quinzena e **3,11×** um dia da 2ª quinzena.

### Quantos dias-chave existem em D1–D15

Depende do dia da semana em que cai o D1:

| D1 cai em | Dias-chave em D1–15 | Dias normais |
|---|---|---|
| Segunda, terça, sábado ou domingo | **9** | 6 |
| Quarta, quinta ou sexta | **8** | 7 |

**Recalcular sempre no início do mês.** Não usar 9 como fixo.

---

## 2. TABELA PRONTA — por verba mensal

*(caso típico: 9 dias-chave e 6 dias normais em D1–D15; CPA atribuído de referência R$32,49)*

| **B** (mês) | D1–15 total | **Dia-chave R$/dia** | Dia normal R$/dia | D16–30 R$/dia | Conv./dia-chave | Conv./semana |
|---|---|---|---|---|---|---|
| 4.000 | 2.800 | **249** | 93 | 80 | 7,7 | 30,7 ⚠️ |
| 5.000 | 3.500 | **311** | 117 | 100 | 9,6 | 38,3 ⚠️ |
| 6.000 | 4.200 | **373** | 140 | 120 | 11,5 | 46,0 ⚠️ |
| **6.527** | 4.569 | **406** | 152 | 131 | **12,5** | **50,0** ✅ *limiar* |
| **7.950** | 5.565 | **495** | 186 | 159 | 15,2 | 60,9 ✅ |
| 9.000 | 6.300 | **560** | 210 | 180 | 17,2 | 68,9 ✅ |
| 10.000 | 7.000 | **622** | 233 | 200 | 19,2 | 76,6 ✅ |
| 12.000 | 8.400 | **747** | 280 | 240 | 23,0 | 91,9 ✅ |

### ⚠️ Piso operacional: **B ≥ R$6.527/mês**

A Meta documenta ~50 conversões por semana por conjunto para sair da fase de aprendizado. Concentrando a entrega em 4 dias-chave por semana, isso exige ~12,5 conversões por dia-chave, ou **R$406/dia-chave**.

**Abaixo de R$6.527/mês, a concentração vira armadilha:** a verba fica espalhada em poucos dias ativos com volume insuficiente, e o conjunto nunca estabiliza. Nesse cenário é melhor **reduzir a agressividade da concentração** (ex.: 65/35 em vez de 70/30, ou 70/30 dos dias-chave em vez de 80/20) do que manter a regra e ficar preso em aprendizado.

> A recomendação atual do plano de 30 dias (**R$7.950/mês**, ou R$265/dia médio) fica **acima** do piso. Compatível com a regra.

---

## 3. VALIDAÇÃO CONTRA OS DADOS DA CONTA

Cruzei a regra com o período auditado (08/07–12/08) e com o pixel da loja (07–20/08). **Uma parte confirma, outra diverge.**

### 3.1 Meta atribuída — vendas por dia da semana (32 dias)

| Dia | n | Gasto | Vendas | Vendas/dia | CPA | ROAS | Chave? |
|---|---|---|---|---|---|---|---|
| **Segunda** | 4 | 482 | **29** | **7,25** | **R$ 16,61** | **13,34** | ✅ |
| **Terça** | 4 | 446 | 18 | **4,50** | R$ 24,77 | 8,02 | ✅ |
| Quarta | 5 | 506 | 18 | 3,60 | R$ 28,10 | 6,62 | — |
| Quinta | 5 | 961 | 14 | 2,80 | R$ 68,64 | 2,79 | — |
| Sexta | 5 | 697 | 16 | 3,20 | R$ 43,55 | 5,19 | — |
| **Sábado** | 5 | 756 | 18 | 3,60 | R$ 41,98 | 4,89 | ✅ |
| **Domingo** | 4 | 447 | 11 | **2,75** | R$ 40,59 | 5,10 | ✅ |

### 3.2 Pixel da loja — compras por dia da semana (14 dias)

| Dia | n | Compras | Média/dia | Chave? |
|---|---|---|---|---|
| **Segunda** | 2 | 28 | **14,00** | ✅ |
| **Terça** | 2 | 24 | **12,00** | ✅ |
| Quarta | 2 | 17 | 8,50 | — |
| Quinta | 2 | 10 | 5,00 | — |
| Sexta | 2 | 12 | 6,00 | — |
| **Sábado** | 2 | 13 | 6,50 | ✅ |
| **Domingo** | 2 | 5 | **2,50** | ✅ |

### 3.3 O que os dados dizem

**✅ CONFIRMADO — segunda e terça são os melhores dias, com folga.**
Segunda entrega 7,25 vendas/dia com CPA de R$16,61 e ROAS 13,34 — **o melhor dia em todas as métricas, nas duas fontes**. Terça vem em segundo. O pixel confirma de forma independente: 14,0 e 12,0 compras/dia contra uma média geral de ~7.

**⚠️ NÃO CONFIRMADO — sábado e domingo não aparecem como dias fortes.**

| | Sábado | Domingo | Quarta (não-chave) |
|---|---|---|---|
| Vendas/dia (Meta) | 3,60 | **2,75** | 3,60 |
| CPA | R$ 41,98 | R$ 40,59 | **R$ 28,10** |
| Compras/dia (pixel) | 6,50 | **2,50** | 8,50 |

**Domingo é o pior dia da semana nas duas fontes.** E quarta-feira — que a regra trata como dia normal — **supera sábado e domingo** em CPA e em volume no pixel.

**⚠️ PARCIALMENTE CONFIRMADO — a primeira quinzena.**

| Período | Dias | Vendas/dia | CPA | ROAS |
|---|---|---|---|---|
| Agosto D01–15 | 12 | **5,67** | **R$ 22,59** | **8,78** |
| Julho D16–31 | 12 | 2,75 | R$ 55,95 | 3,97 |
| Julho D08–15 | 8 | 2,88 | R$ 39,59 | 5,28 |

Agosto sustenta a regra com força (2× mais vendas/dia e CPA 60% menor que a 2ª quinzena de julho). Mas o pixel da loja mostra o oposto no recorte curto: 7,44 compras/dia em 07–15/08 contra 8,40 em 16–20/08.

### 3.4 Data Sufficiency

**PARTIALLY SUFFICIENT.** São 4–5 observações por dia da semana no Meta e apenas 2 no pixel. Isso é pouco para fechar conclusão sobre um dia específico — **exceto para segunda-feira**, cujo sinal é forte e consistente nas duas fontes independentes.

**Sua experiência operacional cobre um horizonte maior que os 32 dias que consigo ver, e pode capturar sazonalidade (pagamento, quinzena, hábito de compra) que minha janela não alcança.** Por isso não trato a divergência como erro da regra — trato como **hipótese a verificar no mês 1**.

---

## 4. COMO IMPLEMENTAR NA META

### ⚠️ A armadilha: variação de verba reseta o aprendizado

A regra implica oscilar a verba diária em **~3×** entre dia-chave e dia normal. Alterar orçamento manualmente nessa magnitude, várias vezes por semana, **mantém o conjunto permanentemente em aprendizado** — que é exatamente o erro nº 4 da auditoria (a conta nunca saiu do aprendizado em 11 meses).

**Não implementar com edição manual de orçamento diário.**

### ✅ Implementação correta: orçamento vitalício + programação de anúncios

| Item | Configuração |
|---|---|
| **Tipo de orçamento** | **Vitalício** (`lifetime_budget`) — obrigatório: a programação por dia/hora só existe com orçamento vitalício |
| **Período** | Bloco de 15 dias (D1–D15), depois novo bloco para D16–D30 |
| **Programação** | Ativar apenas nas janelas desejadas; a Meta pacea a verba internamente sem resetar aprendizado |
| **Janela horária** | Cruzar com o achado de dayparting: **71% das compras entre 08h e 14h** |

### Estrutura recomendada

```
BLOCO 1 — D1 a D15   (orçamento vitalício = 70% de B)
├─ Conjunto A · DIAS-CHAVE      · vitalício 80% do bloco · sáb/dom/seg/ter
└─ Conjunto B · DIAS NORMAIS    · vitalício 20% do bloco · qua/qui/sex

BLOCO 2 — D16 a D30  (orçamento vitalício = 30% de B)
└─ Conjunto C · TODOS OS DIAS   · sem restrição de dia
```

**Dois conjuntos no bloco 1 é o máximo aceitável de fragmentação.** A auditoria mostrou que 10 conjuntos a ~R$95 cada não produziram aprendizado algum. Dois conjuntos com R$4.452 e R$1.113 (a B=R$7.950) são células viáveis.

> **Alternativa mais simples, se B ficar perto do piso:** um único conjunto no bloco 1, programado só nos dias-chave, aceitando zero presença em qua/qui/sex. Preserva melhor o aprendizado ao custo de abrir mão dos 14%.

---

## 5. PLANO DE VERIFICAÇÃO — mês 1

A regra entra em vigor como definida. Mas o mês 1 tem que **produzir o dado** que confirma ou corrige a parte divergente.

| # | O que verificar | Como | Critério de decisão |
|---|---|---|---|
| 1 | **Domingo merece verba de dia-chave?** | Comparar CPA e volume de domingo contra quarta-feira ao fim do mês | Se domingo continuar pior que quarta em CPA, **remover domingo dos dias-chave no mês 2** |
| 2 | **Sábado merece?** | Idem | Mesma regra de decisão |
| 3 | **A 1ª quinzena é mesmo melhor?** | Comparar D1–15 vs D16–30 com verba proporcional | Se o CPA da 2ª quinzena for igual ou melhor, revisar o 70/30 |
| 4 | **Segunda e terça aguentam mais verba?** | Observar CPA nos dias de maior investimento | Se o CPA de segunda se mantiver <R$25 com verba 3×, **aumentar a concentração nesses dois dias** |

> **Cuidado metodológico:** concentrar verba nos dias-chave e depois medir que os dias-chave venderam mais é raciocínio circular. A leitura tem que ser por **CPA e ROAS** (eficiência), não por volume absoluto — volume alto num dia com 3× mais verba não prova nada.

---

## 6. AJUSTE SUGERIDO — para avaliar, não para aplicar agora

Com base no que os dados mostram, uma variante que preserva a intenção da regra e concentra onde a evidência é mais forte:

| | Regra atual | Variante sugerida |
|---|---|---|
| Dias-chave | sáb · dom · seg · ter | **seg · ter** (peso alto) + **sáb · dom** (peso médio) |
| Distribuição na 1ª quinzena | 80% em 4 dias | 55% em seg/ter · 25% em sáb/dom · 20% nos demais |
| Quinzena | 70 / 30 | 70 / 30 — mantido |

**Não estou aplicando isso.** A regra registrada na seção 1 é a que vale. Deixo a variante documentada para a conversa do mês 2, quando houver dado próprio da nova operação.

---

## 7. RESUMO OPERACIONAL

```
ENTRADA:  B = verba total do mês (AINDA NÃO DEFINIDA)

CÁLCULO:  n_chave = dias sáb/dom/seg/ter dentro de D1-D15
          dia-chave    = B × 0,56 / n_chave
          dia normal   = B × 0,14 / (15 - n_chave)
          D16-30       = B × 0,30 / 15

PISO:     B ≥ R$ 6.527/mês  (senão a concentração impede sair do aprendizado)

IMPLEMENTA: orçamento VITALÍCIO + programação de anúncios
            NUNCA por edição manual de orçamento diário
```

---

## 8. PENDÊNCIA

🔴 **A verba total do mês (B) ainda não foi definida.**

Todo o resto está parametrizado e pronto. No momento em que **B** for informado, a alocação sai da tabela da seção 2 — ou da fórmula da seção 1, se **B** cair fora da tabela.

**Referência para a decisão:** o plano de 30 dias recomenda **R$7.950/mês** (R$265/dia médio) para entregar ~723 marmitas incrementais. Esse valor é compatível com esta regra e fica acima do piso de aprendizado.

---

*Documento registrado em 21/08/2026 · Regra de origem operacional do cliente, validada contra dados da conta onde possível · Metodologia: /ecommerce-performance*
