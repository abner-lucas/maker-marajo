import React from 'react';

interface BrandLogoProps {
  className?: string;
  showCampus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Vector recreation of the official "LABORATÓRIO IF MAKER" geometric stencil logo
 * and IFPA (Instituto Federal do Pará - Campus Breves) emblem based on the official visual identity.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showCampus = true,
  size = 'md',
}) => {
  const heights = {
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-16',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official IFMAKER geometric stencil SVG */}
      <svg
        viewBox="0 0 350 96"
        className={`${heights[size]} w-auto shrink-0`}
        aria-label="Laboratório IF MAKER"
      >
        {/* Top "LABORATÓRIO" label */}
        <text
          x="116"
          y="20"
          fill="#141A17"
          fontFamily="'Hanken Grotesk Variable', sans-serif"
          fontSize="12.5"
          fontWeight="500"
          letterSpacing="2.2"
        >
          LABORATÓRIO
        </text>

        {/* === LETTER I (Black + Orange accent) === */}
        {/* Top serif bar */}
        <path d="M8 10 H48 C48 18 43 22 36 22 H8 Z" fill="#18191B" />
        {/* Orange upper stem */}
        <path d="M22 22 H34 V44 C29 39 25 38 22 38 Z" fill="#F57C20" />
        {/* Lower black stem + bottom bar */}
        <path d="M22 40 C27 40 31 43 34 48 V74 H48 V86 H8 V74 H22 Z" fill="#18191B" />

        {/* === LETTER F (Black + Blue-violet accent) === */}
        {/* Vertical stem upper */}
        <path d="M62 10 H74 V50 H62 Z" fill="#18191B" />
        {/* Top right detached bar */}
        <path d="M84 10 H108 V22 H92 C86 22 84 17 84 10 Z" fill="#18191B" />
        {/* Middle bar */}
        <path d="M74 42 H104 V53 H74 Z" fill="#18191B" />
        {/* Blue-violet accent in stem */}
        <rect x="62" y="50" width="12" height="18" fill="#6378D8" />
        {/* Bottom stem */}
        <path d="M62 66 H74 V86 H62 Z" fill="#18191B" />

        {/* === LETTER M (Black + IF Green accent) === */}
        <path d="M116 30 H126 V86 H116 Z" fill="#18191B" />
        {/* Green triangle fill on left half of M */}
        <polygon points="126,30 144,86 126,86" fill="#23963C" />
        {/* Right strokes of M */}
        <polygon points="154,30 166,30 152,86 144,86" fill="#18191B" />
        <path d="M164 30 H174 V86 H164 Z" fill="#18191B" />

        {/* === LETTER A (Black + Red inner triangle) === */}
        <polygon points="196,30 208,30 226,86 213,86 202,48 188,86 176,86" fill="#18191B" />
        {/* Red center triangle + crossbar */}
        <polygon points="201,51 210,77 187,77" fill="#DC1F26" />
        <path d="M183 75 H218 V86 H181 L176 92 L173 86 Z" fill="#18191B" />

        {/* === LETTER K (Black + Cyan lower triangle) === */}
        <path d="M232 30 H243 V60 L232 68 Z" fill="#18191B" />
        <polygon points="262,30 276,30 250,58 238,58" fill="#18191B" />
        <polygon points="246,61 256,61 277,86 263,86" fill="#18191B" />
        {/* Cyan triangle accent */}
        <polygon points="234,65 256,86 234,86" fill="#0092D6" />

        {/* === LETTER E (Black + Yellow/Gold middle block) === */}
        <path d="M282 36 H316 V45 H282 Z" fill="#18191B" />
        {/* Yellow upper-mid block */}
        <path d="M282 45 H314 V58 H292 V63 H282 Z" fill="#F9B814" />
        {/* Lower stem and bars */}
        <path d="M282 61 H292 V86 H282 Z" fill="#18191B" />
        <path d="M292 60 H314 V69 H292 Z" fill="#18191B" />
        <path d="M302 77 H316 V86 H298 C298 81 300 77 302 77 Z" fill="#18191B" />

        {/* === LETTER R (Black + Purple circle core) === */}
        <path
          d="M322 30 H340 C347 30 350 36 350 45 C350 54 345 60 338 62 L350 86 H339 L328 62 H322 V52 H334 C339 52 341 49 341 45 C341 41 339 38 334 38 H322 Z"
          fill="#18191B"
        />
        <path d="M322 58 H331 V86 H322 Z" fill="#18191B" />
        {/* Purple circle inside R bowl */}
        <circle cx="335" cy="46" r="8.5" fill="#70388E" />
      </svg>

      {showCampus && (
        <div className="hidden xl:flex items-center gap-2 pl-2.5 border-l border-wb-line">
          {/* Official IFPA Grid Mark */}
          <svg viewBox="0 0 28 38" className="h-7 w-auto shrink-0" aria-hidden="true">
            <circle cx="5" cy="5" r="4.5" fill="#DC1F26" />
            <rect x="11" y="1" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="20" y="1" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="1" y="10.5" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="11" y="10.5" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="1" y="20" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="11" y="20" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="20" y="20" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="1" y="29.5" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
            <rect x="11" y="29.5" width="7.5" height="7.5" rx="1.2" fill="#23963C" />
          </svg>
          <div className="leading-tight">
            <div className="font-ui text-[11px] font-bold text-wb-ink">
              IFPA · BREVES
            </div>
            <div className="font-key text-[10px] font-medium text-wb-ink-3">
              Campus Breves
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Word-by-word animated headline rise (exact Constructa `<v text={...} />` pattern)
 */
export const WordRise: React.FC<{ text: string; delayOffset?: number }> = ({
  text,
  delayOffset = 0,
}) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, idx) => (
        <React.Fragment key={idx}>
          <span
            className="word-rise"
            style={{ animationDelay: `${(delayOffset + idx * 0.055).toFixed(2)}s` }}
          >
            {word}
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </>
  );
};

