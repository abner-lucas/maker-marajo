import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
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

// Remotion (Player + composição) só é baixado quando a seção monta
const PalcoMontagem = lazy(() => import('./remotion/PalcoMontagem'));

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
      <div ref={sectionRef} className="relative" style={{ height: '340svh' }}>
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
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="rotulo">
                  <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                  Como funciona · Da ideia ao protótipo
                </span>
              </div>
              <h2
                className="max-w-[11.5em] font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(38px, 6.4vw, 98px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.028em',
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
            className="absolute inset-0 z-10 flex items-start justify-center pt-[84px] lg:items-center lg:pl-[380px] xl:pl-[420px] lg:pt-[76px] pb-[70px] px-4"
            style={{
              opacity: hudFadeIn,
              transform: `scale(${0.95 + hudFadeIn * 0.05})`,
            }}
          >
            <div className="relative w-full max-w-[820px] aspect-[16/11] overflow-hidden rounded-[22px] wb-grid-bg flex flex-col shadow-[0_40px_80px_-40px_rgba(42,28,16,0.35)]">
              {/* Workbench Stage Header Bar */}
              <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                  <span className="ml-1 min-w-0 truncate font-key text-[11.5px] font-semibold tracking-[0.04em] text-wb-ink-2">
                    BANCADA_DIGITAL_IFMAKER_BREVES.CAD
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline"><span className="wb-key text-[11px]">180 mm × 125 mm</span></span>
                  <span
                    className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1 font-key text-[11px] font-semibold tracking-[0.03em] text-white transition-colors duration-500 ${
                      isSimulating
                        ? 'bg-wb-green'
                        : activeStepIndex === 0
                        ? 'bg-wb-ink'
                        : activeStepIndex === 1
                        ? 'bg-[#0b5c97]'
                        : 'bg-[#4b2a63]'
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
              <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                {/* Palco renderizado com Remotion; o quadro segue a rolagem */}
                <div
                  role="img"
                  aria-label="Visualização interativa da montagem do protótipo no IF MAKER"
                  className="absolute inset-0"
                >
                  <Suspense fallback={null}>
                    <PalcoMontagem progresso={stepProgress} />
                  </Suspense>
                </div>

                {/* Bottom CAD Quick Tools Dock (Exact Constructa CAD toolbar) */}
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-wb-ink/92 p-1.5 backdrop-blur absolute bottom-4 left-1/2 -translate-x-1/2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)]">
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
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors duration-500 ${
                        (activeStepIndex === 0 && i === 2) ||
                        (activeStepIndex === 1 && i === 4) ||
                        (activeStepIndex === 2 && i === 0)
                          ? 'bg-wb-canvas text-wb-ink'
                          : 'text-white/60'
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
                <div className="wb-modal p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="rotulo">
                      <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                      Etapa 01 · Modelagem 3D e Corte a Laser
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
                <div className="wb-modal p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="rotulo">
                      <span aria-hidden="true" className="marajo-glifo text-wb-blue" />
                      Etapa 02 · Eletrônica e Sensores
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
                  <div className="mt-4 border-t border-wb-line py-3">
                    <svg viewBox="0 0 380 125" className="w-full h-24">
                      <defs>
                        <linearGradient id="pinoLata" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#eef1f4" />
                          <stop offset="1" stopColor="#7d858d" />
                        </linearGradient>
                      </defs>
                      {/* Arduino UNO visto de cima: placa, chip DIP, USB e barra de pinos onde os fios chegam */}
                      <rect x="4" y="22" width="94" height="92" rx="6" fill="#0b5c97" />
                      <rect x="4" y="22" width="94" height="92" rx="6" fill="none" stroke="rgba(255,255,255,0.18)" />
                      <rect x="-2" y="32" width="20" height="18" rx="2" fill="url(#pinoLata)" />
                      <rect x="24" y="64" width="44" height="12" rx="2" fill="#141414" />
                      {Array.from({ length: 8 }).map((_, i) => (
                        <rect key={i} x={27 + i * 5.2} y="61" width="2" height="3" fill="#cfd2d6" />
                      ))}
                      <rect x="86" y="52" width="10" height="56" rx="1.5" fill="#141414" />
                      {[62, 74, 88, 102].map((y) => (
                        <rect key={y} x="89" y={y - 2} width="4" height="4" rx="0.8" fill="#5c5f63" />
                      ))}
                      <text x="46" y="100" textAnchor="middle" fontFamily="'Hanken Grotesk Variable', system-ui, sans-serif" fontSize="9.5" fontWeight="700" letterSpacing="0.8" fill="rgba(255,255,255,0.85)">
                        ARDUINO
                      </text>

                      {/* HC-SR04: placa, duas latas e os 4 pinos (VCC, Trig, Echo, GND) */}
                      <rect x="285" y="28" width="90" height="80" rx="6" fill="#0b5c97" />
                      {[52, 88].map((cy) => (
                        <g key={cy}>
                          <circle cx="335" cy={cy} r="15" fill="url(#pinoLata)" />
                          <circle cx="335" cy={cy} r="10.5" fill="#2a2c30" />
                        </g>
                      ))}
                      <rect x="283" y="52" width="8" height="56" rx="1.5" fill="#141414" />
                      {[58, 70, 84, 104].map((y) => (
                        <rect key={y} x="285" y={y - 2} width="4" height="4" rx="0.8" fill="#cfd2d6" />
                      ))}
                      <text x="335" y="121" textAnchor="middle" fontFamily="'Hanken Grotesk Variable', system-ui, sans-serif" fontSize="9.5" fontWeight="700" letterSpacing="0.8" fill="#4a453e">
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
                        <span aria-hidden="true" className="marajo-glifo text-wb-red" /> 5V
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
                <div className="wb-modal p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="rotulo">
                      <span aria-hidden="true" className="marajo-glifo text-wb-purple" />
                      Etapa 03 · Programação e Robótica
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
              className="relative flex items-center gap-1 border-t border-wb-line py-1.5"
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

