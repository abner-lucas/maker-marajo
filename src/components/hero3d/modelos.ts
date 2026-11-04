import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/*
 * Modelos procedurais da bancada (robô 4WD, impressora CoreXY, braço 6 eixos, kit Arduino).
 * Proporções tiradas de peças reais (Arduino UNO 68,6 × 53,4 mm, motor TT, HC-SR04, 18650,
 * servo MG996R) em escala única. São representações visuais — não simulam a física das peças.
 *
 * Cada modelo devolve uma lista de "peças": é a unidade que se separa no modo explodido.
 * Todos apoiam no chão em y = CHAO.
 */

export const CHAO = -0.95;
const MM = 0.011; // 1 mm em unidades da cena

export interface Peca {
  obj: THREE.Object3D;
  pos: [number, number, number];
  rot?: [number, number, number];
}

/* ------------------------------------------------------------------ texturas */

const canvasTex = (w: number, h: number, pintar: (g: CanvasRenderingContext2D) => void, cor = true) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  pintar(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (cor) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// Pseudoaleatório determinístico: as texturas saem iguais a cada carregamento
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function texMDF() {
  const r = rng(7);
  return canvasTex(512, 256, (g) => {
    g.fillStyle = '#c99c6c';
    g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 2200; i++) {
      const v = 150 + r() * 60;
      g.fillStyle = `rgba(${v + 30},${v - 10},${v - 60},${0.08 + r() * 0.12})`;
      g.fillRect(r() * 512, r() * 256, 1 + r() * 6, 1);
    }
  });
}

function texProtoboard() {
  return canvasTex(512, 192, (g) => {
    g.fillStyle = '#f1efe8';
    g.fillRect(0, 0, 512, 192);
    // trilhos de alimentação
    for (const [y, c] of [[10, '#d33'], [26, '#25c'], [166, '#d33'], [182, '#25c']] as const) {
      g.fillStyle = c;
      g.fillRect(8, y, 496, 2);
    }
    g.fillStyle = '#3a3a38';
    const furo = (x: number, y: number) => g.fillRect(x, y, 4, 4);
    for (let x = 14; x < 500; x += 10) {
      if ((x / 10) % 6 < 5) {
        furo(x, 15);
        furo(x, 171);
      }
      for (let k = 0; k < 5; k++) {
        furo(x, 44 + k * 10);
        furo(x, 108 + k * 10);
      }
    }
    // canaleta central
    g.fillStyle = '#d9d6cd';
    g.fillRect(0, 94, 512, 6);
  });
}

function texOLED() {
  return canvasTex(256, 128, (g) => {
    g.fillStyle = '#05070a';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#7fd4ff';
    g.font = 'bold 30px sans-serif';
    g.fillText('IF MAKER', 18, 44);
    g.font = '18px sans-serif';
    g.fillText('dist: 24 cm', 18, 76);
    for (let i = 0; i < 14; i++) g.fillRect(18 + i * 15, 112 - ((i * 37) % 26), 10, 4 + ((i * 37) % 26));
  });
}

function texPEI() {
  const r = rng(3);
  return canvasTex(256, 256, (g) => {
    g.fillStyle = '#b48a3c';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,230,170' : '80,55,20'},${r() * 0.25})`;
      g.fillRect(r() * 256, r() * 256, 1.5, 1.5);
    }
  });
}

function texEtiquetaServo() {
  return canvasTex(256, 128, (g) => {
    g.fillStyle = '#16181b';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#c8ccd2';
    g.font = 'bold 34px sans-serif';
    g.fillText('MG996R', 30, 62);
    g.font = '16px sans-serif';
    g.fillText('METAL GEAR · 180°', 32, 92);
  });
}

/* ------------------------------------------------------------------ materiais */

