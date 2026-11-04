import * as THREE from 'three';

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

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Studio Workbench Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(6, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
  fillLight.position.set(-7, 5, -5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffedd5, 0.7);
  rimLight.position.set(0, -4, 6);
  scene.add(rimLight);

  // Shadow catcher ground disc
  const shadowGeo = new THREE.CircleGeometry(3.8, 48);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x141a17,
    transparent: true,
    opacity: 0.08,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = -1.25;
  scene.add(shadowDisc);

  // Root group positioned on the right side for desktop, centered lower on mobile
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const positionRootForViewport = () => {
    if (container.clientWidth < 900) {
      rootGroup.position.set(0, -0.35, 0);
      shadowDisc.position.set(0, -1.55, 0);
    } else {
      rootGroup.position.set(1.55, 0.1, 0);
      shadowDisc.position.set(1.55, -1.25, 0);
    }
  };
  positionRootForViewport();

  // Shared Materials (IF MAKER palette)
  const mats = {
    orange: new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.32, metalness: 0.1 }),
    green: new THREE.MeshStandardMaterial({ color: 0x23963c, roughness: 0.35, metalness: 0.12 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x0092d6, roughness: 0.32, metalness: 0.15 }),
    purple: new THREE.MeshStandardMaterial({ color: 0x70388e, roughness: 0.35, metalness: 0.15 }),
    red: new THREE.MeshStandardMaterial({ color: 0xdc1f26, roughness: 0.32, metalness: 0.1 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.3, metalness: 0.1 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1b2420, roughness: 0.45, metalness: 0.3 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xd4dce0, roughness: 0.25, metalness: 0.65 }),
    mdf: new THREE.MeshStandardMaterial({ color: 0xd6a77a, roughness: 0.65, metalness: 0.05 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x0f6b58, roughness: 0.35, metalness: 0.2 }),
  };

  let parts: PartItem[] = [];
  let currentPhase: PhaseType = 'assembled';
  let rebuildTimer = 0;

  const clearParts = () => {
    parts.forEach((p) => rootGroup.remove(p.mesh));
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

    if (model === 'rover') {
      // 1. Main MDF/3D Printed Chassis Plate
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, 1.65), mats.orange);
      addPart(chassis, 0, -0.15, 0);

      // 2. Upper Deck Acrylic Plate
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 1.45), mats.dark);
      addPart(deck, -0.1, 0.32, 0);

      // 3. Arduino UNO Board on top
      const arduino = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.72), mats.blue);
      addPart(arduino, -0.25, 0.44, 0);

      // 4. Battery Pack
      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.9), mats.green);
      addPart(battery, 0.5, 0.12, 0);

      // 5. Four Wheels with tires + yellow hubs
      const wheelPositions = [
        [-0.85, -0.32, 0.95],
        [0.85, -0.32, 0.95],
        [-0.85, -0.32, -0.95],
        [0.85, -0.32, -0.95],
      ];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheelGroup = new THREE.Group();
        const tire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.46, 0.46, 0.26, 24),
          mats.dark
        );
        tire.rotation.x = Math.PI / 2;
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 0.28, 16),
          mats.yellow
        );
        hub.rotation.x = Math.PI / 2;
        wheelGroup.add(tire, hub);
        addPart(wheelGroup, wx, wy, wz);
      });

      // 6. Ultrasonic Sensor HC-SR04 Head
      const sensorGroup = new THREE.Group();
      const sBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.78), mats.blue);
      const eyeL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 16), mats.silver);
      eyeL.rotation.z = Math.PI / 2;
      eyeL.position.set(0.12, 0, 0.22);
      const eyeR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 16), mats.silver);
      eyeR.rotation.z = Math.PI / 2;
      eyeR.position.set(0.12, 0, -0.22);
      sensorGroup.add(sBoard, eyeL, eyeR);
      addPart(sensorGroup, 1.15, 0.25, 0);

      // 7. Robotic Mast / Antenna
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 12), mats.silver);
      addPart(mast, -0.75, 0.72, -0.45);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), mats.red);
      addPart(beacon, -0.75, 1.15, -0.45);
    } else if (model === 'printer3d') {
      // CoreXY 3D Printer Frame
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 2.1), mats.dark);
      addPart(base, 0, -0.85, 0);

      // Heated Build Plate
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.08, 1.65), mats.silver);
      addPart(bed, 0, -0.55, 0);

      // 4 Pillars
      const pillarCoords = [
        [-1.0, 0.2, -0.9],
        [1.0, 0.2, -0.9],
        [-1.0, 0.2, 0.9],
        [1.0, 0.2, 0.9],
      ];
      pillarCoords.forEach(([px, py, pz]) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.9, 0.14), mats.dark);
        addPart(p, px, py, pz);
      });

      // Top Gantry X-Beam
      const gantry = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 0.2), mats.green);
      addPart(gantry, 0, 0.75, 0.1);

      // Extruder Print Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.38), mats.orange);
      addPart(head, 0.15, 0.62, 0.22);

      // 3D Printed Prototype Object on Bed (Gear/Vase)
      const printObj = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.32, 0.1, 64, 12),
        mats.orange
      );
      addPart(printObj, 0, -0.1, 0);

      // Filament Spool Holder on Side
      const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 24), mats.yellow);
      spool.rotation.z = Math.PI / 2;
      addPart(spool, -1.22, 0.45, -0.2);
    } else if (model === 'arm') {
      // 6-DOF Robotic Arm
      const basePedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.9, 0.3, 28),
        mats.dark
      );
      addPart(basePedestal, 0, -0.8, 0);

      const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.35, 24), mats.orange);
      addPart(turret, 0, -0.48, 0);

      const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.15, 0.28), mats.green);
      addPart(lowerArm, -0.15, 0.15, 0, 0, 0, 0.28);

      const elbowJoint = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.38, 20),
        mats.purple
      );
      elbowJoint.rotation.x = Math.PI / 2;
      addPart(elbowJoint, -0.32, 0.68, 0);

      const foreArm = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.24, 0.24), mats.blue);
      addPart(foreArm, 0.22, 0.85, 0, 0, 0, 0.22);

      const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), mats.yellow);
      addPart(wrist, 0.78, 0.98, 0);

      const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.08), mats.red);
      addPart(clawL, 1.05, 1.08, 0.12, 0, 0, -0.2);
      const clawR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.08), mats.red);
      addPart(clawR, 1.05, 0.88, -0.12, 0, 0, 0.2);
    } else {
      // Arduino + Breadboard + Sensors Kit
      const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 1.75), mats.pcb);
      addPart(pcbBoard, 0, -0.35, 0);

      const breadboard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.85), mats.silver);
      addPart(breadboard, 0.35, -0.18, 0.25);

      const mcuChip = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.32), mats.dark);
      addPart(mcuChip, -0.55, -0.18, -0.25);

      const usbPort = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.24, 0.32), mats.silver);
      addPart(usbPort, -1.08, -0.15, -0.35);

      const oledDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.08), mats.blue);
      addPart(oledDisplay, 0.35, 0.22, -0.45, -0.25, 0, 0);

      const servoBlock = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.28), mats.orange);
      addPart(servoBlock, -0.55, 0.12, 0.45);

      const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), mats.red);
      addPart(led1, 0.1, 0.05, 0.35);
      const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), mats.green);
      addPart(led2, 0.4, 0.05, 0.35);
      const led3 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), mats.yellow);
      addPart(led3, 0.7, 0.05, 0.35);
    }
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
      rootGroup.position.y =
        (container.clientWidth < 900 ? -0.35 : 0.1) + Math.sin(elapsed * 1.8) * 0.06;
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
    renderer.dispose();
    if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
  };
}
