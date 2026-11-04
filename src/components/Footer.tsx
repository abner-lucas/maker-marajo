import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, MapPin, Mail, Sparkles, ArrowUpRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { EQUIPMENTS } from '../data/labData';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-wb-line bg-wb-bench font-ui text-wb-ink">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-8 gap-y-12 px-5 py-16 sm:px-8 md:grid-cols-[1.6fr_1.1fr_1.2fr_1.1fr] md:gap-x-10">
        {/* Col 1: About Lab */}
        <div className="col-span-2 md:col-span-1">
          <BrandLogo size="md" />
          <p className="mt-5 max-w-[32em] text-[14.5px] leading-[1.65] text-wb-ink-2">
            Quinto <strong>Laboratório IF MAKER</strong> entregue pelo Instituto Federal do Pará em
            março de 2026. Um espaço aberto de prototipagem, robótica, ensino, pesquisa e extensão
            no coração do Marajó para fortalecer a cultura do <strong className="font-semibold text-wb-ink">“aprender fazendo”</strong>.
          </p>
          <div className="mt-5 space-y-2 text-[13.5px] text-wb-ink-2">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-wb-green shrink-0" />
              <span>IFPA Campus Breves — Breves, Arquipélago do Marajó, Pará</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-wb-orange shrink-0" />
              <span>ifmaker.breves@ifpa.edu.br</span>
            </p>
          </div>
        </div>

        {/* Col 2: Equipamentos (Separate Pages) */}
        <nav aria-label="Equipamentos do Laboratório">
          <p className="text-[15px] font-bold text-wb-ink">Equipamentos</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                to="/equipamentos"
                className="inline-block py-1.5 text-[14px] font-semibold text-wb-orange transition-colors hover:text-wb-ink"
              >
                Parque Tecnológico Completo
              </Link>
            </li>
            {EQUIPMENTS.map((eq) => (
              <li key={eq.id}>
                <Link
                  to={`/equipamentos/${eq.slug}`}
                  className="inline-block py-1.5 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
                >
                  {eq.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Col 3: Portal & Navegação */}
        <nav aria-label="Navegação do Portal">
          <p className="text-[15px] font-bold text-wb-ink">Laboratório & Ações</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                to="/"
                className="inline-block py-1.5 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Apresentação & Scrollytelling
              </Link>
            </li>
            <li>
              <Link
                to="/servicos"
                className="inline-block py-1.5 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Serviços Realizados & Estimador
              </Link>
            </li>
            <li>
              <Link
                to="/projetos"
                className="inline-block py-1.5 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Projetos Produzidos & Em Andamento
              </Link>
            </li>
            <li>
              <Link
                to="/equipe"
                className="inline-block py-1.5 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Equipe, Docentes & Monitores
              </Link>
            </li>
          </ul>
        </nav>

        {/* Col 4: Google Agenda & Institucional */}
        <nav aria-label="Google Agenda e Links">
          <p className="text-[15px] font-bold text-wb-ink">Google Agenda & IFPA</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                to="/agendamento"
                className="inline-flex items-center gap-1.5 py-1.5 text-[14px] font-semibold text-wb-green transition-colors hover:text-wb-ink"
              >
                <Calendar className="h-3.5 w-3.5" />
                Agendar Máquina / Bancada
              </Link>
            </li>
            <li>
              <Link
                to="/agenda-mensal"
                className="inline-block py-1.5 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Calendário Mensal de Atividades
              </Link>
            </li>
            <li>
              <a
                href="https://breves.ifpa.edu.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Portal IFPA Campus Breves
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a
                href="https://ifpa.edu.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[14px] text-wb-ink-2 transition-colors hover:text-wb-ink"
              >
                Instituto Federal do Pará (Reitoria)
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>

          <div className="mt-6 border-t border-wb-line py-3.5">
            <div className="flex items-center gap-2 text-[12px] font-key font-bold text-wb-ink">
              <Sparkles className="h-3.5 w-3.5 text-wb-orange" />
              Cultura learning by doing
            </div>
            <p className="mt-1 text-[12px] text-wb-ink-3 leading-snug">
              Horário de funcionamento: Seg a Sex, das 08h às 12h e das 14h às 18h.
            </p>
          </div>
        </nav>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-wb-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-5 py-5 text-[12.5px] text-wb-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © 2026 Laboratório IF MAKER · Instituto Federal de Educação, Ciência e Tecnologia do Pará
            (IFPA) — Campus Breves
          </p>
          <p className="font-key text-[11.5px]">
            5º Laboratório IF MAKER entregue em Março/2026 · Ensino, Pesquisa e Extensão
          </p>
        </div>
      </div>
    </footer>
  );
};

