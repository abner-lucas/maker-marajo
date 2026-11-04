import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Film,
  Plus,
  Users,
  Wrench,
} from 'lucide-react';
import { Hero3DWorkbench } from '../components/Hero3DWorkbench';
import { ScrollytellingSection } from '../components/ScrollytellingSection';
import { InteractiveBentoFeatures } from '../components/InteractiveBentoFeatures';
import { LabVideosSection } from '../components/LabVideosSection';
import { WordRise } from '../components/BrandLogo';
import {
  CALENDAR_ACTIVITIES,
  EQUIPMENTS,
  FAQ_ITEMS,
  IMAGE_ASSETS,
} from '../data/labData';

const GALLERY_MOSAIC = [
  {
    kind: 'photo',
    src: IMAGE_ASSETS.real.canoasMarajoaras3d,
    caption: 'Ribeirinhos em canoas marajoaras impressos em 3D + base cortada a laser',
    span: 'col-span-2 row-span-2 lg:row-span-3',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.elegooCentauriCarbon,
    caption: 'Elegoo Centauri Carbon',
    span: 'col-span-2 row-span-2',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.laserCo2CortandoAcrilico,
    caption: 'Laser CO2 em Acrílico',
    span: '',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.laserDiodoMdf,
    caption: 'Laser Diodo em MDF',
    span: '',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.robotSoccerDisputa,
    caption: 'Robot Soccer 3D + LCD',
    span: '',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.bancadaCanetas3dAcai,
    caption: 'Canetas 3D & Eletrônica',
    span: '',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.alunosRetificaAcrilico,
    caption: 'Acabamento Micro-Retífica',
    span: '',
  },
  {
    kind: 'item',
    src: IMAGE_ASSETS.real.inauguracaoEspaco,
    caption: 'Espaço Convivência RGB',
    span: '',
  },
  {
    kind: 'photo',
    src: IMAGE_ASSETS.real.alunasMontagemMedalhas,
    caption: 'Estudantes montando as medalhas do IV JINs no LabMaker Marajó',
    span: 'col-span-2 row-span-2 lg:row-span-3',
  },
  {
    kind: 'photo',
    src: IMAGE_ASSETS.real.medalhaJinsPronta,
    caption: 'Medalha Oficial IV JINs 2026 produzida em MDF e acrílico no laboratório',
    span: 'col-span-2 row-span-2 lg:col-span-4',
  },
];

const MARQUEE_IMAGES = [
  { src: IMAGE_ASSETS.real.canoasMarajoaras3d, label: 'Canoas Marajoaras 3D' },
  { src: IMAGE_ASSETS.real.medalhaJinsPronta, label: 'Medalhas IV JINs 2026' },
  { src: IMAGE_ASSETS.real.robotSoccerDisputa, label: 'Robot Soccer Marajó' },
  { src: IMAGE_ASSETS.real.elegooCentauriCarbon, label: 'Elegoo Centauri Carbon' },
  { src: IMAGE_ASSETS.real.laserCo2CortandoAcrilico, label: 'Laser CO2 no Acrílico' },
  { src: IMAGE_ASSETS.real.laserDiodoMdf, label: 'Laser Diodo CNC' },
  { src: IMAGE_ASSETS.real.alunasMontagemMedalhas, label: 'Protagonismo Estudantil' },
  { src: IMAGE_ASSETS.real.bancadaCanetas3dAcai, label: 'Mural Açaí & Canetas 3D' },
  { src: IMAGE_ASSETS.real.estacaoCadSlicer, label: 'Estação CAD Monitor Curvo' },
  { src: IMAGE_ASSETS.real.vitrine3d, label: 'Vitrine de Protótipos 3D' },
];

