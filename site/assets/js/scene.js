/**
 * RUBRA - palco WebGL.
 *
 * Uma garrafa de extrato de 200 ml construida por revolucao (LatheGeometry):
 * casca de vidro fechada com espessura real, conteudo opaco, tampa metalica e
 * rotulo com textura de canvas. O ambiente e um estudio procedural gerado por
 * PMREM, que e o que da a faixa de luz vertical caracteristica no vidro.
 *
 * O modulo nao sabe nada sobre rolagem. Ele expoe `rig` (o grupo animado) e
 * alguns setters; a coreografia mora em main.js.
 */

import * as THREE from "three";

const GLASS_TINT = 0x8fb79a;
const EXTRACT = 0x8e1a08;

/* ------------------------------------------------------------------ perfis */

// Contorno da garrafa: sobe pela face externa e desce pela interna, fechando
// uma casca solida. Sem isso o vidro refrata como uma folha de papel.
const OUTER = [
  [0.0, 0.0], [1.9, 0.0], [2.25, 0.1], [2.35, 0.42],
  [2.35, 6.6], [2.33, 7.1], [2.24, 7.7], [2.02, 8.35],
  [1.68, 8.95], [1.3, 9.45], [1.02, 9.9], [0.92, 10.25],
  [0.9, 10.55], [0.9, 11.85], [0.99, 12.0], [0.99, 12.45],
  [0.9, 12.6],
];

const INNER = [
  [0.72, 12.6], [0.68, 12.0], [0.68, 10.55], [0.7, 10.2],
  [0.8, 9.85], [1.08, 9.4], [1.46, 8.9], [1.8, 8.3],
  [2.02, 7.66], [2.11, 7.08], [2.13, 6.58], [2.13, 0.55],
  [1.9, 0.32], [1.6, 0.28], [0.0, 0.28],
];

// Nivel de enchimento: extrato ate a base do ombro, como garrafa cheia de fato.
const FILL = [
  [0.0, 0.3], [2.1, 0.32], [2.1, 6.58], [2.08, 7.08],
  [1.98, 7.66], [1.77, 8.28], [1.44, 8.88], [1.2, 9.2],
  [1.06, 9.45], [0.0, 9.45],
];

const toVec2 = (pairs) => pairs.map(([x, y]) => new THREE.Vector2(x, y));

/* ------------------------------------------------------- ambiente de estudio */

/**
 * Softboxes de verdade em vez de um HDRI baixado: quatro planos emissivos
 * passados pelo PMREM. Barato, deterministico e offline.
 */
function buildStudioEnvironment(renderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050404);

  const panel = (w, h, color, intensity, pos, rot) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    env.add(mesh);
  };

  // Softbox larga a esquerda: preenche a lateral do vidro.
  panel(34, 70, 0xffffff, 3.1, [-24, 0, -2], [0, Math.PI / 2, 0]);
  // Faixa estreita a direita: gera o realce vertical nitido na quina do vidro.
  panel(7, 70, 0xffeadd, 6.4, [21, 0, 2], [0, -Math.PI / 2, 0]);
  // Teto: separa o ombro da garrafa do fundo.
  panel(46, 46, 0xfff5ee, 1.5, [0, 26, 0], [Math.PI / 2, 0, 0]);
  // Rebote quente atras: devolve o vermelho da marca dentro do vidro.
  panel(30, 24, 0xff5a30, 2.3, [2, -4, -30], [0, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromScene(env, 0.02);

  env.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  pmrem.dispose();

  return target.texture;
}

/* ----------------------------------------------------------------- rotulo */

function buildLabelTexture() {
  const W = 2048;
  const H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ece4d8";
  ctx.fillRect(0, 0, W, H);

  // Fibra do papel, para o rotulo nao ler como plastico chapado.
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = i % 2 ? "#8a7c68" : "#ffffff";
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 1);
  }
  ctx.globalAlpha = 1;

  // Duas copias em volta do corpo: uma sempre cai de frente para a camera.
  for (let copy = 0; copy < 2; copy++) {
    const cx = W * 0.25 + copy * W * 0.5;

    ctx.save();
    ctx.translate(cx, 0);
    ctx.textAlign = "center";

    ctx.strokeStyle = "#c0341d";
    ctx.lineWidth = 4;
    ctx.strokeRect(-W * 0.128, H * 0.12, W * 0.256, H * 0.76);

    ctx.fillStyle = "#c0341d";
    ctx.font = '800 132px "Bricolage Grotesque", sans-serif';
    ctx.letterSpacing = "10px";
    ctx.fillText("RUBRA", 0, H * 0.45);

    ctx.fillStyle = "#3a2f28";
    ctx.font = '600 36px "Archivo", sans-serif';
    ctx.letterSpacing = "7px";
    ctx.fillText("EXTRATO DE TOMATE", 0, H * 0.6);

    ctx.strokeStyle = "#3a2f28";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-W * 0.055, H * 0.685);
    ctx.lineTo(W * 0.055, H * 0.685);
    ctx.stroke();

    ctx.fillStyle = "#3a2f28";
    ctx.font = '500 34px "Archivo", sans-serif';
    ctx.letterSpacing = "5px";
    ctx.fillText("200 ml", 0, H * 0.785);

    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ---------------------------------------------------------------- garrafa */

