/**
 * Fix: Meta Pixel Lead Event Tracking para GreatPages
 *
 * Como usar:
 * Cole o conteúdo da tag <script> abaixo no campo de
 * "Código personalizado" / "HTML personalizado" da sua página
 * na GreatPages (antes do </body>).
 *
 * O script detecta o envio do formulário e dispara o evento
 * fbq('track', 'Lead') do Meta Pixel automaticamente.
 */

(function () {
  'use strict';

  // Aguarda o DOM estar pronto
  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  // Dispara o evento Lead no Meta Pixel com segurança
  function trackLead() {
    if (typeof fbq === 'function') {
      fbq('track', 'Lead');
      console.log('[Pixel] Evento Lead disparado com sucesso.');
    } else {
      console.warn('[Pixel] fbq não encontrado. Verifique se o Meta Pixel está instalado corretamente.');
    }
  }

  onReady(function () {
    // 1. Captura submit tradicional de formulários
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (form && form.tagName === 'FORM') {
        trackLead();
      }
    }, true);

    // 2. Intercepta fetch (AJAX moderno) - GreatPages usa fetch para enviar formulários
    var originalFetch = window.fetch;
    window.fetch = function () {
      var args = arguments;
      var url = (args[0] && typeof args[0] === 'string') ? args[0] : '';

      return originalFetch.apply(this, args).then(function (response) {
        // Detecta chamadas de submissão de formulário (ajuste a URL conforme necessário)
        var isFormSubmit =
          url.indexOf('lead') !== -1 ||
          url.indexOf('form') !== -1 ||
          url.indexOf('contato') !== -1 ||
          url.indexOf('submit') !== -1 ||
          url.indexOf('capturas') !== -1 ||
          url.indexOf('conversao') !== -1;

        if (isFormSubmit && response.ok) {
          trackLead();
        }

        return response;
      });
    };

    // 3. Intercepta XMLHttpRequest (AJAX legado)
    var OriginalXHR = window.XMLHttpRequest;
    function PatchedXHR() {
      var xhr = new OriginalXHR();
      var method, url;

      var originalOpen = xhr.open.bind(xhr);
      xhr.open = function (m, u) {
        method = m;
        url = u;
        return originalOpen.apply(xhr, arguments);
      };

      xhr.addEventListener('load', function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          var isFormSubmit =
            url && (
              url.indexOf('lead') !== -1 ||
              url.indexOf('form') !== -1 ||
              url.indexOf('contato') !== -1 ||
              url.indexOf('submit') !== -1 ||
              url.indexOf('capturas') !== -1 ||
              url.indexOf('conversao') !== -1
            );

          if (isFormSubmit) {
            trackLead();
          }
        }
      });

      return xhr;
    }
    PatchedXHR.prototype = OriginalXHR.prototype;
    window.XMLHttpRequest = PatchedXHR;

    // 4. Observa botões de submit que podem ser clicados diretamente
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (
        el &&
        (el.type === 'submit' ||
          el.getAttribute('data-action') === 'submit' ||
          (el.tagName === 'BUTTON' && el.closest('form')))
      ) {
        // Aguarda um momento para garantir que o submit ocorreu com sucesso
        setTimeout(function () {
          // Verifica se há mensagem de sucesso no DOM (ajuste o seletor se necessário)
          var successEl = document.querySelector(
            '.success, .obrigado, [class*="success"], [class*="obrigado"], [class*="thank"], [id*="sucesso"], [id*="success"]'
          );
          if (successEl && getComputedStyle(successEl).display !== 'none') {
            trackLead();
          }
        }, 1500);
      }
    });
  });
})();
