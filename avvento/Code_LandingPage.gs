// ==============================================================================
// WEBHOOK DA LANDING PAGE (index.html)
// Grava os leads do formulário do modal "Liberar Calculadora Sistema S"
// na planilha "Leads Calculadora | AVVENTO".
//
// Planilha de destino:
// https://docs.google.com/spreadsheets/d/1H_okuU0Fj_DWarYs6pOrzPqKAy1eaisaTPU38CkrMQM/edit
//
// INSTRUÇÕES DE INSTALAÇÃO:
// 1. Abra a planilha "Leads Calculadora | AVVENTO" no Google Sheets
// 2. Acesse: Extensões > Apps Script
// 3. Cole todo este código lá (substituindo o conteúdo anterior)
// 4. Configure o token do Meta (opcional, ver bloco "META CAPI" abaixo)
// 5. Implantar > Gerenciar implantações > editar (lápis) >
//    Versão: "Nova versão" > Implantar
//    -> mantém a MESMA URL /exec que o index.html já usa
//    (se for a primeira vez: Implantar > Nova implantação > App da Web,
//     Executar como: "Eu", Quem tem acesso: "Qualquer pessoa")
// 6. Confirme que a URL gerada é a mesma de GOOGLE_SHEETS_ENDPOINT no index.html
// ==============================================================================

// Planilha "Leads Calculadora | AVVENTO"
const SPREADSHEET_ID = '1H_okuU0Fj_DWarYs6pOrzPqKAy1eaisaTPU38CkrMQM';
const NOME_ABA = 'Leads - Apresentação';
const CABECALHO = ['Data/Hora', 'Nome Completo', 'E-mail Corporativo', 'Telefone / WhatsApp', 'Origem', 'Status'];

// ---- META CAPI ----------------------------------------------------------
// O token NÃO fica no código (este repositório é público).
// Configure em: Apps Script > Configurações do projeto > Propriedades do script
//   FB_PIXEL_ID     = <id do seu pixel>
//   FB_ACCESS_TOKEN = <seu token da Conversions API>
// Sem essas propriedades o lead continua sendo gravado na planilha
// normalmente; apenas o evento para o Meta é ignorado.
// -------------------------------------------------------------------------
function getMetaConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    pixelId: props.getProperty('FB_PIXEL_ID'),
    accessToken: props.getProperty('FB_ACCESS_TOKEN')
  };
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(NOME_ABA);
  if (!sheet) {
    sheet = ss.insertSheet(NOME_ABA);
    sheet.appendRow(CABECALHO);
    sheet.getRange(1, 1, 1, CABECALHO.length).setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput('Webhook de Leads da Landing Page ativo e funcionando ✔');
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    const sheet = getOrCreateSheet_();

    const dataHora = new Date();
    const nome = data.nome || '';
    const email = data.email || '';
    const telefone = data.telefone || '';
    const origem = data.origem || 'Página de Vendas (index.html)';
    const status = 'Acessou Calculadora';

    sheet.appendRow([dataHora, nome, email, telefone, origem, status]);

    // Enviar evento de Lead para a API de Conversões do Meta (CAPI)
    sendMetaConversionEvent('Lead', email, telefone, {
      content_name: 'Lead Landing Page Avvento',
      origem: origem
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Lead gravado com sucesso!' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Envia eventos para a API de Conversões do Meta (Server-Side).
 */
function sendMetaConversionEvent(eventName, email, phone, extraData) {
  const cfg = getMetaConfig_();
  if (!cfg.accessToken || !cfg.pixelId) return;
  try {
    const url = `https://graph.facebook.com/v19.0/${cfg.pixelId}/events?access_token=${cfg.accessToken}`;
    const userData = {};
    if (email && email.trim()) {
      userData.em = [sha256Hex_(email.trim().toLowerCase())];
    }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone) {
        userData.ph = [sha256Hex_(cleanPhone)];
      }
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: userData,
          custom_data: extraData || {}
        }
      ]
    };

    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    console.log('Erro ao enviar Conversions API Meta: ' + err.toString());
  }
}

function sha256Hex_(value) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return raw.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

/**
 * Rode uma vez pelo editor (Executar > testarGravacao) para confirmar
 * que o script consegue escrever na planilha antes de publicar.
 */
function testarGravacao() {
  doPost({ postData: { contents: JSON.stringify({
    tipo: 'lead_apresentacao_calculadora',
    nome: 'Teste Apps Script',
    email: 'teste@avvento.com.br',
    telefone: '(11) 90000-0000'
  }) } });
}
