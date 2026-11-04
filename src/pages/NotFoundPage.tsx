import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MeandroVivo } from '../components/motion';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Página não encontrada | IF MAKER Breves';
    return () => {
      document.title = 'Laboratório IF MAKER | IFPA Campus Breves — Aprender Fazendo';
    };
  }, []);

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-5 pt-[76px] text-center font-ui text-wb-ink">
      <MeandroVivo className="h-auto w-[220px] text-wb-orange" />
      <p className="mt-8 font-brand text-[96px] font-semibold leading-none">404</p>
      <h1 className="mt-4 font-brand text-[28px] font-semibold">
        Essa peça <span className="acento text-wb-orange">não saiu da impressora</span>.
      </h1>
      <p className="mt-3 max-w-[26em] text-[16px] text-wb-ink-2">
        O endereço não existe ou mudou de lugar.
      </p>
      <Link to="/" className="wb-btn wb-btn-dark mt-8 h-12 px-6 text-[15px]">
        Voltar ao início
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
};