export function criarMateriais() {
  const fisico = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  return {
    pla: fisico({ color: 0xe25a24, roughness: 0.58, clearcoat: 0.15, clearcoatRoughness: 0.6 }),
    plaGrafite: fisico({ color: 0x2b2d31, roughness: 0.62, clearcoat: 0.1 }),
    plaVerde: fisico({ color: 0x1f8a52, roughness: 0.58, clearcoat: 0.12 }),
    aluminio: new THREE.MeshStandardMaterial({ color: 0xb8bec5, metalness: 0.92, roughness: 0.34 }),
    anodizado: new THREE.MeshStandardMaterial({ color: 0x1e2023, metalness: 0.7, roughness: 0.42 }),
    borracha: new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.92 }),
    mdf: new THREE.MeshStandardMaterial({ map: texMDF(), roughness: 0.86 }),
    mdfQueimado: new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.9 }),
    acrilico: fisico({ color: 0xeef6ff, roughness: 0.06, transparent: true, opacity: 0.32, clearcoat: 1 }),
    latao: new THREE.MeshStandardMaterial({ color: 0xc6a052, metalness: 0.95, roughness: 0.3 }),
    pino: new THREE.MeshStandardMaterial({ color: 0xd9dadc, metalness: 1, roughness: 0.22 }),
    pcbAzul: new THREE.MeshStandardMaterial({ color: 0x0b5c97, roughness: 0.42, metalness: 0.1 }),
    pcbVermelho: new THREE.MeshStandardMaterial({ color: 0xa8242a, roughness: 0.45 }),
    pcbPreto: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.4 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.55 }),
    plasticoPreto: new THREE.MeshStandardMaterial({ color: 0x1a1b1d, roughness: 0.55 }),
    plasticoBranco: new THREE.MeshStandardMaterial({ color: 0xecebe5, roughness: 0.6 }),
    plasticoAmarelo: new THREE.MeshStandardMaterial({ color: 0xf0bf2a, roughness: 0.5 }),
    plasticoAzulTransl: fisico({ color: 0x2c6fd6, roughness: 0.3, transparent: true, opacity: 0.85 }),
    bornerAzul: new THREE.MeshStandardMaterial({ color: 0x1b6fd1, roughness: 0.5 }),
    celula18650: new THREE.MeshStandardMaterial({ color: 0x2257b8, roughness: 0.35, metalness: 0.2 }),
    tela: new THREE.MeshStandardMaterial({ map: texOLED(), emissive: 0xffffff, emissiveMap: texOLED(), emissiveIntensity: 0.9 }),
    pei: new THREE.MeshStandardMaterial({ map: texPEI(), roughness: 0.7, metalness: 0.3 }),
    protoboard: new THREE.MeshStandardMaterial({ map: texProtoboard(), roughness: 0.75 }),
    etiquetaServo: new THREE.MeshStandardMaterial({ map: texEtiquetaServo(), roughness: 0.5 }),
    ptfe: fisico({ color: 0xffffff, roughness: 0.2, transparent: true, opacity: 0.55 }),
    fioVermelho: new THREE.MeshStandardMaterial({ color: 0xc8302c, roughness: 0.5 }),
    fioPreto: new THREE.MeshStandardMaterial({ color: 0x1f1f22, roughness: 0.5 }),
    fioLaranja: new THREE.MeshStandardMaterial({ color: 0xe8792d, roughness: 0.5 }),
    fioVerde: new THREE.MeshStandardMaterial({ color: 0x2f9e5b, roughness: 0.5 }),
    fioAzul: new THREE.MeshStandardMaterial({ color: 0x2f6fd1, roughness: 0.5 }),
    ledVermelho: fisico({ color: 0xff3b30, emissive: 0xff2010, emissiveIntensity: 0.9, roughness: 0.15, transparent: true, opacity: 0.9 }),
    ledVerde: fisico({ color: 0x3bff7a, emissive: 0x18e05a, emissiveIntensity: 0.8, roughness: 0.15, transparent: true, opacity: 0.9 }),
    ledAmarelo: fisico({ color: 0xffd23b, emissive: 0xffb000, emissiveIntensity: 0.8, roughness: 0.15, transparent: true, opacity: 0.9 }),
    resistor: new THREE.MeshStandardMaterial({ color: 0xd8c39a, roughness: 0.6 }),
    malhaSensor: new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.8, metalness: 0.3 }),
  };
}
export type Materiais = ReturnType<typeof criarMateriais>;

/* ------------------------------------------------------------------ primitivas */

const caixa = (w: number, h: number, d: number, m: THREE.Material, r = 0.012) => {
  const raio = Math.min(r, w / 2.01, h / 2.01, d / 2.01);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, raio), m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const cilindro = (r: number, h: number, m: THREE.Material, seg = 28, rTopo = r) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTopo, r, h, seg), m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const fio = (pts: [number, number, number][], m: THREE.Material, raio = 0.012) => {
  const curva = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curva, 48, raio, 8, false), m);
  mesh.castShadow = true;
  return mesh;
};

const em = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
};

const grupo = (...filhos: THREE.Object3D[]) => {
  const g = new THREE.Group();
  g.add(...filhos);
  return g;
};

/** Fileira de pinos/furos repetidos com InstancedMesh (barato mesmo com muitas cópias) */
const fileira = (geo: THREE.BufferGeometry, m: THREE.Material, n: number, passo: number, eixo: 'x' | 'z' = 'x') => {
  const inst = new THREE.InstancedMesh(geo, m, n);
  const mat = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const d = (i - (n - 1) / 2) * passo;
    mat.makeTranslation(eixo === 'x' ? d : 0, 0, eixo === 'z' ? d : 0);
    inst.setMatrixAt(i, mat);
  }
  inst.castShadow = true;
  return inst;
};

/* ------------------------------------------------------------------ subconjuntos */

