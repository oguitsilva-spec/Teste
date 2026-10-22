// Gera os modelos em branco (.docx) de cada laudo no novo padrão.
import { writeFileSync, mkdirSync } from "node:fs";
import { gerarDOCX } from "../src/docx.js";
import { assets } from "./teste-pdf.mjs";
import { HEMO_FAIXAS, BIO_PACOTES, TESTES } from "../src/catalogo.js";

const out = process.argv[2] || "/home/claude/modelos";
mkdirSync(out, { recursive: true });
const ass = { nome: "Thialla Odorício Garcia", titulo: "Médica Veterinária", crmv: "CRMV-SP 33229" };
const pac = (especie) => ({ especie, animal: "", tutor: "", raca: "", sexo: "", idadeN: "", solicitante: "" });
const modelo = (especie, exames) => ({ modelo: true, numero: "", data: "", paciente: pac(especie), assinante: ass, exames });
const on = (ks) => Object.fromEntries(ks.map((k) => [k, { on: true, v: "" }]));

const lista = [];
let n = 1;
const nn = () => String(n++).padStart(2, "0");
for (const f of HEMO_FAIXAS.Canina) lista.push([`${nn()} Hemograma canino - ${f.nome}`, modelo("Canina", [{ tipo: "hemograma", faixa: f.id, v: {} }])]);
for (const f of HEMO_FAIXAS.Felina) lista.push([`${nn()} Hemograma felino - ${f.nome}`, modelo("Felina", [{ tipo: "hemograma", faixa: f.id, v: {} }])]);
lista.push([`${nn()} Bioquimico canino - completo`, modelo("Canina", [{ tipo: "bioquimico", itens: on(BIO_PACOTES.Canina.Completo) }])]);
lista.push([`${nn()} Bioquimico canino - eletrolitos`, modelo("Canina", [{ tipo: "bioquimico", itens: on(BIO_PACOTES.Canina["Eletrólitos"]) }])]);
lista.push([`${nn()} Bioquimico felino - completo`, modelo("Felina", [{ tipo: "bioquimico", itens: on(BIO_PACOTES.Felina.Completo) }])]);
lista.push([`${nn()} Bioquimico felino - simples`, modelo("Felina", [{ tipo: "bioquimico", itens: on(BIO_PACOTES.Felina.Simples) }])]);
lista.push([`${nn()} Urinalise`, modelo("", [{ tipo: "urinalise", v: {} }])]);
lista.push([`${nn()} Teste rapido`, modelo("", [{ tipo: "teste", nome: "", linhas: [{ nome: "", res: "" }] }])]);
lista.push([`${nn()} Atestado leishmaniose`, modelo("Canina", [{ tipo: "leish" }])]);
void TESTES;

for (const [nome, laudo] of lista) {
  const buf = await gerarDOCX(laudo, assets);
  const arq = `${out}/Zog - ${nome.replace(/[\/]/g, "-")}.docx`;
  writeFileSync(arq, buf);
  console.log(arq);
}