function buildBottle(segments) {
  const bottle = new THREE.Group();

  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(toVec2([...OUTER, ...INNER]), segments),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.045,
      transmission: 1,
      thickness: 1.5,
      ior: 1.52,
      attenuationColor: new THREE.Color(GLASS_TINT),
      attenuationDistance: 12,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.25,
      side: THREE.DoubleSide,
      transparent: true,
    })
  );
  glass.renderOrder = 2;
  bottle.add(glass);

  const extract = new THREE.Mesh(
    new THREE.LatheGeometry(toVec2(FILL), segments),
    new THREE.MeshPhysicalMaterial({
      color: EXTRACT,
      roughness: 0.68,
      metalness: 0,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xff7a55),
      clearcoat: 0.2,
      clearcoatRoughness: 0.6,
      envMapIntensity: 0.45,
      side: THREE.DoubleSide,
    })
  );
  extract.renderOrder = 1;
  bottle.add(extract);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(1.07, 1.07, 1.25, segments),
    new THREE.MeshStandardMaterial({
      color: 0x1a1615,
      metalness: 0.92,
      roughness: 0.31,
      envMapIntensity: 1.3,
    })
  );
  cap.position.y = 12.15;
  bottle.add(cap);

  // Anel de rosca sob a tampa, so para a silhueta nao terminar reta demais.
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(1.02, 1.02, 0.16, segments),
    new THREE.MeshStandardMaterial({
      color: 0x241d1b,
      metalness: 0.85,
      roughness: 0.45,
    })
  );
  collar.position.y = 11.45;
  bottle.add(collar);

  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(2.372, 2.372, 4.7, segments, 1, true),
    new THREE.MeshStandardMaterial({
      map: buildLabelTexture(),
      roughness: 0.86,
      metalness: 0,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    })
  );
  label.position.y = 4.05;
  label.rotation.y = -Math.PI * 0.5;
  label.renderOrder = 3;
  bottle.add(label);

  // Centraliza a garrafa na origem do grupo pai.
  bottle.position.y = -6.4;
  return bottle;
}

/* ------------------------------------------------------------ campo de tomate */

function buildField(count) {
  const field = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(1, 22, 16);
  const calyxGeo = new THREE.IcosahedronGeometry(0.42, 0);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.56,
    metalness: 0,
    clearcoat: 0.16,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.28,
    transparent: true,
    opacity: 0,
  });

  const calyxMat = new THREE.MeshStandardMaterial({
    color: 0x3f5a25,
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    opacity: 0,
  });

  const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, count);
  const calyxes = new THREE.InstancedMesh(calyxGeo, calyxMat, count);
  bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  calyxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bodies.frustumCulled = false;
  calyxes.frustumCulled = false;

  // Um talhao nao tem trinta tomates da mesma cor: varia maduro, quase maduro
  // e passado por instancia.
  const tint = new THREE.Color();
  const seeds = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      x: (Math.random() - 0.5) * 74,
      y: (Math.random() - 0.5) * 40,
      z: -30 - Math.random() * 52,
      s: 0.85 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.4,
      tilt: (Math.random() - 0.5) * 0.9,
    });
    tint.setHSL(0.0 + Math.random() * 0.024, 0.92, 0.055 + Math.random() * 0.06);
    bodies.setColorAt(i, tint);
  }
  bodies.instanceColor.needsUpdate = true;

  field.add(bodies, calyxes);
  return { field, bodies, calyxes, seeds, bodyMat, calyxMat };
}