/** Arduino UNO R3 (68,6 × 53,4 mm). `e` multiplica a escala para kits vistos de perto */
export function arduinoUNO(M: Materiais, e = 1) {
  const s = MM * e;
  const g = new THREE.Group();
  const L = 68.6 * s;
  const P = 53.4 * s;
  g.add(caixa(L, 1.6 * s, P, M.pcbAzul, 1.5 * s));
  // ATmega328P DIP-28
  const dip = em(caixa(35 * s, 3.6 * s, 7.6 * s, M.chip, 0.6 * s), 6 * s, 2.6 * s, 9 * s);
  const pinos = fileira(new THREE.BoxGeometry(0.6 * s, 2.4 * s, 1.4 * s), M.pino, 14, 2.54 * s);
  g.add(dip, em(pinos.clone(), 6 * s, 1.6 * s, 9 * s + 4.4 * s), em(pinos, 6 * s, 1.6 * s, 9 * s - 4.4 * s));
  // USB-B e conector P4
  g.add(em(caixa(16 * s, 11 * s, 12 * s, M.aluminio, 0.8 * s), -L / 2 + 5 * s, 6.3 * s, -P / 2 + 13 * s));
  g.add(em(caixa(14 * s, 11 * s, 9 * s, M.plasticoPreto, 1 * s), -L / 2 + 5 * s, 6.3 * s, P / 2 - 9 * s));
  // barras de pinos fêmea nas duas bordas
  const barra = (n: number) => caixa(n * 2.54 * s, 8.5 * s, 2.54 * s, M.plasticoPreto, 0.4 * s);
  g.add(em(barra(18), 6 * s, 5 * s, -P / 2 + 2.5 * s), em(barra(14), 9 * s, 5 * s, P / 2 - 2.5 * s));
  // cristal, capacitores, botão reset e LED "ON"
  g.add(em(caixa(11 * s, 3.5 * s, 4.5 * s, M.aluminio, 2 * s), -12 * s, 2.5 * s, -2 * s));
  for (const z of [-4, 4]) g.add(em(cilindro(3.2 * s, 7 * s, M.chip, 18), -20 * s, 4.3 * s, z * s + 10 * s));
  g.add(em(caixa(6 * s, 3 * s, 6 * s, M.plasticoPreto, 1 * s), -L / 2 + 8 * s, 2.3 * s, -2 * s));
  g.add(em(caixa(1.6 * s, 0.8 * s, 0.8 * s, M.ledVerde, 0.2 * s), 22 * s, 1.3 * s, 14 * s));
  return g;
}

/** Sensor ultrassônico HC-SR04 (45 × 20 mm), virado para +x */
export function hcsr04(M: Materiais, e = 1) {
  const s = MM * e;
  const g = new THREE.Group();
  g.add(caixa(1.6 * s, 20 * s, 45 * s, M.pcbAzul, 1 * s));
  for (const z of [-13, 13]) {
    const lata = em(cilindro(8 * s, 12 * s, M.aluminio, 32), 6.8 * s, 0, z * s, 0, 0, Math.PI / 2);
    const tela = em(cilindro(6.6 * s, 0.6 * s, M.malhaSensor, 32), 13 * s, 0, z * s, 0, 0, Math.PI / 2);
    g.add(lata, tela);
  }
  g.add(em(caixa(3 * s, 4 * s, 10 * s, M.aluminio, 1.5 * s), 2.2 * s, 6.5 * s, 0));
  const pinos = fileira(new THREE.BoxGeometry(0.64 * s, 8 * s, 0.64 * s), M.pino, 4, 2.54 * s, 'z');
  g.add(em(pinos, -0.5 * s, -13 * s, 0));
  return g;
}

/** Motor TT amarelo com motor DC metálico atrás, eixo saindo em +z */
function motorTT(M: Materiais) {
  const s = MM;
  return grupo(
    caixa(64 * s, 22 * s, 19 * s, M.plasticoAmarelo, 2 * s),
    em(cilindro(10 * s, 26 * s, M.aluminio, 24), -38 * s, 0, 0, 0, 0, Math.PI / 2),
    em(cilindro(2.7 * s, 10 * s, M.plasticoBranco, 12), 20 * s, 0, 13 * s, Math.PI / 2, 0, 0),
    em(caixa(2 * s, 5 * s, 3 * s, M.latao, 0.4 * s), -50 * s, 3 * s, 5 * s),
    em(caixa(2 * s, 5 * s, 3 * s, M.latao, 0.4 * s), -50 * s, 3 * s, -5 * s)
  );
}

