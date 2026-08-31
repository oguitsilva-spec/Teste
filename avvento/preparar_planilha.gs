// ==============================================================================
// SETUP DA PLANILHA — rode UMA VEZ pelo editor (Executar > prepararPlanilha)
//
// Deixa a aba "Leads - Apresentação" pronta para receber os leads:
// cabeçalho na identidade da Avvento, linha congelada, filtro, larguras de
// coluna, formatos de data e telefone, e remoção da aba vazia padrão.
//
// É idempotente: pode rodar de novo sem duplicar nada nem apagar leads.
// Não exige nova implantação — só afeta a planilha.
// ==============================================================================

function prepararPlanilha() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let sheet = ss.getSheetByName(NOME_ABA);
  if (!sheet) sheet = ss.insertSheet(NOME_ABA);

  // --- cabeçalho (sempre reescrito, para corrigir uma aba antiga) ---
  sheet.getRange(1, 1, 1, CABECALHO.length)
    .setValues([CABECALHO])
    .setFontWeight('bold')
    .setFontColor('#F4F2ED')
    .setBackground('#0D1B2A')
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // --- larguras das colunas ---
  const larguras = [160, 220, 260, 170, 240, 180];
  larguras.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // --- formatos ---
  const maxLinhas = sheet.getMaxRows() - 1;
  if (maxLinhas > 0) {
    // A: data/hora legível
    sheet.getRange(2, 1, maxLinhas, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    // D: telefone como TEXTO, senão o Sheets come o zero e vira número
    sheet.getRange(2, 4, maxLinhas, 1).setNumberFormat('@');
    // corpo alinhado ao topo, sem quebrar o layout
    sheet.getRange(2, 1, maxLinhas, CABECALHO.length).setVerticalAlignment('top');
  }

  // --- tira colunas sobrando à direita, se houver ---
  const extras = sheet.getMaxColumns() - CABECALHO.length;
  if (extras > 0) sheet.deleteColumns(CABECALHO.length + 1, extras);

  // --- filtro no cabeçalho (recria se já existir) ---
  const filtroAtual = sheet.getFilter();
  if (filtroAtual) filtroAtual.remove();
  sheet.getRange(1, 1, sheet.getMaxRows(), CABECALHO.length).createFilter();

  // --- remove a aba padrão vazia ("Página1" / "Sheet1"), se existir ---
  ss.getSheets().forEach(function (s) {
    const nome = s.getName();
    const vazia = s.getLastRow() === 0 && s.getLastColumn() === 0;
    if (nome !== NOME_ABA && vazia && /^(P[áa]gina|Sheet|Folha)\s*\d+$/i.test(nome)) {
      ss.deleteSheet(s);
    }
  });

  sheet.activate();
  SpreadsheetApp.flush();
  Logger.log('Aba "%s" pronta. Leads existentes preservados: %s',
    NOME_ABA, Math.max(sheet.getLastRow() - 1, 0));
}
