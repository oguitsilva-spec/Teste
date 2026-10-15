"""Gera os criativos estáticos do Silêncio Neural (feed 1080x1350 e stories 1080x1920).

Uso: python3 anuncios/criativos/gerar.py
Escreve os HTML em anuncios/criativos/html/ e os PNG em anuncios/criativos/png/.
"""
import pathlib
import subprocess

CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
BASE = pathlib.Path(__file__).resolve().parent
HTML_DIR = BASE / "html"
PNG_DIR = BASE / "png"

FORMATS = {"feed": (1080, 1350), "stories": (1080, 1920)}

CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --bg: #0c0c0c; --card: #1a1a1a; --line: #2c2c2c; --orange: #ff7a00;
        --orange-soft: #ffb066; --text: #ffffff; --muted: #b9b9b9; }
html, body { width: 100%; height: 100%; }
body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif;
       -webkit-font-smoothing: antialiased; overflow: hidden; }
.frame { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column;
         padding: 90px 84px 80px; }
.stories .frame { padding: 250px 84px 360px; }
.glow { position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(circle at 85% 8%, rgba(255,122,0,.22), transparent 45%),
                    radial-gradient(circle at 0% 100%, rgba(255,122,0,.12), transparent 40%); }
.brand { display: flex; align-items: center; gap: 16px; font-weight: 700; font-size: 30px;
         letter-spacing: .5px; color: var(--muted); z-index: 1; }
.brand .dot { width: 18px; height: 18px; border-radius: 50%; background: var(--orange);
              box-shadow: 0 0 24px var(--orange); }