/** Roda de 65 mm: pneu com cravos + aro impresso em 3D com 6 raios. Eixo em z */
function roda(M: Materiais) {
  const s = MM;
  const R = 32.5 * s;
  const g = new THREE.Group();
  const pneu = em(cilindro(R - 3 * s, 26 * s, M.borracha, 40), 0, 0, 0, Math.PI / 2, 0, 0);
  g.add(pneu);
  // cravos em volta do pneu
  const cravo = new THREE.BoxGeometry(5 * s, 4 * s, 24 * s);
  const n = 22;
  const inst = new THREE.InstancedMesh(cravo, M.borracha, n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a);
    m.compose(new THREE.Vector3(Math.cos(a) * (R - 1.5 * s), Math.sin(a) * (R - 1.5 * s), 0), q, new THREE.Vector3(1, 1, 1));
    inst.setMatrixAt(i, m);
  }
  inst.castShadow = true;
  g.add(inst);
  // aro e raios (PLA)
  g.add(em(cilindro(20 * s, 27 * s, M.pla, 32), 0, 0, 0, Math.PI / 2, 0, 0));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.add(em(caixa(3 * s, 15 * s, 4 * s, M.pla, 1 * s), Math.cos(a) * 9 * s, Math.sin(a) * 9 * s, 14 * s, 0, 0, a - Math.PI / 2));
  }
  g.add(em(cilindro(5 * s, 6 * s, M.plaGrafite, 20), 0, 0, 14 * s, Math.PI / 2, 0, 0));
  return g;
}

/** Placa ponte-H L298N com dissipador aletado */
function l298n(M: Materiais) {
  const s = MM;
  const g = grupo(caixa(43 * s, 1.6 * s, 43 * s, M.pcbVermelho, 1 * s));
  const base = em(caixa(23 * s, 4 * s, 16 * s, M.anodizado, 0.6 * s), 0, 3 * s, -6 * s);
  g.add(base);
  for (let i = 0; i < 7; i++) g.add(em(caixa(1.4 * s, 22 * s, 16 * s, M.anodizado, 0.4 * s), (i - 3) * 3.3 * s, 14 * s, -6 * s));
  for (const x of [-15, 15]) g.add(em(caixa(10 * s, 10 * s, 8 * s, M.bornerAzul, 0.8 * s), x * s, 5.8 * s, 15 * s));
  g.add(em(caixa(15 * s, 10 * s, 8 * s, M.bornerAzul, 0.8 * s), 0, 5.8 * s, 15 * s));
  return g;
}

/** Suporte 2 × 18650 */
function suporteBaterias(M: Materiais) {
  const s = MM;
  const g = grupo(em(caixa(77 * s, 4 * s, 42 * s, M.plasticoPreto, 2 * s), 0, -9 * s, 0));
  for (const z of [-10, 10]) {
    g.add(em(cilindro(9 * s, 65 * s, M.celula18650, 28), 0, 0, z * s, 0, 0, Math.PI / 2));
    g.add(em(cilindro(4 * s, 1.5 * s, M.pino, 16), 33.3 * s, 0, z * s, 0, 0, Math.PI / 2));
  }
  for (const x of [-37, 37]) g.add(em(caixa(3 * s, 20 * s, 42 * s, M.plasticoPreto, 1 * s), x * s, 0, 0));
  return g;
}

/** Servo MG996R, eixo de saída em +z (com braço de alumínio) */
function servoMG996R(M: Materiais) {
  const s = MM;
  return grupo(
    caixa(40 * s, 37 * s, 20 * s, M.plasticoPreto, 1.5 * s),
    em(caixa(54 * s, 2.5 * s, 20 * s, M.plasticoPreto, 0.8 * s), 0, 9 * s, 0),
    em(new THREE.Mesh(new THREE.PlaneGeometry(30 * s, 15 * s), M.etiquetaServo), -2 * s, -2 * s, 10.05 * s),
    em(cilindro(4 * s, 6 * s, M.aluminio, 20), 10 * s, 12 * s, 13 * s, Math.PI / 2, 0, 0),
    em(cilindro(10 * s, 2.5 * s, M.aluminio, 32), 10 * s, 12 * s, 16 * s, Math.PI / 2, 0, 0)
  );
}

/* ------------------------------------------------------------------ modelos */

