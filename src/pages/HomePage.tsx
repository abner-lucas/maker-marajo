import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Calendar, Plus } from 'lucide-react';
import { Hero3DWorkbench } from '../components/Hero3DWorkbench';
import { ScrollytellingSection } from '../components/ScrollytellingSection';
import { InteractiveBentoFeatures } from '../components/InteractiveBentoFeatures';
import { LabVideosSection } from '../components/LabVideosSection';
import {
  Cascata,
  CascataItem,
  MeandroVivo,
  Parallax,
  Revelar,
  SecaoViva,
  TituloPalavras,
} from '../components/motion';
import { CALENDAR_ACTIVITIES, EQUIPMENTS, FAQ_ITEMS, IMAGE_ASSETS } from '../data/labData';

/* Galeria em 3 colunas que rolam em velocidades diferentes (parallax de camadas) */
const GALERIA: { src: string; legenda: string; alto?: boolean }[][] = [
  [
    { src: IMAGE_ASSETS.real.canoasMarajoaras3d, legenda: 'Canoas marajoaras em 3D', alto: true },
    { src: IMAGE_ASSETS.real.laserCo2CortandoAcrilico, legenda: 'Laser CO2 no acrílico' },
    { src: IMAGE_ASSETS.real.bancadaCanetas3dAcai, legenda: 'Canetas 3D' },
  ],
  [
    { src: IMAGE_ASSETS.real.elegooCentauriCarbon, legenda: 'Elegoo Centauri Carbon' },
    { src: IMAGE_ASSETS.real.alunasMontagemMedalhas, legenda: 'Montagem das medalhas do IV JINs', alto: true },
    { src: IMAGE_ASSETS.real.robotSoccerDisputa, legenda: 'Robot Soccer' },
  ],
  [
    { src: IMAGE_ASSETS.real.laserDiodoMdf, legenda: 'Laser diodo em MDF' },
    { src: IMAGE_ASSETS.real.alunosRetificaAcrilico, legenda: 'Acabamento' },
    { src: IMAGE_ASSETS.real.medalhaJinsPronta, legenda: 'Medalha do IV JINs pronta', alto: true },
  ],
];
const VELOCIDADES = [40, -70, 90];

const Titulo: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2
    className={`font-brand font-semibold ${className}`}
    style={{ fontSize: 'clamp(32px, 4.4vw, 60px)', lineHeight: 1.02, letterSpacing: '-0.028em' }}
  >
    {children}
  </h2>
);

const Rotulo: React.FC<{ cor: string; children: React.ReactNode; claro?: boolean }> = ({ cor, children, claro }) => (
  <p className={`rotulo ${claro ? '!text-white/70' : ''}`}>
    <span aria-hidden="true" className={`marajo-glifo ${cor}`} />
    {children}
  </p>
);

