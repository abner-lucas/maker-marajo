import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

/** Easing expressivo usado em todo o site */
export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Camada de parallax: desloca o conteúdo verticalmente conforme a rolagem.
 * `velocidade` > 0 move mais devagar que a página (fundo); < 0 move mais rápido (primeiro plano).
 * Valores em px de deslocamento total enquanto o elemento atravessa a tela.
 */
export const Parallax: React.FC<{
  velocidade?: number;
  className?: string;
  children: React.ReactNode;
}> = ({ velocidade = 60, className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yBruto = useTransform(scrollYProgress, [0, 1], [velocidade, -velocidade]);
  // Mola leve: suaviza o "degrau" da roda do mouse sem atrasar demais
  const y = useSpring(yBruto, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      // useScroll precisa de um ancestral posicionado para medir o deslocamento
      className={`${className ?? ''} ${/absolute/.test(className ?? '') ? '' : 'relative'}`}
      style={reduzir ? undefined : { y }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Seção com transição ligada à rolagem: "abre" com recorte arredondado e leve subida.
 * Termina quando o topo da seção chega a ~65% da tela, para o conteúdo aparecer cedo.
 */
export const SecaoViva: React.FC<
  React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }
> = ({ children, className, style, ...rest }) => {
  const ref = useRef<HTMLElement>(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.65'] });
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ['inset(4% 3% 0% 3% round 36px)', 'inset(0% 0% 0% 0% round 0px)']
  );
  const y = useTransform(scrollYProgress, [0, 1], [44, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.65, 1]);
  return (
    <motion.section
      ref={ref}
      className={`relative ${className ?? ''}`}
      style={reduzir ? style : { ...style, clipPath, y, opacity }}
      {...(rest as object)}
    >
      {children}
    </motion.section>
  );
};

const itemVariantes = {
  oculto: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visivel: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: EASE } },
};

/** Revela um bloco ao entrar na tela (uma vez) */
export const Revelar: React.FC<{ className?: string; atraso?: number; children: React.ReactNode }> = ({
  className,
  atraso = 0,
  children,
}) => {
  const reduzir = useReducedMotion();
  if (reduzir) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, margin: '-60px' }}
      variants={itemVariantes}
      transition={{ delay: atraso }}
    >
      {children}
    </motion.div>
  );
};

/** Lista em cascata: filhos <CascataItem> entram um após o outro */
export const Cascata: React.FC<{ className?: string; as?: 'div' | 'ul'; children: React.ReactNode }> = ({
  className,
  as = 'div',
  children,
}) => {
  const reduzir = useReducedMotion();
  const Comp = as === 'ul' ? motion.ul : motion.div;
  if (reduzir) return as === 'ul' ? <ul className={className}>{children}</ul> : <div className={className}>{children}</div>;
  return (
    <Comp
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ visivel: { transition: { staggerChildren: 0.07 } } }}
    >
      {children}
    </Comp>
  );
};

export const CascataItem: React.FC<{ className?: string; as?: 'div' | 'li'; children: React.ReactNode }> = ({
  className,
  as = 'div',
  children,
}) => {
  const Comp = as === 'li' ? motion.li : motion.div;
  return (
    <Comp className={className} variants={itemVariantes}>
      {children}
    </Comp>
  );
};

/** Título que entra palavra a palavra por trás de uma máscara */
export const TituloPalavras: React.FC<{ texto: string; inicio?: number; className?: string }> = ({
  texto,
  inicio = 0,
  className,
}) => {
  const reduzir = useReducedMotion();
  if (reduzir) return <span className={className}>{texto}</span>;
  return (
    <motion.span
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, margin: '-40px' }}
    >
      {texto.split(' ').map((p, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              oculto: { y: '110%' },
              visivel: { y: '0%', transition: { duration: 0.8, ease: EASE, delay: (inicio + i) * 0.05 } },
            }}
          >
            {p}
            {' '}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

/** Meandro marajoara que se desenha conforme a rolagem (divisor entre cenas) */
export const MeandroVivo: React.FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'start 55%'] });
  const desenho: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const modulos = 14;
  let d = '';
  for (let i = 0; i < modulos; i++) {
    const x = i * 40;
    d += `M${x} 18H${x + 8}V4H${x + 26}V14H${x + 16}V9 M${x + 26} 18H${x + 40} `;
  }
  return (
    <span ref={ref} className="block">
    <svg
      viewBox={`0 0 ${modulos * 40} 22`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="square"
        style={reduzir ? undefined : { pathLength: desenho }}
      />
    </svg>
    </span>
  );
};