.main { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
h1 { font-weight: 900; font-size: 88px; line-height: 1.02; letter-spacing: -2px; }
h1 em { font-style: normal; color: var(--orange); }
.sub { margin-top: 34px; font-size: 38px; line-height: 1.35; color: var(--muted); font-weight: 500; }
.sub b { color: var(--text); font-weight: 700; }
.cta { z-index: 1; display: flex; align-items: center; justify-content: space-between;
       background: var(--orange); color: #111; font-weight: 900; font-size: 34px;
       letter-spacing: .5px; padding: 34px 44px; border-radius: 18px; text-transform: uppercase; }
.cta .arrow { font-size: 44px; }
.tag { display: inline-block; align-self: flex-start; background: rgba(255,122,0,.14);
       color: var(--orange-soft); border: 2px solid rgba(255,122,0,.5); font-weight: 800;
       font-size: 26px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 22px;
       border-radius: 999px; margin-bottom: 36px; }
.stories h1 { font-size: 96px; }
.stories .sub { font-size: 42px; }
"""

BRAND = '<div class="brand"><span class="dot"></span>SILÊNCIO NEURAL</div>'


def cta(text="Saiba mais"):
    return f'<div class="cta"><span>{text}</span><span class="arrow">→</span></div>'


# ---------- S1: 60 segundos ----------
def s1(fmt):
    size = 560 if fmt == "feed" else 640
    r, c = 240, 2 * 3.14159 * 240
    return f"""
<style>
.timer {{ position: relative; width: {size}px; height: {size}px; margin: 0 auto 40px; }}
.timer svg {{ width: 100%; height: 100%; transform: rotate(-90deg); }}
.timer .num {{ position: absolute; inset: 0; display: flex; flex-direction: column;
              align-items: center; justify-content: center; }}
.timer .num b {{ font-size: {int(size*0.42)}px; font-weight: 900; color: var(--orange);
                 line-height: .9; letter-spacing: -8px; }}
.timer .num span {{ font-size: {int(size*0.075)}px; font-weight: 800; letter-spacing: 8px;
                    color: var(--text); margin-top: 6px; }}
.s1 h1 {{ text-align: center; font-size: 74px; }}
.s1 .sub {{ text-align: center; }}
</style>
<div class="frame s1"><div class="glow"></div>{BRAND}
<div class="main">
  <div class="timer">
    <svg viewBox="0 0 520 520">
      <circle cx="260" cy="260" r="{r}" fill="none" stroke="#262626" stroke-width="22"/>
      <circle cx="260" cy="260" r="{r}" fill="none" stroke="#ff7a00" stroke-width="22"
              stroke-linecap="round" stroke-dasharray="{c*0.82:.0f} {c:.0f}"/>
    </svg>
    <div class="num"><b>60</b><span>SEGUNDOS</span></div>
  </div>
  <h1>para liberar um <em style="white-space:nowrap">ponto-gatilho</em></h1>
  <p class="sub">Encontre a origem da dor do seu paciente com o <b>Mapa dos Pontos Gatilho</b>.</p>
</div>
{cta("Assista à aula")}</div>"""


# ---------- S2: agenda pelo boca a boca ----------
def s2(fmt):
    rows = 7 if fmt == "feed" else 9
    days = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
    hours = ["08h", "09h", "10h", "11h", "14h", "15h", "16h", "17h", "18h"][:rows]
    # Preenchimento cresce ao longo da semana: o boca a boca em ação.
    fill = [0.35, 0.5, 0.65, 0.8, 0.95, 1.0]
    cells = ""
    for hi, h in enumerate(hours):
        cells += f'<div class="h">{h}</div>'
        for di in range(len(days)):
            on = (hi * 37 + di * 11) % 100 < fill[di] * 100
            cells += f'<div class="c{" on" if on else ""}"></div>'
    head = '<div class="h"></div>' + "".join(f'<div class="d">{d}</div>' for d in days)
    return f"""
<style>
.cal {{ display: grid; grid-template-columns: 90px repeat(6, 1fr); gap: 10px;
        background: var(--card); border: 2px solid var(--line); border-radius: 26px;
        padding: 28px; margin: 44px 0 0; }}
.cal .d {{ text-align: center; font-weight: 800; font-size: 22px; color: var(--muted);
           letter-spacing: 2px; padding-bottom: 6px; }}
.cal .h {{ font-size: 22px; color: #777; font-weight: 600; display: flex; align-items: center; }}
.cal .c {{ height: {46 if fmt == "feed" else 54}px; border-radius: 10px; background: #242424; }}
.cal .c.on {{ background: linear-gradient(135deg, #ff8a1f, #ff6a00); }}
.s2 h1 {{ font-size: 80px; }}
</style>
<div class="frame s2"><div class="glow"></div>{BRAND}
<div class="main">
  <h1>Paciente que melhora em <em>1 ou 2 sessões</em> indica outros.</h1>
  <div class="cal">{head}{cells}</div>
  <p class="sub">Mais de <b>1.000 alunos</b> aplicando o método no consultório.</p>
</div>
{cta()}</div>"""


# ---------- S3: mapa / origem da dor ----------
BODY_SVG = """
<svg viewBox="0 0 400 560" class="body">
  <defs>
    <radialGradient id="pg" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ff7a00" stop-opacity=".9"/>
      <stop offset="1" stop-color="#ff7a00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g fill="#2a2a2a" stroke="#3a3a3a" stroke-width="3">
    <circle cx="200" cy="58" r="44"/>
    <path d="M178 98 h44 v22 h-44z"/>
    <path d="M110 128 Q200 104 290 128 L300 250 Q292 300 280 330 L120 330 Q108 300 100 250 Z"/>
    <path d="M110 132 L70 160 L48 300 L72 304 L96 190 Z"/>
    <path d="M290 132 L330 160 L352 300 L328 304 L304 190 Z"/>
    <path d="M120 330 Q200 350 280 330 L290 400 Q200 430 110 400 Z"/>
    <path d="M114 400 L196 418 L186 556 L128 556 Z"/>
    <path d="M286 400 L204 418 L214 556 L272 556 Z"/>
  </g>
  <path d="M200 120 L200 400" stroke="#3d3d3d" stroke-width="4" stroke-dasharray="6 8"/>
  <!-- dor: lombar -->
  <circle cx="200" cy="282" r="42" fill="none" stroke="#9a9a9a" stroke-width="4" stroke-dasharray="8 7"/>
  <!-- origem: glúteo médio -->
  <circle cx="250" cy="372" r="46" fill="url(#pg)"/>
  <circle cx="250" cy="372" r="13" fill="#ff7a00" stroke="#fff" stroke-width="4"/>
  <path d="M250 372 Q240 330 220 312" stroke="#ff7a00" stroke-width="4" fill="none"
        stroke-dasharray="2 9" stroke-linecap="round"/>
</svg>"""


def s3(fmt):
    w = 400 if fmt == "feed" else 560
    return f"""
<style>
.s3 .wrap {{ display: flex; align-items: center; gap: 30px; margin: 40px 0 10px; }}
.s3 .body {{ width: {w}px; flex-shrink: 0; }}
.s3 .legend {{ display: flex; flex-direction: column; gap: 40px; }}
.s3 .item {{ font-size: 34px; font-weight: 700; line-height: 1.25; }}
.s3 .item small {{ display: block; font-size: 26px; font-weight: 500; color: var(--muted); margin-top: 6px; }}
.s3 .k {{ display: inline-block; width: 26px; height: 26px; border-radius: 50%; margin-right: 12px;
          vertical-align: -3px; }}
.s3 .k.dor {{ border: 4px dashed #9a9a9a; }}
.s3 .k.ori {{ background: var(--orange); border: 4px solid #fff; }}
.s3 h1 {{ font-size: 84px; }}
.stories .s3 .wrap {{ flex-direction: column; }}
.stories .s3 .legend {{ flex-direction: row; gap: 50px; }}
</style>
<div class="frame s3"><div class="glow"></div>{BRAND}
<div class="main">
  <h1>Onde dói <em>não é</em> onde começa.</h1>
  <div class="wrap">{BODY_SVG.replace('class="body"', 'class="body"')}
    <div class="legend">
      <div class="item"><span class="k dor"></span>Onde o paciente sente<small>a dor na lombar</small></div>
      <div class="item"><span class="k ori"></span>Onde você trata<small>o ponto-gatilho de origem</small></div>
    </div>
  </div>
  <p class="sub">Aprenda a usar o <b>Mapa dos Pontos Gatilho</b> e liberar o ponto em cerca de 60 segundos.</p>
</div>
{cta()}</div>"""


# ---------- S4: prova dos alunos ----------
def s4(fmt):
    alunos = [
        ("T", "Tulio", "Fisioterapeuta"),
        ("V", "Valdemar", "A referência em sua cidade"),
        ("G", "Gregório", "De zero à agenda lotada"),
    ]
    cards = "".join(
        f'<div class="al"><div class="av">{i}</div><div><b>{n}</b><span>{t}</span></div>'
        f'<div class="play">▶</div></div>'
        for i, n, t in alunos
    )
    return f"""
<style>
.s4 .list {{ display: flex; flex-direction: column; gap: 22px; margin: 50px 0 10px; }}
.s4 .al {{ display: flex; align-items: center; gap: 28px; background: var(--card);
           border: 2px solid var(--line); border-radius: 24px; padding: 28px 32px; }}
.s4 .av {{ width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0; display: flex;
           align-items: center; justify-content: center; font-size: 44px; font-weight: 900;
           color: #111; background: linear-gradient(135deg, #ffb066, #ff6a00); }}
.s4 .al b {{ display: block; font-size: 40px; font-weight: 800; }}
.s4 .al span {{ display: block; font-size: 30px; color: var(--orange-soft); font-weight: 600; margin-top: 4px; }}
.s4 .play {{ margin-left: auto; width: 70px; height: 70px; border-radius: 50%; background: #fff;
             color: #111; display: flex; align-items: center; justify-content: center;
             font-size: 28px; padding-left: 5px; flex-shrink: 0; }}
.s4 h1 {{ font-size: 82px; }}
</style>
<div class="frame s4"><div class="glow"></div>{BRAND}
<div class="main">
  <span class="tag">Resultados dos alunos</span>
  <h1>Mais de <em>1.000 alunos</em> aplicando o método.</h1>
  <div class="list">{cards}</div>
  <p class="sub">Assista aos depoimentos completos na página.</p>
</div>
{cta("Ver depoimentos")}</div>"""


# ---------- S5: oferta Black Friday ----------
def s5(fmt):
    itens = [
        "Mapa dos Pontos Gatilho",
        "Patologias: lombalgia, torcicolo e mais",
        "Posicionamento, anatomia e acompanhamento",
        "Bônus: ergonomia do terapeuta",
        "Bônus: massagem relaxante (parte alta das costas)",
    ]
    lis = "".join(f"<li>{i}</li>" for i in itens)
    return f"""
<style>
.s5 .box {{ background: var(--card); border: 3px solid var(--orange); border-radius: 30px;
            padding: 50px 54px; box-shadow: 0 0 80px rgba(255,122,0,.25); text-align: center; }}
.s5 .tag {{ align-self: center; margin-bottom: 26px; background: var(--orange); color: #111; border: 0; }}
.s5 .de {{ font-size: 40px; color: var(--muted); font-weight: 600; }}
.s5 .de s {{ text-decoration-thickness: 4px; text-decoration-color: var(--orange); }}
.s5 .por {{ font-size: 32px; font-weight: 700; margin-top: 10px; }}
.s5 .preco {{ font-size: 170px; font-weight: 900; color: var(--orange); letter-spacing: -5px; line-height: 1; margin-top: 6px; }}
.s5 .preco small {{ font-size: 70px; letter-spacing: 0; margin-right: 10px; }}
.s5 ul {{ list-style: none; text-align: left; margin-top: 40px; display: flex; flex-direction: column; gap: 16px; }}
.s5 li {{ font-size: 30px; font-weight: 600; padding-left: 50px; position: relative; line-height: 1.3; }}
.s5 li::before {{ content: '✓'; position: absolute; left: 0; top: -2px; width: 34px; height: 34px;
                  border-radius: 50%; background: rgba(255,122,0,.18); color: var(--orange);
                  font-weight: 900; font-size: 22px; display: flex; align-items: center; justify-content: center; }}
.s5 h1 {{ font-size: 64px; text-align: center; margin-bottom: 40px; }}
.feed .s5 h1 {{ display: none; }}
.feed .s5 ul {{ margin-top: 30px; gap: 12px; }}
.feed .s5 li {{ font-size: 28px; }}
.feed .s5 .preco {{ font-size: 150px; }}
</style>
<div class="frame s5"><div class="glow"></div>{BRAND}
<div class="main">
  <h1>Silêncio <em>Neural</em></h1>
  <div class="box">
    <span class="tag">Oferta de Black Friday</span>
    <div class="de">De <s>R$ 1.497</s></div>
    <div class="por">por apenas</div>
    <div class="preco"><small>R$</small>997</div>
    <ul>{lis}</ul>
  </div>
</div>
{cta("Quero ter resultados incríveis")}</div>"""


# ---------- S6: pergunta da FAQ ----------
def s6(fmt):
    return f"""
<style>
.s6 .q {{ font-size: 240px; font-weight: 900; color: var(--orange); line-height: .6; height: 110px; }}
.s6 h1 {{ font-size: 92px; }}
.stories .s6 h1 {{ font-size: 100px; }}
.s6 .sub {{ margin-top: 50px; border-left: 6px solid var(--orange); padding-left: 30px; }}
</style>
<div class="frame s6"><div class="glow"></div>{BRAND}
<div class="main">
  <span class="tag">A pergunta que mais recebemos</span>
  <div class="q">“</div>
  <h1>Funciona pra quem está <em>começando</em> na massoterapia?</h1>
  <p class="sub">Veja a resposta e os depoimentos de quem começou do zero.</p>
</div>
{cta("Ver a resposta")}</div>"""


CRIATIVOS = {
    "s1-60-segundos": s1,
    "s2-agenda-boca-a-boca": s2,
    "s3-onde-doi": s3,
    "s4-alunos": s4,
    "s5-oferta-black-friday": s5,
    "s6-faq-iniciante": s6,
}


def main():
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    PNG_DIR.mkdir(parents=True, exist_ok=True)
    for nome, fn in CRIATIVOS.items():
        for fmt, (w, h) in FORMATS.items():
            html = (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
                    f"<style>{CSS} html,body{{width:{w}px;height:{h}px}}</style></head><body class=\"{fmt}\">{fn(fmt)}</body></html>")
            src = HTML_DIR / f"{nome}-{fmt}.html"
            src.write_text(html, encoding="utf-8")
            out = PNG_DIR / f"{nome}-{fmt}.png"
            subprocess.run(
                [CHROME, "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                 "--force-device-scale-factor=1", f"--window-size={w},{h}",
                 f"--screenshot={out}", src.as_uri()],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            print(out.relative_to(BASE.parent.parent))


if __name__ == "__main__":
    main()