export const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      {/* 1. Interactive Three.js 3D Hero Section */}
      <Hero3DWorkbench />

      {/* 2. Institutional Presentation Banner: 5th Lab Delivered in March 2026 */}
      <section
        id="apresentacao"
        className="bg-wb-bench border-b border-wb-line py-20 sm:py-28 font-ui text-wb-ink"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="marajo-glifo text-wb-green" />
                <span className="rotulo">
                  Apresentação institucional · LabMaker Marajó
                </span>
              </div>

              <h2
                className="mt-4 font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(30px, 3.8vw, 50px)',
                  lineHeight: 1.06,
                  letterSpacing: '-0.028em',
                }}
              >
                O 5º Laboratório IF MAKER do Pará, <span className="acento">em plena produção</span> em Breves.
              </h2>

              <p className="mt-5 text-[16.5px] leading-[1.68] text-wb-ink-2">
                Inaugurado pelo <strong>Instituto Federal do Pará (IFPA)</strong> em{' '}
                <strong>março de 2026</strong> no <strong>Campus Breves</strong>, o{' '}
                <strong>Laboratório IFPA MAKER Marajó</strong> fortalece a cultura do{' '}
                <strong className="text-wb-ink">“aprender fazendo” (learning by doing)</strong> com
                infraestrutura real de ponta.
              </p>

              <p className="mt-3.5 text-[16px] leading-[1.68] text-wb-ink-2">
                Aqui os estudantes já projetam e fabricam desde as{' '}
                <strong>medalhas oficiais do IV JINs</strong> (em acrílico e MDF cortados a laser),
                disputam partidas na <strong>Arena Robot Soccer</strong> (com 5 robôs impressos em
                3D e display LCD) e materializam ícones culturais como os{' '}
                <strong>ribeirinhos em canoas marajoaras</strong> nas impressoras{' '}
                <strong>Elegoo Centauri Carbon</strong>.
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    title: 'Parque Real em Operação',
                    desc: 'Impressoras 3D Elegoo Centauri Carbon, Laser CO2 Industrial, Laser Diodo CNC, Canetas 3D e Arena Robot Soccer.',
                  },
                  {
                    title: 'Protagonismo Estudantil no Marajó',
                    desc: 'Estudantes operando CAD, corte a laser, micro-retíficas, pintura e robótica para demandas reais do campus.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="border-t border-wb-line py-4"
                  >
                    <div className="flex items-center gap-2 font-bold text-[15px] text-wb-ink">
                      <CheckCircle2 className="h-4 w-4 text-wb-green shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] text-wb-ink-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#videos-reais"
                  className="wb-btn wb-btn-primary h-12 px-6 text-[15px]"
                >
                  <Film className="h-4 w-4" />
                  <span>Assistir vídeos quadro a quadro</span>
                </a>
                <Link
                  to="/projetos"
                  className="wb-btn wb-btn-green h-12 px-6 text-[15px]"
                >
                  <span>Ver projetos produzidos</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: Real Video Loop + Official Poster Thumbnail */}
            <div className="relative">
              <figure>
                <div className="relative overflow-hidden rounded-[20px] aspect-[4/3] bg-black">
                  <video
                    src="/videos/DWCiTZDEavR.mp4"
                    poster={IMAGE_ASSETS.real.canoasMarajoaras3d}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[13.5px]">
                  <span className="font-semibold text-wb-ink">Tour pelo laboratório — vídeo real</span>
                  <span className="text-wb-ink-3">Elegoo Centauri Carbon · Laser CO2 · Canetas 3D</span>
                </figcaption>
              </figure>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Videos & Frame-by-Frame Reel Analysis Section */}
      <LabVideosSection />

      {/* 4. Dedicated Pages Showcase: Our 5 Equipment Categories */}
      <section className="bg-wb-canvas py-24 sm:py-32 border-b border-wb-line">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-green" />
                Parque tecnológico real · Páginas dedicadas
              </p>
              <h2
                className="mt-3 font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(30px, 4vw, 54px)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.028em',
                }}
              >
                Nossos <span className="acento">equipamentos</span>.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-[15px] text-wb-ink-2 max-w-[28em]">
                Acesse a página exclusiva de cada equipamento para ver fotos e vídeos reais da
                bancada, simuladores interativos e especificações.
              </p>
              <Link
                to="/equipamentos"
                className="wb-btn wb-btn-dark h-11 px-5 text-[14px] shrink-0"
              >
                <span>Ver parque completo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* 5 Equipment Cards linking to their separate pages */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {EQUIPMENTS.map((eq) => (
              <Link
                key={eq.id}
                to={`/equipamentos/${eq.slug}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-wb-bench">
                  <img
                    src={eq.image}
                    alt={eq.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between pt-4">
                  <div>
                    <span className="flex items-center gap-2 font-key text-[12.5px] font-semibold text-wb-ink-3">
                      <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45" style={{ backgroundColor: eq.accentColor }} />
                      {eq.badge.split('·')[0].trim()} · {eq.unitsAvailable} un.
                    </span>
                    <h3 className="mt-1.5 font-brand text-[21px] font-semibold text-wb-ink group-hover:text-wb-orange transition-colors">
                      {eq.shortName}
                    </h3>
                    <p className="mt-2 text-[13.5px] text-wb-ink-2 line-clamp-3 leading-relaxed">
                      {eq.tagline}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-wb-ink group-hover:text-wb-orange">
                    <span>Abrir página e simulador</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Constructa-style Scrollytelling Section (460svh sticky scroll-driven animation) */}
      <ScrollytellingSection />

      {/* 6. Constructa-style Interactive 6-Card Bento Grid */}
      <InteractiveBentoFeatures />

      {/* 7. Constructathon-style Dense Real Photo Mosaic + Infinite Marquee */}
      <section
        id="vivencia-maker"
        className="scroll-mt-20 bg-wb-canvas pb-12 pt-20 font-ui text-wb-ink sm:pt-28 border-t border-wb-line"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
            <div>
              <p className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                Registros reais do laboratório · LabMaker Marajó em imagens
              </p>
              <h2
                className="mt-3 font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 54px)',
                  lineHeight: 1.04,
                  letterSpacing: '-0.028em',
                }}
              >
                O que já fizemos <span className="acento">nas nossas bancadas</span>.
              </h2>
            </div>
            <div className="md:text-right">
              <p className="text-[15.5px] text-wb-ink-2">
                Das medalhas do IV JINs e canoas marajoaras 3D às partidas de Robot Soccer na nossa
                arena.
              </p>
              <Link
                to="/projetos"
                className="mt-3 inline-flex items-center gap-1.5 font-bold text-[14.5px] text-wb-orange hover:underline"
              >
                <span>Ver todos os projetos</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Dense Bento Photo Mosaic with Real Lab Photos */}
          <div className="mt-12 grid grid-flow-row-dense auto-rows-[136px] grid-cols-2 gap-3 sm:auto-rows-[152px] sm:grid-cols-4 lg:auto-rows-[140px] lg:grid-cols-6 lg:gap-4">
            {GALLERY_MOSAIC.map((item, idx) =>
              item.kind === 'photo' ? (
                <figure
                  key={idx}
                  className={`group relative overflow-hidden rounded-[18px] bg-wb-bench border border-wb-line ${item.span}`}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <figcaption className="absolute bottom-3 left-3 right-3 w-fit rounded-[10px] bg-white/92 px-3 py-1.5 text-[12px] font-bold text-wb-ink backdrop-blur shadow-sm">
                    {item.caption}
                  </figcaption>
                </figure>
              ) : (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-[18px] border border-wb-line bg-white ${item.span}`}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="h-full w-full scale-[1.03] object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 font-key text-[10px] font-semibold text-white backdrop-blur-sm">
                    {item.caption}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Infinite Auto-Scrolling Marquee Strip */}
        <div
          dir="ltr"
          className="relative mt-12 overflow-hidden"
          aria-label="Galeria contínua de equipamentos e projetos reais do IF MAKER Breves"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
          <ul className="wb-marquee flex w-max gap-3.5">
            {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((item, idx) => (
              <li
                key={idx}
                aria-hidden={idx >= MARQUEE_IMAGES.length}
                className="relative h-[126px] w-[164px] shrink-0 overflow-hidden rounded-[15px] border border-wb-line bg-white sm:h-[144px] sm:w-[190px]"
              >
                <img
                  src={item.src}
                  alt={item.label}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 right-2 truncate rounded-md bg-white/90 px-2 py-0.5 text-center font-key text-[10.5px] font-bold text-wb-ink">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Dark-Mode Spotlight Card: Robot Soccer Live Video + Agenda Mensal (Constructa `#whats-new` style) */}
      <section className="bg-wb-canvas pt-20 pb-24 font-ui text-wb-ink">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <article className="relative grid overflow-hidden rounded-[26px] bg-[#0C100E] text-white ring-1 ring-white/10 lg:grid-cols-[minmax(0,5.5fr)_minmax(0,6.5fr)]">
            {/* Left Copy */}
            <div className="relative z-10 flex flex-col justify-between p-7 sm:p-11">
              <div>
                <p className="rotulo !text-white/75">
                  <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                  Robot Soccer & agenda · em ação no lab
                </p>

                <h2
                  className="mt-5 font-brand font-bold text-white"
                  style={{
                    fontSize: 'clamp(28px, 3.6vw, 46px)',
                    lineHeight: 1.06,
                    letterSpacing: '-0.028em',
                  }}
                >
                  Robot Soccer, <span className="acento text-wb-orange">futebol de robôs</span> e oficinas do mês
                </h2>

                <p className="mt-4 text-[15.5px] leading-relaxed text-white/75">
                  O{' '}
                  <strong className="text-white">LabMaker Marajó</strong> já conta com sua própria{' '}
                  <strong className="text-white">Arena Robot Soccer</strong> com 5 robôs impressos
                  em 3D e display LCD! Confira os próximos eventos sincronizados via{' '}
                  <strong className="text-white">Google Agenda</strong>:
                </p>

                {/* Next 3 Upcoming Events Mini List */}
                <div className="mt-6 space-y-2.5">
                  {CALENDAR_ACTIVITIES.slice(0, 3).map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-3 border-t border-white/10 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold text-white">{act.title}</p>
                        <p className="font-key text-[11px] text-white/60">
                          {act.date} · {act.startTime} às {act.endTime} · {act.equipment}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-wb-green/20 px-2.5 py-1 font-key text-[10.5px] font-bold text-emerald-300">
                        {act.spotsAvailable} vagas
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/agenda-mensal"
                  className="wb-btn wb-btn-primary h-12 px-6 text-[14.5px]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Ver agenda do mês</span>
                </Link>
                <Link
                  to="/agendamento"
                  className="wb-btn border border-white/20 bg-white/10 h-12 px-6 text-[14.5px] text-white hover:bg-white/20"
                >
                  <span>Agendar horário de bancada</span>
                </Link>
              </div>
            </div>

            {/* Right: Live Robot Soccer Video inside 3D Perspective Grid Arena */}
            <div className="relative min-h-[340px] sm:min-h-[420px] overflow-hidden flex items-center justify-center p-6">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(55% 60% at 50% 58%, rgba(47,179,107,0.34), rgba(255,107,53,0.12) 45%, transparent 75%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-[52%] overflow-hidden [perspective:260px]">
                <div
                  className="absolute -inset-x-1/2 bottom-0 h-[220%] origin-bottom [transform:rotateX(62deg)]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
                  }}
                />
              </div>

              {/* Embedded Real Robot Soccer Video Card */}
              <div className="relative z-10 w-full max-w-[300px] overflow-hidden rounded-[22px] border border-white/20 bg-black">
                <video
                  src="/videos/DYOI0SHRQBN.mp4"
                  poster={IMAGE_ASSETS.real.robotSoccerDisputa}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full aspect-[9/14] object-cover"
                />
                <div className="bg-black/90 px-4 py-2.5 flex items-center justify-between text-[11.5px]">
                  <span className="font-key font-bold text-emerald-400">
                    Robot Soccer · LabMaker Marajó
                  </span>
                  <a
                    href="https://www.instagram.com/reel/DYOI0SHRQBN/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Reel</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 9. Sticky Split-Layout FAQ Accordion */}
      <section
        id="faq"
        className="scroll-mt-20 border-y border-wb-line bg-wb-bench py-24 font-ui text-wb-ink sm:py-32"
      >
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-ink-3" />
              Dúvidas frequentes · FAQ
            </p>
            <h2
              className="mt-4 font-brand font-bold text-wb-ink"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.05,
                letterSpacing: '-0.028em',
              }}
            >
              Perguntas, <span className="acento">respondidas</span>.
            </h2>
            <p className="mt-4 text-[15.5px] text-wb-ink-2 leading-relaxed">
              Tudo o que você precisa saber sobre os equipamentos e produções do Laboratório IFPA
              MAKER Marajó no Campus Breves.
            </p>
          </div>

          <div className="wb-panel divide-y divide-wb-line overflow-hidden">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-start transition-colors hover:bg-wb-bench/60"
                    >
                      <span className="text-[16px] font-bold text-wb-ink sm:text-[17px]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-out-soft ${
                          isOpen
                            ? 'rotate-45 border-wb-ink bg-wb-ink text-white'
                            : 'border-wb-line bg-white text-wb-ink-2'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    </button>
                  </h3>
                  <div
                    className="grid transition-all duration-300 ease-out-soft"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[46em] px-6 pb-6 text-[15px] leading-[1.7] text-wb-ink-2">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Bottom Perspective Grid CTA Panel */}
      <section
        id="cta"
        className="relative overflow-hidden bg-wb-canvas py-24 font-ui text-wb-ink sm:py-32"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="wb-floor" style={{ bottom: '-70%' }} />
        </div>
        <div className="relative mx-auto max-w-[760px] px-5 sm:px-8">
          <div className="wb-panel flex flex-col items-center px-6 py-10 text-center sm:px-12 sm:py-14 bg-white/95 backdrop-blur">
            <p className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />
              Venha aprender fazendo · LabMaker Marajó
            </p>
            <h2
              className="mt-4 font-brand font-bold text-wb-ink"
              style={{
                fontSize: 'clamp(32px, 4.6vw, 58px)',
                lineHeight: 1.03,
                letterSpacing: '-0.028em',
              }}
            >
              <WordRise text="Pronto para tirar seu protótipo do papel?" />
            </h2>
            <p className="mt-5 max-w-[32em] text-[17px] leading-relaxed text-wb-ink-2">
              Reserve uma impressora Elegoo Centauri Carbon, a Cortadora a Laser CO2 ou a Arena
              Robot Soccer pelo Google Agenda e construa conosco no IFPA Campus Breves.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Link
                to="/agendamento"
                className="wb-btn wb-btn-primary h-13 px-7 text-[16px]"
              >
                <Calendar className="h-5 w-5" />
                <span>Agendar pelo Google Agenda</span>
              </Link>
              <Link
                to="/equipamentos"
                className="wb-btn wb-btn-dark h-13 px-6 text-[15.5px]"
              >
                <Wrench className="h-4 w-4 text-wb-orange" />
                <span>Explorar equipamentos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