export function modeloRobo(M: Materiais): Peca[] {
  const s = MM;
  const R = 32.5 * s; // raio da roda
  const yEixo = CHAO + R;
  const yPlaca = yEixo + 16 * s;
  const pecas: Peca[] = [];

  // 1. Chassi MDF 3 mm cortado a laser, com borda queimada e furação
  const chassi = grupo(
    caixa(200 * s, 3 * s, 132 * s, M.mdf, 6 * s),
    em(caixa(201 * s, 2.6 * s, 133 * s, M.mdfQueimado, 6.2 * s), 0, -0.4 * s, 0)
  );
  for (const [x, z] of [[-60, -40], [-60, 40], [60, -40], [60, 40], [0, -48], [0, 48]])
    chassi.add(em(cilindro(2.2 * s, 3.4 * s, M.mdfQueimado, 14), x * s, 0, z * s));
  for (let i = 0; i < 5; i++) chassi.add(em(caixa(26 * s, 3.4 * s, 4 * s, M.mdfQueimado, 1.8 * s), (i - 2) * 30 * s, 0, 0));
  pecas.push({ obj: chassi, pos: [0, yPlaca, 0] });

  // 2-5. Motores TT presos sob o chassi
  const xs = [-62, 62];
  const zs = [-1, 1];
  for (const x of xs)
    for (const lado of zs)
      pecas.push({
        obj: motorTT(M),
        pos: [x * s + (x > 0 ? -10 * s : 10 * s), yEixo, lado * 48 * s],
        rot: [0, lado > 0 ? 0 : Math.PI, x > 0 ? 0 : 0],
      });

  // 6-9. Rodas
  for (const x of xs)
    for (const lado of zs)
      pecas.push({ obj: roda(M), pos: [x * s, yEixo, lado * 76 * s], rot: [0, lado > 0 ? 0 : Math.PI, 0] });

  // 10. Espaçadores de latão + placa superior de acrílico
  const andar = grupo(em(caixa(150 * s, 3 * s, 110 * s, M.acrilico, 6 * s), 0, 30 * s, 0));
  for (const [x, z] of [[-60, -40], [-60, 40], [60, -40], [60, 40]])
    andar.add(em(cilindro(3 * s, 30 * s, M.latao, 6), x * s, 15 * s, z * s));
  pecas.push({ obj: andar, pos: [-8 * s, yPlaca + 1.5 * s, 0] });
  const yAndar = yPlaca + 1.5 * s + 31.5 * s;

  // 11. Arduino UNO no andar de cima
  pecas.push({ obj: arduinoUNO(M), pos: [-18 * s, yAndar + 1 * s, 0], rot: [0, Math.PI, 0] });

  // 12. Ponte-H L298N e 13. baterias no chassi
  pecas.push({ obj: l298n(M), pos: [-55 * s, yPlaca + 2.3 * s, 0], rot: [0, Math.PI / 2, 0] });
  pecas.push({ obj: suporteBaterias(M), pos: [30 * s, yPlaca + 12 * s, 0] });

  // 14. HC-SR04 na frente, em suporte impresso
  const frente = grupo(
    em(caixa(6 * s, 30 * s, 52 * s, M.plaGrafite, 1.5 * s), -4 * s, 0, 0),
    em(hcsr04(M), 0, 4 * s, 0)
  );
  pecas.push({ obj: frente, pos: [104 * s, yPlaca + 16 * s, 0] });

  // 15. Chicote: ponte-H → motores, sensor → Arduino
  const yf = yPlaca + 3 * s;
  pecas.push({
    obj: grupo(
      fio([[-55 * s, yf + 8 * s, 12 * s], [-62 * s, yf + 2 * s, 30 * s], [-52 * s, yEixo + 8 * s, 46 * s]], M.fioVermelho),
      fio([[-55 * s, yf + 8 * s, -12 * s], [-62 * s, yf + 2 * s, -30 * s], [-52 * s, yEixo + 8 * s, -46 * s]], M.fioPreto),
      fio([[96 * s, yPlaca + 6 * s, 3 * s], [70 * s, yAndar + 20 * s, 6 * s], [10 * s, yAndar + 12 * s, 20 * s]], M.fioLaranja),
      fio([[96 * s, yPlaca + 6 * s, -3 * s], [72 * s, yAndar + 16 * s, -4 * s], [12 * s, yAndar + 12 * s, 16 * s]], M.fioVerde)
    ),
    pos: [0, 0, 0],
  });
  return pecas;
}

