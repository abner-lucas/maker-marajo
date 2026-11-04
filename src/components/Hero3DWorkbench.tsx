import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Play, RotateCcw, Calendar, Sparkles, X, Layers, Cpu, Wrench } from 'lucide-react';
import { WordRise, BrandLogo } from './BrandLogo';
import { IMAGE_ASSETS } from '../data/labData';

type ModelType = 'rover' | 'printer3d' | 'arm' | 'arduino';
type PhaseType = 'assembled' | 'floating' | 'rebuilding';

interface PartItem {
  mesh: THREE.Object3D;
  homePos: THREE.Vector3;
  homeRot: THREE.Euler;
  explodedPos: THREE.Vector3;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
}

const MODEL_LABELS: Record<ModelType, string> = {
  rover: 'Robô Explorador 4WD',
  printer3d: 'Impressora 3D CoreXY',
  arm: 'Braço Robótico 6-Eixos',
  arduino: 'Kit Arduino + Sensores',
};

export const Hero3DWorkbench: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<ModelType>('rover');
  const [phase, setPhase] = useState<PhaseType>('assembled');
  const [rebuildTrigger, setRebuildTrigger] = useState(0);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  const apiRef = useRef<{
    setModel: (m: ModelType) => void;
    explode: () => void;
    rebuild: () => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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

    apiRef.current = {
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

    const animate = () => {
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

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, []);

  useEffect(() => {
    apiRef.current?.setModel(activeModel);
  }, [activeModel]);

  useEffect(() => {
    if (rebuildTrigger > 0) {
      apiRef.current?.rebuild();
    }
  }, [rebuildTrigger]);

  return (
    <>
      <section
        id="top"
        className="relative isolate overflow-hidden bg-wb-canvas font-ui text-wb-ink border-b border-wb-line"
      >
        {/* Constructa 3D Perspective Workbench Floor Grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="wb-floor wb-floor-in" />
        </div>

        <div className="relative flex min-h-[max(720px,96dvh)] flex-col">
          {/* Interactive Three.js 3D Viewport */}
          <div
            ref={mountRef}
            className="absolute inset-x-0 bottom-0 z-0 h-[440px] min-[900px]:top-0 min-[900px]:h-auto"
            title="Arraste para girar em 3D · Clique para desmontar ou remontar as peças"
          />

          {/* Main Hero Copy Overlay (Left Column) */}
          <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1320px] px-5 pt-[118px] pb-[440px] sm:px-8 sm:pt-[148px] min-[900px]:pb-[160px]">
            {/* Eyebrow Institutional Badge */}
            <div className="wb-rise pointer-events-auto flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="rotulo">
                <span aria-hidden="true" className="marajo-glifo text-wb-green" />
                Laboratório IFPA MAKER Marajó · Campus Breves
              </span>
            </div>

            {/* Constructa-style Giant Display Headline */}
            <h1
              className="mt-6 max-w-[13em] font-brand font-semibold text-wb-ink"
              style={{
                fontSize: 'clamp(40px, 5.6vw, 84px)',
                lineHeight: 0.98,
                letterSpacing: '-0.028em',
              }}
            >
              <WordRise text="Aquela solução na sua cabeça?" />{' '}
              <span className="acento text-wb-orange">
                <WordRise text="Construa aqui." delayOffset={0.3} />
              </span>
            </h1>

            {/* Lead Paragraph */}
            <p
              className="mt-6 max-w-[33em] text-wb-ink-2"
              style={{
                fontSize: 'clamp(16.5px, 1.3vw, 19px)',
                lineHeight: 1.6,
              }}
            >
              Impressão 3D, laser, scanners e robótica para estudantes do IFPA Campus Breves.
            </p>

            {/* Primary CTAs */}
            <div className="pointer-events-auto mt-8 flex w-fit flex-wrap items-center gap-x-5 gap-y-3.5">
              <Link
                to="/agendamento"
                className="wb-btn wb-btn-primary h-13 px-6 text-[16px]"
              >
                <Calendar className="h-5 w-5" />
                <span>Agendar equipamento</span>
              </Link>

              <Link
                to="/equipamentos"
                className="wb-btn wb-btn-dark h-13 px-6 text-[16px]"
              >
                <Wrench className="h-4 w-4 text-wb-orange" />
                <span>Explorar máquinas</span>
              </Link>

              <button
                type="button"
                onClick={() => setTourModalOpen(true)}
                className="group inline-flex min-h-[44px] items-center gap-2.5 text-[15.5px] font-semibold text-wb-ink transition-colors hover:text-wb-orange"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wb-ink text-white transition-transform group-hover:scale-110 group-hover:bg-wb-orange">
                  <Play className="h-4 w-4 translate-x-[1px] fill-current" />
                </span>
                <span className="underline decoration-wb-line underline-offset-4 group-hover:decoration-wb-orange">Conheça o Laboratório</span>
              </button>
            </div>

            {/* Quick Pillar Counters */}
            <div className="pointer-events-auto mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 max-w-[640px]">
              {[
                { label: 'Impressão 3D & Resina', val: '6 Máquinas', color: '#FF6B35' },
                { label: 'Corte a Laser CNC', val: '100W CO2', color: '#E5484D' },
                { label: 'Scanners 3D Ópticos', val: '0.05 mm', color: '#0092D6' },
                { label: 'Robótica & Arduino', val: '+35 Kits', color: '#23963C' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border-t border-wb-ink/80 pt-2.5"
                >
                  <div
                    className="flex items-center gap-1.5 font-brand text-[24px] font-semibold leading-none text-wb-ink"
                  >
                    <span aria-hidden="true" className="h-2 w-2 rotate-45" style={{ backgroundColor: stat.color }} />
                    {stat.val}
                  </div>
                  <div className="mt-1.5 text-[13px] text-wb-ink-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Interactive 3D Switcher Bar (Exact Constructa bottom bar) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[92px] bg-gradient-to-t from-white/90 via-white/50 to-transparent">
            <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-3 px-5 sm:px-8">
              {/* Model Switcher Pill Group */}
              <div
                role="group"
                aria-label="Escolher protótipo 3D na bancada"
                className="pointer-events-auto flex min-w-0 items-center gap-5 overflow-x-auto max-w-full [scrollbar-width:none]"
              >
                {(Object.keys(MODEL_LABELS) as ModelType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={activeModel === m}
                    onClick={() => setActiveModel(m)}
                    className={`whitespace-nowrap border-b-2 py-2.5 text-[14px] font-semibold transition-colors ${
                      activeModel === m
                        ? 'border-wb-orange text-wb-ink'
                        : 'border-transparent text-wb-ink-3 hover:text-wb-ink'
                    }`}
                  >
                    {MODEL_LABELS[m]}
                  </button>
                ))}
              </div>

              {/* Right Hint / Explode & Rebuild Button */}
              <div className="flex items-center gap-3 shrink-0">
                {phase === 'floating' || phase === 'rebuilding' ? (
                  <>
                    <p className="hidden font-key text-[12px] text-wb-ink-3 md:block">
                      Peças em gravidade zero · Arraste ou remonte
                    </p>
                    <button
                      type="button"
                      onClick={() => setRebuildTrigger((c) => c + 1)}
                      disabled={phase === 'rebuilding'}
                      className="wb-btn wb-btn-primary pointer-events-auto h-11 px-4 text-[14px] disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Remontar protótipo</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="hidden font-key text-[12px] text-wb-ink-2 sm:block">
                      Arraste para girar 3D ·{' '}
                      <button
                        type="button"
                        onClick={() => apiRef.current?.explode()}
                        className="pointer-events-auto font-bold text-wb-orange underline underline-offset-2"
                      >
                        Clique para desmontar peças
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Presentation Modal ("Conheça o Laboratório IFPA") */}
      {tourModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setTourModalOpen(false)}
        >
          <div
            className="wb-modal wb-pop relative max-h-[90vh] w-[min(960px,95vw)] overflow-y-auto p-6 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setTourModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-wb-line bg-wb-bench text-wb-ink hover:bg-wb-orange hover:text-white transition-colors"
              aria-label="Fechar janela"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-6 items-center">
              <div className="overflow-hidden rounded-2xl border border-wb-line bg-black aspect-[9/14] max-h-[480px] mx-auto w-full max-w-[300px]">
                <video
                  src="/videos/DWCiTZDEavR.mp4"
                  poster={IMAGE_ASSETS.real.inauguracaoPorta}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="wb-key text-wb-green border-wb-green/30 bg-wb-green/10">
                  Vídeo oficial · Laboratório IFPA MAKER Marajó
                </span>
                <h2 className="mt-3 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                  Laboratório IFPA MAKER Marajó — Campus Breves
                </h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-wb-ink-2">
                  Instalado no{' '}
                  <strong>IFPA Campus Breves</strong>, o
                  espaço fortalece a cultura do{' '}
                  <strong>“aprender fazendo” (learning by doing)</strong> com impressoras 3D{' '}
                  <strong>Elegoo Centauri Carbon</strong>, cortadoras a laser CO2 e Diodo CNC,
                  canetas 3D, arena de <strong>Robot Soccer</strong> e bancadas de eletrônica.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-wb-line bg-wb-bench/70 p-4">
                    <p className="text-[13.5px] font-bold text-wb-ink">
                      🎯 Objetivo Institucional
                    </p>
                    <p className="text-[13px] text-wb-ink-2 mt-0.5">
                      Estimular a criação de protótipos físicos, soluções tecnológicas regionais e
                      projetos de inovação que conectem estudantes, professores e a comunidade de
                      Breves.
                    </p>
                  </div>

                  <div className="rounded-xl border border-wb-line bg-wb-bench/70 p-4">
                    <p className="text-[13.5px] font-bold text-wb-ink">
                      🛠️ Tríade Ensino, Pesquisa e Extensão
                    </p>
                    <p className="text-[13px] text-wb-ink-2 mt-0.5">
                      Equipado com Impressoras 3D, Cortadoras a Laser CNC, Scanners 3D, Kits de
                      Robótica e Placas Arduino prontos para aulas práticas, TCCs e oficinas
                      abertas.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/agendamento"
                    onClick={() => setTourModalOpen(false)}
                    className="wb-btn wb-btn-primary h-11 px-5 text-[14px]"
                  >
                    Agendar Uso Agora
                  </Link>
                  <Link
                    to="/equipamentos"
                    onClick={() => setTourModalOpen(false)}
                    className="wb-btn border border-wb-line bg-white h-11 px-5 text-[14px] text-wb-ink hover:bg-wb-bench"
                  >
                    Ver Todas as Máquinas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

