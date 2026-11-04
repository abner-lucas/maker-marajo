import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/*
 * Composição Remotion: montagem do robô 4WD em perspectiva isométrica.
 * O quadro é controlado pela rolagem da seção (o Player não toca sozinho), então os mesmos
 * intervalos de progresso da versão anterior continuam valendo: 0..1 = stepProgress.
 * Ilustração didática — não é uma simulação física do robô.
 */

export const MONTAGEM_FPS = 30;
export const MONTAGEM_DURACAO = 600;
export const MONTAGEM_W = 1280;
export const MONTAGEM_H = 880;

const FONTE = "'Hanken Grotesk Variable', system-ui, sans-serif";
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/* ---------------------------------------------------------------- projeção */

const S = 2.15; // px por mm
const C30 = Math.cos(Math.PI / 6);
const S30 = 0.5;
type P3 = [number, number, number];
const iso = ([x, y, z]: P3): [number, number] => [(x - z) * C30 * S, (x + z) * S30 * S - y * S];
const pts = (ps: P3[]) => ps.map((p) => iso(p).join(',')).join(' ');

const tom = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

/** Caixa com três faces visíveis; luz vindo de cima/esquerda */
const Caixa: React.FC<{ o: P3; t: P3; cor: string; topo?: string; brilho?: boolean }> = ({ o, t, cor, topo, brilho = true }) => {
  const [x, y, z] = o;
  const [w, h, d] = t;
  const T: P3[] = [[x, y + h, z], [x + w, y + h, z], [x + w, y + h, z + d], [x, y + h, z + d]];
  const E: P3[] = [[x, y, z + d], [x + w, y, z + d], [x + w, y + h, z + d], [x, y + h, z + d]];
  const D: P3[] = [[x + w, y, z], [x + w, y, z + d], [x + w, y + h, z + d], [x + w, y + h, z]];
  return (
    <g>
      <polygon points={pts(E)} fill={tom(cor, -0.12)} />
      <polygon points={pts(D)} fill={tom(cor, -0.32)} />
      <polygon points={pts(T)} fill={topo ?? tom(cor, 0.1)} />
      {brilho && (
        <polyline
          points={pts([[x, y + h, z + d], [x, y + h, z], [x + w, y + h, z]])}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={1}
        />
      )}
    </g>
  );
};

/** Círculo no plano xy (eixo em z) ou yz (eixo em x), amostrado como polígono */
const circulo = (c: P3, r: number, eixo: 'z' | 'x', n = 36): string => {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p: P3 =
      eixo === 'z' ? [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]] : [c[0], c[1] + Math.sin(a) * r, c[2] + Math.cos(a) * r];
    out.push(iso(p).join(','));
  }
  return out.join(' ');
};

/** Cilindro extrudado: discos de trás para frente dão volume sem cálculo de silhueta */
const Cilindro: React.FC<{ c: P3; r: number; de: number; ate: number; eixo: 'z' | 'x'; cor: string; tampa?: string }> = ({
  c,
  r,
  de,
  ate,
  eixo,
  cor,
  tampa,
}) => {
  const passos = 10;
  const discos = [];
  for (let i = 0; i <= passos; i++) {
    const k = de + ((ate - de) * i) / passos;
    const centro: P3 = eixo === 'z' ? [c[0], c[1], k] : [k, c[1], c[2]];
    discos.push(<polygon key={i} points={circulo(centro, r, eixo)} fill={i === passos ? tampa ?? tom(cor, 0.08) : tom(cor, -0.25)} />);
  }
  return <g>{discos}</g>;
};

/** Roda 65 mm com cravos e raios que giram conforme o deslocamento */
const Roda: React.FC<{ c: P3; giro: number; frente: boolean }> = ({ c, giro, frente }) => {
  const r = 32.5;
  const [z0, z1] = frente ? [c[2] - 12, c[2] + 12] : [c[2] + 12, c[2] - 12];
  const face: P3 = [c[0], c[1], z1];
  const cravos = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + giro;
    const [px, py] = iso([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z1]);
    const [qx, qy] = iso([c[0] + Math.cos(a) * (r - 4), c[1] + Math.sin(a) * (r - 4), z1]);
    cravos.push(<line key={i} x1={px} y1={py} x2={qx} y2={qy} stroke="#0d0d0e" strokeWidth={2.6} strokeLinecap="round" />);
  }
  const raios = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + giro;
    const [ax, ay] = iso([c[0] + Math.cos(a) * 6, c[1] + Math.sin(a) * 6, z1 + 0.5]);
    const [bx, by] = iso([c[0] + Math.cos(a) * 15, c[1] + Math.sin(a) * 15, z1 + 0.5]);
    raios.push(<line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={tom('#e25a24', -0.25)} strokeWidth={3.2} strokeLinecap="round" />);
  }
  return (
    <g>
      <Cilindro c={c} r={r} de={z0} ate={z1} eixo="z" cor="#1d1d20" tampa="#2a2a2e" />
      {cravos}
      <polygon points={circulo([face[0], face[1], z1 + 0.4], 17, 'z')} fill="#e25a24" />
      {raios}
      <polygon points={circulo([face[0], face[1], z1 + 0.8], 5, 'z')} fill="#2b2d31" />
    </g>
  );
};

