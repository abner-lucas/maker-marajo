import React, { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { MONTAGEM_DURACAO, MONTAGEM_FPS, MONTAGEM_H, MONTAGEM_W, MontagemRobo } from './MontagemRobo';

/**
 * Player do Remotion embutido na seção "Como funciona". Não toca sozinho: o quadro
 * acompanha a rolagem (`progresso` 0..1), então a cena avança e volta junto com a página.
 */
const PalcoMontagem: React.FC<{ progresso: number }> = ({ progresso }) => {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    const quadro = Math.round(Math.min(1, Math.max(0, progresso)) * (MONTAGEM_DURACAO - 1));
    ref.current?.seekTo(quadro);
  }, [progresso]);

  return (
    <Player
      ref={ref}
      component={MontagemRobo}
      durationInFrames={MONTAGEM_DURACAO}
      fps={MONTAGEM_FPS}
      compositionWidth={MONTAGEM_W}
      compositionHeight={MONTAGEM_H}
      controls={false}
      autoPlay={false}
      loop={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      moveToBeginningWhenEnded={false}
      acknowledgeRemotionLicense
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    />
  );
};

export default PalcoMontagem;
