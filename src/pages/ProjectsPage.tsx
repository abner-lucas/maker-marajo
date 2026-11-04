import React, { useState } from 'react';
import {
  ArrowRight,
  ExternalLink,
  Film,
  Play,
  X,
} from 'lucide-react';
import { MAKER_PROJECTS, MakerProject } from '../data/labData';
import { WordRise } from '../components/BrandLogo';

export const ProjectsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Produzido' | 'Em Andamento'>('Todos');
  const [pillarFilter, setPillarFilter] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<MakerProject | null>(null);
  const [playingVideoCards, setPlayingVideoCards] = useState<Record<string, boolean>>({
    'proj-jins-medalhas': true,
    'proj-robot-soccer': true,
  });

  const filtered = MAKER_PROJECTS.filter((p) => {
    const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
    const matchPillar = pillarFilter === 'Todos' || p.pillar === pillarFilter;
    return matchStatus && matchPillar;
  });

  const toggleCardVideo = (projId: string) => {
    setPlayingVideoCards((prev) => ({ ...prev, [projId]: !prev[projId] }));
  };

  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      {/* Header */}
      <section className="border-b border-wb-line bg-wb-bench py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />Portfólio do laboratório · Projetos e soluções</span>
          <h1
            className="mt-4 font-brand font-bold text-wb-ink max-w-[16em]"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 58px)',
              lineHeight: 1.04,
              letterSpacing: '-0.028em',
            }}
          >
            <WordRise text="Projetos Produzidos e em Andamento." />
          </h1>
          <p className="mt-4 max-w-[42em] text-[17px] leading-relaxed text-wb-ink-2">
            Assista aos vídeos e veja as fotos reais do que já foi produzido no{' '}
            <strong>Laboratório IFPA MAKER Marajó</strong> — como as{' '}
            <strong>medalhas oficiais do IV JINs</strong>, o <strong>Robot Soccer</strong> e os{' '}
            <strong>ribeirinhos em canoas marajoaras 3D</strong> — além dos projetos de pesquisa e
            extensão em andamento.
          </p>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex border-t border-wb-line py-1">
              {(['Todos', 'Produzido', 'Em Andamento'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-xl px-4 py-2 text-[13.5px] font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-wb-ink text-white'
                      : 'text-wb-ink-2 hover:text-wb-ink'
                  }`}
                >
                  {st === 'Produzido'
                    ? '✓ Produzidos no Lab'
                    : st === 'Em Andamento'
                    ? '⚡ Em Andamento'
                    : 'Todos os Projetos'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['Todos', 'Ensino', 'Pesquisa', 'Extensão', 'Inovação'].map((pil) => (
                <button
                  key={pil}
                  type="button"
                  onClick={() => setPillarFilter(pil)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                    pillarFilter === pil
                      ? 'bg-wb-green text-white'
                      : 'bg-white border border-wb-line text-wb-ink-2 hover:text-wb-ink'
                  }`}
                >
                  {pil}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {filtered.map((proj) => {
              const imgSrc = proj.image;
              const showVideo = Boolean(proj.videoSrc && playingVideoCards[proj.id]);

              return (
                <article
                  key={proj.id}
                  className="wb-panel wb-panel-hover flex flex-col overflow-hidden"
                >
                  {/* Media Container (Video or Image) */}
                  <div className="relative h-72 sm:h-80 bg-[#0E1311] border-b border-wb-line overflow-hidden group">
                    {showVideo && proj.videoSrc ? (
                      <video
                        src={proj.videoSrc}
                        poster={imgSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={imgSrc}
                        alt={proj.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    {/* Top Status & Pillar Badges */}
                    <div className="pointer-events-none absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3 py-1 font-key text-[11px] font-bold text-white shadow ${
                          proj.status === 'Produzido' ? 'bg-wb-green' : 'bg-wb-orange'
                        }`}
                      >
                        {proj.status === 'Produzido'
                          ? 'Produzido no lab'
                          : `Em andamento · ${proj.progress}%`}
                      </span>
                      <span className="rounded-full bg-white/92 backdrop-blur px-3 py-1 font-key text-[11px] font-bold text-wb-ink">
                        Pilar: {proj.pillar}
                      </span>
                    </div>

                    {/* Bottom Media Controls Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      {proj.videoSrc ? (
                        <button
                          type="button"
                          onClick={() => toggleCardVideo(proj.id)}
                          className="wb-btn wb-btn-primary h-11 px-4 text-[13.5px]"
                        >
                          <Film className="h-3.5 w-3.5" />
                          <span>{showVideo ? 'Ver foto de capa' : 'Assistir vídeo real'}</span>
                        </button>
                      ) : (
                        <span />
                      )}

                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                    <div>
                      <div className="flex items-center justify-between font-key text-[11px] font-bold text-wb-ink-3">
                        <span>
                          {proj.category} · {proj.year}
                        </span>
                        {proj.instagramUrl && (
                          <a
                            href={proj.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[44px] items-center gap-1 text-[13px] text-wb-orange hover:underline"
                          >
                            <span>Reel oficial</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <h2 className="mt-1.5 font-brand text-xl sm:text-2xl font-bold text-wb-ink leading-snug">
                        {proj.title}
                      </h2>

                      <p className="mt-2 text-[14.5px] leading-relaxed text-wb-ink-2">
                        {proj.summary}
                      </p>

                      {/* Thumbnail Strip of Real Steps (if available) */}
                      {proj.gallery && proj.gallery.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                          {proj.gallery.map((gImg, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedProject(proj)}
                              className="h-12 w-14 shrink-0 overflow-hidden rounded-lg border border-wb-line hover:border-wb-orange"
                            >
                              <img
                                src={gImg}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between font-key text-[11px] font-bold">
                          <span className="text-wb-ink-2">Estágio de Execução na Bancada</span>
                          <span
                            className={
                              proj.status === 'Produzido' ? 'text-wb-green' : 'text-wb-orange'
                            }
                          >
                            {proj.progress}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-wb-bench">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${proj.progress}%`,
                              backgroundColor:
                                proj.status === 'Produzido' ? '#23963C' : '#FF6B35',
                            }}
                          />
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {proj.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="border-t border-wb-line py-2.5"
                          >
                            <div className="font-key text-[10px] text-wb-ink-3 truncate">
                              {m.label}
                            </div>
                            <div className="text-[12.5px] font-bold text-wb-ink mt-0.5 truncate">
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Equipments Used + Details Button */}
                    <div className="mt-6 pt-4 border-t border-wb-line flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {proj.equipmentsUsed.map((eq) => (
                          <span key={eq} className="wb-key text-[11px]">
                            {eq}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProject(proj)}
                        className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-wb-orange hover:underline"
                      >
                        <span>Ver Vídeo & Fotos</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Technical Details Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="wb-modal wb-pop relative max-h-[90vh] w-[min(920px,95vw)] overflow-y-auto p-6 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-wb-line bg-wb-bench text-wb-ink hover:bg-wb-orange hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="wb-key text-wb-orange font-bold">
              {selectedProject.status} · {selectedProject.pillar}
            </span>
            <h2 className="mt-3 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
              {selectedProject.title}
            </h2>
            <p className="mt-1 text-[15px] font-semibold text-wb-ink-2">
              {selectedProject.subtitle}
            </p>

            {/* Video + Photo Gallery inside Modal */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
              {selectedProject.videoSrc ? (
                <div className="rounded-2xl overflow-hidden border border-wb-line bg-black aspect-[9/15] max-w-[260px] mx-auto w-full">
                  <video
                    src={selectedProject.videoSrc}
                    poster={selectedProject.image}
                    autoPlay
                    controls
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full rounded-2xl border border-wb-line object-cover"
                />
              )}

              <div className="space-y-4">
                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedProject.gallery.map((g, i) => (
                      <img
                        key={i}
                        src={g}
                        alt=""
                        className="h-28 w-full rounded-xl object-cover border border-wb-line"
                      />
                    ))}
                  </div>
                )}

                <div className="rounded-xl border border-wb-line bg-wb-bench/70 p-4">
                  <h3 className="font-key text-[11px] font-bold text-wb-ink-3">
                    Resumo Técnico
                  </h3>
                  <p className="mt-1.5 text-[14px] text-wb-ink leading-relaxed">
                    {selectedProject.summary}
                  </p>
                </div>

                <div className="rounded-xl border border-wb-line bg-wb-bench/70 p-4">
                  <h3 className="font-key text-[11px] font-bold text-wb-green">
                    Impacto no Campus Breves / Marajó
                  </h3>
                  <p className="mt-1.5 text-[14px] text-wb-ink leading-relaxed">
                    {selectedProject.impactMarajo}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-wb-line bg-white p-4 text-[13.5px] space-y-1.5">
              <p>
                <strong>Equipe / Autores:</strong> {selectedProject.authors.join(', ')}
              </p>
              <p>
                <strong>Orientação / Coordenação:</strong> {selectedProject.advisor}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
