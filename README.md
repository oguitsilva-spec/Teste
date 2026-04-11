# Fix: Evento Lead Meta Pixel - GreatPages

Este repositório contém o script para corrigir o disparo do evento **Lead** do Meta Pixel em formulários da GreatPages.

## Problema

O evento `Lead` do Meta Pixel não estava sendo disparado ao enviar o formulário na página `3560227` no editor da GreatPages, impedindo o rastreamento correto de conversões no Gerenciador de Anúncios do Facebook/Meta.

## Causa Comum

A GreatPages envia formulários via **AJAX (fetch/XMLHttpRequest)**, sem recarregar a página. Por isso, o simples redirecionamento para uma página de agradecimento (onde normalmente o Pixel dispararia) não ocorre, e o evento `Lead` nunca é acionado.

## Solução

O script intercepta:
1. **Submit tradicional** de formulários HTML
2. **fetch API** (AJAX moderno) - utilizado pela GreatPages
3. **XMLHttpRequest** (AJAX legado)

E dispara `fbq('track', 'Lead')` automaticamente quando uma requisição de envio de formulário é concluída com sucesso.

## Como Aplicar na GreatPages

1. Acesse o editor da página: `https://app.greatpages.com.br/paginas_editor/editar/3560227`
2. Clique em **Configurações da Página** (ícone de engrenagem)
3. Vá em **"Código Personalizado"** ou **"Scripts"**
4. Cole o conteúdo do arquivo [`lead-event-tracking-snippet.html`](./lead-event-tracking-snippet.html) no campo **"Antes do `</body>`"** (rodapé)
5. **Salve** e **Publique** a página

## Como Testar

1. Instale a extensão **[Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)** no Chrome
2. Acesse a página publicada
3. Preencha e envie o formulário
4. Verifique no Pixel Helper se o evento `Lead` aparece
5. Confirme também em: **Gerenciador de Eventos** > `https://business.facebook.com/events_manager`

## Arquivos

| Arquivo | Descrição |
|---|---|
| `lead-event-tracking-snippet.html` | Snippet HTML pronto para colar no editor da GreatPages |
| `lead-event-tracking.js` | Script JavaScript comentado e documentado |
| `README.md` | Este arquivo com instruções |