export function modeloImpressora(M: Materiais): Peca[] {
  const pecas: Peca[] = [];
  const W = 1.9;
  const yBase = CHAO + 0.11;
  const yTopo = 1.0;
  const perfil = (alt: number) =>
    grupo(caixa(0.07, alt, 0.07, M.anodizado, 0.008), em(caixa(0.012, alt * 0.98, 0.074, M.plasticoPreto, 0.003), 0, 0, 0));

  // 1. Base
  const base = grupo(caixa(W + 0.1, 0.22, W + 0.1, M.anodizado, 0.04));
  base.add(em(caixa(0.5, 0.26, 0.04, M.plasticoPreto, 0.02), 0.55, 0.17, W / 2 + 0.06, -0.35, 0, 0));
  base.add(em(new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.2), M.tela), 0.55, 0.18, W / 2 + 0.083, -0.35, 0, 0));
  pecas.push({ obj: base, pos: [0, yBase, 0] });

  // 2. Colunas + quadro superior
  const quadro = new THREE.Group();
  const alt = yTopo - (yBase + 0.11);
  for (const x of [-1, 1]) for (const z of [-1, 1]) quadro.add(em(perfil(alt), (x * W) / 2 - x * 0.04, 0, (z * W) / 2 - z * 0.04));
  for (const z of [-1, 1]) quadro.add(em(perfil(W), 0, alt / 2, (z * W) / 2 - z * 0.04, 0, 0, Math.PI / 2));
  for (const x of [-1, 1]) quadro.add(em(perfil(W), (x * W) / 2 - x * 0.04, alt / 2, 0, Math.PI / 2, 0, 0));
  pecas.push({ obj: quadro, pos: [0, yBase + 0.11 + alt / 2, 0] });

  // 3. Fusos Z
  const fusos = new THREE.Group();
  for (const x of [-0.7, 0.7]) fusos.add(em(cilindro(0.018, alt - 0.05, M.pino, 12), x, 0, -0.7));
  pecas.push({ obj: fusos, pos: [0, yBase + 0.11 + alt / 2, 0] });

  // 4. Mesa aquecida com chapa PEI texturizada
  const mesa = grupo(caixa(1.55, 0.05, 1.55, M.aluminio, 0.01), em(caixa(1.5, 0.012, 1.5, M.pei, 0.004), 0, 0.03, 0));
  mesa.add(em(caixa(0.3, 0.06, 0.2, M.anodizado, 0.01), 0, -0.03, -0.7));
  const yMesa = yBase + 0.32;
  pecas.push({ obj: mesa, pos: [0, yMesa, 0] });

  // 5. Peça sendo impressa: vaso com linhas de camada visíveis
  const vaso = new THREE.Group();
  const camadas = 34;
  const hCam = 0.016;
  for (let i = 0; i < camadas; i++) {
    const t = i / camadas;
    const r = 0.2 + Math.sin(t * Math.PI * 0.9) * 0.1 - t * 0.04;
    const anel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hCam * 0.92, 48, 1, true), M.pla);
    anel.position.y = i * hCam;
    anel.castShadow = true;
    vaso.add(anel);
  }
  vaso.add(em(cilindro(0.2, hCam, M.pla, 48), 0, -hCam / 2, 0));
  pecas.push({ obj: vaso, pos: [0.15, yMesa + 0.045, 0.1] });

  // 6. Gantry CoreXY: guias Y, travessa X e correias
  const yG = yTopo - 0.16;
  const gantry = new THREE.Group();
  for (const x of [-0.82, 0.82]) {
    gantry.add(em(cilindro(0.02, W - 0.2, M.pino, 14), x, 0, 0, Math.PI / 2, 0, 0));
    gantry.add(em(caixa(0.012, 0.03, W - 0.25, M.borracha, 0.004), x + (x > 0 ? -0.05 : 0.05), 0.02, 0));
  }
  gantry.add(em(caixa(1.7, 0.05, 0.06, M.anodizado, 0.01), 0, 0, 0.1));
  for (const x of [-0.85, 0.85]) gantry.add(em(caixa(0.12, 0.08, 0.12, M.plasticoPreto, 0.015), x, 0, 0.1));
  pecas.push({ obj: gantry, pos: [0, yG, 0] });

  // 7. Cabeçote com ventoinha e bico
  const cabeca = grupo(caixa(0.26, 0.3, 0.2, M.plaGrafite, 0.03));
  cabeca.add(em(cilindro(0.085, 0.012, M.anodizado, 32), 0, 0, 0.105, Math.PI / 2, 0, 0));
  for (let i = 0; i < 5; i++) cabeca.add(em(caixa(0.15, 0.006, 0.005, M.plasticoPreto, 0.002), 0, -0.06 + i * 0.03, 0.112));
  cabeca.add(em(caixa(0.12, 0.08, 0.21, M.pla, 0.02), 0, -0.17, 0));
  cabeca.add(em(cilindro(0.012, 0.06, M.latao, 12, 0.025), 0, -0.24, 0));
  const yCab = yG - 0.08;
  pecas.push({ obj: cabeca, pos: [0.15, yCab, 0.18] });

  // 8. Carretel lateral + tubo PTFE até o cabeçote
  const carretel = grupo(
    em(cilindro(0.3, 0.025, M.plaGrafite, 40), 0, 0.09, 0),
    em(cilindro(0.3, 0.025, M.plaGrafite, 40), 0, -0.09, 0),
    cilindro(0.26, 0.16, M.pla, 40),
    cilindro(0.07, 0.2, M.plasticoPreto, 20)
  );
  pecas.push({ obj: carretel, pos: [-W / 2 - 0.2, 0.25, -0.35], rot: [0, 0, Math.PI / 2] });
  pecas.push({
    obj: fio([[-W / 2 - 0.12, 0.3, -0.35], [-0.6, yTopo + 0.25, -0.2], [0.15, yCab + 0.3, 0.18]], M.ptfe, 0.014),
    pos: [0, 0, 0],
  });
  return pecas;
}

