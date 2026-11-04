import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Check, Cpu, Layers, Sparkles, Sliders, Code2 } from 'lucide-react';

const ENVS = [
  { key: 'marajo', label: 'Solo Marajó', dot: '#23963C', g: 9.81, bounce: 18, speed: 2.3 },
  { key: 'arena', label: 'Arena OBR', dot: '#FF6B35', g: 9.81, bounce: 8, speed: 3.2 },
  { key: 'moon', label: 'Lua', dot: '#F5C518', g: 1.62, bounce: 42, speed: 1.15 },
  { key: 'zero', label: 'Zero-G', dot: '#0092D6', g: 0.0, bounce: 68, speed: 0.75 },
] as const;

type EnvKey = (typeof ENVS)[number]['key'];

export const InteractiveBentoFeatures: React.FC = () => {
  // Card 1 State: Physics & Robotics Simulator
  const [env, setEnv] = useState<EnvKey>('moon');
  const [simRunning, setSimRunning] = useState(true);
  const robotGroupRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const simStateRef = useRef({ env: 'moon' as EnvKey, running: true });
  simStateRef.current = { env, running: simRunning };

  // Card 3 State: Ultrasonic Sensor Distance
  const [distanceCm, setDistanceCm] = useState(24);

  // Card 4 State: 3D Slicer Layer Preview
  const [layerPct, setLayerPct] = useState(78);

  // Card 5 State: Blocks vs C++ Toggle
  const [codeMode, setCodeMode] = useState<'blocks' | 'cpp'>('blocks');

  // Card 6 State: Institutional Pillar
  const [activePillar, setActivePillar] = useState<'Ensino' | 'Pesquisa' | 'Extensão'>('Ensino');

  useEffect(() => {
    let rafId = 0;
    let yPos = 0;
    let rotAngle = 0;
    const start = performance.now();

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      const t = (now - start) / 1000;
      const { env: curEnv, running } = simStateRef.current;

      let targetY = 0;
      let targetRot = 0;

      if (running) {
        if (curEnv === 'moon') {
          targetY = -36 * Math.abs(Math.sin(t * 1.25));
          targetRot = Math.sin(t * 1.25) * 4;
        } else if (curEnv === 'marajo') {
          targetY = -16 * Math.abs(Math.sin(t * 2.4));
          targetRot = Math.sin(t * 4.8) * 3.5;
        } else if (curEnv === 'arena') {
          targetY = -6 * Math.abs(Math.sin(t * 4.2));
          targetRot = Math.sin(t * 2.1) * 1.5;
        } else if (curEnv === 'zero') {
          targetY = -64 + 9 * Math.sin(t * 0.95);
          targetRot = -18 + 8 * Math.sin(t * 0.65);
        }
      }

      const lerpFactor = curEnv === 'zero' ? 0.035 : 0.18;
      yPos += (targetY - yPos) * lerpFactor;
      rotAngle += (targetRot - rotAngle) * 0.08;

      if (robotGroupRef.current) {
        robotGroupRef.current.setAttribute(
          'transform',
          `translate(0 ${yPos.toFixed(2)}) rotate(${rotAngle.toFixed(2)} 210 150)`
        );
      }
      if (shadowRef.current) {
        const hRatio = Math.min(1, -yPos / 80);
        shadowRef.current.setAttribute('rx', String((92 - 44 * hRatio).toFixed(1)));
        shadowRef.current.setAttribute('opacity', String((0.22 - 0.16 * hRatio).toFixed(2)));
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const currentEnvObj = ENVS.find((e) => e.key === env) || ENVS[0];

  return (
    <section
      id="recursos"
      className="scroll-mt-20 bg-wb-canvas pt-24 pb-20 font-ui text-wb-ink sm:pt-32"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Section Header (Exact Constructa `qi` header layout) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <p className="rotulo">
              <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
              Aprender fazendo · Prática no laboratório
            </p>
            <h2
              className="mt-3 font-brand font-bold text-wb-ink"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.04,
                letterSpacing: '-0.028em',
              }}
            >
              Por que criar no IF MAKER Breves.
            </h2>
          </div>
          <p className="text-[16px] leading-relaxed text-wb-ink-2 md:text-right max-w-[34em] md:ml-auto">
            Não fique apenas na teoria. Cada card abaixo é uma demonstração interativa do que você
            encontra nas bancadas do Laboratório IFPA MAKER Marajó. Clique e teste agora.
          </p>
        </div>

        {/* 6-Card Interactive Bento Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {/* === CARD 1 (2x2 Span): ROBOTICS & PHYSICS SIMULATOR === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px] md:col-span-2 lg:row-span-2">
            <div className="relative overflow-hidden border-b border-wb-line bg-wb-bench wb-grid-bg h-[460px] sm:h-[400px] lg:h-auto lg:min-h-[420px] lg:flex-1">
              <svg
                viewBox="0 0 420 250"
                className="absolute inset-x-0 top-2 h-[54%] w-full sm:inset-y-0 sm:top-0 sm:h-full sm:w-[62%]"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="214"
                  x2="420"
                  y2="214"
                  stroke="var(--wb-axis)"
                  strokeOpacity="0.65"
                  strokeWidth="2"
                />
                <ellipse
                  ref={shadowRef}
                  cx="210"
                  cy="217"
                  rx="92"
                  ry="6"
                  fill="rgba(20,26,23,0.18)"
                />
                <g ref={robotGroupRef}>
                  {[150, 270].map((x, idx) => (
                    <g key={x}>
                      <line
                        x1={x}
                        y1="150"
                        x2={x + (idx ? 18 : -18)}
                        y2="182"
                        stroke="#23963C"
                        strokeWidth="11"
                        strokeLinecap="round"
                      />
                      <line
                        x1={x + (idx ? 18 : -18)}
                        y1="182"
                        x2={x + (idx ? 6 : -6)}
                        y2="208"
                        stroke="#23963C"
                        strokeWidth="9"
                        strokeLinecap="round"
                      />
                      <circle cx={x} cy="150" r="10" fill="#1A1F22" />
                    </g>
                  ))}
                  <rect x="112" y="104" width="196" height="48" rx="9" fill="#FF6B35" />
                  <rect x="112" y="104" width="196" height="10" rx="5" fill="#FF8559" />
                  <text
                    x="205"
                    y="134"
                    textAnchor="middle"
                    fontFamily="'Hanken Grotesk Variable', system-ui, sans-serif"
                    fontSize="11"
                    fontWeight="700"
                    fill="#FFF"
                  >
                    ROVER IFPA · BREVES
                  </text>
                  <rect x="148" y="92" width="78" height="12" rx="3" fill="#0092D6" />
                  <rect x="236" y="93" width="34" height="11" rx="3" fill="#70388E" />
                  <path d="M168 92 L172 78 L186 78 L190 92 Z" fill="#141A17" />
                  <rect x="306" y="114" width="8" height="30" rx="2" fill="#23963C" />
                  <circle cx="324" cy="121" r="8" fill="#D9DEE2" stroke="#141A17" strokeWidth="1.5" />
                  <circle cx="324" cy="138" r="8" fill="#D9DEE2" stroke="#141A17" strokeWidth="1.5" />
                </g>
              </svg>

              {/* Floating Control Panel inside Card 1 */}
              <div className="absolute inset-x-3 bottom-3 rounded-[16px] border border-wb-line bg-white/95 p-4 shadow-[0_14px_30px_-16px_rgba(28,36,33,0.35)] backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-[252px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#FFF0E9] text-wb-orange">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                    <span className="text-[12.5px] font-bold tracking-[0.02em] text-wb-ink">
                      BANCADA ROBÓTICA
                    </span>
                  </div>
                  <span className="wb-key text-[10px]">FÍSICA REAL</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSimRunning((r) => !r)}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[12.5px] font-bold transition-colors ${
                    simRunning
                      ? 'bg-wb-ink text-white'
                      : 'bg-wb-orange text-white hover:bg-wb-orange/90'
                  }`}
                >
                  {simRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pausar Simulação
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" /> Iniciar Simulação
                    </>
                  )}
                </button>

                <p className="mt-3 font-key text-[10.5px] text-wb-ink-3">
                  Ambiente de Teste
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {ENVS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setEnv(item.key);
                        setSimRunning(true);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all ${
                        env === item.key
                          ? 'border-wb-ink bg-wb-bench text-wb-ink font-bold shadow-sm'
                          : 'border-wb-line bg-white text-wb-ink-2 hover:bg-wb-bench/50'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.dot }}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-wb-line pt-2.5 font-key text-[11.5px]">
                  <span className="text-wb-ink-3">Gravidade:</span>
                  <span className="font-bold text-wb-ink">{currentEnvObj.g.toFixed(2)} m/s²</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <h3
                className="font-brand text-[22px] font-bold leading-tight text-wb-ink"
                style={{ letterSpacing: '-0.028em' }}
              >
                Robótica e Física que contam a verdade.
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2">
                Alterne entre Solo Marajó, Arena OBR ou Gravidade Zero acima. No IF MAKER Breves,
                você simula torque, atrito e cinemática antes mesmo de ligar os motores na arena
                física.
              </p>
            </div>
          </article>

          {/* === CARD 2: ZERO COST FOR STUDENTS & PUBLIC SCHOOLS === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden border-b border-wb-line bg-wb-bench wb-grid-bg h-[230px] p-4 flex items-center justify-center">
              <div className="w-full max-w-[290px] border-t border-wb-line py-3.5 text-[12px]">
                <div className="flex items-center justify-between border-b border-wb-line pb-2">
                  <span className="font-bold text-wb-ink">Custo Comercial Externo</span>
                  <span className="wb-key text-[10px]">PROTOTIPAGEM</span>
                </div>
                <div className="mt-2 space-y-1 text-wb-ink-2 font-key text-[11px]">
                  <div className="flex justify-between">
                    <span>Impressão 3D + Filamento</span>
                    <span className="line-through opacity-60">R$ 420</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora Cortadora Laser CNC</span>
                    <span className="line-through opacity-60">R$ 280</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kit Arduino + Sensores + Scanner</span>
                    <span className="line-through opacity-60">R$ 890</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-wb-line pt-2">
                  <span className="font-bold text-wb-ink">No IF MAKER Breves:</span>
                  <span className="rounded-full bg-wb-green px-2.5 py-0.5 font-key text-[12px] font-extrabold text-white">
                    R$ 0,00 · Gratuito
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <h3
                className="font-brand text-[21px] font-bold leading-tight text-wb-ink"
                style={{ letterSpacing: '-0.028em' }}
              >
                Acesso público e gratuito.
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2">
                Estudantes, pesquisadores e projetos comunitários do Marajó contam com máquinas de
                ponta sem custo para transformar ideias em protótipos reais.
              </p>
            </div>
          </article>

          {/* === CARD 3: INTERACTIVE ARDUINO ULTRASONIC SENSOR === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden border-b border-wb-line bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-t border-wb-line py-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-wb-purple" />
                  <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-ink" />
                    Arduino · HC-SR04
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-key text-[11px] font-bold ${
                    distanceCm < 20
                      ? 'bg-wb-red/15 text-wb-red'
                      : 'bg-wb-green/15 text-wb-green'
                  }`}
                >
                  {distanceCm < 20 ? 'OBSTÁCULO!' : 'LIVRE'} · {distanceCm} cm
                </span>
              </div>

              {/* Visual Ultrasonic Beam */}
              <div className="my-auto flex items-center gap-3 px-2">
                <div className="rounded-xl bg-[#0092D6] px-3 py-3 text-white font-key text-[10px] font-bold shadow">
                  Sonar
                </div>
                <div className="flex-1 relative h-3 rounded-full bg-wb-line overflow-hidden">
                  <div
                    className="h-full transition-all duration-100 rounded-full"
                    style={{
                      width: `${Math.min(100, (distanceCm / 100) * 100)}%`,
                      backgroundColor: distanceCm < 20 ? '#E5484D' : '#2FB36B',
                    }}
                  />
                </div>
                <div className="rounded-lg border-2 border-wb-ink bg-wb-orange px-2.5 py-2 font-key text-[10px] font-bold text-white">
                  Alvo
                </div>
              </div>

              <div className="border-t border-wb-line py-2">
                <label className="flex items-center justify-between text-[11px] font-key text-wb-ink-2">
                  <span>Arraste o obstáculo:</span>
                  <span className="font-bold text-wb-ink">{distanceCm} cm</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={distanceCm}
                  onChange={(e) => setDistanceCm(Number(e.target.value))}
                  className="mt-1 w-full accent-wb-orange cursor-pointer"
                />
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <h3
                className="font-brand text-[21px] font-bold leading-tight text-wb-ink"
                style={{ letterSpacing: '-0.028em' }}
              >
                Eletrônica que você enxerga.
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2">
                Arraste o controle acima para testar o sensor ultrassônico. Nossas bancadas Arduino
                e ESP32 têm +45 sensores prontos para ligar pino a pino.
              </p>
            </div>
          </article>

          {/* === CARD 4: 3D PRINTING SLICER & LASER PREVIEW === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden border-b border-wb-line bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="wb-key bg-white">FATIADOR 3D · CAMADAS</span>
                <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                  Camada {layerPct}/100
                </span>
              </div>

              {/* Stacked 3D Layers Visual */}
              <div className="my-auto flex flex-col-reverse items-center justify-center h-24 gap-[2px]">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const threshold = (idx + 1) * 10;
                  const active = layerPct >= threshold - 5;
                  const widthPx = 140 - idx * 7;
                  return (
                    <div
                      key={idx}
                      className="h-2 rounded-full transition-all duration-150"
                      style={{
                        width: `${widthPx}px`,
                        backgroundColor: active
                          ? idx === Math.floor(layerPct / 10) - 1
                            ? '#23963C'
                            : '#FF6B35'
                          : '#E1E7E3',
                        opacity: active ? 1 : 0.35,
                      }}
                    />
                  );
                })}
              </div>

              <div className="border-t border-wb-line py-2">
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={layerPct}
                  onChange={(e) => setLayerPct(Number(e.target.value))}
                  className="w-full accent-wb-orange cursor-pointer"
                  aria-label="Inspecionar camada de impressão 3D"
                />
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <h3
                className="font-brand text-[21px] font-bold leading-tight text-wb-ink"
                style={{ letterSpacing: '-0.028em' }}
              >
                Impressão 3D e Laser ao vivo.
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2">
                Inspecione cada camada do seu arquivo .STL ou .DXF antes de produzir nas 6
                Impressoras 3D e na Cortadora a Laser CNC de 100W.
              </p>
            </div>
          </article>

          {/* === CARD 5: BLOCKS TO REAL ARDUINO C++ === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden border-b border-wb-line bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="inline-flex border-t border-wb-line py-0.5">
                  <button
                    type="button"
                    onClick={() => setCodeMode('blocks')}
                    className={`rounded-md px-2.5 py-1 text-[11.5px] font-bold transition-colors ${
                      codeMode === 'blocks' ? 'bg-wb-ink text-white' : 'text-wb-ink-2'
                    }`}
                  >
                    Blocos Visuais
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeMode('cpp')}
                    className={`rounded-md px-2.5 py-1 text-[11.5px] font-bold transition-colors ${
                      codeMode === 'cpp' ? 'bg-wb-ink text-white' : 'text-wb-ink-2'
                    }`}
                  >
                    Arduino C++
                  </button>
                </div>
                <span className="wb-key text-[10px]">ENSINO MÉDIO & SUPERIOR</span>
              </div>

              {codeMode === 'blocks' ? (
                <div className="my-auto space-y-1.5 font-ui text-[12px] font-bold text-white">
                  <div className="rounded-lg bg-[#FF6B35] px-3 py-1.5 w-fit">
                    ⚡ quando o robô iniciar
                  </div>
                  <div className="rounded-lg bg-[#0092D6] px-3 py-1.5 ml-4 w-fit">
                    📏 se distância sonar &lt; 20 cm então
                  </div>
                  <div className="rounded-lg bg-[#23963C] px-3 py-1.5 ml-8 w-fit">
                    🔄 girar motores 90° para esquerda
                  </div>
                </div>
              ) : (
                <pre className="my-auto rounded-xl bg-[#121816] p-3 font-key text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
                  {`void loop() {\n  if (sonar.ping_cm() < 20) {\n    girarEsquerda(90);\n  }\n}`}
                </pre>
              )}

              <p className="text-[11px] font-key text-wb-ink-3">
                Clique nas abas acima para alternar entre Blocos e C++
              </p>
            </div>
            <div className="p-6 sm:p-7">
              <h3
                className="font-brand text-[21px] font-bold leading-tight text-wb-ink"
                style={{ letterSpacing: '-0.028em' }}
              >
                Dos blocos ao código C++ real.
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2">
                Iniciantes começam com programação em blocos e avançam no seu ritmo para C++ e
                Python embarcados.
              </p>
            </div>
          </article>

          {/* === CARD 6: 5TH LAB DELIVERED IN MARCH 2026 (ENSINO, PESQUISA, EXTENSÃO) === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden border-b border-wb-line bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
              <div className="flex gap-1 border-t border-wb-line py-1">
                {(['Ensino', 'Pesquisa', 'Extensão'] as const).map((pillar) => (
                  <button
                    key={pillar}
                    type="button"
                    onClick={() => setActivePillar(pillar)}
                    className={`flex-1 rounded-lg py-1.5 text-[12px] font-bold transition-colors ${
                      activePillar === pillar
                        ? 'bg-wb-green text-white'
                        : 'text-wb-ink-2 hover:bg-wb-bench'
                    }`}
                  >
                    {pillar}
                  </button>
                ))}
              </div>

              <div className="my-auto border-t border-wb-line py-3.5">
                {activePillar === 'Ensino' && (
                  <p className="text-[12.5px] text-wb-ink leading-snug">
                    <strong>Aulas Práticas Multidisciplinares:</strong> Física, Biologia, Geografia,
                    Informática e Edificações usando modelos táteis 3D e kits montáveis.
                  </p>
                )}
                {activePillar === 'Pesquisa' && (
                  <p className="text-[12.5px] text-wb-ink leading-snug">
                    <strong>Iniciação Científica & TCCs:</strong> Instrumentação IoT para rios e
                    florestas, bioengenharia, escaneamento 3D e automação para a Amazônia.
                  </p>
                )}
                {activePillar === 'Extensão' && (
                  <p className="text-[12.5px] text-wb-ink leading-snug">
                    <strong>Portas Abertas ao Marajó:</strong> Oficinas para escolas públicas de
                    Breves, Makeathons e apoio a produtores e artesãos locais.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-key text-wb-ink-2">
                <span>IFPA Campus Breves · Marajó</span>
                <span className="font-bold text-wb-green">● Ensino, Pesquisa e Extensão</span>
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <h3
                className="font-brand text-[21px] font-bold leading-tight text-wb-ink"
                style={{ letterSpacing: '-0.028em' }}
              >
                Ensino, Pesquisa e Extensão.
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2">
                O laboratório integra sala de aula, iniciação científica e
                soluções tecnológicas para os desafios reais de Breves e do Marajó.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

