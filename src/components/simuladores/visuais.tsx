import React, { useEffect, useRef, useState } from 'react';

/*
 * Visuais dos simuladores das páginas de equipamento. Recebem exatamente os mesmos valores
 * de estado de antes (ângulos, garra, modo e densidade do scanner) — só a representação muda.
 */

/** Suaviza um valor numérico com mola (inércia ao mover o controle), respeitando "reduzir movimento" */
export function useMola(alvo: number, rigidez = 140, amortecimento = 18) {
  const [valor, setValor] = useState(alvo);
  const estado = useRef({ x: alvo, v: 0 });
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      estado.current = { x: alvo, v: 0 };
      setValor(alvo);
      return;
    }
    let raf = 0;
    let ultimo = performance.now();
    const passo = (agora: number) => {
      const dt = Math.min(0.032, (agora - ultimo) / 1000);
      ultimo = agora;
      const s = estado.current;
      const a = (alvo - s.x) * rigidez - s.v * amortecimento;
      s.v += a * dt;
      s.x += s.v * dt;
      setValor(s.x);
      if (Math.abs(alvo - s.x) > 0.05 || Math.abs(s.v) > 0.05) raf = requestAnimationFrame(passo);
      else setValor(alvo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo, rigidez, amortecimento]);
  return valor;
}

