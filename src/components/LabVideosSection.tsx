import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { LAB_VIDEOS, LabVideoItem } from '../data/labData';

export const LabVideosSection: React.FC = () => {
  const [activeVideoId, setActiveVideoId] = useState<string>(LAB_VIDEOS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeHighlightIdx, setActiveHighlightIdx] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo: LabVideoItem =
    LAB_VIDEOS.find((v) => v.id === activeVideoId) || LAB_VIDEOS[0];

  const handleSelectVideo = (vid: LabVideoItem) => {
    setActiveVideoId(vid.id);
    setActiveHighlightIdx(0);
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 50);
  };

  const handleSeekToHighlight = (seconds: number, idx: number) => {
    setActiveHighlightIdx(idx);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleStepFrame = (direction: -1 | 1) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    // Step ~0.25s (7-8 frames at 30fps) for clear visual inspection
    const nextTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 15, videoRef.current.currentTime + direction * 0.35)
    );
    videoRef.current.currentTime = nextTime;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section
      id="videos-reais"
      className="scroll-mt-20 bg-wb-bench border-b border-wb-line py-20 sm:py-28 font-ui text-wb-ink"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-wb-line bg-white px-3.5 py-1.5 shadow-sm">
              <Film className="h-4 w-4 text-wb-orange" />
              <span className="font-key text-[11.5px] font-bold uppercase tracking-wider text-wb-ink">
                VÍDEOS REAIS & INSPEÇÃO QUADRO A QUADRO · LABMAKER MARAJÓ
              </span>
            </div>
            <h2
              className="mt-4 font-brand font-bold text-wb-ink"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.04,
                letterSpacing: '-0.045em',
              }}
            >
              Assista ao que já foi produzido no laboratório.
            </h2>
          </div>

          <p className="text-[15.5px] text-wb-ink-2 max-w-[34em]">
            Explore os vídeos oficiais da inauguração, do <strong>Robot Soccer</strong> e da{' '}
            <strong>produção das medalhas do IV JINs</strong>. Clique nos quadros da linha do tempo
            ou use os botões <code>-1 Quadro / +1 Quadro</code> para inspecionar cada detalhe.
          </p>
        </div>

        {/* Video Selector Tabs */}
        <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {LAB_VIDEOS.map((vid) => {
            const isSelected = vid.id === activeVideo.id;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectVideo(vid)}
                className={`text-left rounded-[18px] border p-4 transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-wb-ink bg-wb-ink text-white shadow-lg scale-[1.01]'
                    : 'border-wb-line bg-white text-wb-ink hover:bg-wb-canvas'
                }`}
              >
                <img
                  src={vid.posterSrc}
                  alt={vid.title}
                  className="h-16 w-14 rounded-xl object-cover shrink-0 border border-white/20"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 font-key text-[10px] font-bold text-white"
                    style={{ backgroundColor: vid.accentColor }}
                  >
                    {vid.category}
                  </span>
                  <h3 className="mt-1.5 font-brand text-[15px] font-bold leading-snug line-clamp-1">
                    {vid.title}
                  </h3>
                  <p
                    className={`mt-0.5 text-[12px] line-clamp-1 ${
                      isSelected ? 'text-white/75' : 'text-wb-ink-3'
                    }`}
                  >
                    {vid.date} · {vid.author}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Video Stage + Frame-by-Frame Inspector */}
        <div className="mt-8 wb-panel overflow-hidden bg-white grid grid-cols-1 lg:grid-cols-[380px_1fr]">
          {/* Left: Vertical 9:16 Video Player with Frame Step Controls */}
          <div className="bg-[#0E1311] p-5 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-wb-line">
            <div className="relative w-full max-w-[310px] aspect-[9/16] rounded-[20px] overflow-hidden border border-white/15 shadow-2xl bg-black">
              <video
                ref={videoRef}
                key={activeVideo.videoSrc}
                src={activeVideo.videoSrc}
                poster={activeVideo.posterSrc}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={() => {
                  if (!videoRef.current) return;
                  const t = videoRef.current.currentTime;
                  // Highlight corresponding chapter
                  let matched = 0;
                  activeVideo.frameByFrameHighlights.forEach((h, idx) => {
                    if (t >= h.seconds) matched = idx;
                  });
                  if (matched !== activeHighlightIdx) {
                    setActiveHighlightIdx(matched);
                  }
                }}
                className="h-full w-full object-cover"
              />

              {/* Top Overlay Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="rounded-full bg-black/70 px-3 py-1 font-key text-[10.5px] font-bold text-white backdrop-blur">
                  REEL · {activeVideo.reelCode}
                </span>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-wb-orange"
                  title={isMuted ? 'Ativar áudio do vídeo' : 'Silenciar áudio'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Frame-by-Frame Control Bar */}
            <div className="mt-4 w-full max-w-[310px] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleStepFrame(-1)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/10 py-2 font-key text-[11.5px] font-bold text-white hover:bg-white/20"
                title="Voltar quadro a quadro"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>-1 Quadro</span>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-10 w-12 items-center justify-center rounded-xl bg-wb-orange text-white hover:bg-wb-orange/90"
                title={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStepFrame(1)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/10 py-2 font-key text-[11.5px] font-bold text-white hover:bg-white/20"
                title="Avançar quadro a quadro"
              >
                <span>+1 Quadro</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: Frame-by-Frame Breakdown & Equipment Identified */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wb-line pb-4">
                <div>
                  <span className="font-key text-[11px] font-bold uppercase text-wb-orange">
                    ANÁLISE QUADRO A QUADRO DO VÍDEO
                  </span>
                  <h3 className="mt-1 font-brand text-2xl font-bold text-wb-ink">
                    {activeVideo.title}
                  </h3>
                </div>

                <a
                  href={activeVideo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-wb-line bg-wb-bench px-3.5 py-1.5 text-[12.5px] font-bold text-wb-ink hover:border-wb-orange hover:text-wb-orange"
                >
                  <span>Abrir Reel no Instagram</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-wb-ink-2">
                {activeVideo.summary}
              </p>

              {/* Interactive Frame Cards Grid */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-key text-[11.5px] font-bold uppercase text-wb-ink-3">
                    Clique em qualquer quadro abaixo para pular para o momento exato no vídeo:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeVideo.frameByFrameHighlights.map((hl, idx) => {
                    const isCurrent = activeHighlightIdx === idx;
                    return (
                      <button
                        key={hl.timeLabel + idx}
                        type="button"
                        onClick={() => handleSeekToHighlight(hl.seconds, idx)}
                        className={`flex items-start gap-3 rounded-2xl border p-2.5 text-left transition-all ${
                          isCurrent
                            ? 'border-wb-orange bg-wb-orange/10 ring-2 ring-wb-orange/30'
                            : 'border-wb-line bg-wb-bench/50 hover:bg-wb-bench'
                        }`}
                      >
                        <img
                          src={hl.thumbSrc}
                          alt={hl.title}
                          className="h-16 w-16 rounded-xl object-cover shrink-0 border border-wb-line"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-wb-ink px-1.5 py-0.5 font-key text-[10px] font-bold text-white">
                              {hl.timeLabel}
                            </span>
                            <span className="truncate text-[13px] font-bold text-wb-ink">
                              {hl.title}
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-snug text-wb-ink-2 line-clamp-2">
                            {hl.detail}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom: Equipment & Tools Seen in this Video */}
            <div className="mt-7 pt-5 border-t border-wb-line">
              <div className="flex items-center gap-2 font-key text-[11px] font-bold uppercase text-wb-green">
                <Wrench className="h-3.5 w-3.5" />
                <span>Equipamentos e Bancadas Identificados neste Vídeo:</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {activeVideo.equipmentsSeen.map((item) => (
                  <span key={item} className="wb-key text-[11.5px] bg-wb-bench">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