export function modeloBraco(M: Materiais): Peca[] {
  const s = MM;
  const pecas: Peca[] = [];
  const x0 = -0.45;

  // 1. Base de alumínio com anel de parafusos
  const base = grupo(cilindro(0.62, 0.08, M.anodizado, 64));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    base.add(em(cilindro(0.025, 0.02, M.pino, 12), x0 * 0 + Math.cos(a) * 0.52, 0.05, Math.sin(a) * 0.52));
  }
  pecas.push({ obj: base, pos: [x0, CHAO + 0.04, 0] });

  // 2. Giro da base (servo deitado + prato)
  const giro = grupo(em(servoMG996R(M), 0, 0, 0, -Math.PI / 2, 0, 0), em(cilindro(0.3, 0.03, M.aluminio, 48), 0.11, 0.24, 0));
  pecas.push({ obj: giro, pos: [x0, CHAO + 0.28, 0] });

  // Cadeia cinemática (plano xy): ombro → cotovelo → punho
  const ombro = new THREE.Vector2(x0 + 0.11, CHAO + 0.62);
  const L1 = 0.95;
  const L2 = 0.8;
  const a1 = THREE.MathUtils.degToRad(68);
  const a2 = THREE.MathUtils.degToRad(-12);
  const cotovelo = ombro.clone().add(new THREE.Vector2(Math.cos(a1), Math.sin(a1)).multiplyScalar(L1));
  const punho = cotovelo.clone().add(new THREE.Vector2(Math.cos(a2), Math.sin(a2)).multiplyScalar(L2));

  // 3. Suporte em U do ombro com servo
  const suporteU = grupo(
    em(caixa(0.3, 0.03, 0.42, M.aluminio, 0.008), 0, -0.17, 0),
    em(caixa(0.3, 0.32, 0.03, M.aluminio, 0.008), 0, 0, 0.2),
    em(caixa(0.3, 0.32, 0.03, M.aluminio, 0.008), 0, 0, -0.2),
    em(servoMG996R(M), -0.1, -0.02, 0, 0, 0, 0)
  );
  pecas.push({ obj: suporteU, pos: [ombro.x, ombro.y, 0] });

  // Elo: duas chapas paralelas com furos de alívio, ao longo de +x local
  const elo = (L: number, larg: number) => {
    const g = new THREE.Group();
    for (const z of [-0.16, 0.16]) {
      g.add(em(caixa(L, larg, 0.022, M.aluminio, 0.01), L / 2, 0, z));
      for (let i = 1; i < 4; i++) g.add(em(cilindro(0.03, 0.026, M.anodizado, 16), (L * i) / 4, 0, z, Math.PI / 2, 0, 0));
    }
    g.add(em(caixa(0.05, larg * 0.8, 0.3, M.aluminio, 0.008), L * 0.55, 0, 0));
    return g;
  };

  // 4. Braço (ombro → cotovelo) e 5. servo do cotovelo
  pecas.push({ obj: elo(L1, 0.14), pos: [ombro.x, ombro.y, 0], rot: [0, 0, a1] });
  pecas.push({ obj: servoMG996R(M), pos: [cotovelo.x, cotovelo.y, 0], rot: [0, 0, a1 - Math.PI / 2] });

  // 6. Antebraço e 7. punho
  pecas.push({ obj: elo(L2, 0.11), pos: [cotovelo.x, cotovelo.y, 0], rot: [0, 0, a2] });
  const punhoG = grupo(
    em(servoMG996R(M), 0, 0, 0, 0, 0, Math.PI / 2),
    em(caixa(0.06, 0.3, 0.34, M.aluminio, 0.01), 0.16, 0, 0)
  );
  pecas.push({ obj: punhoG, pos: [punho.x, punho.y, 0], rot: [0, 0, a2] });

  // 8. Garra com dedos paralelos e engrenagens
  const garra = grupo(em(caixa(0.05, 0.08, 0.3, M.aluminio, 0.008), 0, 0, 0));
  for (const z of [-0.05, 0.05]) garra.add(em(cilindro(0.045, 0.02, M.latao, 18), 0.04, 0.05, z, Math.PI / 2, 0, 0));
  for (const lado of [-1, 1]) {
    garra.add(em(caixa(0.24, 0.035, 0.03, M.aluminio, 0.008), 0.13, 0.02 * lado, lado * 0.11, 0, lado * 0.15, 0));
    garra.add(em(caixa(0.12, 0.05, 0.035, M.borracha, 0.01), 0.26, 0.02 * lado, lado * 0.075));
  }
  const fim = punho.clone().add(new THREE.Vector2(Math.cos(a2), Math.sin(a2)).multiplyScalar(0.22));
  pecas.push({ obj: garra, pos: [fim.x, fim.y, 0], rot: [0, 0, a2] });

  // 9. Cabo que acompanha o braço
  pecas.push({
    obj: fio(
      [
        [x0 + 0.05, CHAO + 0.4, 0.24],
        [ombro.x + 0.05, ombro.y + 0.1, 0.22],
        [cotovelo.x - 0.05, cotovelo.y + 0.08, 0.22],
        [punho.x - 0.1, punho.y + 0.1, 0.2],
      ],
      M.fioPreto,
      0.016
    ),
    pos: [0, 0, 0],
  });
  return pecas;
}

