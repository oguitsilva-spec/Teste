import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gerarPDF } from "../src/pdf.js";
import * as EX from "./exemplos.mjs";

const A = (f) => new Uint8Array(readFileSync(new URL("../assets/" + f, import.meta.url)));
export const assets = {
  fonts: { regular: A("Montserrat_400Regular.ttf"), italic: A("Montserrat_400Regular_Italic.ttf"), medium: A("Montserrat_500Medium.ttf"), semibold: A("Montserrat_600SemiBold.ttf"), bold: A("Montserrat_700Bold.ttf") },
  logo: A("logo-laudo.jpg"), logoTipo: "jpg",
};
const out = process.argv[2] || "/home/claude/out";
mkdirSync(out, { recursive: true });
for (const [nome, laudo] of Object.entries(EX)) {
  if (nome === "base") continue;
  if (nome === "testeLeish") {
    const foto = readFileSync("/home/claude/foto-teste.jpg");
    laudo.exames[0].foto = { data: new Uint8Array(foto), type: "image/jpeg" };
  }
  const bytes = await gerarPDF(laudo, assets);
  writeFileSync(`${out}/${nome}.pdf`, bytes);
  console.log(nome, bytes.length);
}
