import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Cpu,
  Layers,
  Menu,
  Printer,
  Scan,
  Sparkles,
  Wrench,
  X,
  Zap,
  Bot,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { EQUIPMENTS } from '../data/labData';

const eqIcons: Record<string, React.ReactNode> = {
  'impressoras-3d': <Printer className="h-4 w-4 text-[#FF6B35]" />,
  'cortadora-laser-cnc': <Zap className="h-4 w-4 text-[#E5484D]" />,
  'scanners-3d': <Scan className="h-4 w-4 text-[#0092D6]" />,
  'kits-robotica': <Bot className="h-4 w-4 text-[#23963C]" />,
  'arduino-eletronica': <Cpu className="h-4 w-4 text-[#70388E]" />,
};

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [eqDropdownOpen, setEqDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setEqDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    if (!eqDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEqDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [eqDropdownOpen]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 font-ui transition-all duration-300 ease-out-soft ${
        scrolled || mobileMenuOpen
          ? 'bg-white/90 backdrop-blur-md border-b border-wb-line shadow-[0_4px_24px_-12px_rgba(20,26,23,0.12)]'
          : 'bg-white/65 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1340px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-8">
        {/* Brand Logo */}
        <Link to="/" aria-label="Início Laboratório IF MAKER Breves" className="group flex items-center">
          <BrandLogo size="md" />
        </Link>

        {/* Primary Desktop Navigation (Constructa Pill Style) */}
        <nav aria-label="Navegação Principal" className="hidden lg:flex items-center gap-0.5">
          <Link
            to="/"
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
              isActive('/')
                ? 'bg-wb-bench text-wb-ink'
                : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
            }`}
          >
            Apresentação
          </Link>

          {/* Equipamentos Dropdown + Page Link */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setEqDropdownOpen(true)}
            onMouseLeave={() => setEqDropdownOpen(false)}
          >
            <div className="flex items-center">
              <Link
                to="/equipamentos"
                className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-l-full pl-3.5 pr-1.5 py-2 text-[14.5px] font-semibold transition-colors ${
                  isActive('/equipamentos')
                    ? 'bg-wb-bench text-wb-ink'
                    : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
                }`}
              >
                Equipamentos
              </Link>
              <button
                type="button"
                onClick={() => setEqDropdownOpen((v) => !v)}
                aria-label="Abrir páginas de equipamentos"
                className={`inline-flex items-center rounded-r-full pr-3 pl-1 py-2 text-[14.5px] font-semibold transition-colors ${
                  isActive('/equipamentos')
                    ? 'bg-wb-bench text-wb-ink'
                    : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
                }`}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    eqDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {eqDropdownOpen && (
              <div className="wb-pop absolute left-0 top-full pt-2 w-[340px] z-50">
                <div className="rounded-[18px] border border-wb-line bg-white p-2 shadow-[0_20px_48px_-16px_rgba(20,26,23,0.28)]">
                  <div className="px-3 py-2 border-b border-wb-line mb-1 flex items-center justify-between">
                    <span className="font-key text-[11px] uppercase tracking-wider text-wb-ink-3 font-semibold">
                      Páginas de Equipamentos
                    </span>
                    <Link
                      to="/equipamentos"
                      className="text-[12px] font-bold text-wb-orange hover:underline"
                    >
                      Ver Todos →
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {EQUIPMENTS.map((eq) => (
                      <Link
                        key={eq.id}
                        to={`/equipamentos/${eq.slug}`}
                        className="flex items-start gap-3 rounded-[12px] p-2.5 transition-colors hover:bg-wb-bench group"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-wb-line bg-white shadow-sm group-hover:scale-105 transition-transform">
                          {eqIcons[eq.slug]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13.5px] font-bold text-wb-ink group-hover:text-wb-orange transition-colors">
                              {eq.shortName}
                            </p>
                            <span className="wb-key text-[10px]">{eq.unitsAvailable} un.</span>
                          </div>
                          <p className="text-[12px] text-wb-ink-3 line-clamp-1 mt-0.5">
                            {eq.tagline}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/servicos"
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
              isActive('/servicos')
                ? 'bg-wb-bench text-wb-ink'
                : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
            }`}
          >
            Serviços
          </Link>

          <Link
            to="/projetos"
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
              isActive('/projetos')
                ? 'bg-wb-bench text-wb-ink'
                : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
            }`}
          >
            Projetos
          </Link>

          <Link
            to="/agenda-mensal"
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
              isActive('/agenda-mensal')
                ? 'bg-wb-bench text-wb-ink'
                : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
            }`}
          >
            Agenda Mensal
            <span
              aria-label="Atividades do mês"
              className="h-2 w-2 rounded-full bg-wb-orange animate-pulse"
            />
          </Link>

          <Link
            to="/equipe"
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
              isActive('/equipe')
                ? 'bg-wb-bench text-wb-ink'
                : 'text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink'
            }`}
          >
            Equipe
          </Link>
        </nav>

        {/* Right Actions: Google Calendar Booking CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-wb-line bg-wb-bench/80 px-3 py-1.5 text-[12px] font-key text-wb-ink-2">
            <span className="h-2 w-2 rounded-full bg-wb-green animate-ping" />
            <span className="h-2 w-2 rounded-full bg-wb-green -ml-3.5" />
            <span>Lab Aberto · Breves</span>
          </div>

          <Link
            to="/agendamento"
            className="wb-btn wb-btn-primary h-10 sm:h-11 whitespace-nowrap px-3.5 sm:px-5 text-[13.5px] sm:text-[14.5px]"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Agendar Bancada</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu de navegação"
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-full border border-wb-line bg-white text-wb-ink hover:bg-wb-bench"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-wb-line bg-white px-5 py-5 shadow-xl max-h-[82vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              className="rounded-xl px-3.5 py-2.5 text-[15px] font-bold text-wb-ink hover:bg-wb-bench"
            >
              Apresentação (Início)
            </Link>

            <div className="rounded-xl bg-wb-bench/70 p-3 my-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-key text-[11px] uppercase tracking-wider text-wb-ink-3 font-bold">
                  Páginas de Equipamentos
                </span>
                <Link
                  to="/equipamentos"
                  className="text-[12px] font-bold text-wb-orange underline"
                >
                  Visão Geral
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {EQUIPMENTS.map((eq) => (
                  <Link
                    key={eq.id}
                    to={`/equipamentos/${eq.slug}`}
                    className="flex items-center gap-2.5 rounded-lg bg-white p-2 border border-wb-line text-[13.5px] font-semibold text-wb-ink"
                  >
                    {eqIcons[eq.slug]}
                    <span>{eq.shortName}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/servicos"
              className="rounded-xl px-3.5 py-2.5 text-[15px] font-bold text-wb-ink hover:bg-wb-bench"
            >
              Serviços Realizados
            </Link>
            <Link
              to="/projetos"
              className="rounded-xl px-3.5 py-2.5 text-[15px] font-bold text-wb-ink hover:bg-wb-bench"
            >
              Projetos Produzidos & Em Andamento
            </Link>
            <Link
              to="/agendamento"
              className="rounded-xl px-3.5 py-2.5 text-[15px] font-bold text-wb-orange hover:bg-wb-bench flex items-center justify-between"
            >
              <span>Agendamento (Google Agenda)</span>
              <span className="wb-key">Reservar</span>
            </Link>
            <Link
              to="/agenda-mensal"
              className="rounded-xl px-3.5 py-2.5 text-[15px] font-bold text-wb-ink hover:bg-wb-bench flex items-center justify-between"
            >
              <span>Agenda Mensal de Ações</span>
              <span className="h-2 w-2 rounded-full bg-wb-orange" />
            </Link>
            <Link
              to="/equipe"
              className="rounded-xl px-3.5 py-2.5 text-[15px] font-bold text-wb-ink hover:bg-wb-bench"
            >
              Nossa Equipe
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