export function modeloKitArduino(M: Materiais): Peca[] {
  const s = MM;
  const e = 1.6; // kit visto mais de perto
  const pecas: Peca[] = [];
  const yTampo = CHAO + 0.04;

  // 1. Base de MDF da bancada
  pecas.push({ obj: grupo(caixa(2.7, 0.06, 1.8, M.mdf, 0.02), em(caixa(2.71, 0.05, 1.81, M.mdfQueimado, 0.02), 0, -0.006, 0)), pos: [0, CHAO + 0.03, 0] });

  // 2. Arduino UNO
  const uno = arduinoUNO(M, e);
  pecas.push({ obj: uno, pos: [-0.72, yTampo + 1 * s * e, -0.05], rot: [0, Math.PI / 2, 0] });

  // 3. Protoboard 830 pontos
  const proto = grupo(caixa(1.2, 0.07, 0.45, M.plasticoBranco, 0.012));
  proto.add(em(new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.44), M.protoboard), 0, 0.0352, 0, -Math.PI / 2, 0, 0));
  const yProto = yTampo + 0.035;
  pecas.push({ obj: proto, pos: [0.45, yProto, 0.15] });
  const yFuro = yProto + 0.036;

  // 4. LEDs 5 mm com resistores
  const leds = new THREE.Group();
  [M.ledVermelho, M.ledAmarelo, M.ledVerde].forEach((mat, i) => {
    const x = 0.05 + i * 0.16;
    leds.add(em(cilindro(2.5 * s * e, 5.5 * s * e, mat, 24), x, yFuro + 6 * s * e, 0.22));
    leds.add(em(new THREE.Mesh(new THREE.SphereGeometry(2.5 * s * e, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat), x, yFuro + 8.75 * s * e, 0.22));
    leds.add(em(cilindro(0.8 * s * e, 6 * s * e, M.pino, 8), x - 1.3 * s * e, yFuro + 1.5 * s * e, 0.22));
    leds.add(em(cilindro(0.8 * s * e, 6 * s * e, M.pino, 8), x + 1.3 * s * e, yFuro + 1.5 * s * e, 0.22));
    leds.add(em(cilindro(1.2 * s * e, 6.5 * s * e, M.resistor, 12), x, yFuro + 3 * s * e, 0.09, Math.PI / 2, 0, 0));
  });
  pecas.push({ obj: leds, pos: [0, 0, 0] });

  // 5. HC-SR04 espetado na protoboard
  pecas.push({ obj: hcsr04(M, e), pos: [0.75, yFuro + 21 * s * e, 0.02], rot: [0, -Math.PI / 2, 0] });

  // 6. Display OLED 0,96"
  const oled = grupo(caixa(27 * s * e, 1.6 * s * e, 27 * s * e, M.pcbPreto, 1 * s * e));
  oled.add(em(new THREE.Mesh(new THREE.PlaneGeometry(24 * s * e, 13 * s * e), M.tela), 0, 0.85 * s * e, -2 * s * e, -Math.PI / 2, 0, 0));
  pecas.push({ obj: oled, pos: [0.15, yFuro + 0.14, -0.05], rot: [-1.15, 0, 0] });

  // 7. Servo SG90 (corpo azul translúcido) com braço branco
  const sg90 = grupo(
    caixa(23 * s * e, 22 * s * e, 12 * s * e, M.plasticoAzulTransl, 1 * s * e),
    em(caixa(32 * s * e, 2.5 * s * e, 12 * s * e, M.plasticoAzulTransl, 0.6 * s * e), 0, 6 * s * e, 0),
    em(cilindro(3 * s * e, 4 * s * e, M.plasticoBranco, 16), 6 * s * e, 13 * s * e, 0),
    em(caixa(20 * s * e, 2 * s * e, 5 * s * e, M.plasticoBranco, 1.5 * s * e), 10 * s * e, 15.5 * s * e, 0, 0, 0.5, 0)
  );
  pecas.push({ obj: sg90, pos: [-0.15, yTampo + 11 * s * e, 0.62] });

  // 8. Jumpers do Arduino até a protoboard
  const yH = yTampo + 10 * s * e;
  pecas.push({
    obj: grupo(
      fio([[-0.62, yH, 0.25], [-0.35, yH + 0.22, 0.32], [-0.1, yFuro + 0.02, 0.33]], M.fioVermelho),
      fio([[-0.6, yH, 0.2], [-0.32, yH + 0.18, 0.05], [-0.1, yFuro + 0.02, 0.36]], M.fioPreto),
      fio([[-0.62, yH, -0.3], [-0.2, yH + 0.28, -0.25], [0.55, yFuro + 0.02, -0.02]], M.fioLaranja),
      fio([[-0.6, yH, -0.25], [-0.15, yH + 0.24, -0.12], [0.05, yFuro + 0.02, 0.15]], M.fioVerde),
      fio([[-0.58, yH, 0.1], [-0.4, yH + 0.15, 0.5], [-0.2, yTampo + 0.2, 0.62]], M.fioAzul)
    ),
    pos: [0, 0, 0],
  });
  return pecas;
}
