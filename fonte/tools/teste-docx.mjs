import { writeFileSync, readFileSync } from "node:fs";
import { gerarDOCX } from "../src/docx.js";
import { assets } from "./teste-pdf.mjs";
import * as EX from "./exemplos.mjs";
const out = "/home/claude/out";
for (const [nome, laudo] of Object.entries(EX)) {
  if (nome === "base") continue;
  if (nome === "testeLeish") laudo.exames[0].foto = { data: new Uint8Array(readFileSync("/home/claude/foto-teste.jpg")), type: "image/jpeg", w: 1600, h: 676 };
  const buf = await gerarDOCX(laudo, assets);
  writeFileSync(`${out}/${nome}.docx`, buf);
  console.log(nome, buf.length);
}
