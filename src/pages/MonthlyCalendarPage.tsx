import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import {
  CALENDAR_ACTIVITIES,
  CalendarActivity,
  GOOGLE_CALENDAR_CONFIG,
} from '../data/labData';
import { WordRise } from '../components/BrandLogo';

const TYPE_COLORS: Record<CalendarActivity['type'], { bg: string; text: string; dot: string }> = {
  Oficina: { bg: 'bg-wb-orange/15', text: 'text-wb-orange', dot: '#FF6B35' },
  'Agendamento Bancada': { bg: 'bg-wb-blue/15', text: 'text-wb-blue', dot: '#0092D6' },
  'Pesquisa & TCC': { bg: 'bg-wb-purple/15', text: 'text-wb-purple', dot: '#70388E' },
  'Extensão Escolar': { bg: 'bg-wb-green/15', text: 'text-wb-green', dot: '#23963C' },
  Makeathon: { bg: 'bg-wb-red/15', text: 'text-wb-red', dot: '#E5484D' },
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MonthlyCalendarPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gcal-embed'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('Todos');
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity>(
    CALENDAR_ACTIVITIES[0]
  );
  const [customCalendarId, setCustomCalendarId] = useState<string>(
    GOOGLE_CALENDAR_CONFIG.calendarId
  );

  const filteredActivities =
    typeFilter === 'Todos'
      ? CALENDAR_ACTIVITIES
      : CALENDAR_ACTIVITIES.filter((a) => a.type === typeFilter);

  const buildAddEventToGCalUrl = (act: CalendarActivity) => {
    const cleanDate = act.date.replace(/-/g, '');
    const start = act.startTime.replace(':', '') + '00';
    const end = act.endTime.replace(':', '') + '00';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `[IF MAKER Breves] ${act.title}`,
      dates: `${cleanDate}T${start}/${cleanDate}T${end}`,
      details: `${act.description}\n\nEquipamento: ${act.equipment}\nResponsável: ${act.instructorOrResponsible}`,
      location: act.location,
      ctz: 'America/Belem',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // November 2026 starts on Sunday (2026-11-01 is Sunday! 30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      {/* Header */}
      <section className="border-b border-wb-line bg-wb-bench py-14 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-green" />Agenda de atividades · Programação mensal</span>
              <h1
                className="mt-4 font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 54px)',
                  lineHeight: 1.04,
                  letterSpacing: '-0.028em',
                }}
              >
                <WordRise text="Visualização Mensal de Ações e Atividades." />
              </h1>
              <p className="mt-3 max-w-[42em] text-[16.5px] leading-relaxed text-wb-ink-2">
                Acompanhe todas as oficinas práticas, sessões de corte a laser e impressão 3D,
                visitas de escolas públicas e Makeathons do{' '}
                <strong>Laboratório IF MAKER — IFPA Campus Breves</strong>.
              </p>
            </div>

            <Link
              to="/agendamento"
              className="wb-btn wb-btn-primary h-12 px-6 text-[14.5px]"
            >
              <Plus className="h-4 w-4" />
              <span>Agendar Nova Atividade</span>
            </Link>
          </div>

          {/* View Mode & Category Filter Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {/* View Switcher */}
            <div className="flex max-w-full flex-wrap gap-x-1 border-t border-wb-line py-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                  viewMode === 'grid' ? 'bg-wb-ink text-white' : 'text-wb-ink-2 hover:text-wb-ink'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Calendário Mensal</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                  viewMode === 'list' ? 'bg-wb-ink text-white' : 'text-wb-ink-2 hover:text-wb-ink'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Lista de Ações</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('gcal-embed')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                  viewMode === 'gcal-embed'
                    ? 'bg-wb-orange text-white'
                    : 'text-wb-ink-2 hover:text-wb-ink'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Google Agenda Embed (Iframe)</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Todos',
                'Oficina',
                'Agendamento Bancada',
                'Pesquisa & TCC',
                'Extensão Escolar',
                'Makeathon',
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTypeFilter(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
                    typeFilter === cat
                      ? 'bg-wb-green text-white'
                      : 'bg-white border border-wb-line text-wb-ink-2 hover:text-wb-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          {/* === MODE 1: INTERACTIVE MONTHLY CALENDAR GRID === */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">
              {/* Monthly Grid Panel */}
              <div className="wb-panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-wb-line bg-wb-bench/70 px-6 py-4">
                  <div>
                    <span className="rotulo">
                      <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                      Calendário do laboratório · Horário de Belém
                    </span>
                    <h2 className="font-brand text-xl sm:text-2xl font-bold text-wb-ink">
                      Novembro de 2026
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="wb-key text-[11px]">
                      {filteredActivities.length} atividades no mês
                    </span>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-wb-line bg-wb-bench/40 text-center font-key text-[11.5px] font-bold text-wb-ink-3">
                  {WEEKDAYS.map((wd) => (
                    <div key={wd} className="py-2.5 border-r last:border-r-0 border-wb-line">
                      {wd}
                    </div>
                  ))}
                </div>

                {/* 30 Days Cells */}
                <div className="grid grid-cols-7 auto-rows-[minmax(108px,auto)] divide-x divide-y divide-wb-line">
                  {daysInMonth.map((day) => {
                    const dayActs = filteredActivities.filter((a) => a.dayOfMonth === day);
                    const isToday = day === 4;
                    return (
                      <div
                        key={day}
                        className={`p-2 transition-colors ${
                          dayActs.length > 0 ? 'bg-white hover:bg-wb-bench/40' : 'bg-wb-bench/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-key text-[12px] font-bold ${
                              isToday
                                ? 'bg-wb-orange text-white'
                                : dayActs.length > 0
                                ? 'text-wb-ink'
                                : 'text-wb-ink-3'
                            }`}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <span className="hidden sm:inline font-key text-[9px] font-bold text-wb-orange">
                              Hoje
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 space-y-1">
                          {dayActs.map((act) => {
                            const style = TYPE_COLORS[act.type];
                            const isSelected = selectedActivity?.id === act.id;
                            return (
                              <button
                                key={act.id}
                                type="button"
                                onClick={() => setSelectedActivity(act)}
                                className={`w-full text-left rounded-lg p-1.5 text-[11px] font-bold leading-tight transition-all ${
                                  style.bg
                                } ${style.text} ${
                                  isSelected ? 'ring-2 ring-wb-ink shadow-sm' : 'hover:opacity-85'
                                }`}
                              >
                                <div className="font-key text-[9.5px] opacity-80">
                                  {act.startTime}
                                </div>
                                <div className="line-clamp-2 mt-0.5">{act.title}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Activity Inspector */}
              <div className="wb-panel p-6 lg:sticky lg:top-24 space-y-5">
                <div className="flex items-center justify-between border-b border-wb-line pb-3">
                  <span className="rotulo">
                    <span aria-hidden="true" className="marajo-glifo text-wb-green" />
                    Atividade selecionada
                  </span>
                  <span className="wb-key">{selectedActivity.date}</span>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 font-key text-[11px] font-bold ${
                      TYPE_COLORS[selectedActivity.type].bg
                    } ${TYPE_COLORS[selectedActivity.type].text}`}
                  >
                    {selectedActivity.type}
                  </span>
                  <h3 className="mt-3 font-brand text-xl font-bold text-wb-ink leading-snug">
                    {selectedActivity.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-wb-ink-2">
                    {selectedActivity.description}
                  </p>
                </div>

                <div className="space-y-2.5 border-t border-wb-line py-4 text-[13px]">
                  <div className="flex items-center gap-2 text-wb-ink">
                    <Clock className="h-4 w-4 text-wb-orange shrink-0" />
                    <span>
                      <strong>Horário:</strong> {selectedActivity.startTime} às{' '}
                      {selectedActivity.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-wb-ink">
                    <User className="h-4 w-4 text-wb-green shrink-0" />
                    <span>
                      <strong>Responsável:</strong> {selectedActivity.instructorOrResponsible}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-wb-ink">
                    <MapPin className="h-4 w-4 text-wb-blue shrink-0" />
                    <span>
                      <strong>Equipamento:</strong> {selectedActivity.equipment}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[13px] font-bold">
                  <span className="text-wb-ink-2">Vagas Disponíveis:</span>
                  <span className="rounded-full bg-wb-green/15 px-3 py-1 font-key text-wb-green">
                    {selectedActivity.spotsAvailable} / {selectedActivity.totalSpots} vagas
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <a
                    href={buildAddEventToGCalUrl(selectedActivity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wb-btn wb-btn-primary w-full h-11 text-[13.5px]"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Salvar na Minha Google Agenda</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <Link
                    to={`/agendamento?servico=${encodeURIComponent(selectedActivity.title)}`}
                    className="wb-btn wb-btn-dark w-full h-11 text-[13.5px]"
                  >
                    <span>Inscrever-se / Participar</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* === MODE 2: LIST VIEW === */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredActivities.map((act) => {
                const style = TYPE_COLORS[act.type];
                return (
                  <div
                    key={act.id}
                    className="wb-panel p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center border-t border-wb-line font-key">
                        <span className="text-[11px] font-bold text-wb-orange">nov</span>
                        <span className="text-2xl font-extrabold text-wb-ink">
                          {String(act.dayOfMonth).padStart(2, '0')}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-key text-[10.5px] font-bold ${style.bg} ${style.text}`}
                          >
                            {act.type}
                          </span>
                          <span className="wb-key text-[11px]">
                            {act.startTime} - {act.endTime}
                          </span>
                          <span className="text-[12.5px] font-semibold text-wb-ink-3">
                            · {act.equipment}
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-brand text-lg font-bold text-wb-ink">
                          {act.title}
                        </h3>
                        <p className="mt-1 text-[14px] text-wb-ink-2 max-w-[52em]">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                      <a
                        href={buildAddEventToGCalUrl(act)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wb-btn wb-btn-primary h-10 px-4 text-[13px]"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>+ Google Agenda</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* === MODE 3: OFFICIAL GOOGLE CALENDAR EMBED (IFRAME) === */}
          {viewMode === 'gcal-embed' && (
            <div className="wb-panel p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-wb-line pb-5">
                <div>
                  <span className="rotulo">
                    <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                    Google Agenda · Calendário público
                  </span>
                  <h2 className="mt-1 font-brand text-2xl font-bold text-wb-ink">
                    Google Agenda Incorporado — IF MAKER Campus Breves
                  </h2>
                  <p className="mt-1 text-[14px] text-wb-ink-2">
                    Visualize a agenda pública mensal diretamente do Google Calendar ou insira o ID
                    da agenda institucional do laboratório:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCalendarId}
                    onChange={(e) => setCustomCalendarId(e.target.value)}
                    placeholder="ID da Google Agenda (ex: makermarajo@ifpa.edu.br)"
                    className="rounded-xl border border-wb-line bg-wb-bench px-3.5 py-2 font-key text-[12.5px] text-wb-ink w-[270px]"
                  />
                </div>
              </div>

              <div className="overflow-hidden border-t border-wb-line">
                <iframe
                  title="Google Agenda Mensal do Laboratório IF MAKER Breves"
                  src={GOOGLE_CALENDAR_CONFIG.publicEmbedUrl}
                  className="w-full h-[640px] border-0"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

