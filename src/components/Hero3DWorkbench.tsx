import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CenaApi, ModelType, PhaseType } from './hero3d/cena';
import { Play, RotateCcw, Calendar, Sparkles, X, Layers, Cpu, Wrench } from 'lucide-react';
import { WordRise, BrandLogo } from './BrandLogo';
import { IMAGE_ASSETS } from '../data/labData';

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

  const apiRef = useRef<CenaApi | null>(null);

  // three.js é carregado sob demanda, depois da primeira pintura da página
  const activeModelRef = useRef<ModelType>(activeModel);
  activeModelRef.current = activeModel;
  const [cenaPronta, setCenaPronta] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let destruir: (() => void) | undefined;
    let cancelado = false;

    const carregar = () => {
      import('./hero3d/cena')
        .then(({ montarCena }) => {
          if (cancelado) return;
          destruir = montarCena(container, setPhase, apiRef);
          if (activeModelRef.current !== 'rover') apiRef.current?.setModel(activeModelRef.current);
          setCenaPronta(true);
        })
        .catch((err) => {
          // Sem WebGL ou falha de rede: o hero continua funcional, só sem o 3D
          console.warn('Cena 3D indisponível:', err);
        });
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = w.requestIdleCallback ? w.requestIdleCallback(carregar, { timeout: 1500 }) : undefined;
    const timeoutId = idleId === undefined ? window.setTimeout(carregar, 250) : undefined;

    return () => {
      cancelado = true;
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      destruir?.();
      apiRef.current = null;
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
            className={`absolute inset-x-0 bottom-0 z-0 h-[440px] transition-opacity duration-700 min-[900px]:top-0 min-[900px]:h-auto ${
              cenaPronta ? 'opacity-100' : 'opacity-0'
            }`}
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