const arco = (r: number, de: number, ate: number) => {
  const p = (g: number) => [Math.sin((g * Math.PI) / 180) * r, -Math.cos((g * Math.PI) / 180) * r];
  const [x1, y1] = p(de);
  const [x2, y2] = p(ate);
  const grande = Math.abs(ate - de) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${grande} ${ate > de ? 1 : 0} ${x2} ${y2}`;
};

/** Elo de alumínio entre duas juntas, apontando para cima (0,0) → (0,-L) */
const Elo: React.FC<{ L: number; larg: number }> = ({ L, larg }) => (
  <g>
    <rect x={-larg / 2} y={-L} width={larg} height={L} rx={larg / 2} fill="url(#braçoAluminio)" />
    {[0.3, 0.55, 0.8].map((k) => (
      <circle key={k} cx="0" cy={-L * k} r={larg * 0.2} fill="#23262b" opacity="0.85" />
    ))}
  </g>
);

const Servo: React.FC = () => (
  <g>
    <rect x="-13" y="-10" width="26" height="20" rx="3" fill="#1b1c1f" />
    <circle r="7.5" fill="url(#braçoAluminio)" />
    <circle r="2" fill="#1b1c1f" />
  </g>
);

export const BracoVisual: React.FC<{ ombro: number; cotovelo: number; garraAberta: boolean }> = ({
  ombro,
  cotovelo,
  garraAberta,
}) => {
  const o = useMola(ombro);
  const c = useMola(cotovelo);
  const g = useMola(garraAberta ? 1 : 0, 220, 22);
  return (
    <svg viewBox="0 0 280 190" className="h-full w-auto" aria-hidden="true">
      <defs>
        <linearGradient id="braçoAluminio" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8b939b" />
          <stop offset="0.45" stopColor="#eef1f4" />
          <stop offset="1" stopColor="#7c848c" />
        </linearGradient>
        <radialGradient id="braçoSombra" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(42,28,16,0.35)" />
          <stop offset="1" stopColor="rgba(42,28,16,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="130" cy="176" rx="74" ry="9" fill="url(#braçoSombra)" />
      {/* base e prato giratório */}
      <path d="M86 172 L92 158 L168 158 L174 172 Z" fill="#1e2023" />
      <ellipse cx="130" cy="158" rx="38" ry="6" fill="url(#braçoAluminio)" />
      <g transform={`translate(130, 155) rotate(${o})`}>
        <Elo L={64} larg={16} />
        {/* arco do ângulo do ombro */}
        <g transform={`rotate(${-o})`}>
          <path d={arco(24, 0, o)} fill="none" stroke="#23a35e" strokeWidth="2" opacity="0.8" />
        </g>
        <Servo />
        <g transform={`translate(0, -64) rotate(${c})`}>
          <Elo L={56} larg={12} />
          <g transform={`rotate(${-c})`}>
            <path d={arco(18, 0, c)} fill="none" stroke="#e25a24" strokeWidth="2" opacity="0.85" />
          </g>
          <Servo />
          {/* garra paralela: dedos deslizam conforme abre/fecha */}
          <g transform="translate(0, -56)">
            <rect x="-14" y="-6" width="28" height="7" rx="2" fill="#1b1c1f" />
            {[-1, 1].map((lado) => (
              <g key={lado} transform={`translate(${lado * (4 + g * 9)}, 0)`}>
                <rect x={lado > 0 ? 0 : -5} y="-24" width="5" height="19" rx="1.5" fill="url(#braçoAluminio)" />
                <rect x={lado > 0 ? 0 : -5} y="-24" width="5" height="7" rx="1.5" fill="#26272a" />
              </g>
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
};

/* -------------------------------------------------------------- scanner 3D */

// Perfil de uma urna marajoara (t: 0 = base, 1 = boca); raio em unidades do SVG
const perfil = (t: number) => 22 + 34 * Math.sin(Math.PI * Math.min(1, t * 1.05)) - 10 * t + (t > 0.85 ? (t - 0.85) * 90 : 0);
const Y0 = 132;
const ALT = 104;
const ACH = 0.2; // achatamento da elipse (vista levemente de cima)

export const ScannerVisual: React.FC<{ modo: 'points' | 'wireframe' | 'solid'; densidade: number }> = ({ modo, densidade }) => {
  const aneis = Math.round(8 + densidade / 4); // 13..33
  const meridianos = Math.round(10 + densidade / 3); // 17..43
  const cx = 130;

  const silhueta = () => {
    const esq: string[] = [];
    const dir: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = Y0 - t * ALT;
      esq.push(`${cx - perfil(t)},${y}`);
      dir.unshift(`${cx + perfil(t)},${y}`);
    }
    return `M ${esq.join(' L ')} L ${dir.join(' L ')} Z`;
  };

  const elementos: React.ReactNode[] = [];
  if (modo === 'points') {
    for (let i = 0; i < aneis; i++) {
      const t = i / (aneis - 1);
      const r = perfil(t);
      const y = Y0 - t * ALT;
      for (let j = 0; j < meridianos; j++) {
        const a = (j / meridianos) * Math.PI * 2;
        const frente = Math.sin(a);
        const luz = 0.35 + 0.65 * Math.max(0, frente * 0.6 + Math.cos(a + 0.8) * 0.4);
        elementos.push(
          <circle
            key={`${i}-${j}`}
            cx={cx + Math.cos(a) * r}
            cy={y + frente * r * ACH}
            r={frente > 0 ? 1.15 : 0.8}
            fill="#7dd3fc"
            opacity={frente > 0 ? luz : 0.18}
          />
        );
      }
    }
  } else if (modo === 'wireframe') {
    for (let i = 0; i < aneis; i++) {
      const t = i / (aneis - 1);
      const r = perfil(t);
      const y = Y0 - t * ALT;
      elementos.push(
        <ellipse key={`a${i}`} cx={cx} cy={y} rx={r} ry={r * ACH} fill="none" stroke="#38bdf8" strokeWidth="0.7" opacity="0.75" />
      );
    }
    for (let j = 0; j < meridianos; j++) {
      const a = (j / meridianos) * Math.PI * 2;
      const frente = Math.sin(a) > 0;
      const pts: string[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const r = perfil(t);
        pts.push(`${cx + Math.cos(a) * r},${Y0 - t * ALT + Math.sin(a) * r * ACH}`);
      }
      elementos.push(
        <polyline key={`m${j}`} points={pts.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="0.7" opacity={frente ? 0.85 : 0.2} />
      );
    }
  }

  return (
    <svg viewBox="0 0 260 150" className="h-full w-auto" aria-hidden="true">
      <defs>
        <linearGradient id="urnaBarro" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a3b1c" />
          <stop offset="0.35" stopColor="#d98a55" />
          <stop offset="0.6" stopColor="#c06a38" />
          <stop offset="1" stopColor="#5a2a12" />
        </linearGradient>
        <clipPath id="urnaRecorte">
          <path d={silhueta()} />
        </clipPath>
        <linearGradient id="scanLuz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(125,211,252,0)" />
          <stop offset="0.5" stopColor="rgba(125,211,252,0.55)" />
          <stop offset="1" stopColor="rgba(125,211,252,0)" />
        </linearGradient>
      </defs>
      {/* prato giratório do scanner */}
      <ellipse cx={cx} cy={Y0 + 4} rx="70" ry="11" fill="none" stroke="#1f6f99" strokeWidth="1" />
      <ellipse cx={cx} cy={Y0 + 4} rx="58" ry="8.5" fill="rgba(31,111,153,0.25)" />

      {modo === 'solid' && (
        <g>
          <path d={silhueta()} fill="url(#urnaBarro)" />
          <g clipPath="url(#urnaRecorte)" fill="none" stroke="#3a1a0a" strokeWidth="1.6" opacity="0.7">
            {[0.3, 0.62].map((t) => {
              const y = Y0 - t * ALT;
              let d = `M ${cx - 70} ${y}`;
              for (let x = cx - 70; x < cx + 70; x += 10) d += ` L ${x + 5} ${y - 5} L ${x + 10} ${y}`;
              return <path key={t} d={d} />;
            })}
            {[0.22, 0.38, 0.54, 0.7].map((t) => (
              <line key={t} x1={cx - 70} y1={Y0 - t * ALT} x2={cx + 70} y2={Y0 - t * ALT} strokeWidth="0.9" />
            ))}
          </g>
          <ellipse cx={cx} cy={Y0 - ALT} rx={perfil(1)} ry={perfil(1) * ACH} fill="#4a2210" />
        </g>
      )}
      {elementos}

      {/* linha de luz estruturada varrendo a peça */}
      <g className="scan-varre">
        <rect x="40" y="-8" width="180" height="16" fill="url(#scanLuz)" />
        <line x1="40" y1="0" x2="220" y2="0" stroke="#bae6fd" strokeWidth="0.8" />
      </g>
    </svg>
  );
};
