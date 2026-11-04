import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Check,
  Code2,
  Cpu,
  Grid,
  Layers,
  Move,
  Play,
  RotateCw,
  Scissors,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rangeProgress = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const ARDUINO_CODE_LINES = [
  '#include <IFMaker_Marajo.h>',
  '#include <NewPing.h>',
  '',
  '// === PINOS ARDUINO UNO / ESP32 ===',
  'const int PINO_MOTOR_ESQ = 5;',
  'const int PINO_MOTOR_DIR = 6;',
  'NewPing sonar(9, 10, 200); // Sensor HC-SR04',
  '',
  'void setup() {',
  '  Serial.begin(115200);',
  '  IFMaker.iniciarBancada("IFPA-Breves");',
  '}',
  '',
  'void loop() {',
  '  int distCm = sonar.ping_cm();',
  '  if (distCm > 22) {',
  '    IFMaker.avancarPWM(220);',
  '  } else {',
  '    IFMaker.desviarObstaculo();',
  '  }',
  '}',
];

const BUILD_PARTS = [
  { name: 'Chassi MDF Cortado a Laser (6mm)', range: [0.02, 0.10], color: '#E5484D', spec: '180 × 125 mm' },
  { name: 'Suportes Impressos em 3D (PLA+)', range: [0.09, 0.17], color: '#FF6B35', spec: 'Camada 0.16 mm' },
  { name: 'Motores Redutores + Rodas 4WD', range: [0.16, 0.24], color: '#23963C', spec: 'Torque 4.5 kgf·cm' },
  { name: 'Carenagem Escaneada em 3D', range: [0.23, 0.31], color: '#0092D6', spec: 'Malha 0.05 mm' },
];

const WIRES_LIST = [
  {
    label: '5V Alimentação (VCC)',
    color: '#EF4444',
    d: 'M 95 62 C 150 22, 220 22, 285 58',
    range: [0.36, 0.45],
  },
  {
    label: 'Terra Comum (GND)',
    color: '#1C2421',
    d: 'M 95 88 C 160 118, 225 118, 285 84',
    range: [0.44, 0.53],
  },
  {
    label: 'Sinal Trigger / Echo (Pinos 9-10)',
    color: '#FF6B35',
    d: 'M 95 74 C 175 55, 210 95, 285 70',
    range: [0.52, 0.60],
  },
  {
    label: 'PWM Ponte-H Motores (Pinos 5-6)',
    color: '#23963C',
    d: 'M 95 102 C 170 138, 230 132, 285 104',
    range: [0.59, 0.66],
  },
];