/** Chamada técnica: ponto na peça, linha e rótulo (mantém o texto original da ilustração) */
const Chamada: React.FC<{ ancora: P3; dx: number; dy: number; texto: string; op: number }> = ({ ancora, dx, dy, texto, op }) => {
  const [ax, ay] = iso(ancora);
  const lx = ax + dx;
  const ly = ay + dy;
  const larg = texto.length * 7.6 + 22;
  const esq = dx < 0;
  return (
    <g opacity={op}>
      <circle cx={ax} cy={ay} r={3.5} fill="#16130f" />
      <polyline points={`${ax},${ay} ${lx},${ly} ${lx + (esq ? -14 : 14)},${ly}`} fill="none" stroke="#16130f" strokeWidth={1.2} />
      <g transform={`translate(${esq ? lx - 14 - larg : lx + 14}, ${ly - 14})`}>
        <rect width={larg} height={28} rx={14} fill="#16130f" />
        <text x={larg / 2} y={18.5} textAnchor="middle" fontFamily={FONTE} fontSize={13} fontWeight={600} fill="#fbfaf7" letterSpacing={0.3}>
          {texto}
        </text>
      </g>
    </g>
  );
};

/* ---------------------------------------------------------------- composição */

const faixa = (p: number, a: number, b: number) => interpolate(p, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

export const MontagemRobo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = frame / (MONTAGEM_DURACAO - 1);

  // Mesmos intervalos da animação original (stepProgress)
  const ini = (a: number) => Math.round(a * (MONTAGEM_DURACAO - 1));
  const queda = (a: number) =>
    spring({ frame: frame - ini(a), fps, config: { damping: 13, mass: 0.7, stiffness: 120 }, durationInFrames: 40 });
  const pChassi = queda(0.01);
  const pSuportes = queda(0.09);
  const pRodas = queda(0.16);
  const pCarenagem = queda(0.23);
  const pArduino = queda(0.34);
  const pSensor = queda(0.45);
  const pFios = faixa(p, 0.52, 0.66);
  const pDrive = faixa(p, 0.85, 1);
  const simulando = p >= 0.86;

  // Deslocamento do robô na simulação (mesma trajetória senoidal da versão anterior, em mm)
  const desloc = simulando ? Math.sin(pDrive * Math.PI * 4) * 18 : 0;
  const giroRodas = -desloc / 32.5;

  // Câmera: plano geral → aproxima na eletrônica (etapa 2) → recua e acompanha o robô (etapa 3)
  const zoom = interpolate(p, [0, 0.3, 0.42, 0.62, 0.78, 1], [0.92, 1, 1.22, 1.22, 1.02, 1], {
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  const camX = interpolate(p, [0, 0.3, 0.42, 0.62, 0.78], [0, 0, -40, -40, 0], { extrapolateRight: 'clamp', easing: EASE });
  const camY = interpolate(p, [0, 0.3, 0.42, 0.62, 0.78], [10, 0, 70, 70, 0], { extrapolateRight: 'clamp', easing: EASE });
  const [segueX] = iso([desloc, 0, 0]);

  const desce = (v: number, altura = 70) => (1 - v) * altura;
  const g = (v: number) => Math.max(0, Math.min(1, v * 1.6));

  // Geometria (mm). Chão em y = 0
  const yEixo = 32.5;
  const yPlaca = 40;
  const ySup = yPlaca + 6;
  const yPonte = ySup + 30;
  const yUno = yPonte + 8 + 4;

  return (
    <AbsoluteFill>
      <svg viewBox={`${-MONTAGEM_W / 2} ${-MONTAGEM_H / 2 - 60} ${MONTAGEM_W} ${MONTAGEM_H}`} width="100%" height="100%">
        <defs>
          <radialGradient id="luz" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
          <filter id="desfoque" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
        </defs>
        <ellipse cx={0} cy={-40} rx={560} ry={330} fill="url(#luz)" />

        <g transform={`translate(${camX - segueX * 0.35}, ${camY}) scale(${zoom})`}>
          {/* cota de 180 mm no chão */}
          <g opacity={g(pChassi)}>
            {(() => {
              const [ax, ay] = iso([-90, 0, 92]);
              const [bx, by] = iso([90, 0, 92]);
              const [mx, my] = iso([0, 0, 92]);
              return (
                <g>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#16130f" strokeWidth={1.2} />
                  <line x1={ax} y1={ay - 8} x2={ax} y2={ay + 8} stroke="#16130f" strokeWidth={1.2} />
                  <line x1={bx} y1={by - 8} x2={bx} y2={by + 8} stroke="#16130f" strokeWidth={1.2} />
                  <g transform={`translate(${mx}, ${my + 4}) rotate(30)`}>
                    <rect x={-34} y={-12} width={68} height={24} rx={12} fill="#fbfaf7" stroke="#16130f" strokeWidth={1} />
                    <text x={0} y={5} textAnchor="middle" fontFamily={FONTE} fontSize={12.5} fontWeight={700} fill="#16130f">
                      180 mm
                    </text>
                  </g>
                </g>
              );
            })()}
          </g>

          <g transform={`translate(${segueX}, 0)`}>
            {/* sombra de contato */}
            <ellipse
              cx={0}
              cy={iso([0, 0, 0])[1] + 30}
              rx={250 * Math.max(0.25, g(pChassi))}
              ry={95 * Math.max(0.25, g(pChassi))}
              fill="rgba(42,28,16,0.28)"
              filter="url(#desfoque)"
            />

            {/* rodas traseiras e motores */}
            <g opacity={g(pRodas)}>
              {[-58, 58].map((x) => (
                <g key={x} transform={`translate(0, ${desce(pRodas, 50)})`}>
                  <Roda c={[x, yEixo, -75]} giro={giroRodas} frente={false} />
                </g>
              ))}
              {[-58, 58].map((x) =>
                [-1, 1].map((l) => <Caixa key={`${x}${l}`} o={[x - 32, yEixo - 11, l * 45 - 9.5]} t={[64, 22, 19]} cor="#e9b92c" />)
              )}
            </g>

            {/* chassi MDF 6 mm com borda queimada e furos */}
            <g opacity={g(pChassi)} transform={`translate(0, ${-desce(pChassi)})`}>
              <Caixa o={[-90, yPlaca, -62.5]} t={[180, 6, 125]} cor="#5b3a22" topo="#cfa274" />
              {[[-60, -40], [-60, 40], [60, -40], [60, 40], [0, -50], [0, 50]].map(([x, z]) => {
                const [cx, cy] = iso([x, yPlaca + 6, z]);
                return <ellipse key={`f${x}${z}`} cx={cx} cy={cy} rx={6.4} ry={3.7} fill="#4a2c18" />;
              })}
              {[-40, -20, 0, 20, 40].map((x) => (
                <polygon key={`r${x}`} points={pts([[x - 6, yPlaca + 6, -14], [x + 6, yPlaca + 6, -14], [x + 6, yPlaca + 6, 14], [x - 6, yPlaca + 6, 14]])} fill="#4a2c18" opacity={0.85} />
              ))}
            </g>

            {/* suportes impressos em PLA+ */}
            <g opacity={g(pSuportes)} transform={`translate(0, ${-desce(pSuportes)})`}>
              {[-80, 50].map((x) => (
                <g key={x}>
                  <Caixa o={[x, ySup, -35]} t={[30, 30, 70]} cor="#e25a24" />
                  {[0, 1, 2, 3].map((k) => (
                    <polyline
                      key={k}
                      points={pts([[x, ySup + 6 + k * 6, 35], [x + 30, ySup + 6 + k * 6, 35]])}
                      stroke={tom('#e25a24', -0.28)}
                      strokeWidth={0.8}
                      fill="none"
                    />
                  ))}
                </g>
              ))}
            </g>

            {/* carenagem escaneada */}
            <g opacity={g(pCarenagem)} transform={`translate(0, ${-desce(pCarenagem)})`}>
              <Caixa o={[-82, yPonte, -45]} t={[164, 8, 90]} cor="#1f8a52" />
              <Caixa o={[-70, yPonte + 8, -38]} t={[140, 4, 76]} cor="#1f8a52" brilho={false} />
            </g>

            {/* Arduino UNO */}
            <g opacity={g(pArduino)} transform={`translate(0, ${-desce(pArduino, 90)})`}>
              <Caixa o={[-50, yUno, -26.7]} t={[68.6, 1.6, 53.4]} cor="#0b5c97" />
              <Caixa o={[-28, yUno + 1.6, -4]} t={[35, 3.6, 7.6]} cor="#1a1a1c" />
              <Caixa o={[-48, yUno + 1.6, -22]} t={[46, 8.5, 2.6]} cor="#1a1a1c" />
              <Caixa o={[-44, yUno + 1.6, 19]} t={[36, 8.5, 2.6]} cor="#1a1a1c" />
              <Caixa o={[-56, yUno + 1.6, -14]} t={[16, 11, 12]} cor="#b8bec5" />
              <Caixa o={[-56, yUno + 1.6, 8]} t={[14, 11, 9]} cor="#1a1a1c" />
              {(() => {
                const [lx, ly] = iso([10, yUno + 1.7, 16]);
                return <circle cx={lx} cy={ly} r={2.4} fill="#3bff7a" />;
              })()}
            </g>

            {/* HC-SR04 na frente */}
            <g opacity={g(pSensor)} transform={`translate(${desce(pSensor, 60)}, 0)`}>
              <Caixa o={[86, yPlaca + 6, -24]} t={[3, 26, 48]} cor="#0b5c97" />
              {[-13, 13].map((z) => (
                <g key={z}>
                  <Cilindro c={[0, yPlaca + 19, z]} r={8} de={89} ate={101} eixo="x" cor="#b8bec5" tampa="#2a2c30" />
                </g>
              ))}
              {p > 0.5 &&
                [0, 1, 2].map((k) => {
                  const fase = ((frame / 18 + k / 3) % 1 + 1) % 1;
                  const [ox, oy] = iso([104 + fase * 60, yPlaca + 19, 0]);
                  return (
                    <ellipse
                      key={k}
                      cx={ox}
                      cy={oy}
                      rx={10 + fase * 26}
                      ry={18 + fase * 46}
                      transform={`rotate(-30 ${ox} ${oy})`}
                      fill="none"
                      stroke="#23a35e"
                      strokeWidth={2}
                      opacity={(1 - fase) * 0.8}
                    />
                  );
                })}
            </g>

            {/* fios ponto a ponto */}
            {pFios > 0 &&
              (
                [
                  { cor: '#c8302c', de: [-30, yUno + 10, -22], ate: [87, yPlaca + 12, -6], alt: 40 },
                  { cor: '#e8792d', de: [-24, yUno + 10, -22], ate: [87, yPlaca + 12, 2], alt: 52 },
                  { cor: '#2f9e5b', de: [-40, yUno + 10, 19], ate: [-58, yEixo + 4, 45], alt: 30 },
                ] as { cor: string; de: P3; ate: P3; alt: number }[]
              ).map((f, i) => {
                const [ax, ay] = iso(f.de);
                const [bx, by] = iso(f.ate);
                const c1 = iso([f.de[0], f.de[1] + f.alt, f.de[2]]);
                const c2 = iso([f.ate[0], f.ate[1] + f.alt * 0.6, f.ate[2]]);
                const d = `M ${ax} ${ay} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${bx} ${by}`;
                return (
                  <g key={i}>
                    <path d={d} stroke="rgba(0,0,0,0.25)" strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pFios} strokeLinecap="round" />
                    <path d={d} stroke={f.cor} strokeWidth={3.4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pFios} strokeLinecap="round" />
                  </g>
                );
              })}

            {/* rodas dianteiras por cima de tudo (mais próximas da câmera) */}
            <g opacity={g(pRodas)}>
              {[-58, 58].map((x) => (
                <g key={x} transform={`translate(0, ${desce(pRodas, 50)})`}>
                  <Roda c={[x, yEixo, 75]} giro={giroRodas} frente />
                </g>
              ))}
            </g>

            {/* chamadas técnicas (texto original da ilustração) */}
            <Chamada ancora={[-70, yPlaca + 6, 62.5]} dx={-70} dy={70} texto="CHASSI MDF CORTE LASER CNC · 6MM" op={faixa(p, 0.06, 0.1) * (1 - faixa(p, 0.34, 0.38))} />
            <Chamada ancora={[-65, ySup + 30, 35]} dx={-110} dy={-40} texto="3D PLA+" op={faixa(p, 0.14, 0.18) * (1 - faixa(p, 0.34, 0.38))} />
            <Chamada ancora={[65, ySup + 30, 35]} dx={90} dy={-30} texto="3D PLA+" op={faixa(p, 0.14, 0.18) * (1 - faixa(p, 0.34, 0.38))} />
            <Chamada ancora={[60, yPonte + 12, -20]} dx={120} dy={-70} texto="ESTRUTURA IF MAKER · BREVES" op={faixa(p, 0.28, 0.32) * (1 - faixa(p, 0.4, 0.44))} />
            <Chamada ancora={[-16, yUno + 2, -10]} dx={-150} dy={-90} texto="ARDUINO UNO R3" op={faixa(p, 0.4, 0.44) * (1 - faixa(p, 0.82, 0.86))} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
