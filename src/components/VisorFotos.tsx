import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface VisorFotosProps {
  fotos: string[];
  inicial: number;
  titulo?: string;
  onFechar: () => void;
}

/**
 * Visualizador de fotos em tela cheia.
 * Setas na tela, setas do teclado (← →), Esc para fechar e deslizar o dedo no celular.
 */
export const VisorFotos: React.FC<VisorFotosProps> = ({ fotos, inicial, titulo, onFechar }) => {
  const [indice, setIndice] = useState(inicial);
  const toqueX = useRef<number | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const total = fotos.length;

  const anterior = useCallback(() => setIndice((i) => (i - 1 + total) % total), [total]);
  const proxima = useCallback(() => setIndice((i) => (i + 1) % total), [total]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'ArrowRight') proxima();
      else if (e.key === 'Escape') {
        e.stopPropagation();
        onFechar();
      }
    };
    window.addEventListener('keydown', tecla, true);
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fecharRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', tecla, true);
      document.body.style.overflow = rolagem;
    };
  }, [anterior, proxima, onFechar]);

  // pré-carrega as vizinhas para a troca ficar instantânea
  useEffect(() => {
    [fotos[(indice + 1) % total], fotos[(indice - 1 + total) % total]].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [indice, fotos, total]);

  if (!total) return null;

  const botaoSeta =
    'absolute top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-wb-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo ? `Fotos: ${titulo}` : 'Fotos'}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
      onClick={onFechar}
      onTouchStart={(e) => {
        toqueX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return;
        const dx = e.changedTouches[0].clientX - toqueX.current;
        toqueX.current = null;
        if (Math.abs(dx) > 45) (dx > 0 ? anterior : proxima)();
      }}
    >
      <img
        key={fotos[indice]}
        src={fotos[indice]}
        alt={titulo ? `${titulo} — foto ${indice + 1} de ${total}` : `Foto ${indice + 1} de ${total}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[92vw] select-none rounded-xl object-contain shadow-2xl wb-pop"
        draggable={false}
      />

      <button
        ref={fecharRef}
        type="button"
        aria-label="Fechar fotos"
        onClick={onFechar}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-wb-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <X className="h-5 w-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.stopPropagation();
              anterior();
            }}
            className={`${botaoSeta} left-3 sm:left-6`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => {
              e.stopPropagation();
              proxima();
            }}
            className={`${botaoSeta} right-3 sm:right-6`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <p
            aria-live="polite"
            className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3.5 py-1 font-key text-[13px] font-semibold text-white"
          >
            {indice + 1} / {total}
          </p>
        </>
      )}
    </div>
  );
};
