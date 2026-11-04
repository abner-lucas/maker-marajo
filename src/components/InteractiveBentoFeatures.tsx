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
  // Pernas (perto e longe) redesenhadas a cada quadro por cinemática inversa de 2 elos
  const pernasRef = useRef<(SVGPathElement | null)[]>([]);
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

    // Só anima com a seção visível (economiza CPU/bateria fora da tela)
    let visivel = false;
    const loop = (now: number) => {
      if (!visivel) {
        rafId = 0;
        return;
      }
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
      // Visual derivado da mesma altura yPos: pés buscam o chão, joelho dobra no apoio e
      // a perna estica quando o robô está no ar (cinemática inversa, não simulação de força)
      pernasRef.current.forEach((el, i) => {
        if (!el) return;
        const quadril = i % 2 === 0 ? 150 : 270;
        const longe = i >= 2;
        const hx = quadril + (longe ? 12 : 0);
        const hy = 150;
        const fx = hx + (i % 2 === 0 ? -14 : 14);
        const fy = 209 - yPos;
        const L1 = 34;
        const L2 = 36;
        let dx = fx - hx;
        let dy = fy - hy;
        let d = Math.hypot(dx, dy);
        const max = L1 + L2 - 0.5;
        if (d > max) {
          dx *= max / d;
          dy *= max / d;
          d = max;
        }
        const a = Math.atan2(dy, dx);
        const b = Math.acos(Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
        const dobra = i % 2 === 0 ? 1 : -1;
        const kx = hx + Math.cos(a + b * dobra) * L1;
        const ky = hy + Math.sin(a + b * dobra) * L1;
        el.setAttribute('d', `M${hx} ${hy} L${kx.toFixed(1)} ${ky.toFixed(1)} L${(hx + dx).toFixed(1)} ${(hy + dy).toFixed(1)}`);
      });
      if (shadowRef.current) {
        const hRatio = Math.min(1, -yPos / 80);
        shadowRef.current.setAttribute('rx', String((92 - 44 * hRatio).toFixed(1)));
        shadowRef.current.setAttribute('opacity', String((0.22 - 0.16 * hRatio).toFixed(2)));
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !rafId) rafId = requestAnimationFrame(loop);
    });
    if (robotGroupRef.current) io.observe(robotGroupRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
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
              Por que criar <span className="acento text-wb-orange">aqui</span>.
            </h2>
          </div>
          <p className="text-[16px] leading-relaxed text-wb-ink-2 md:text-right max-w-[34em] md:ml-auto">
            Cada bloco abaixo é interativo. Mexa e veja.
          </p>
        </div>

        {/* 6-Card Interactive Bento Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {/* === CARD 1 (2x2 Span): ROBOTICS & PHYSICS SIMULATOR === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px] md:col-span-2 lg:row-span-2">
            <div className="relative overflow-hidden rounded-[18px] bg-wb-bench wb-grid-bg h-[460px] sm:h-[400px] lg:h-auto lg:min-h-[420px] lg:flex-1">
              <svg
                viewBox="0 0 420 250"
                className="absolute inset-x-0 top-2 h-[54%] w-full sm:inset-y-0 sm:top-0 sm:h-full sm:w-[62%]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="roverCasco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f07a45" />
                    <stop offset="1" stopColor="#c84a1a" />
                  </linearGradient>
                  <linearGradient id="roverMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#eef1f4" />
                    <stop offset="0.5" stopColor="#a9b1b9" />
                    <stop offset="1" stopColor="#6d757d" />
                  </linearGradient>
                  <linearGradient id="roverChao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(42,28,16,0.10)" />
                    <stop offset="1" stopColor="rgba(42,28,16,0)" />
                  </linearGradient>
                  <pattern id="roverCamadas" width="6" height="2.4" patternUnits="userSpaceOnUse">
                    <rect width="6" height="1.2" fill="rgba(0,0,0,0.07)" />
                  </pattern>
                  <filter id="roverSombra" x="-50%" y="-200%" width="200%" height="500%">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>
                {/* chão: só a sombra de contato, sobre o piso de estúdio do cartão */}
                <ellipse
                  ref={shadowRef}
                  cx="210"
                  cy="216"
                  rx="92"
                  ry="6"
                  fill="rgba(42,28,16,0.5)"
                  filter="url(#roverSombra)"
                />
                <g ref={robotGroupRef}>
                  {/* pernas do lado de lá (mais escuras, atrás do corpo) */}
                  {[2, 3].map((i) => (
                    <path
                      key={i}
                      ref={(el) => {
                        pernasRef.current[i] = el;
                      }}
                      d=""
                      fill="none"
                      stroke="#3b3f45"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {/* chapa MDF cortada a laser */}
                  <rect x="112" y="140" width="196" height="9" rx="2" fill="#c99c6c" stroke="#5b3a22" strokeWidth="1.2" />
                  {/* casco impresso em PLA com linhas de camada */}
                  <path d="M120 140 L128 106 Q130 101 136 101 L290 101 Q296 101 298 106 L304 140 Z" fill="url(#roverCasco)" />
                  <path d="M120 140 L128 106 Q130 101 136 101 L290 101 Q296 101 298 106 L304 140 Z" fill="url(#roverCamadas)" />
                  <path d="M132 103 L292 103" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
                  <text
                    x="212"
                    y="127"
                    textAnchor="middle"
                    fontFamily="'Hanken Grotesk Variable', system-ui, sans-serif"
                    fontSize="10.5"
                    fontWeight="700"
                    letterSpacing="0.6"
                    fill="rgba(60,20,4,0.55)"
                  >
                    ROVER IFPA · BREVES
                  </text>
                  {/* Arduino UNO sobre o casco */}
                  <rect x="146" y="94" width="80" height="7" rx="1.5" fill="#0b5c97" />
                  <rect x="152" y="89" width="34" height="5" rx="1" fill="#1a1b1d" />
                  <rect x="192" y="89" width="28" height="5" rx="1" fill="#1a1b1d" />
                  <rect x="140" y="88" width="12" height="9" rx="1" fill="url(#roverMetal)" />
                  {/* célula 18650 */}
                  <rect x="236" y="90" width="36" height="11" rx="5.5" fill="#2257b8" />
                  <rect x="270" y="92" width="3" height="7" rx="1" fill="#d9dadc" />
                  {/* suporte do sensor */}
                  <path d="M168 89 L172 78 L186 78 L190 89 Z" fill="#2b2d31" />
                  {/* HC-SR04 na frente: placa + duas latas metálicas */}
                  <rect x="304" y="108" width="5" height="36" rx="1.5" fill="#0b5c97" />
                  {[114, 130].map((y) => (
                    <g key={y}>
                      <rect x="309" y={y} width="14" height="13" rx="2" fill="url(#roverMetal)" />
                      <rect x="321" y={y + 1.5} width="3" height="10" rx="1" fill="#2a2c30" />
                    </g>
                  ))}
                  {/* pernas do lado de cá */}
                  {[0, 1].map((i) => (
                    <path
                      key={i}
                      ref={(el) => {
                        pernasRef.current[i] = el;
                      }}
                      d=""
                      fill="none"
                      stroke="url(#roverMetal)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {/* servos do quadril com braço de alumínio */}
                  {[150, 270].map((x) => (
                    <g key={x}>
                      <circle cx={x} cy="150" r="11" fill="#1a1b1d" />
                      <circle cx={x} cy="150" r="5.5" fill="url(#roverMetal)" />
                      <circle cx={x} cy="150" r="1.6" fill="#1a1b1d" />
                    </g>
                  ))}
                </g>
              </svg>

              {/* Floating Control Panel inside Card 1 */}
              <div className="absolute inset-x-3 bottom-3 rounded-[16px] bg-wb-canvas/95 p-4 shadow-[0_24px_50px_-24px_rgba(42,28,16,0.45)] ring-1 ring-black/5 backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-[252px]">
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
                Troque o ambiente acima e veja torque e atrito mudarem antes de ligar o robô.
              </p>
            </div>
          </article>

          {/* === CARD 2: ZERO COST FOR STUDENTS & PUBLIC SCHOOLS === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden rounded-[18px] bg-wb-bench wb-grid-bg h-[230px] p-4 flex items-center justify-center">
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
                Máquinas de ponta, sem custo, para estudantes e projetos do Marajó.
              </p>
            </div>
          </article>

          {/* === CARD 3: INTERACTIVE ARDUINO ULTRASONIC SENSOR === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden rounded-[18px] bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
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

              {/* HC-SR04 desenhado + frentes de onda até o obstáculo (posição = distanceCm) */}
              {(() => {
                const perto = distanceCm < 20;
                const xAlvo = 78 + (Math.min(100, distanceCm) / 100) * 236;
                const cor = perto ? '#e5484d' : '#23a35e';
                return (
                  <svg viewBox="0 0 340 96" className="my-auto h-[118px] w-full" aria-hidden="true">
                    <defs>
                      <linearGradient id="sonarLata" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#7a828a" />
                        <stop offset="0.45" stopColor="#eef1f4" />
                        <stop offset="1" stopColor="#8d959d" />
                      </linearGradient>
                      <clipPath id="sonarFeixe">
                        <rect x="62" y="0" width={Math.max(0, xAlvo - 62)} height="96" />
                      </clipPath>
                    </defs>
                    {/* módulo: placa azul, latas metálicas com tela */}
                    <rect x="8" y="16" width="44" height="64" rx="4" fill="#0b5c97" />
                    <rect x="12" y="44" width="10" height="8" rx="1" fill="#d9dadc" />
                    {[30, 66].map((cy) => (
                      <g key={cy}>
                        <rect x="38" y={cy - 11} width="22" height="22" rx="3" fill="url(#sonarLata)" />
                        <rect x="57" y={cy - 9} width="4" height="18" rx="1.5" fill="#2a2c30" />
                      </g>
                    ))}
                    <text x="24" y="92" textAnchor="middle" fontFamily="'Hanken Grotesk Variable', system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#4a453e">
                      Sonar
                    </text>
                    {/* frentes de onda (CSS), cortadas no obstáculo */}
                    <g clipPath="url(#sonarFeixe)" fill="none" stroke={cor} strokeWidth="2">
                      {[0, 1, 2].map((k) => (
                        <path key={k} className="sonar-onda" style={{ animationDelay: `${k * 0.45}s` }} d="M66 18 Q86 48 66 78" />
                      ))}
                    </g>
                    {/* cota de distância */}
                    <line x1="62" y1="88" x2={xAlvo} y2="88" stroke="#16130f" strokeWidth="1" />
                    <line x1="62" y1="84" x2="62" y2="92" stroke="#16130f" strokeWidth="1" />
                    <line x1={xAlvo} y1="84" x2={xAlvo} y2="92" stroke="#16130f" strokeWidth="1" />
                    {/* obstáculo com sombra */}
                    <g style={{ transition: 'transform 160ms cubic-bezier(0.16,1,0.3,1)' }} transform={`translate(${xAlvo} 0)`}>
                      <ellipse cx="13" cy="80" rx="16" ry="3" fill="rgba(42,28,16,0.25)" />
                      <rect x="0" y="22" width="26" height="56" rx="4" fill={perto ? '#e5484d' : '#e25a24'} />
                      <rect x="0" y="22" width="26" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
                      <text x="13" y="54" textAnchor="middle" fontFamily="'Hanken Grotesk Variable', system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#fff" transform="rotate(-90 13 50)">
                        Alvo
                      </text>
                    </g>
                  </svg>
                );
              })()}

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
                Arraste o obstáculo e veja o sensor ultrassônico responder.
              </p>
            </div>
          </article>

          {/* === CARD 4: 3D PRINTING SLICER & LASER PREVIEW === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden rounded-[18px] bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="wb-key">FATIADOR 3D · CAMADAS</span>
                <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                  Camada {layerPct}/100
                </span>
              </div>

              {/* Peça em 3/4 sendo fatiada: camadas impressas (laranja), atual (verde) e por imprimir */}
              <svg viewBox="0 0 220 104" className="my-auto h-[104px] w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="fatiaLado" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#b8441a" />
                    <stop offset="0.4" stopColor="#f07a45" />
                    <stop offset="1" stopColor="#a63b14" />
                  </linearGradient>
                </defs>
                {/* mesa PEI em perspectiva */}
                <ellipse cx="110" cy="92" rx="96" ry="10" fill="#b48a3c" opacity="0.35" />
                {Array.from({ length: 10 }).map((_, idx) => {
                  const threshold = (idx + 1) * 10;
                  const active = layerPct >= threshold - 5;
                  const atual = idx === Math.floor(layerPct / 10) - 1;
                  const rx = 70 - idx * 3.5;
                  const y = 86 - idx * 7.2;
                  return (
                    <g key={idx} style={{ transition: 'opacity 150ms' }} opacity={active ? 1 : 0.28}>
                      <path
                        d={`M${110 - rx} ${y} L${110 - rx} ${y - 5} A${rx} ${rx * 0.16} 0 0 0 ${110 + rx} ${y - 5} L${110 + rx} ${y} A${rx} ${rx * 0.16} 0 0 1 ${110 - rx} ${y} Z`}
                        fill={active ? (atual ? '#23a35e' : 'url(#fatiaLado)') : '#d8d2c6'}
                      />
                      <ellipse
                        cx="110"
                        cy={y - 5}
                        rx={rx}
                        ry={rx * 0.16}
                        fill={active ? (atual ? '#3fc27a' : '#f4925f') : '#e8e3d9'}
                      />
                    </g>
                  );
                })}
                {/* bico acompanha a camada atual */}
                {(() => {
                  const y = 86 - (Math.max(1, Math.floor(layerPct / 10)) - 1) * 7.2 - 6;
                  return (
                    <g style={{ transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)' }} transform={`translate(0 ${y - 30})`}>
                      <rect x="92" y="0" width="36" height="20" rx="4" fill="#2b2d31" />
                      <path d="M104 20 L116 20 L112 28 L108 28 Z" fill="#c6a052" />
                    </g>
                  );
                })()}
              </svg>

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
                Confira cada camada do arquivo antes de imprimir ou cortar.
              </p>
            </div>
          </article>

          {/* === CARD 5: BLOCKS TO REAL ARDUINO C++ === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden rounded-[18px] bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
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
                Comece em blocos e avance para C++ no seu ritmo.
              </p>
            </div>
          </article>

          {/* === CARD 6: 5TH LAB DELIVERED IN MARCH 2026 (ENSINO, PESQUISA, EXTENSÃO) === */}
          <article className="wb-panel flex flex-col overflow-hidden rounded-[22px]">
            <div className="relative overflow-hidden rounded-[18px] bg-wb-bench wb-grid-bg h-[230px] p-4 flex flex-col justify-between">
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
                Aulas, iniciação científica e soluções para Breves.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