export const ScrollytellingSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [rawScroll, setRawScroll] = useState(0); // 0..1 across entire 460svh
  const [stepProgress, setStepProgress] = useState(0); // 0..1 after intro splash

  const INTRO_FRACTION = 0.18;

  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      ticking = false;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const s = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
      const p = clamp01((s - INTRO_FRACTION) / (1 - INTRO_FRACTION));
      setRawScroll(s);
      setStepProgress(p);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const introProgress = clamp01(rawScroll / INTRO_FRACTION);
  const introFadeOut = smoothstep(rangeProgress(introProgress, 0.15, 0.72));
  const hudFadeIn = smoothstep(rangeProgress(introProgress, 0.45, 0.98));

  const activeStepIndex = stepProgress >= 0.67 ? 2 : stepProgress >= 0.34 ? 1 : 0;
  const isSimulating = stepProgress >= 0.86;

  const jumpToStep = (stepIdx: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    const targetP =
      stepIdx === 3 ? 0.92 : stepIdx === 2 ? 0.72 : stepIdx === 1 ? 0.39 : 0.05;
    const targetS = INTRO_FRACTION + targetP * (1 - INTRO_FRACTION);
    window.scrollTo({
      top: top + scrollable * targetS,
      behavior: 'smooth',
    });
  };

  // Sub-progress values for the central visual workbench
  const pChassis = smoothstep(rangeProgress(stepProgress, 0.01, 0.1));
  const pMounts = smoothstep(rangeProgress(stepProgress, 0.09, 0.18));
  const pWheels = smoothstep(rangeProgress(stepProgress, 0.16, 0.25));
  const pShell = smoothstep(rangeProgress(stepProgress, 0.23, 0.32));
  const pArduinoBoard = smoothstep(rangeProgress(stepProgress, 0.34, 0.44));
  const pSensors = smoothstep(rangeProgress(stepProgress, 0.45, 0.56));
  const pWires = smoothstep(rangeProgress(stepProgress, 0.52, 0.66));
  const pCodeLines = Math.floor(
    rangeProgress(stepProgress, 0.68, 0.9) * ARDUINO_CODE_LINES.length
  );
  const pDrive = rangeProgress(stepProgress, 0.85, 1.0);

  return (
    <section id="como-funciona" className="bg-wb-canvas font-ui text-wb-ink border-b border-wb-line">
      <div ref={sectionRef} className="relative" style={{ height: '460svh' }}>
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          {/* Background 3D Workbench Grid Floor */}
          <div className="absolute inset-0 wb-grid-bg opacity-65 pointer-events-none" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="wb-floor" style={{ bottom: '-58%' }} />
          </div>

          {/* === LAYER 1: INTRO GIANT TYPOGRAPHY SPLASH (Constructa Style) === */}
          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center will-change-transform bg-wb-canvas/85 backdrop-blur-[2px]"
            style={{
              opacity: 1 - introFadeOut,
              transform: `translateY(${-introFadeOut * 64}px) scale(${1 - introFadeOut * 0.04})`,
              visibility: introFadeOut >= 0.99 ? 'hidden' : 'visible',
            }}
          >
            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-wb-line bg-wb-bench px-3.5 py-1.5 mb-5">
                <Sparkles className="h-4 w-4 text-wb-orange" />
                <span className="font-key text-[12px] font-bold uppercase tracking-wider text-wb-ink">
                  SCROLLYTELLING · FLUXO CRIATIVO IF MAKER BREVES
                </span>
              </div>
              <h2
                className="max-w-[11.5em] font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(38px, 6.4vw, 98px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.048em',
                }}
              >
                Tudo para aprender fazendo, em um só lugar.
              </h2>
              <p
                className="mt-6 max-w-[35em] text-wb-ink-2"
                style={{
                  fontSize: 'clamp(17px, 1.45vw, 21px)',
                  lineHeight: 1.55,
                }}
              >
                Modele na Impressora 3D e na Cortadora a Laser, conecte sensores na placa Arduino e
                programe seu robô. Role a página e veja um protótipo nascer passo a passo.
              </p>
            </div>
          </div>

          {/* === LAYER 2: INTERACTIVE WORKBENCH STAGE (Right / Center) === */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center lg:pl-[380px] xl:pl-[420px] pt-[76px] pb-[70px] px-4"
            style={{
              opacity: hudFadeIn,
              transform: `scale(${0.95 + hudFadeIn * 0.05})`,
            }}
          >
            <div className="relative w-full max-w-[760px] aspect-[16/11] rounded-[24px] border border-wb-line bg-white/90 shadow-[0_24px_60px_-20px_rgba(20,26,23,0.22)] backdrop-blur overflow-hidden flex flex-col">
              {/* Workbench Stage Header Bar */}
              <div className="flex items-center justify-between border-b border-wb-line bg-wb-bench/80 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-wb-red" />
                  <span className="h-2.5 w-2.5 rounded-full bg-wb-yellow" />
                  <span className="h-2.5 w-2.5 rounded-full bg-wb-green" />
                  <span className="ml-2 font-key text-[11.5px] font-bold text-wb-ink">
                    BANCADA_DIGITAL_IFMAKER_BREVES.CAD
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="wb-key text-[11px]">180 mm × 125 mm</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-key text-[11px] font-bold ${
                      isSimulating
                        ? 'bg-wb-green text-white animate-pulse'
                        : activeStepIndex === 0
                        ? 'bg-wb-orange/15 text-wb-orange'
                        : activeStepIndex === 1
                        ? 'bg-wb-blue/15 text-wb-blue'
                        : 'bg-wb-purple/15 text-wb-purple'
                    }`}
                  >
                    {isSimulating
                      ? '● ROBÔ EM MOVIMENTO'
                      : activeStepIndex === 0
                      ? 'ETAPA 01 · CAD 3D & LASER'
                      : activeStepIndex === 1
                      ? 'ETAPA 02 · ELETRÔNICA ARDUINO'
                      : 'ETAPA 03 · CÓDIGO & ROBÓTICA'}
                  </span>
                </div>
              </div>

              {/* Interactive SVG Assembly Canvas */}
              <div className="relative flex-1 wb-grid-bg flex items-center justify-center p-4 overflow-hidden">
                {/* Coordinate Axes */}
                <svg
                  viewBox="0 0 680 400"
                  className="w-full h-full max-h-[420px] select-none"
                  aria-label="Visualização interativa da montagem do protótipo no IF MAKER"
                >
                  <defs>
                    <filter id="partShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.16" />
                    </filter>
                  </defs>

                  {/* Green CAD Axis Lines */}
                  <line
                    x1="40"
                    y1="320"
                    x2="640"
                    y2="320"
                    stroke="#2FB36B"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    opacity="0.65"
                  />
                  <line
                    x1="340"
                    y1="30"
                    x2="340"
                    y2="370"
                    stroke="#2FB36B"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    opacity="0.45"
                  />

                  {/* Dimension Callouts (180 mm / 125 mm) */}
                  <g opacity={0.85}>
                    <line x1="170" y1="350" x2="510" y2="350" stroke="#141A17" strokeWidth="1.5" />
                    <line x1="170" y1="344" x2="170" y2="356" stroke="#141A17" strokeWidth="1.5" />
                    <line x1="510" y1="344" x2="510" y2="356" stroke="#141A17" strokeWidth="1.5" />
                    <rect x="305" y="339" width="70" height="22" rx="6" fill="#FFFFFF" stroke="#E1E7E3" />
                    <text
                      x="340"
                      y="354"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                      fontSize="11"
                      fontWeight="700"
                      fill="#141A17"
                    >
                      180 mm
                    </text>
                  </g>

                  {/* Master Robot Assembly Group (moves when simulating in Step 3!) */}
                  <g
                    transform={`translate(${
                      isSimulating ? Math.sin(pDrive * Math.PI * 4) * 38 : 0
                    }, 0)`}
                  >
                    {/* Ground Shadow */}
                    <ellipse
                      cx="340"
                      cy="312"
                      rx={145 * Math.max(0.3, pChassis)}
                      ry="14"
                      fill="rgba(20,26,23,0.12)"
                    />

                    {/* PART 1: Laser-Cut MDF Chassis Plate */}
                    <g
                      opacity={pChassis}
                      transform={`translate(0, ${(1 - pChassis) * -65})`}
                      filter="url(#partShadow)"
                    >
                      <rect
                        x="175"
                        y="215"
                        width="330"
                        height="34"
                        rx="10"
                        fill="#D97742"
                        stroke="#141A17"
                        strokeWidth="2.5"
                      />
                      <rect x="175" y="215" width="330" height="10" rx="5" fill="#F0945E" />
                      <text
                        x="340"
                        y="238"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        CHASSI MDF CORTE LASER CNC · 6MM
                      </text>
                    </g>

                    {/* PART 2: 3D Printed Orange Brackets & Motor Mounts */}
                    <g
                      opacity={pMounts}
                      transform={`translate(0, ${(1 - pMounts) * -55})`}
                      filter="url(#partShadow)"
                    >
                      <rect
                        x="195"
                        y="182"
                        width="68"
                        height="35"
                        rx="7"
                        fill="#FF6B35"
                        stroke="#141A17"
                        strokeWidth="2"
                      />
                      <rect
                        x="417"
                        y="182"
                        width="68"
                        height="35"
                        rx="7"
                        fill="#FF6B35"
                        stroke="#141A17"
                        strokeWidth="2"
                      />
                      <text
                        x="229"
                        y="203"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        3D PLA+
                      </text>
                      <text
                        x="451"
                        y="203"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        3D PLA+
                      </text>
                    </g>

                    {/* PART 3: 4WD Wheels & Motors */}
                    <g
                      opacity={pWheels}
                      transform={`translate(0, ${(1 - pWheels) * 50})`}
                      filter="url(#partShadow)"
                    >
                      {[225, 455].map((cx) => (
                        <g key={cx}>
                          <circle
                            cx={cx}
                            cy="268"
                            r="42"
                            fill="#1B2420"
                            stroke="#141A17"
                            strokeWidth="3"
                          />
                          <circle cx={cx} cy="268" r="22" fill="#F5C518" />
                          <circle cx={cx} cy="268" r="7" fill="#141A17" />
                        </g>
                      ))}
                    </g>

                    {/* PART 4: 3D Scanned Upper Structural Bridge */}
                    <g
                      opacity={pShell}
                      transform={`translate(0, ${(1 - pShell) * -50})`}
                      filter="url(#partShadow)"
                    >
                      <path
                        d="M 220 182 L 245 142 L 435 142 L 460 182 Z"
                        fill="#23963C"
                        stroke="#141A17"
                        strokeWidth="2.5"
                      />
                      <text
                        x="340"
                        y="167"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        ESTRUTURA IF MAKER · BREVES
                      </text>
                    </g>

                    {/* PART 5 (STEP 02): Arduino UNO + ESP32 Controller */}
                    <g
                      opacity={pArduinoBoard}
                      transform={`translate(0, ${(1 - pArduinoBoard) * -45})`}
                      filter="url(#partShadow)"
                    >
                      <rect
                        x="255"
                        y="94"
                        width="125"
                        height="48"
                        rx="8"
                        fill="#0092D6"
                        stroke="#141A17"
                        strokeWidth="2.5"
                      />
                      <rect x="268" y="106" width="44" height="16" rx="3" fill="#141A17" />
                      <text
                        x="318"
                        y="134"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        ARDUINO UNO R3
                      </text>
                    </g>

                    {/* PART 6 (STEP 02): Ultrasonic Sensor HC-SR04 + Solar IoT */}
                    <g
                      opacity={pSensors}
                      transform={`translate(${(1 - pSensors) * 45}, 0)`}
                      filter="url(#partShadow)"
                    >
                      <rect
                        x="458"
                        y="112"
                        width="42"
                        height="54"
                        rx="8"
                        fill="#70388E"
                        stroke="#141A17"
                        strokeWidth="2.5"
                      />
                      <circle cx="502" cy="126" r="10" fill="#E1E7E3" stroke="#141A17" strokeWidth="2" />
                      <circle cx="502" cy="150" r="10" fill="#E1E7E3" stroke="#141A17" strokeWidth="2" />
                      {/* Ultrasonic Sonar Waves when in Step 2 or 3 */}
                      {stepProgress > 0.5 && (
                        <g stroke="#2FB36B" strokeWidth="2.5" fill="none">
                          <path d="M 522 122 Q 535 138 522 154" opacity="0.9" />
                          <path d="M 534 114 Q 552 138 534 162" opacity="0.6" />
                          <path d="M 546 106 Q 568 138 546 170" opacity="0.35" />
                        </g>
                      )}
                    </g>

                    {/* PART 7 (STEP 02): Animated Pin-to-Pin Jumper Wires */}
                    {pWires > 0 && (
                      <g fill="none" strokeLinecap="round">
                        <path
                          d="M 380 110 C 415 80, 440 90, 462 124"
                          stroke="#EF4444"
                          strokeWidth="3.5"
                          strokeDasharray="120"
                          strokeDashoffset={120 * (1 - pWires)}
                        />
                        <path
                          d="M 380 122 C 420 120, 435 140, 462 146"
                          stroke="#FF6B35"
                          strokeWidth="3.5"
                          strokeDasharray="120"
                          strokeDashoffset={120 * (1 - pWires)}
                        />
                        <path
                          d="M 275 142 C 240 165, 225 180, 225 235"
                          stroke="#23963C"
                          strokeWidth="3.5"
                          strokeDasharray="140"
                          strokeDashoffset={140 * (1 - pWires)}
                        />
                      </g>
                    )}
                  </g>
                </svg>

                {/* Bottom CAD Quick Tools Dock (Exact Constructa CAD toolbar) */}
                <div className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-wb-line bg-white/95 px-3 py-2 shadow-md position absolute bottom-3 left-1/2 -translate-x-1/2">
                  {[
                    { icon: <Move className="h-3.5 w-3.5" />, label: 'Mover' },
                    { icon: <RotateCw className="h-3.5 w-3.5" />, label: 'Girar' },
                    { icon: <Layers className="h-3.5 w-3.5" />, label: 'Fatiar 3D' },
                    { icon: <Scissors className="h-3.5 w-3.5" />, label: 'Corte Laser' },
                    { icon: <Cpu className="h-3.5 w-3.5" />, label: 'Fiação' },
                    { icon: <Grid className="h-3.5 w-3.5" />, label: 'Grade 1mm' },
                  ].map((tool, i) => (
                    <div
                      key={tool.label}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold ${
                        (activeStepIndex === 0 && i === 2) ||
                        (activeStepIndex === 1 && i === 4) ||
                        (activeStepIndex === 2 && i === 0)
                          ? 'bg-wb-ink text-white'
                          : 'text-wb-ink-2 bg-wb-bench/60'
                      }`}
                    >
                      {tool.icon}
                      <span>{tool.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* === LAYER 3: FLOATING STEP CARDS ON LEFT (Constructa 01 / 02 / 03 Cards) === */}
          <div
            className="pointer-events-none relative z-20 mx-auto flex h-full max-w-[1320px] px-5 sm:px-8"
            style={{
              opacity: hudFadeIn,
              transform: `translateY(${(1 - hudFadeIn) * 32}px)`,
            }}
          >
            <div className="pointer-events-auto absolute left-4 right-4 bottom-20 sm:left-8 sm:right-auto top-auto lg:top-[96px] lg:bottom-auto lg:w-[390px]">
              {/* STEP 01 CARD: CAD 3D & LASER */}
              {activeStepIndex === 0 && (
                <div className="wb-panel p-5 sm:p-6 bg-white/95 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="font-key text-[12px] font-bold text-wb-orange">
                      01 / PROTOTIPAGEM 3D & CNC
                    </span>
                    <span className="wb-key">CAD · STL · DXF</span>
                  </div>
                  <h3 className="mt-2 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                    Modele e Construa.
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-wb-ink-2">
                    Desenhe o chassi para a Cortadora a Laser, imprima suportes e engrenagens nas
                    Impressoras 3D ou digitalize peças reais no Scanner 3D.
                  </p>

                  <div className="mt-4 space-y-2 border-t border-wb-line pt-3.5">
                    {BUILD_PARTS.map((part) => {
                      const prog = rangeProgress(stepProgress, part.range[0], part.range[1]);
                      return (
                        <div key={part.name} className="text-[12.5px]">
                          <div className="flex items-center justify-between font-semibold text-wb-ink">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: part.color }}
                              />
                              {part.name}
                            </span>
                            <span className="font-key text-[11px] text-wb-ink-3">{part.spec}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-wb-bench">
                            <div
                              className="h-full rounded-full transition-all duration-150"
                              style={{
                                width: `${Math.round(prog * 100)}%`,
                                backgroundColor: part.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 02 CARD: ARDUINO & SENSORS WIRING */}
              {activeStepIndex === 1 && (
                <div className="wb-panel p-5 sm:p-6 bg-white/95 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="font-key text-[12px] font-bold text-wb-blue">
                      02 / ELETRÔNICA & ARDUINO
                    </span>
                    <span className="wb-key">UNO R3 · ESP32</span>
                  </div>
                  <h3 className="mt-2 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                    Conecte pino a pino.
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-wb-ink-2">
                    Fixe a placa Arduino ou ESP32 no topo, adicione sensores ultrassônicos e
                    ambientais e conecte os jumpers na protoboard com clareza visual.
                  </p>

                  {/* Interactive SVG Pin-to-Pin Mini Widget */}
                  <div className="mt-4 rounded-xl border border-wb-line bg-wb-bench/70 p-3">
                    <svg viewBox="0 0 380 125" className="w-full h-24">
                      <rect
                        x="10"
                        y="25"
                        width="85"
                        height="85"
                        rx="8"
                        fill="#0092D6"
                        stroke="#141A17"
                        strokeWidth="2"
                      />
                      <text
                        x="52"
                        y="72"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        ARDUINO
                      </text>

                      <rect
                        x="285"
                        y="25"
                        width="85"
                        height="85"
                        rx="8"
                        fill="#70388E"
                        stroke="#141A17"
                        strokeWidth="2"
                      />
                      <text
                        x="327"
                        y="72"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="700"
                        fill="#FFF"
                      >
                        SENSORES
                      </text>

                      {WIRES_LIST.map((w) => {
                        const wp = smoothstep(
                          rangeProgress(stepProgress, w.range[0], w.range[1])
                        );
                        return (
                          <path
                            key={w.label}
                            d={w.d}
                            fill="none"
                            stroke={w.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray="1"
                            strokeDashoffset={1 - wp}
                            opacity={wp > 0 ? 1 : 0.15}
                          />
                        );
                      })}
                    </svg>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-key text-wb-ink-2">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-wb-red" /> 5V
                        <span className="h-2 w-2 rounded-full bg-wb-ink ml-1" /> GND
                        <span className="h-2 w-2 rounded-full bg-wb-orange ml-1" /> Sinal
                      </span>
                      <span className="font-bold text-wb-green">
                        {Math.min(4, Math.ceil(rangeProgress(stepProgress, 0.35, 0.65) * 4))}/4
                        fios conectados
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 03 CARD: CODE & SIMULATION */}
              {activeStepIndex === 2 && (
                <div className="wb-panel p-5 sm:p-6 bg-white/95 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="font-key text-[12px] font-bold text-wb-purple">
                      03 / ROBÓTICA & CÓDIGO C++
                    </span>
                    <span className="wb-key">ARDUINO IDE · BLOCOS</span>
                  </div>
                  <h3 className="mt-2 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                    Programe e Simule.
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-wb-ink-2">
                    Comece com blocos lógicos ou escreva C++ real para Arduino. Ao compilar, seu
                    protótipo responde imediatamente aos sensores na bancada.
                  </p>

                  {/* Live Code Terminal */}
                  <div className="mt-4 rounded-xl bg-[#101614] p-3.5 font-key text-[11px] leading-[1.45] text-emerald-300 shadow-inner max-h-[190px] overflow-hidden">
                    {ARDUINO_CODE_LINES.slice(0, Math.max(4, pCodeLines)).map((line, idx) => (
                      <div key={idx} className="flex gap-2.5">
                        <span className="select-none text-white/30 w-4 text-right">
                          {idx + 1}
                        </span>
                        <span className="truncate">{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === LAYER 4: BOTTOM / RIGHT STEP PILL NAVIGATOR (Constructa Stepper) === */}
          <div
            className="pointer-events-auto absolute inset-x-0 bottom-3 z-20 flex justify-center px-4"
            style={{ opacity: hudFadeIn }}
          >
            <div
              role="group"
              aria-label="Etapas do fluxo criativo IF MAKER"
              className="relative flex items-center gap-1 rounded-[16px] border border-wb-line bg-white/95 p-1.5 shadow-lg backdrop-blur"
            >
              {[
                { idx: 0, num: '01', label: 'Modelar 3D & Laser' },
                { idx: 1, num: '02', label: 'Conectar Arduino' },
                { idx: 2, num: '03', label: 'Programar Robô' },
              ].map((st) => (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => jumpToStep(st.idx)}
                  className={`whitespace-nowrap rounded-[11px] px-3 py-2 text-[12.5px] sm:text-[13px] font-bold transition-colors ${
                    activeStepIndex === st.idx
                      ? 'bg-wb-ink text-white'
                      : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
                  }`}
                >
                  <span className="font-key text-[11px] opacity-65 mr-1">{st.num}</span>
                  {st.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => jumpToStep(3)}
                className={`whitespace-nowrap rounded-[11px] px-3 py-2 text-[12.5px] sm:text-[13px] font-bold inline-flex items-center gap-1.5 transition-colors ${
                  isSimulating
                    ? 'bg-wb-green text-white'
                    : 'bg-wb-orange/15 text-wb-orange hover:bg-wb-orange hover:text-white'
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Testar</span>
              </button>

              {/* Progress Bar under Stepper */}
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-3 right-3 h-[3px] overflow-hidden rounded-full bg-wb-line"
              >
                <span
                  className="block h-full origin-left bg-wb-orange transition-transform duration-100"
                  style={{ transform: `scaleX(${stepProgress.toFixed(3)})` }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

