// Laudos de exemplo para testar os renderizadores (dados fictícios).
export const base = {
  numero: "20261022-1655",
  data: "2026-10-22",
  assinadoEm: "2026-10-22T16:55:00",
  assinante: { nome: "Thialla Odorício Garcia", titulo: "Médica Veterinária", crmv: "CRMV-SP 33229" },
};

export const caoHemoBio = {
  ...base,
  paciente: { animal: "Theo", tutor: "Jesuína Alves", especie: "Canina", raca: "Shih-tzu", sexo: "Macho", idadeN: "3", idadeU: "anos", solicitante: "Dra. Ana Paula Freddi" },
  exames: [
    { tipo: "hemograma", faixa: "auto", v: { hem: "6.43", hb: "13", ht: "39", vcm: "60.6", hcm: "20.2", chcm: "33.3", ppt: "7,0", leu: "12900", lin_p: "22.1", mon_p: "3.1", eos_p: "10.7", gra_p: "64.1", gra_a: "", pla: "207" },
      obs: { verm: "Morfologia celular normal.", branca: "Morfologia celular normal.", geral: "" } },
    { tipo: "bioquimico", itens: { creat: { on: true, v: "1.01" }, ureia: { on: true, v: "41.5" }, alt: { on: true, v: "53" }, fa: { on: true, v: "52" }, alb: { on: true, v: "3.8" }, ast: { on: true, v: "32" }, col: { on: true, v: "209" }, tg: { on: true, v: "34" } } },
  ],
};

export const gatoCompleto = {
  ...base,
  paciente: { animal: "Frederico", tutor: "Ademir Souza", especie: "Felina", raca: "SRD", sexo: "Macho", idadeN: "7", idadeU: "anos", solicitante: "Dra. Ana Paula Freddi" },
  exames: [
    { tipo: "bioquimico", itens: Object.fromEntries(["alt", "ast", "fa", "creat", "ureia", "bt", "bd", "bi", "ca", "ggt", "k", "pt", "alb", "glob", "ag", "na", "p", "amil", "col", "gli", "tg"].map((k, i) => [k, { on: true, v: { alt: "59", ast: "31", fa: "40", creat: "0.96", ureia: "45", bt: "0.30", bd: "0.10", ca: "9.1", ggt: "4", k: "4.3", pt: "7.1", alb: "3.2", na: "150", p: "5.2", amil: "1200", col: "120", gli: "98", tg: "70" }[k] || "" }])),
      obs: "Amostra levemente hemolisada." },
    { tipo: "urinalise", obtencao: "Cistocentese", v: { volume: "7", aspecto: "Turvo", cor: "Amarelo", odor: "Sui generis", dens: "1,020", ph: "6,0", bili: "Ausente", prot: "2+", urob: "Normal", glic: "Ausente", sangue: "4+", cet: "Ausente", nitrito: "Negativo", leuc: "Negativo", s_hem: "3+", s_bac: "Raras" },
      obs: "Amostra com volume inferior a 10 mL." },
  ],
};

export const testeLeish = {
  ...base,
  paciente: { animal: "Nina", tutor: "Maisa Ribeiro", especie: "Felina", raca: "SRD", sexo: "Fêmea", idadeN: "Adulta", idadeU: "anos", solicitante: "Dra. Anna Laura Cassettari" },
  exames: [
    { tipo: "teste", nome: "Panleucopenia felina", material: "Fezes", kit: "Teste rápido FPV Ag", lote: "EKV009a", validade: "ABR/27", linhas: [{ nome: "Antígeno do parvovírus felino (FPV)", res: "Negativo" }] },
  ],
};

export const leish = {
  ...base,
  paciente: { animal: "Baby", tutor: "Marcela de Fátima Oliveira", especie: "Canina", raca: "Poodle", sexo: "Fêmea", idadeN: "6", idadeU: "anos", solicitante: "Dra. Thialla Odorício Garcia" },
  exames: [{ tipo: "leish", cpf: "000.000.000-00", endereco: "R. Exemplo, 4-50, Bauru-SP", sinais: true, metodo: "teste rápido", resultado: "Positivo" }],
};
