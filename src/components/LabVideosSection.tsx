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
            <div className="inline-flex items-center gap-2">
              <span className="rotulo">
                <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                Vídeos do laboratório · Produção em ação
              </span>
            </div>
            <h2
              className="mt-4 font-brand font-bold text-wb-ink"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.04,
                letterSpacing: '-0.028em',
              }}
            >
              Veja o laboratório <span className="acento text-wb-orange">em ação</span>.
            </h2>
          </div>

          <p className="text-[15.5px] text-wb-ink-2 max-w-[34em]">
            Três vídeos reais. Avance quadro a quadro ou pule pelos capítulos.
          </p>
        </div>

        {/* Video Selector Tabs */}
        <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
          {LAB_VIDEOS.map((vid) => {
            const isSelected = vid.id === activeVideo.id;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectVideo(vid)}
                aria-pressed={isSelected}
                className={`text-left border-t-2 pt-4 pb-2 transition-colors flex items-start gap-3.5 text-wb-ink ${
                  isSelected ? 'border-wb-orange' : 'border-wb-line hover:border-wb-ink opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={vid.posterSrc}
                  alt={vid.title}
                  className="h-16 w-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block font-key text-[12px] font-semibold"
                    style={{ color: vid.accentColor }}
                  >
                    {vid.category}
                  </span>
                  <h3 className="mt-1.5 font-brand text-[15px] font-bold leading-snug line-clamp-1">
                    {vid.title}
                  </h3>
                  <p
                    className={`mt-0.5 text-[12px] line-clamp-1 ${
                      'text-wb-ink-3'
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
        <div className="mt-8 overflow-hidden grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">
          {/* Left: Vertical 9:16 Video Player with Frame Step Controls */}
          <div className="rounded-[20px] bg-[#14110d] p-5 flex flex-col items-center justify-between">
            <div className="relative w-full max-w-[310px] aspect-[9/16] overflow-hidden rounded-[14px] bg-black">
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
                  Reel · {activeVideo.reelCode}
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
          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wb-line pb-4">
                <div>
                  <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                    Análise quadro a quadro do vídeo
                  </span>
                  <h3 className="mt-1 font-brand text-2xl font-bold text-wb-ink">
                    {activeVideo.title}
                  </h3>
                </div>

                <a
                  href={activeVideo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-wb-ink underline decoration-wb-line underline-offset-4 hover:text-wb-orange hover:decoration-wb-orange"
                >
                  <span>Abrir Reel no Instagram</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <p className="mt-4 line-clamp-2 text-[15px] leading-relaxed text-wb-ink-2">
                {activeVideo.summary}
              </p>

              {/* Interactive Frame Cards Grid */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-ink-3" />
                    Capítulos — toque para pular
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
                        className={`flex items-start gap-3 border-t-2 py-3 text-left transition-colors ${
                          isCurrent
                            ? 'border-wb-orange'
                            : 'border-wb-line hover:border-wb-ink'
                        }`}
                      >
                        <img
                          src={hl.thumbSrc}
                          alt={hl.title}
                          className="h-12 w-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-key text-[12px] font-semibold text-wb-orange">
                              {hl.timeLabel}
                            </span>
                            <span className="line-clamp-2 text-[14px] font-semibold text-wb-ink">
                              {hl.title}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

