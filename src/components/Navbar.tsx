import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { EQUIPMENTS } from '../data/labData';

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/projetos', label: 'Projetos' },
  { to: '/agenda-mensal', label: 'Agenda' },
  { to: '/equipe', label: 'Equipe' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [eqOpen, setEqOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Cabeçalho some ao descer e volta ao subir (mais área útil no celular)
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      if (y > 240 && y > last + 4) setHidden(true);
      else if (y < last - 4 || y <= 240) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setEqOpen(false);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (!eqOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setEqOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setEqOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [eqOpen]);

  // Menu móvel: trava a rolagem, fecha com Esc e devolve o foco ao botão
  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const linkCls = (active: boolean) =>
    `relative py-2 text-[15px] font-medium transition-colors after:absolute after:left-0 after:right-0 after:bottom-0.5 after:h-[2px] after:origin-left after:bg-wb-orange after:transition-transform after:duration-300 ${
      active
        ? 'text-wb-ink after:scale-x-100'
        : 'text-wb-ink-2 hover:text-wb-ink after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-wb-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 font-ui transition-[transform,background-color,border-color] duration-500 ease-out-soft ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled || menuOpen
            ? 'border-b border-wb-line bg-wb-canvas/90 backdrop-blur-md'
            : 'border-b border-transparent bg-wb-canvas/0'
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1340px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8">
          <Link
            to="/"
            aria-label="Início — Laboratório IF MAKER Breves"
            className="flex min-w-0 shrink items-center"
          >
            <BrandLogo size="md" />
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
            <Link to="/" className={linkCls(isActive('/'))}>
              Início
            </Link>

            <div ref={dropdownRef} className="relative" onMouseLeave={() => setEqOpen(false)}>
              <button
                type="button"
                aria-expanded={eqOpen}
                aria-controls="menu-equipamentos"
                onClick={() => setEqOpen((v) => !v)}
                onMouseEnter={() => setEqOpen(true)}
                className={`${linkCls(isActive('/equipamentos'))} inline-flex items-center gap-1`}
              >
                Equipamentos
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${eqOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {eqOpen && (
                <div
                  id="menu-equipamentos"
                  className="wb-pop absolute -left-6 top-full z-50 w-[390px] pt-3"
                >
                  <div className="wb-modal p-3">
                    <ul>
                      {EQUIPMENTS.map((eq, i) => (
                        <li key={eq.id}>
                          <Link
                            to={`/equipamentos/${eq.slug}`}
                            className="group flex items-baseline gap-3.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-wb-bench"
                          >
                            <span
                              className="h-2.5 w-2.5 shrink-0 self-center rounded-full"
                              style={{ backgroundColor: eq.accentColor }}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-brand text-[16px] font-bold leading-tight text-wb-ink group-hover:text-wb-orange transition-colors">
                                {eq.shortName}
                              </span>
                              <span className="mt-0.5 block truncate text-[12.5px] text-wb-ink-2">
                                {eq.tagline}
                              </span>
                            </span>
                            <span className="font-key text-[11px] font-semibold text-wb-ink-3 shrink-0 self-center">
                              0{i + 1}
                            </span>
                            <ArrowUpRight className="h-4 w-4 shrink-0 self-center text-wb-ink-3 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-wb-orange" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/equipamentos"
                      className="mt-1 flex items-center justify-between border-t border-wb-line px-3 pb-1 pt-3 text-[13.5px] font-bold text-wb-orange hover:text-wb-ink transition-colors"
                    >
                      Ver o parque tecnológico completo
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {LINKS.slice(1).map((l) => (
              <Link key={l.to} to={l.to} className={linkCls(isActive(l.to))}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/agendamento"
              className="wb-btn wb-btn-dark hidden h-11 px-5 text-[14.5px] sm:inline-flex"
            >
              Agendar bancada
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="menu-movel"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] px-3 text-[14.5px] font-semibold text-wb-ink hover:bg-wb-bench lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="max-[359px]:hidden">{menuOpen ? 'Fechar' : 'Menu'}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="menu-movel"
            className="wb-rise h-[calc(100dvh-68px)] overflow-y-auto bg-wb-canvas px-5 pb-10 pt-4 sm:h-[calc(100dvh-76px)] sm:px-8 lg:hidden"
          >
            <nav aria-label="Navegação móvel">
              <ul className="divide-y divide-wb-line border-b border-wb-line">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={`flex items-center justify-between py-4 font-brand text-[28px] font-semibold leading-none ${
                        isActive(l.to) ? 'text-wb-orange' : 'text-wb-ink'
                      }`}
                    >
                      {l.label}
                      <ArrowUpRight className="h-5 w-5 text-wb-ink-3" />
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-8 flex items-center gap-2 text-[13px] font-medium text-wb-ink-3">
                <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                Equipamentos
              </p>
              <ul className="mt-2">
                {EQUIPMENTS.map((eq) => (
                  <li key={eq.id}>
                    <Link
                      to={`/equipamentos/${eq.slug}`}
                      className="flex items-center justify-between py-2.5 text-[17px] font-medium text-wb-ink"
                    >
                      {eq.shortName}
                      <span className="font-key text-[13px] text-wb-ink-3">
                        {eq.unitsAvailable} un.
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/equipamentos"
                    className="inline-block py-2.5 text-[15px] font-semibold text-wb-orange underline underline-offset-4"
                  >
                    Ver todos
                  </Link>
                </li>
              </ul>

              <Link to="/agendamento" className="wb-btn wb-btn-primary mt-8 h-13 w-full text-[16px]">
                Agendar bancada
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