/* -------------------------------------------------------------------- API */

export function createScene(canvas) {
  const compact = window.matchMedia("(max-width: 860px)").matches;
  const segments = compact ? 72 : 128;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !compact,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.85));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Refracao em meia resolucao: e o unico custo real da cena em telas pequenas.
  if ("transmissionResolutionScale" in renderer) {
    renderer.transmissionResolutionScale = compact ? 0.4 : 0.6;
  }

  const scene = new THREE.Scene();
  scene.environment = buildStudioEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 220);
  camera.position.set(0, 0, 40);

  const key = new THREE.DirectionalLight(0xfff1e6, 2.2);
  key.position.set(9, 15, 11);
  const rim = new THREE.DirectionalLight(0xff6a45, 2.6);
  rim.position.set(-11, 5, -9);
  const fill = new THREE.DirectionalLight(0xbcd4ff, 0.45);
  fill.position.set(-7, -5, 9);
  scene.add(key, rim, fill);

  const rig = new THREE.Group();
  const bottle = buildBottle(segments);
  rig.add(bottle);
  scene.add(rig);

  const fieldParts = buildField(compact ? 16 : 26);
  scene.add(fieldParts.field);

  /* --------------------------------------------------------------- estado */

  const state = { field: 0, idle: 1 };
  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  let running = true;
  let frame = 0;

  function draw() {
    updateField(clock.getElapsedTime());
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!running) draw();
  }

  /** Meia-largura e meia-altura visiveis no plano z = 0, em unidades de mundo. */
  function viewport() {
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    return { halfW: halfH * camera.aspect, halfH };
  }

  function updateField(t) {
    const { seeds, bodies, calyxes, bodyMat, calyxMat, field } = fieldParts;

    // Fora da secao de origem o campo nao existe: nem opacidade residual, nem
    // custo de desenho.
    field.visible = state.field > 0.02;
    if (!field.visible) return;

    const push = (1 - state.field) * 26;

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const bob = Math.sin(t * 0.42 + s.phase) * 1.1 * state.idle;

      dummy.position.set(s.x, s.y + bob, s.z - push);
      dummy.rotation.set(s.tilt, t * s.spin * state.idle + s.phase, s.tilt * 0.5);
      dummy.scale.setScalar(s.s);
      dummy.scale.y *= 0.8;
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);

      dummy.position.y += s.s * 0.78;
      dummy.scale.setScalar(s.s * 0.82);
      dummy.scale.y *= 0.3;
      dummy.updateMatrix();
      calyxes.setMatrixAt(i, dummy.matrix);
    }

    bodies.instanceMatrix.needsUpdate = true;
    calyxes.instanceMatrix.needsUpdate = true;
    bodyMat.opacity = state.field;
    calyxMat.opacity = state.field;
  }

  function render() {
    if (!running) return;
    frame = requestAnimationFrame(render);
    const t = clock.getElapsedTime();

    // Respiro proprio da garrafa: mantem o vidro vivo mesmo com a pagina parada.
    bottle.rotation.y = Math.sin(t * 0.24) * 0.09 * state.idle;
    bottle.position.y = -6.4 + Math.sin(t * 0.55) * 0.16 * state.idle;

    draw();
  }

  resize();
  window.addEventListener("resize", resize);
  render();

  return {
    rig,
    state,
    viewport,
    resize,
    /**
     * Movimento reduzido: para o loop de animacao de vez e desenha um unico
     * quadro. Um rAF perpetuo para uma imagem parada e so consumo de bateria.
     */
    freezeIdle() {
      state.idle = 0;
      running = false;
      cancelAnimationFrame(frame);
      draw();
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      scene.traverse((o) => {
        if (!o.isMesh && !o.isInstancedMesh) return;
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      renderer.dispose();
    },
  };
}