export const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      <Hero3DWorkbench />

      {/* Sobre — texto curto + vídeo em camadas de parallax */}
      <SecaoViva id="apresentacao" className="overflow-x-clip bg-wb-bench py-24 font-ui text-wb-ink sm:py-32">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <Rotulo cor="text-wb-green">Sobre o laboratório</Rotulo>
            <Titulo className="mt-4 text-wb-ink">
              <TituloPalavras texto="Aprender fazendo," />
              <span className="acento text-wb-green">no coração do Marajó.</span>
            </Titulo>
            <Revelar atraso={0.1}>
              <p className="mt-6 max-w-[30em] text-[18px] leading-[1.6] text-wb-ink-2">
                O IFPA MAKER Marajó, no Campus Breves, já fabrica medalhas a laser, robôs de
                futebol e peças da cultura marajoara em impressão 3D.
              </p>
            </Revelar>

            <Cascata className="mt-9 grid max-w-[30em] grid-cols-3 gap-6 border-t border-wb-ink/80 pt-5">
              {[
                { n: '5', t: 'tipos de equipamento' },
                { n: '3', t: 'vídeos reais' },
                { n: '100%', t: 'gratuito no ensino e extensão' },
              ].map((x) => (
                <CascataItem key={x.t}>
                  <p className="font-brand text-[40px] font-semibold leading-none">{x.n}</p>
                  <p className="mt-2 text-[13.5px] text-wb-ink-3">{x.t}</p>
                </CascataItem>
              ))}
            </Cascata>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/projetos" className="wb-btn wb-btn-dark h-12 px-6 text-[15px]">
                Ver projetos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#videos-reais" className="wb-btn h-12 px-4 text-[15px] text-wb-ink underline decoration-wb-line underline-offset-4 hover:decoration-wb-orange">
                Assistir vídeos
              </a>
            </div>
          </div>

          {/* Três camadas: meandro ao fundo, vídeo no meio, foto à frente */}
          <div className="relative mx-auto w-full max-w-[600px] pb-16 lg:pb-0">
            <Parallax velocidade={30} className="pointer-events-none absolute -top-10 right-0 w-[70%] text-wb-orange/50 lg:-right-6">
              <MeandroVivo className="h-auto w-full" />
              <MeandroVivo className="mt-2 h-auto w-full" />
            </Parallax>
            <Parallax velocidade={-20}>
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-black">
                  <video
                    src="/videos/DWCiTZDEavR.mp4"
                    poster={IMAGE_ASSETS.real.canoasMarajoaras3d}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label="Tour pelo laboratório"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[13.5px] text-wb-ink-3">Tour pelo laboratório</figcaption>
              </figure>
            </Parallax>
            <Parallax
              velocidade={-90}
              className="absolute -bottom-2 left-0 w-[42%] sm:-left-10 lg:-bottom-14"
            >
              <img
                src={IMAGE_ASSETS.real.medalhaJinsPronta}
                alt="Medalha do IV JINs feita no laboratório"
                loading="lazy"
                className="aspect-square w-full rotate-[-4deg] rounded-[18px] object-cover ring-[6px] ring-wb-bench"
              />
            </Parallax>
          </div>
        </div>
      </SecaoViva>

      <LabVideosSection />

      {/* Equipamentos */}
      <SecaoViva className="bg-wb-canvas py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Rotulo cor="text-wb-orange">Equipamentos</Rotulo>
              <Titulo className="mt-3 text-wb-ink">
                Cinco bancadas, <span className="acento text-wb-orange">um simulador cada</span>.
              </Titulo>
            </div>
            <Link to="/equipamentos" className="wb-btn wb-btn-dark h-11 px-5 text-[14px]">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Cascata className="mt-12 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {EQUIPMENTS.map((eq) => (
              <CascataItem key={eq.id}>
                <Link to={`/equipamentos/${eq.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-wb-bench">
                    <img
                      src={eq.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
                    />
                    <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-wb-canvas text-wb-ink transition-all duration-300 group-hover:rotate-45 group-hover:bg-wb-orange group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-[13px] text-wb-ink-3">
                    <span aria-hidden="true" className="h-2 w-2 rotate-45" style={{ backgroundColor: eq.accentColor }} />
                    {eq.unitsAvailable} unidades
                  </p>
                  <h3 className="mt-1 font-brand text-[22px] font-semibold leading-tight text-wb-ink transition-colors group-hover:text-wb-orange">
                    {eq.shortName}
                  </h3>
                </Link>
              </CascataItem>
            ))}
          </Cascata>
        </div>
      </SecaoViva>

      <ScrollytellingSection />

      <InteractiveBentoFeatures />

      {/* Galeria em parallax de camadas */}
      <SecaoViva id="vivencia-maker" className="scroll-mt-20 overflow-hidden bg-wb-canvas py-24 font-ui text-wb-ink sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Rotulo cor="text-wb-orange">Galeria</Rotulo>
              <Titulo className="mt-3 text-wb-ink">
                Feito <span className="acento text-wb-orange">nas nossas bancadas</span>.
              </Titulo>
            </div>
            <Link
              to="/projetos"
              className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-wb-ink underline decoration-wb-line underline-offset-4 hover:text-wb-orange hover:decoration-wb-orange"
            >
              Todos os projetos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {GALERIA.map((coluna, ci) => (
              <Parallax
                key={ci}
                velocidade={VELOCIDADES[ci]}
                className={`flex flex-col gap-3 sm:gap-5 ${ci === 2 ? 'hidden lg:flex' : ''} ${ci === 1 ? 'pt-16' : ''}`}
              >
                {coluna.map((f) => (
                  <figure key={f.src} className="group relative overflow-hidden rounded-[18px] bg-wb-bench">
                    <img
                      src={f.src}
                      alt={f.legenda}
                      loading="lazy"
                      className={`w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.05] ${
                        f.alto ? 'aspect-[3/4]' : 'aspect-[4/3]'
                      }`}
                    />
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-[13px] font-medium text-white opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                      {f.legenda}
                    </figcaption>
                  </figure>
                ))}
              </Parallax>
            ))}
          </div>
        </div>
      </SecaoViva>

      {/* Robot Soccer + agenda (palco escuro) */}
      <section className="bg-wb-canvas px-3 pb-24 sm:px-5">
        <SecaoViva className="mx-auto max-w-[1380px] overflow-hidden rounded-[28px] bg-[#14110d] text-white">
          <div className="grid lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <div className="flex flex-col justify-between p-7 sm:p-12">
              <div>
                <Rotulo cor="text-wb-orange" claro>
                  Agenda do mês
                </Rotulo>
                <Titulo className="mt-4 text-white">
                  Oficinas, treinos e <span className="acento text-wb-orange">futebol de robôs</span>.
                </Titulo>

                <Cascata as="ul" className="mt-9">
                  {CALENDAR_ACTIVITIES.slice(0, 3).map((act) => (
                    <CascataItem as="li" key={act.id}>
                      <Link
                        to="/agenda-mensal"
                        className="group flex items-center justify-between gap-4 border-t border-white/15 py-4"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[16px] font-semibold">{act.title}</span>
                          <span className="mt-0.5 block text-[13px] text-white/55">
                            {act.date} · {act.startTime}
                          </span>
                        </span>
                        <span className="shrink-0 text-[13px] font-semibold text-emerald-300">
                          {act.spotsAvailable} vagas
                        </span>
                      </Link>
                    </CascataItem>
                  ))}
                </Cascata>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/agenda-mensal" className="wb-btn wb-btn-primary h-12 px-6 text-[15px]">
                  <Calendar className="h-4 w-4" />
                  Ver agenda
                </Link>
                <Link
                  to="/agendamento"
                  className="wb-btn h-12 px-5 text-[15px] text-white underline decoration-white/30 underline-offset-4 hover:decoration-wb-orange"
                >
                  Agendar bancada
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden p-6">
              <Parallax velocidade={50} className="absolute inset-0">
                <div
                  className="absolute inset-[-10%]"
                  style={{
                    background:
                      'radial-gradient(50% 55% at 50% 55%, rgba(35,163,94,0.35), rgba(242,98,46,0.12) 50%, transparent 75%)',
                  }}
                />
              </Parallax>
              <Parallax velocidade={-40} className="relative z-10 w-full max-w-[290px]">
                <div className="overflow-hidden rounded-[22px] bg-black">
                  <video
                    src="/videos/DYOI0SHRQBN.mp4"
                    poster={IMAGE_ASSETS.real.robotSoccerDisputa}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    className="aspect-[9/14] w-full object-cover"
                  />
                </div>
                <a
                  href="https://www.instagram.com/reel/DYOI0SHRQBN/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] text-white/70 hover:text-white"
                >
                  Robot Soccer no Instagram
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Parallax>
            </div>
          </div>
        </SecaoViva>
      </section>

      {/* FAQ */}
      <SecaoViva id="faq" className="scroll-mt-20 bg-wb-bench py-24 font-ui text-wb-ink sm:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Rotulo cor="text-wb-ink-3">Dúvidas</Rotulo>
            <Titulo className="mt-4 text-wb-ink">
              Perguntas, <span className="acento">respondidas</span>.
            </Titulo>
          </div>

          <div className="divide-y divide-wb-line border-y border-wb-ink/80">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${idx}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-start"
                    >
                      <span className="text-[17px] font-semibold text-wb-ink transition-colors group-hover:text-wb-orange sm:text-[19px]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-out-soft ${
                          isOpen ? 'rotate-45 bg-wb-orange text-white' : 'bg-wb-canvas text-wb-ink'
                        }`}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-a-${idx}`}
                    role="region"
                    aria-labelledby={`faq-q-${idx}`}
                    className="grid transition-all duration-500 ease-out-soft"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[44em] pb-6 text-[15.5px] leading-[1.7] text-wb-ink-2">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SecaoViva>

      {/* Chamada final */}
      <section id="cta" className="relative overflow-hidden bg-wb-canvas py-28 text-center font-ui text-wb-ink sm:py-40">
        <Parallax velocidade={80} className="pointer-events-none absolute inset-0" >
          <div aria-hidden="true" className="wb-floor" style={{ bottom: '-70%' }} />
        </Parallax>
        <div className="relative mx-auto max-w-[900px] px-5 sm:px-8">
          <Rotulo cor="text-wb-orange">Participe</Rotulo>
          <h2
            className="mt-5 font-brand font-semibold"
            style={{ fontSize: 'clamp(38px, 6vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}
          >
            <TituloPalavras texto="Tire seu protótipo" />
            <span className="acento text-wb-orange">do papel.</span>
          </h2>
          <Revelar atraso={0.2}>
            <p className="mx-auto mt-6 max-w-[26em] text-[18px] leading-relaxed text-wb-ink-2">
              Reserve uma máquina e construa com a gente — gratuito para ensino, pesquisa e extensão.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/agendamento" className="wb-btn wb-btn-primary h-13 px-7 text-[16px]">
                <Calendar className="h-5 w-5" />
                Agendar
              </Link>
              <Link to="/equipamentos" className="wb-btn wb-btn-dark h-13 px-6 text-[16px]">
                Ver equipamentos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Revelar>
        </div>
      </section>
    </div>
  );
};
