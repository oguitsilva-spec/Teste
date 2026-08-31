// ==============================================================================
// SCRIPT DO FUNIL DA CALCULADORA (calculadora.html)
//
// COLE ESTE CÓDIGO EM: Extensions > Apps Script (dentro da planilha
// "Leads - Calculadora Sistema S (Avvento)")
// Depois: Deploy > Manage deployments > editar > Nova versão > Implantar
// (é o MESMO endpoint que o calculadora.html já usa — só o código mudou)
//
// Este script grava em TRÊS destinos:
//
// 1) SHEET_ID_LEADS_LP -> planilha "Leads Calculadora | AVVENTO".
//    Recebe os leads do formulário da landing page (nome, e-mail, telefone),
//    tipo = "lead_apresentacao_calculadora".
//
// 2) SHEET_ID_CNPJ_IMEDIATO -> captura no instante em que a pessoa termina
//    de digitar um CNPJ válido, antes de qualquer outra etapa
//    (tipo = "cnpj_imediato").
//
// 3) SHEET_ID -> planilha principal com abas por estágio do funil
//    (tipo = "parcial" | "bloqueado" | "completo").
// ==============================================================================

// Planilha principal do funil da calculadora.
// ATENÇÃO: os leads de funil que já existem hoje estão em
// '1UJwDQPk97NUHhzVDH4gv5-pa1vUs_ox1HdcCWQx64ow' ("Leads - Calculadora
// Sistema S (Avvento)"). O ID abaixo aponta para "Calculadora | Avvento",
// que está vazia. Ajuste conforme onde você quer o histórico do funil.
const SHEET_ID = '1qXL9welTai3rjiQiUZRe5AlS-v4ciS5vyo6DFevwJyg';
const SHEET_ID_CNPJ_IMEDIATO = '1qXL9welTai3rjiQiUZRe5AlS-v4ciS5vyo6DFevwJyg';

// Planilha "Leads Calculadora | AVVENTO" — destino dos leads da landing page.
const SHEET_ID_LEADS_LP = '1H_okuU0Fj_DWarYs6pOrzPqKAy1eaisaTPU38CkrMQM';

// ---- META CAPI ----------------------------------------------------------
// O token NÃO fica no código (este repositório é público).
// Configure em: Apps Script > Configurações do projeto > Propriedades do script
//   FB_PIXEL_ID     = <id do seu pixel>
//   FB_ACCESS_TOKEN = <seu token da Conversions API>
// Sem essas propriedades os leads continuam sendo gravados na planilha
// normalmente; apenas o evento para o Meta é ignorado.
// -------------------------------------------------------------------------
function getMetaConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    pixelId: props.getProperty('FB_PIXEL_ID'),
    accessToken: props.getProperty('FB_ACCESS_TOKEN')
  };
}

const ABAS = {
  parcial:   { nome: 'Leads Parciais',    cabecalho: ['Data/Hora','CNPJ','E-mail','Empresa','Status'] },
  bloqueado: { nome: 'Bloqueados Simples',cabecalho: ['Data/Hora','CNPJ','E-mail','Empresa','Regime informado','Status'] },
  completo:  { nome: 'Leads Completos',   cabecalho: ['Data/Hora','CNPJ','E-mail','Empresa','Nº Funcionários','Salário Médio','Regime','Valor c/ SELIC','Valor sem correção','Status'] }
};

const ABA_LEADS_LP = {
  nome: 'Leads - Apresentação',
  cabecalho: ['Data/Hora', 'Nome Completo', 'E-mail Corporativo', 'Telefone / WhatsApp', 'Origem', 'Status']
};

function getOrCreateSheet_(spreadsheetId, nome, cabecalho) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
    sheet.appendRow(cabecalho);
    sheet.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  const sheet = getOrCreateSheet_(SHEET_ID, 'Teste Deploy', ['Data/Hora','Status']);
  sheet.appendRow([new Date(), 'Teste de deploy funcionando ✔']);
  return ContentService.createTextOutput('OK — o deploy está funcionando. Confira a aba "Teste Deploy" na planilha.');
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
    const tipo = data.tipo || 'completo';

    // ---- captura da landing page / página de vendas (index.html) ----
    // Grava na planilha "Leads Calculadora | AVVENTO".
    if (tipo === 'lead_apresentacao_calculadora') {
      const sheet = getOrCreateSheet_(SHEET_ID_LEADS_LP, ABA_LEADS_LP.nome, ABA_LEADS_LP.cabecalho);
      sheet.appendRow([
        new Date(),
        data.nome || '',
        data.email || '',
        data.telefone || '',
        data.origem || 'Página de Vendas (index.html)',
        'Acessou Calculadora'
      ]);

      sendMetaConversionEvent('Lead', data.email, data.telefone, {
        content_name: 'Lead Landing Page Avvento',
        origem: 'index.html'
      });

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---- captura imediata: planilha separada, simples e direta ----
    if (tipo === 'cnpj_imediato') {
      const sheet = getOrCreateSheet_(SHEET_ID_CNPJ_IMEDIATO, 'CNPJs', ['Data/Hora','CNPJ','E-mail']);
      sheet.appendRow([new Date(), data.cnpj || '', data.email || '']);
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---- funil completo: planilha principal, aba por estágio ----
    const cfg = ABAS[tipo] || ABAS.completo;
    const sheet = getOrCreateSheet_(SHEET_ID, cfg.nome, cfg.cabecalho);

    let row;
    if (tipo === 'parcial') {
      row = [new Date(), data.cnpj || '', data.email || '', data.empresa || '', 'Abandonou antes de calcular'];
    } else if (tipo === 'bloqueado') {
      row = [new Date(), data.cnpj || '', data.email || '', data.empresa || '', data.regime || '', 'Bloqueado — Simples/MEI'];
    } else {
      row = [
        new Date(), data.cnpj || '', data.email || '', data.empresa || '',
        data.funcionarios || '', data.salario || '', data.regime || '',
        data.valorComSelic || '', data.valorSemSelic || '', 'Completo'
      ];
    }
    sheet.appendRow(row);

    // Enviar evento de Lead para a API de Conversões do Meta (CAPI)
    sendMetaConversionEvent('Lead', data.email, data.telefone, {
      content_name: 'Calculadora Sistema S (' + tipo + ')',
      value: data.valorComSelic || 0,
      currency: 'BRL'
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
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
