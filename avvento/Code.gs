// =============================================================================
// AVVENTO — Webhook de Leads (Landing Page + Calculadora Sistema S)
//
// ONDE COLAR: planilha "Calculadora | Avvento" > Extensoes > Apps Script
// DEPOIS: Implantar > Gerenciar implantacoes > editar (lapis) > Nova versao >
//         Implantar. A URL do endpoint NAO muda, entao o index.html continua
//         igual.
//
// -----------------------------------------------------------------------------
// CONFIGURACAO OBRIGATORIA ANTES DO DEPLOY (uma unica vez):
//
// 1) No editor do Apps Script, abra: Configuracoes do projeto (engrenagem)
//    > Propriedades do script > Adicionar propriedade
//
//       Propriedade            Valor
//       ---------------------  ----------------------------------------
//       FB_PIXEL_ID            2906741552284508
//       FB_ACCESS_TOKEN        (o token NOVO gerado no Meta Business)
//
// 2) Rode a funcao verificarConfiguracao() uma vez e confira o log.
//
// IMPORTANTE: o token antigo (EAAUyWaQ6uO0BSbPnhW7...) estava escrito em texto
// puro na versao anterior deste arquivo, que esta salva no Google Drive.
// Invalide esse token no Meta Business e gere um novo antes de usar.
// =============================================================================

// --- Planilhas --------------------------------------------------------------

// Planilha da calculadora (funil CNPJ) — segue a mesma de antes.
const SHEET_ID = '1qXL9welTai3rjiQiUZRe5AlS-v4ciS5vyo6DFevwJyg';
const SHEET_ID_CNPJ_IMEDIATO = '1qXL9welTai3rjiQiUZRe5AlS-v4ciS5vyo6DFevwJyg';

// Planilha dos leads da landing page (index.html) — "Leads LP Avvento - Sistema S".
const SHEET_ID_LP = '1As-skRG_z0iYyBFZjH2hCYRGwyX_JnYq4DfwPAjq01o';

const ABA_LP = 'Leads - Apresentação';
const CABECALHO_LP = ['Data/Hora', 'Nome Completo', 'E-mail Corporativo', 'Telefone / WhatsApp', 'Origem', 'Status'];

const ABAS = {
  parcial:   { nome: 'Leads Parciais',     cabecalho: ['Data/Hora','CNPJ','E-mail','Empresa','Status'] },
  bloqueado: { nome: 'Bloqueados Simples', cabecalho: ['Data/Hora','CNPJ','E-mail','Empresa','Regime informado','Status'] },
  completo:  { nome: 'Leads Completos',    cabecalho: ['Data/Hora','CNPJ','E-mail','Empresa','Nº Funcionários','Salário Médio','Regime','Valor c/ SELIC','Valor sem correção','Status'] }
};

// --- Credenciais (lidas das Propriedades do script, nunca do codigo) ---------

function getPropriedade_(chave) {
  return PropertiesService.getScriptProperties().getProperty(chave) || '';
}

/**
 * Rode esta funcao uma vez apos configurar as Propriedades do script.
 * Ela nunca imprime o token — so confirma que ele existe.
 */
function verificarConfiguracao() {
  const pixel = getPropriedade_('FB_PIXEL_ID');
  const token = getPropriedade_('FB_ACCESS_TOKEN');
  console.log('FB_PIXEL_ID: ' + (pixel ? 'OK (' + pixel + ')' : 'FALTANDO'));
  console.log('FB_ACCESS_TOKEN: ' + (token ? 'OK (' + token.length + ' caracteres)' : 'FALTANDO'));
  console.log('Planilha da landing page: ' + SpreadsheetApp.openById(SHEET_ID_LP).getName());
  console.log('Planilha da calculadora: ' + SpreadsheetApp.openById(SHEET_ID).getName());
}

// --- Helpers ----------------------------------------------------------------

function getOrCreateSheet_(spreadsheetId, nome, cabecalho) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
    sheet.appendRow(cabecalho);
    sheet.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function respostaJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Endpoints --------------------------------------------------------------

function doGet(e) {
  return ContentService.createTextOutput('Webhook de Leads da Avvento ativo e funcionando ✔');
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

    // ---- captura da landing page / pagina de vendas (index.html) ----
    if (tipo === 'lead_apresentacao_calculadora') {
      const sheet = getOrCreateSheet_(SHEET_ID_LP, ABA_LP, CABECALHO_LP);
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

      return respostaJson_({ status: 'ok' });
    }

    // ---- captura imediata: so Data/Hora, CNPJ e E-mail ----
    if (tipo === 'cnpj_imediato') {
      const sheet = getOrCreateSheet_(SHEET_ID_CNPJ_IMEDIATO, 'CNPJs', ['Data/Hora','CNPJ','E-mail']);
      sheet.appendRow([new Date(), data.cnpj || '', data.email || '']);
      return respostaJson_({ status: 'ok' });
    }

    // ---- funil completo: planilha principal, aba por estagio ----
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

    sendMetaConversionEvent('Lead', data.email, data.telefone, {
      content_name: 'Calculadora Sistema S (' + tipo + ')',
      value: data.valorComSelic || 0,
      currency: 'BRL'
    });

    return respostaJson_({ status: 'ok' });
  } catch (err) {
    return respostaJson_({ status: 'error', message: err.message });
  }
}

// --- Meta Conversions API (server-side) -------------------------------------

function sha256_(texto) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return raw.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function sendMetaConversionEvent(eventName, email, phone, extraData) {
  const pixelId = getPropriedade_('FB_PIXEL_ID');
  const accessToken = getPropriedade_('FB_ACCESS_TOKEN');
  if (!pixelId || !accessToken) {
    console.log('Meta CAPI ignorado: FB_PIXEL_ID ou FB_ACCESS_TOKEN nao configurado nas Propriedades do script.');
    return;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
    const userData = {};

    if (email && email.trim()) {
      userData.em = [sha256_(email.trim().toLowerCase())];
    }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone) {
        userData.ph = [sha256_(cleanPhone)];
      }
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
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
