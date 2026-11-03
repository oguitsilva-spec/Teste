# Garagem — controle de motos (PWA, MVP)

App de celular para substituir as fichas de papel da loja de motos.

## O que faz
- **Cadastrar moto de 3 jeitos:** 📷 foto da ficha (a IA lê modelo, FIPE, custo e todos os gastos), 🎤 falando, ou ✍️ digitando. Sempre mostra uma tela de conferência antes de salvar e avisa se a soma dos gastos não bate com o total anotado.
- **Estoque** com fotos das motos, busca e filtros (em preparação / à venda / vendida).
- **Ficha digital** de cada moto: FIPE, compra, gastos (lançar digitando ou falando: “150 de pneu e 50 de lavagem”), custo total automático, preço de venda, lucro previsto e % sobre a FIPE, sugestão de preço.
- **Venda:** registra valor, data, comprador e forma de pagamento, e calcula o lucro real.
- **Painel:** motos no estoque, dinheiro parado, lucro previsto, vendas do mês e alertas (moto parada há mais de 60 dias, moto sem preço).
- **Vendas:** lucro por mês, lucro médio por moto, tempo médio para vender.
- **Anúncio no WhatsApp** com as fotos e o preço.
- **Backup** (salvar/restaurar arquivo) e funciona **sem internet** (só a leitura por IA precisa de rede).

## Como rodar
É só HTML/JS, sem build. Sirva a pasta por HTTPS (ex.: GitHub Pages, Netlify, Vercel) e abra no celular → “Adicionar à tela inicial”.
Local: `python3 -m http.server 8000` dentro de `moto-app/` e abra `http://localhost:8000`.

Para a leitura inteligente, coloque uma chave da API Claude em **Ajustes**. Sem chave, o áudio usa uma leitura simples e a ficha é digitada.

## Observações do MVP
- Os dados ficam no aparelho (IndexedDB). Para usar em mais de um celular, o próximo passo é um backend com login (ex.: Supabase/Firebase).
- A chave da IA fica no navegador — bom para demonstração; em produção as chamadas devem passar por um backend.
- `js/vendor/anthropic-sdk.js` é o `@anthropic-ai/sdk@0.136.0` empacotado com esbuild.

## Próximas ideias
Multiusuário/sincronização, contas a pagar/receber e financiamento, documentos (CRLV, recibo) por moto, relatório em PDF, publicação direta em OLX/Marketplace, histórico de clientes.
