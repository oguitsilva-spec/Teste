/**
 * RUBRA - coreografia de rolagem.
 *
 * Lenis suaviza a rolagem, ScrollTrigger conduz tres coisas: a posicao da
 * garrafa entre as secoes, o pan horizontal do processo e as entradas de texto.
 * Nada aqui escuta o evento `scroll` diretamente.
 */

import { createScene } from "./scene.js";

const root = document.documentElement;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = window.matchMedia("(max-width: 860px)").matches;

root.classList.add("anim-ready");

/* ------------------------------------------------------ rolagem suave + GSAP */

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* -------------------------------------------------------------- entradas */

function revealText() {
  if (reduced) return;

  // Titulo do hero: cada linha sobe de dentro da propria mascara.
  gsap.fromTo(
    "[data-reveal-line]",
    { yPercent: 110, opacity: 1 },
    { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.09, delay: 0.1 }
  );

  // O resto do hero entra no carregamento, nunca por rolagem: em telas baixas
  // o CTA fica a poucos pixels do limite do gatilho e ficaria invisivel.
  gsap.fromTo(
    "[data-reveal-hero]",
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1, delay: 0.45 }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 94%", once: true },
      }
    );
  });
}

/* ------------------------------------------------- pan horizontal (processo) */

function horizontalPan() {
  const section = document.querySelector(".pan");
  const track = document.querySelector(".pan__track");
  if (!section || !track || reduced) return;

  const travel = () => track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -travel(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      // Folga extra no fim para o ultimo painel respirar antes de soltar o pin.
      end: () => `+=${travel() + window.innerHeight * 0.6}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
}

/* ------------------------------------------------------- garrafa por secao */

/**
 * Posicoes em fracao do viewport 3D, nao em pixels: a garrafa acompanha a
 * coluna de texto em qualquer largura de tela.
 * No desktop ela troca de lado; no compacto ela sobe e desce, porque nao ha
 * espaco lateral para dividir com o texto.
 */
const KEYS = compact
  ? [
      { sel: ".hero", x: 0, y: 0.52, z: -2, ry: 0.14, rz: 0.05, s: 0.56 },
      { sel: ".manifesto", x: 0, y: 0.5, z: -4, ry: Math.PI, rz: -0.05, s: 0.44 },
      { sel: ".origin", x: 0, y: -0.42, z: -4, ry: 2 * Math.PI, rz: 0.07, s: 0.48 },
      { sel: ".pan", x: 0, y: 0.78, z: -8, ry: 3 * Math.PI, rz: -0.04, s: 0.26 },
      { sel: ".close", x: 0, y: 0.5, z: -1, ry: 4 * Math.PI, rz: 0, s: 0.56 },
    ]
  : [
      // ry avanca meia volta por secao e sempre para com o rotulo de frente
      // para a camera (multiplos de PI, com o hero levemente de tres quartos).
      { sel: ".hero", x: 0.42, y: 0, z: 0, ry: 0.14, rz: 0.06, s: 1 },
      { sel: ".manifesto", x: 0.46, y: 0.03, z: -2, ry: Math.PI, rz: -0.05, s: 0.88 },
      { sel: ".origin", x: -0.46, y: 0, z: -1, ry: 2 * Math.PI, rz: 0.08, s: 0.84 },
      { sel: ".pan", x: 0.02, y: 0.86, z: -6, ry: 3 * Math.PI, rz: -0.04, s: 0.3 },
      { sel: ".close", x: 0.44, y: 0, z: 2, ry: 4 * Math.PI, rz: 0.04, s: 1.02 },
    ];

function place(stage, key) {
  const { halfW, halfH } = stage.viewport();
  return { x: key.x * halfW, y: key.y * halfH, z: key.z };
}

function choreograph(stage) {
  const first = KEYS[0];
  const p0 = place(stage, first);
  stage.rig.position.set(p0.x, p0.y, p0.z);
  stage.rig.rotation.set(0, first.ry, first.rz);
  stage.rig.scale.setScalar(first.s);

  if (reduced) {
    stage.freezeIdle();
    return;
  }

  KEYS.slice(1).forEach((key) => {
    const trigger = document.querySelector(key.sel);
    if (!trigger) return;

    const st = {
      trigger,
      start: "top bottom",
      end: "top top",
      scrub: 1,
      invalidateOnRefresh: true,
    };

    gsap.to(stage.rig.position, {
      x: () => place(stage, key).x,
      y: () => place(stage, key).y,
      z: key.z,
      ease: "none",
      scrollTrigger: st,
    });
    gsap.to(stage.rig.rotation, {
      y: key.ry,
      z: key.rz,
      ease: "none",
      scrollTrigger: { ...st },
    });
    gsap.to(stage.rig.scale, {
      x: key.s,
      y: key.s,
      z: key.s,
      ease: "none",
      scrollTrigger: { ...st },
    });
  });

  // O campo de tomates so existe enquanto a secao de origem esta em cena.
  // A rampa comeca tarde de proposito: com "top bottom" o campo ja aparecia
  // como manchas escuras no fim do manifesto.
  gsap.fromTo(
    stage.state,
    { field: 0 },
    {
      field: 1,
      ease: "power2.in",
      scrollTrigger: {
        trigger: ".origin",
        start: "top 60%",
        end: "top 15%",
        scrub: 1,
      },
    }
  );
  gsap.to(stage.state, {
    field: 0,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".origin",
      start: "bottom 85%",
      end: "bottom 20%",
      scrub: 1,
    },
  });
}

/**
 * Faixas de texto puro: bento, depoimento e rodape tem fundo opaco e cortariam
 * a garrafa na propria borda. Em vez de deixar o corte aparecer, o palco some
 * antes de entrar na faixa e volta ja reposicionado do outro lado.
 */
function fadeStageOnTextBands() {
  const stageEl = document.querySelector(".stage");
  if (!stageEl || reduced) return;

  const band = (trigger, to, start, end) => {
    if (!document.querySelector(trigger)) return;
    gsap.to(stageEl, {
      opacity: to,
      ease: "none",
      scrollTrigger: { trigger, start, end, scrub: 1 },
    });
  };

  // As janelas terminam antes da faixa cobrir a garrafa: se a opacidade ainda
  // estiver caindo quando a borda opaca passar por cima, o corte aparece.
  band(".bento", 0, "top bottom", "top 75%");
  band(".close", 1, "top 25%", "top top");
  band(".foot", 0, "top bottom", "top 80%");
}

/* ------------------------------------------------------------------- boot */

function anchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -68 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function boot() {
  revealText();
  horizontalPan();
  fadeStageOnTextBands();
  anchors();

  const canvas = document.getElementById("gl");
  let stage = null;

  try {
    stage = createScene(canvas);
    choreograph(stage);
  } catch (err) {
    // Sem WebGL a pagina continua completa; so perde a garrafa.
    console.warn("Palco 3D indisponivel:", err);
    document.querySelector(".stage")?.remove();
    root.classList.add("no-gl");
  }

  // As fontes mudam a altura dos blocos de texto e, com isso, os gatilhos.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("resize", () => {
    if (stage) stage.resize();
    ScrollTrigger.refresh();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
