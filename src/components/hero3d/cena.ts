import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CHAO,
  criarMateriais,
  modeloBraco,
  modeloImpressora,
  modeloKitArduino,
  modeloRobo,
} from './modelos';

/*
 * Cena 3D do hero (three.js). Fica num módulo separado para ser carregada sob demanda:
 * o texto e os botões do topo aparecem antes, sem esperar ~500 KB de three.js.
 */

export type ModelType = 'rover' | 'printer3d' | 'arm' | 'arduino';
export type PhaseType = 'assembled' | 'floating' | 'rebuilding';

export interface CenaApi {
  setModel: (m: ModelType) => void;
  explode: () => void;
  rebuild: () => void;
}

interface PartItem {
  mesh: THREE.Object3D;
  homePos: THREE.Vector3;
  homeRot: THREE.Euler;
  explodedPos: THREE.Vector3;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
}

export function montarCena(
  container: HTMLDivElement,
  setPhase: (p: PhaseType) => void,
  api: { current: CenaApi | null }
): () => void {

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / Math.max(1, container.clientHeight),
    0.1,
    100
  );

  const updateCameraLayout = () => {
    const w = container.clientWidth;
    const h = Math.max(1, container.clientHeight);
    camera.aspect = w / h;
    if (w < 900) {
      camera.position.set(0, 3.4, 10.6);
      camera.lookAt(0, 0.1, 0);
    } else {
      camera.position.set(-1.9, 3.1, 8.8);
      camera.lookAt(-1.2, 0.35, 0);
    }
    camera.updateProjectionMatrix();
  };
  updateCameraLayout();

  const leve = container.clientWidth < 900 || (navigator.hardwareConcurrency ?? 8) <= 4;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, leve ? 1.5 : 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // Iluminação de estúdio: ambiente HDR procedural (reflexos nos metais) + luz principal com sombra
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = ambiente;
  scene.environmentIntensity = 0.55;

  const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.4);
  keyLight.position.set(4.5, 8, 5.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(leve ? 1024 : 2048, leve ? 1024 : 2048);
  keyLight.shadow.camera.left = -3.2;
  keyLight.shadow.camera.right = 3.2;
  keyLight.shadow.camera.top = 3.2;
  keyLight.shadow.camera.bottom = -3.2;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.bias = -0.0004;
  keyLight.shadow.normalBias = 0.02;
  keyLight.shadow.radius = 5;
  scene.add(keyLight, keyLight.target);

  const recorte = new THREE.DirectionalLight(0xcfe3ff, 0.9);
  recorte.position.set(-6, 3.5, -5);
  scene.add(recorte);

  // Chão: recebe a sombra real + sombra de contato suave logo abaixo da peça
  const shadowDisc = new THREE.Group();
  const chaoSombra = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.ShadowMaterial({ color: 0x2a1c10, opacity: 0.2 })
  );
  chaoSombra.rotation.x = -Math.PI / 2;
  chaoSombra.receiveShadow = true;
  const contato = document.createElement('canvas');
  contato.width = contato.height = 128;
  const gc = contato.getContext('2d')!;
  const grad = gc.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(30,20,10,0.55)');
  grad.addColorStop(1, 'rgba(30,20,10,0)');
  gc.fillStyle = grad;
  gc.fillRect(0, 0, 128, 128);
  const sombraContato = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 2.8),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(contato), transparent: true, depthWrite: false })
  );
  sombraContato.rotation.x = -Math.PI / 2;
  sombraContato.position.y = 0.002;
  shadowDisc.add(chaoSombra, sombraContato);
  scene.add(shadowDisc);

  // Root group positioned on the right side for desktop, centered lower on mobile
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // Escala por modelo: peças pequenas (braço, kit) aparecem maiores; o chão acompanha
  let escala = 1;
  const positionRootForViewport = () => {
    if (container.clientWidth < 900) {
      rootGroup.position.set(0, -0.35, 0);
      shadowDisc.position.set(0, -0.35 + CHAO * escala, 0);
    } else {
      rootGroup.position.set(1.55, 0.1, 0);
      shadowDisc.position.set(1.55, 0.1 + CHAO * escala, 0);
    }
    keyLight.target.position.copy(rootGroup.position);
  };
  positionRootForViewport();

  const mats = criarMateriais();

  let parts: PartItem[] = [];
  let currentPhase: PhaseType = 'assembled';
  let rebuildTimer = 0;

  const clearParts = () => {
    parts.forEach((p) => {
      rootGroup.remove(p.mesh);
      // geometrias são recriadas a cada troca de modelo; materiais são compartilhados
      p.mesh.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    });
    parts = [];
  };

  const addPart = (
    mesh: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    rootGroup.add(mesh);

    const dir = new THREE.Vector3(
      x + (Math.random() - 0.5) * 0.8,
      y + 0.4 + (Math.random() - 0.3) * 0.8,
      z + (Math.random() - 0.5) * 0.8
    );
    if (dir.lengthSq() < 0.1) dir.set(0.5, 1, 0.5);
    dir.normalize().multiplyScalar(1.5 + Math.random() * 1.1);
    // explode para cima e para os lados, nunca para dentro do chão
    if (dir.y < 0.35) dir.y = 0.35 + Math.random() * 0.5;

    parts.push({
      mesh,
      homePos: new THREE.Vector3(x, y, z),
      homeRot: new THREE.Euler(rx, ry, rz),
      explodedPos: new THREE.Vector3(x, y, z).add(dir),
      vel: new THREE.Vector3(),
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4
      ),
    });
  };

  const buildModel = (model: ModelType) => {
    clearParts();
    currentPhase = 'assembled';
    setPhase('assembled');

    escala = { rover: 1.3, printer3d: 1, arm: 1.3, arduino: 1.25 }[model];
    rootGroup.scale.setScalar(escala);
    positionRootForViewport();
    const montar = {
      rover: modeloRobo,
      printer3d: modeloImpressora,
      arm: modeloBraco,
      arduino: modeloKitArduino,
    }[model];
    montar(mats).forEach(({ obj, pos, rot = [0, 0, 0] }) => addPart(obj, pos[0], pos[1], pos[2], rot[0], rot[1], rot[2]));
  };

  buildModel('rover');

  const triggerExplode = () => {
    if (currentPhase === 'floating') return;
    currentPhase = 'floating';
    setPhase('floating');
    parts.forEach((p) => {
      p.vel.copy(p.explodedPos).sub(p.mesh.position).multiplyScalar(2.6);
    });
  };

  const triggerRebuild = () => {
    currentPhase = 'rebuilding';
    setPhase('rebuilding');
    rebuildTimer = 0;
  };

  api.current = {
    setModel: (m) => buildModel(m),
    explode: triggerExplode,
    rebuild: triggerRebuild,
  };

  // Pointer Drag Orbit + Click to Explode
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startY = 0;
  let targetYaw = -0.45;
  let targetPitch = 0.12;
  let currentYaw = -0.45;
  let currentPitch = 0.12;

  const onPointerDown = (e: PointerEvent) => {
    isDown = true;
    dragged = false;
    startX = e.clientX;
    startY = e.clientY;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.hypot(dx, dy) > 6) dragged = true;
    targetYaw += dx * 0.008;
    targetPitch = Math.max(-0.45, Math.min(0.65, targetPitch + dy * 0.006));
    startX = e.clientX;
    startY = e.clientY;
  };

  const onPointerUp = () => {
    if (isDown && !dragged) {
      if (currentPhase === 'assembled') {
        triggerExplode();
      } else if (currentPhase === 'floating') {
        triggerRebuild();
      }
    }
    isDown = false;
  };

  const domEl = renderer.domElement;
  domEl.style.cursor = 'grab';
  domEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  const onResize = () => {
    if (!container) return;
    renderer.setSize(container.clientWidth, container.clientHeight);
    updateCameraLayout();
    positionRootForViewport();
  };
  window.addEventListener('resize', onResize);

  let animId = 0;
  let clock = new THREE.Clock();

  // Só renderiza enquanto o hero está visível (economiza CPU/bateria ao rolar)
  let visivel = true;
  const animate = () => {
    if (!visivel) {
      animId = 0;
      return;
    }
    animId = requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());
    const elapsed = clock.getElapsedTime();

    if (!isDown && currentPhase === 'assembled') {
      targetYaw += dt * 0.32;
    }

    currentYaw += (targetYaw - currentYaw) * 0.1;
    currentPitch += (targetPitch - currentPitch) * 0.1;
    rootGroup.rotation.y = currentYaw;
    rootGroup.rotation.x = currentPitch;

    if (currentPhase === 'assembled') {
      // apoiado no chão: sem "flutuar" sobre a própria sombra
      rootGroup.position.y = container.clientWidth < 900 ? -0.35 : 0.1;
    } else if (currentPhase === 'floating') {
      parts.forEach((p, idx) => {
        p.mesh.position.addScaledVector(p.vel, dt);
        const pull = new THREE.Vector3().copy(p.explodedPos).sub(p.mesh.position);
        p.vel.addScaledVector(pull, 2.2 * dt);
        p.vel.y += Math.sin(elapsed * 2.1 + idx) * 0.4 * dt;
        p.vel.multiplyScalar(0.92);
        p.mesh.rotation.x += p.spin.x * dt;
        p.mesh.rotation.y += p.spin.y * dt;
      });
    } else if (currentPhase === 'rebuilding') {
      rebuildTimer += dt * 2.4;
      const alpha = Math.min(1, rebuildTimer);
      parts.forEach((p) => {
        p.mesh.position.lerp(p.homePos, 0.18);
        p.mesh.rotation.x += (p.homeRot.x - p.mesh.rotation.x) * 0.2;
        p.mesh.rotation.y += (p.homeRot.y - p.mesh.rotation.y) * 0.2;
        p.mesh.rotation.z += (p.homeRot.z - p.mesh.rotation.z) * 0.2;
      });
      if (alpha >= 1) {
        parts.forEach((p) => {
          p.mesh.position.copy(p.homePos);
          p.mesh.rotation.copy(p.homeRot);
        });
        currentPhase = 'assembled';
        setPhase('assembled');
      }
    }

    renderer.render(scene, camera);
  };
  animate();

  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel && !animId) {
      clock.getDelta(); // descarta o tempo parado para não "pular" a animação
      animate();
    }
  });
  io.observe(container);

  return () => {
    io.disconnect();
    cancelAnimationFrame(animId);
    domEl.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('resize', onResize);
    pmrem.dispose();
    ambiente.dispose();
    renderer.dispose();
    if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
  };
}
