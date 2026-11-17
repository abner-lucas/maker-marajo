import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  User,
} from 'lucide-react';
import { CalendarActivity, GOOGLE_CALENDAR_CONFIG } from '../data/labData';
import { WordRise } from '../components/BrandLogo';
import {
  chaveDia,
  dataCurta,
  dataLonga,
  eventosDoDia,
  type EventoAgenda,
  faixaHorario,
  useAgendaAoVivo,
} from '../lib/agenda';

const TYPE_COLORS: Record<CalendarActivity['type'], { bg: string; text: string; dot: string }> = {
  Oficina: { bg: 'bg-wb-orange/15', text: 'text-wb-orange', dot: '#FF6B35' },
  'Agendamento Bancada': { bg: 'bg-wb-blue/15', text: 'text-wb-blue', dot: '#0092D6' },
  'Pesquisa & TCC': { bg: 'bg-wb-purple/15', text: 'text-wb-purple', dot: '#70388E' },
  'Extensão Escolar': { bg: 'bg-wb-green/15', text: 'text-wb-green', dot: '#23963C' },
  Makeathon: { bg: 'bg-wb-red/15', text: 'text-wb-red', dot: '#E5484D' },
};
const ESTILO_AO_VIVO = { bg: 'bg-wb-ink/[0.07]', text: 'text-wb-ink', dot: '#16130f' };
const estilo = (e: EventoAgenda) => (e.tipo ? TYPE_COLORS[e.tipo] : ESTILO_AO_VIVO);

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const pad = (n: number) => String(n).padStart(2, '0');

const buildAddEventToGCalUrl = (e: EventoAgenda) => {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[LabMaker] ${e.titulo}`,
    dates: `${fmt(e.inicio)}/${fmt(e.fim)}`,
    details: [e.descricao, e.equipamento && `Equipamento: ${e.equipamento}`, e.responsavel && `Responsável: ${e.responsavel}`]
      .filter(Boolean)
      .join('\n'),
    location: e.local || GOOGLE_CALENDAR_CONFIG.campusLocation,
    ctz: 'America/Belem',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/** Selo que diz de onde vêm os eventos exibidos */
const SeloFonte: React.FC<{ status: ReturnType<typeof useAgendaAoVivo>['status']; atualizadoEm: Date | null }> = ({
  status,
  atualizadoEm,
}) => {
  if (status === 'ao-vivo')
    return (
      <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-wb-green">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wb-green opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-wb-green" />
        </span>
        Ao vivo do Google Agenda
        {atualizadoEm && (
          <span className="font-normal text-wb-ink-3">
            · atualizado às {atualizadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </span>
    );
  if (status === 'carregando') return <span className="text-[12.5px] text-wb-ink-3">Conectando à agenda do LabMaker…</span>;
  return (
    <span className="text-[12.5px] text-wb-ink-3">
      Atividades de exemplo — a agenda do LabMaker aparece aqui assim que for publicada no Google.
    </span>
  );
};

export const MonthlyCalendarPage: React.FC = () => {
  const { eventos, status, atualizadoEm, aoVivo } = useAgendaAoVivo();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('Todos');
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const hojeChave = chaveDia(new Date());
  const [mesVisivel, setMesVisivel] = useState(() => {
    const [a, m] = hojeChave.split('-').map(Number);
    return { ano: a, mes: m - 1 };
  });
  const irPara = (delta: number) =>
    setMesVisivel(({ ano, mes }) => {
      const d = new Date(Date.UTC(ano, mes + delta, 1));
      return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() };
    });

  // Filtro por tipo só existe nas atividades de exemplo (eventos do Google não têm tipo)
  const filtrados = useMemo(
    () => (aoVivo || typeFilter === 'Todos' ? eventos : eventos.filter((e) => e.tipo === typeFilter)),
    [eventos, typeFilter, aoVivo]
  );

  const { ano, mes } = mesVisivel;
  const diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const chaveDoDia = (d: number) => `${ano}-${pad(mes + 1)}-${pad(d)}`;
  const doMes = filtrados.filter((e) => {
    const k = chaveDia(e.inicio);
    return k.startsWith(`${ano}-${pad(mes + 1)}`);
  });

  const proximos = filtrados.filter((e) => e.fim.getTime() >= Date.now());
  const listaVisivel = viewMode === 'list' ? (aoVivo ? proximos : filtrados) : doMes;
  const selecionado =
    filtrados.find((e) => e.id === selecionadoId) ?? doMes.find((e) => e.fim.getTime() >= Date.now()) ?? doMes[0] ?? proximos[0];

  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      {/* Header */}
      <section className="border-b border-wb-line bg-wb-bench py-14 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rotulo">
                <span aria-hidden="true" className="marajo-glifo text-wb-green" />
                Agenda de atividades · Programação mensal
              </span>
              <h1
                className="mt-4 font-brand font-bold text-wb-ink"
                style={{ fontSize: 'clamp(32px, 4.2vw, 54px)', lineHeight: 1.04, letterSpacing: '-0.028em' }}
              >
                <WordRise text="Visualização Mensal de Ações e Atividades." />
              </h1>
              <p className="mt-3 max-w-[42em] text-[16.5px] leading-relaxed text-wb-ink-2">
                Oficinas, sessões de laser e impressão 3D, visitas e makeathons do mês.
              </p>
              <div className="mt-3" aria-live="polite">
                <SeloFonte status={status} atualizadoEm={atualizadoEm} />
              </div>
            </div>

          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex max-w-full flex-wrap gap-x-1 border-t border-wb-line py-1">
              {(
                [
                  ['grid', 'Calendário Mensal', LayoutGrid],
                  ['list', 'Lista de Ações', List],
                ] as const
              ).map(([modo, rotulo, Icone]) => (
                <button
                  key={modo}
                  type="button"
                  aria-pressed={viewMode === modo}
                  onClick={() => setViewMode(modo)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                    viewMode === modo ? 'bg-wb-ink text-white' : 'text-wb-ink-2 hover:text-wb-ink'
                  }`}
                >
                  <Icone className="h-4 w-4" />
                  <span>{rotulo}</span>
                </button>
              ))}
            </div>

            {!aoVivo && (
              <div className="flex flex-wrap gap-1.5">
                {['Todos', 'Oficina', 'Agendamento Bancada', 'Pesquisa & TCC', 'Extensão Escolar', 'Makeathon'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={typeFilter === cat}
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
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          {/* === CALENDÁRIO MENSAL === */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">
              <div className="wb-panel overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-wb-line bg-wb-bench/70 px-4 py-4 sm:px-6">
                  <div>
                    <span className="rotulo">
                      <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                      Calendário do laboratório · Horário de Belém
                    </span>
                    <h2 className="font-brand text-xl sm:text-2xl font-bold text-wb-ink" aria-live="polite">
                      {MESES[mes]} de {ano}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="wb-key mr-1 hidden text-[11px] sm:inline-flex">{doMes.length} atividades no mês</span>
                    <button
                      type="button"
                      onClick={() => irPara(-1)}
                      aria-label="Mês anterior"
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-wb-bench"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => irPara(1)}
                      aria-label="Próximo mês"
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-wb-bench"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-b border-wb-line bg-wb-bench/40 text-center font-key text-[11.5px] font-bold text-wb-ink-3">
                  {WEEKDAYS.map((wd) => (
                    <div key={wd} className="py-2.5 border-r last:border-r-0 border-wb-line">
                      {wd}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(96px,auto)] divide-x divide-y divide-wb-line sm:auto-rows-[minmax(108px,auto)]">
                  {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                    <div key={`v${i}`} className="bg-wb-bench/10" aria-hidden="true" />
                  ))}
                  {Array.from({ length: diasNoMes }, (_, i) => i + 1).map((day) => {
                    const chave = chaveDoDia(day);
                    const dayActs = eventosDoDia(filtrados, chave);
                    const isToday = chave === hojeChave;
                    return (
                      <div
                        key={day}
                        className={`min-w-0 p-1.5 transition-colors sm:p-2 ${
                          dayActs.length > 0 ? 'bg-white hover:bg-wb-bench/40' : 'bg-wb-bench/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-key text-[12px] font-bold ${
                              isToday ? 'bg-wb-orange text-white' : dayActs.length > 0 ? 'text-wb-ink' : 'text-wb-ink-3'
                            }`}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <span className="hidden sm:inline font-key text-[9px] font-bold text-wb-orange">Hoje</span>
                          )}
                        </div>

                        <div className="mt-1.5 space-y-1">
                          {dayActs.slice(0, 3).map((act) => {
                            const st = estilo(act);
                            const isSelected = selecionado?.id === act.id;
                            return (
                              <button
                                key={act.id}
                                type="button"
                                onClick={() => setSelecionadoId(act.id)}
                                className={`w-full min-w-0 text-left rounded-lg p-1 text-[10.5px] font-bold leading-tight transition-all sm:p-1.5 sm:text-[11px] ${st.bg} ${st.text} ${
                                  isSelected ? 'ring-2 ring-wb-ink shadow-sm' : 'hover:opacity-85'
                                }`}
                              >
                                <div className="font-key text-[9.5px] opacity-80">
                                  {act.diaInteiro ? 'Dia todo' : faixaHorario(act).split(' – ')[0]}
                                </div>
                                <div className="mt-0.5 line-clamp-2 break-words">{act.titulo}</div>
                              </button>
                            );
                          })}
                          {dayActs.length > 3 && (
                            <p className="px-1 text-[10.5px] font-semibold text-wb-ink-3">+{dayActs.length - 3}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Atividade selecionada */}
              <div className="wb-panel p-6 lg:sticky lg:top-24 space-y-5">
                <div className="flex items-center justify-between border-b border-wb-line pb-3">
                  <span className="rotulo">
                    <span aria-hidden="true" className="marajo-glifo text-wb-green" />
                    Atividade selecionada
                  </span>
                  {selecionado && <span className="wb-key">{dataCurta(selecionado.inicio)}</span>}
                </div>

                {selecionado ? (
                  <>
                    <div>
                      {selecionado.tipo && (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 font-key text-[11px] font-bold ${estilo(selecionado).bg} ${estilo(selecionado).text}`}
                        >
                          {selecionado.tipo}
                        </span>
                      )}
                      <h3 className="mt-3 font-brand text-xl font-bold text-wb-ink leading-snug">{selecionado.titulo}</h3>
                      {selecionado.descricao && (
                        <p className="mt-2.5 text-[14px] leading-relaxed text-wb-ink-2">{selecionado.descricao}</p>
                      )}
                    </div>

                    <div className="space-y-2.5 border-t border-wb-line py-4 text-[13px]">
                      <div className="flex items-center gap-2 text-wb-ink">
                        <Clock className="h-4 w-4 text-wb-orange shrink-0" />
                        <span>
                          <strong>Horário:</strong> <span className="capitalize">{dataLonga(selecionado.inicio)}</span>,{' '}
                          {faixaHorario(selecionado)}
                        </span>
                      </div>
                      {selecionado.responsavel && (
                        <div className="flex items-center gap-2 text-wb-ink">
                          <User className="h-4 w-4 text-wb-green shrink-0" />
                          <span>
                            <strong>Responsável:</strong> {selecionado.responsavel}
                          </span>
                        </div>
                      )}
                      {(selecionado.equipamento || selecionado.local) && (
                        <div className="flex items-center gap-2 text-wb-ink">
                          <MapPin className="h-4 w-4 text-wb-blue shrink-0" />
                          <span>
                            <strong>{selecionado.equipamento ? 'Equipamento:' : 'Local:'}</strong>{' '}
                            {selecionado.equipamento ?? selecionado.local}
                          </span>
                        </div>
                      )}
                    </div>

                    {selecionado.vagas && (
                      <div className="flex items-center justify-between text-[13px] font-bold">
                        <span className="text-wb-ink-2">Vagas Disponíveis:</span>
                        <span className="rounded-full bg-wb-green/15 px-3 py-1 font-key text-wb-green">
                          {selecionado.vagas.livres} / {selecionado.vagas.total} vagas
                        </span>
                      </div>
                    )}

                    <div className="space-y-2.5 pt-2">
                      <a
                        href={buildAddEventToGCalUrl(selecionado)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wb-btn wb-btn-primary w-full h-11 text-[13.5px]"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Salvar na Minha Google Agenda</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Link
                        to={`/agendamento?servico=${encodeURIComponent(selecionado.titulo)}`}
                        className="wb-btn wb-btn-dark w-full h-11 text-[13.5px]"
                      >
                        <span>Inscrever-se / Participar</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-[14px] text-wb-ink-2">
                    Nenhuma atividade neste mês. Use as setas para ver outros meses ou{' '}
                    <Link to="/agendamento" className="font-semibold text-wb-orange underline underline-offset-4">
                      reserve um horário
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          )}

          {/* === LISTA === */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {listaVisivel.length === 0 && (
                <p className="text-[15px] text-wb-ink-2">Nenhuma atividade agendada a partir de hoje.</p>
              )}
              {listaVisivel.map((act) => {
                const st = estilo(act);
                const [diaTxt, mesTxt] = dataCurta(act.inicio).split(' de ');
                return (
                  <div
                    key={act.id}
                    className="wb-panel p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center border-t border-wb-line font-key">
                        <span className="text-[11px] font-bold text-wb-orange">{mesTxt}</span>
                        <span className="text-2xl font-extrabold text-wb-ink">{diaTxt}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {act.tipo && (
                            <span className={`rounded-full px-2.5 py-0.5 font-key text-[10.5px] font-bold ${st.bg} ${st.text}`}>
                              {act.tipo}
                            </span>
                          )}
                          <span className="wb-key text-[11px]">{faixaHorario(act)}</span>
                          {(act.equipamento || act.local) && (
                            <span className="text-[12.5px] font-semibold text-wb-ink-3">
                              · {act.equipamento ?? act.local}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1.5 font-brand text-lg font-bold text-wb-ink">{act.titulo}</h3>
                        {act.descricao && <p className="mt-1 text-[14px] text-wb-ink-2 max-w-[52em]">{act.descricao}</p>}
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

        </div>
      </section>
    </div>
  );
};
