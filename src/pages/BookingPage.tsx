import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileCode,
  Info,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import { EQUIPMENTS, GOOGLE_CALENDAR_CONFIG, IMAGE_ASSETS, LAB_SERVICES } from '../data/labData';
import { chaveDia, conflitos, faixaHorario, useAgendaAoVivo } from '../lib/agenda';
import { WordRise } from '../components/BrandLogo';

// Atalhos de horário. A reserva aceita qualquer dia e qualquer horário.
const TIME_SLOTS = [
  { id: 'm1', label: '08:30 - 10:00', period: 'Manhã · Bloco 1', inicio: '08:30', fim: '10:00' },
  { id: 'm2', label: '10:15 - 11:45', period: 'Manhã · Bloco 2', inicio: '10:15', fim: '11:45' },
  { id: 't1', label: '14:00 - 15:45', period: 'Tarde · Bloco 1', inicio: '14:00', fim: '15:45' },
  { id: 't2', label: '16:00 - 17:45', period: 'Tarde · Bloco 2', inicio: '16:00', fim: '17:45' },
];

/** A sala de aula inteira também pode ser reservada, além de cada equipamento */
const SALA = {
  id: 'sala',
  slug: 'sala-de-aula',
  shortName: 'Sala de aula',
  name: 'Sala de aula do LabMaker (espaço inteiro)',
  tagline: 'Aulas, oficinas e reuniões',
  accentColor: '#16130f',
  unitsAvailable: 1,
  image: IMAGE_ASSETS.real.inauguracaoEspaco,
  fileFormats: [] as string[],
};

const ALVOS = [SALA, ...EQUIPMENTS];

/** Abre o calendário/relógio nativo ao clicar em qualquer ponto do campo (Chrome, Edge, Firefox) */
const abrirSeletor = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* navegadores sem showPicker abrem pelo toque nativo */
  }
};

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedEquipment, setSelectedEquipment] = useState<string>(
    searchParams.get('equipamento') || SALA.slug
  );
  const [selectedService, setSelectedService] = useState<string>(
    searchParams.get('servico') || LAB_SERVICES[0].title
  );
  const [bookingDate, setBookingDate] = useState<string>(() => chaveDia(new Date()));
  const [horaInicio, setHoraInicio] = useState<string>('14:00');
  const [horaFim, setHoraFim] = useState<string>('15:45');
  const { eventos, aoVivo, status } = useAgendaAoVivo();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userProfile, setUserProfile] = useState<string>('Estudante IFPA Breves');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const eqParam = searchParams.get('equipamento');
    const srvParam = searchParams.get('servico');
    if (eqParam) setSelectedEquipment(eqParam);
    if (srvParam) setSelectedService(srvParam);
  }, [searchParams]);

  const currentEq = ALVOS.find((e) => e.slug === selectedEquipment) || SALA;
  const formatos = currentEq.fileFormats.length ? ` (${currentEq.fileFormats.join(', ')})` : '';

  // Intervalo escolhido no fuso de Belém (UTC-3, sem horário de verão)
  const inicioEm = new Date(`${bookingDate}T${horaInicio}:00-03:00`);
  const fimEm = new Date(`${bookingDate}T${horaFim}:00-03:00`);
  const horarioValido = !Number.isNaN(inicioEm.getTime()) && fimEm > inicioEm;
  const choques = horarioValido ? conflitos(eventos, inicioEm, fimEm) : [];
  const hhmmss = (h: string) => h.replace(':', '') + '00';
  const slotConflita = (sl: (typeof TIME_SLOTS)[number]) =>
    aoVivo &&
    conflitos(eventos, new Date(`${bookingDate}T${sl.inicio}:00-03:00`), new Date(`${bookingDate}T${sl.fim}:00-03:00`)).length > 0;

  /**
   * Builds the official Google Calendar Event Template URL
   */
  const buildGoogleCalendarUrl = () => {
    const cleanDate = bookingDate.replace(/-/g, '');
    const datesParam = `${cleanDate}T${hhmmss(horaInicio)}/${cleanDate}T${hhmmss(horaFim)}`;
    // O título fica público na agenda do LabMaker: sem nome de quem reservou
    const title = `[LabMaker] Reserva: ${currentEq.shortName}`;
    const details = [
      `Laboratório IFPA MAKER Marajó — IFPA Campus Breves`,
      `Equipamento Reservado: ${currentEq.name}`,
      `Serviço / Modalidade: ${selectedService}`,
      `Solicitante: ${userName || 'A preencher'} (${userProfile})`,
      `E-mail: ${userEmail || 'A preencher'}`,
      `Descrição do Projeto / Arquivo${formatos}: ${
        projectDesc || 'Prototipagem prática no laboratório.'
      }`,
    ].join('\n');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: datesParam,
      details,
      location: GOOGLE_CALENDAR_CONFIG.campusLocation,
      add: GOOGLE_CALENDAR_CONFIG.calendarId,
      ctz: 'America/Belem',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  /**
   * Downloads an .ICS file compatible with Google Calendar / Outlook / Apple Calendar
   */
  const handleDownloadIcs = () => {
    const cleanDate = bookingDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IFPA Campus Breves//Laboratorio IF MAKER//PT',
      'BEGIN:VEVENT',
      `DTSTART;TZID=America/Belem:${cleanDate}T${hhmmss(horaInicio)}`,
      `DTEND;TZID=America/Belem:${cleanDate}T${hhmmss(horaFim)}`,
      `SUMMARY:[LabMaker] Reserva: ${currentEq.shortName}`,
      `ORGANIZER:mailto:${GOOGLE_CALENDAR_CONFIG.calendarId}`,
      `DESCRIPTION:Equipamento: ${currentEq.name}\\nServiço: ${selectedService}\\nPerfil: ${userProfile}\\nProjeto: ${projectDesc}`,
      `LOCATION:${GOOGLE_CALENDAR_CONFIG.campusLocation}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agendamento-ifmaker-breves-${bookingDate}.ics`;
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioValido) return;
    setBookingConfirmed(true);
    window.open(buildGoogleCalendarUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      {/* Header */}
      <section className="border-b border-wb-line bg-wb-bench py-14 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />Agendamento online · Reserva de equipamentos</span>
              <h1
                className="mt-4 font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 54px)',
                  lineHeight: 1.04,
                  letterSpacing: '-0.028em',
                }}
              >
                <WordRise text="Agendamento no Laboratório IF MAKER." />
              </h1>
              <p className="mt-3 max-w-[40em] text-[16.5px] leading-relaxed text-wb-ink-2">
            Escolha a máquina, o dia e o horário. A reserva vai direto para o Google Agenda.
          </p>
            </div>

            <Link
              to="/agenda-mensal"
              className="wb-btn wb-btn-dark h-11 px-5 text-[13.5px]"
            >
              <Calendar className="h-4 w-4 text-wb-orange" />
              <span>Ver Calendário Mensal de Atividades</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Booking Split Layout */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8 items-start">
          {/* Left: Interactive Booking Form */}
          <form onSubmit={handleSubmit} className="wb-panel p-6 sm:p-9 space-y-7">
            {/* Step 1: Select Equipment */}
            <div>
              <label className="block font-brand text-lg font-bold text-wb-ink">
                1. Selecione o Equipamento ou Bancada
              </label>
              <p className="text-[13.5px] text-wb-ink-3 mt-0.5">
                Reserve a sala de aula inteira ou uma estação específica:
              </p>
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALVOS.map((eq) => {
                  const active = selectedEquipment === eq.slug;
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => setSelectedEquipment(eq.slug)}
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? 'border-wb-ink bg-wb-ink text-white shadow-md'
                          : 'border-wb-line bg-wb-bench/60 text-wb-ink hover:bg-wb-bench'
                      }`}
                    >
                      <span
                        className="mt-1 h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: eq.accentColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-bold">{eq.shortName}</span>
                          <span
                            className={`font-key text-[10px] px-2 py-0.5 rounded ${
                              active ? 'bg-white/20 text-white' : 'bg-white text-wb-ink-2'
                            }`}
                          >
                            {eq.unitsAvailable} un.
                          </span>
                        </div>
                        <p
                          className={`text-[12px] mt-0.5 line-clamp-1 ${
                            active ? 'text-white/75' : 'text-wb-ink-3'
                          }`}
                        >
                          {eq.fileFormats.length ? `Formatos: ${eq.fileFormats.join(', ')}` : eq.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date & Time Slot */}
            <div className="border-t border-wb-line pt-6">
              <label className="block font-brand text-lg font-bold text-wb-ink">
                2. Data e horário
              </label>
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[13px] font-bold text-wb-ink-2 mb-1.5">
                    Data da sessão (qualquer dia):
                  </span>
                  <input
                    type="date"
                    onClick={abrirSeletor}
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-wb-line bg-white px-4 py-2.5 text-[14.5px] font-semibold text-wb-ink focus:border-wb-orange focus:outline-none"
                  />
                </div>

                <div>
                  <span className="block text-[13px] font-bold text-wb-ink-2 mb-1.5">
                    Finalidade / Serviço:
                  </span>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full rounded-xl border border-wb-line bg-white px-4 py-2.5 text-[14px] font-semibold text-wb-ink focus:border-wb-orange focus:outline-none"
                  >
                    {LAB_SERVICES.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-[13px] font-bold text-wb-ink-2 mb-1.5">Início:</span>
                  <input
                    type="time"
                    onClick={abrirSeletor}
                    required
                    step={300}
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full rounded-xl border border-wb-line bg-white px-4 py-2.5 text-[14.5px] font-semibold text-wb-ink focus:border-wb-orange focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="block text-[13px] font-bold text-wb-ink-2 mb-1.5">Término:</span>
                  <input
                    type="time"
                    onClick={abrirSeletor}
                    required
                    step={300}
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="w-full rounded-xl border border-wb-line bg-white px-4 py-2.5 text-[14.5px] font-semibold text-wb-ink focus:border-wb-orange focus:outline-none"
                  />
                </label>
              </div>

              <p className="mt-4 text-[12.5px] font-bold text-wb-ink-3">Atalhos de horário:</p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const active = horaInicio === slot.inicio && horaFim === slot.fim;
                  const ocupado = slotConflita(slot);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setHoraInicio(slot.inicio);
                        setHoraFim(slot.fim);
                      }}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-wb-orange bg-wb-orange/10 text-wb-ink ring-2 ring-wb-orange/30'
                          : 'border-wb-line bg-white text-wb-ink-2 hover:bg-wb-bench'
                      }`}
                    >
                      <div>
                        <div className="font-key text-[13.5px] font-bold text-wb-ink">{slot.label}</div>
                        <div className="text-[11.5px] text-wb-ink-3">{slot.period}</div>
                      </div>
                      {aoVivo && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-key text-[10.5px] font-bold ${
                            ocupado ? 'bg-wb-red/15 text-wb-red' : 'bg-wb-green/15 text-wb-green'
                          }`}
                        >
                          {ocupado ? 'Ocupado' : 'Livre'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Situação do horário na agenda do LabMaker (ao vivo) */}
              <div role="status" aria-live="polite" className="mt-4 text-[13.5px]">
                {!horarioValido ? (
                  <p className="rounded-xl bg-wb-red/10 px-4 py-3 font-semibold text-wb-red">
                    O término precisa ser depois do início.
                  </p>
                ) : aoVivo ? (
                  choques.length ? (
                    <div className="rounded-xl bg-wb-red/10 px-4 py-3 text-wb-ink">
                      <p className="font-bold text-wb-red">Já há algo na agenda do LabMaker nesse horário:</p>
                      <ul className="mt-1 space-y-0.5">
                        {choques.slice(0, 4).map((c) => (
                          <li key={c.id}>
                            <span className="font-key font-semibold">{faixaHorario(c)}</span> · {c.titulo}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1 text-[12.5px] text-wb-ink-2">
                        Você ainda pode enviar o pedido; a equipe confirma pela agenda.
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-xl bg-wb-green/10 px-4 py-3 font-semibold text-wb-green">
                      Horário livre na agenda do LabMaker (atualizada ao vivo).
                    </p>
                  )
                ) : (
                  <p className="rounded-xl bg-wb-bench px-4 py-3 text-wb-ink-2">
                    {status === 'carregando'
                      ? 'Consultando a agenda do LabMaker…'
                      : 'A disponibilidade ao vivo aparece aqui assim que a agenda do LabMaker for publicada no Google.'}
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: User & Project Details */}
            <div className="border-t border-wb-line pt-6 space-y-4">
              <label className="block font-brand text-lg font-bold text-wb-ink">
                3. Identificação e Dados do Protótipo
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-wb-ink-2 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-wb-line bg-white px-3.5 py-2.5 text-[14px] text-wb-ink focus:border-wb-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-wb-ink-2 mb-1">
                    Seu E-mail (Google / Institucional) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.nome@discente.ifpa.edu.br"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-wb-line bg-white px-3.5 py-2.5 text-[14px] text-wb-ink focus:border-wb-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-wb-ink-2 mb-1.5">
                  Vínculo com o IFPA Campus Breves / Comunidade:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Estudante IFPA Breves',
                    'Docente / Pesquisador IFPA',
                    'Técnico Administrativo',
                    'Escola Pública Parceira (Breves)',
                    'Comunidade Externa / Arranjo Local',
                  ].map((prof) => (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => setUserProfile(prof)}
                      className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold border transition-colors ${
                        userProfile === prof
                          ? 'border-wb-ink bg-wb-ink text-white'
                          : 'border-wb-line bg-wb-bench text-wb-ink-2'
                      }`}
                    >
                      {prof}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-wb-ink-2 mb-1">
                  Resumo do que será produzido{formatos}:
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva brevemente a peça 3D, corte a laser, circuito Arduino ou objetivo da sessão..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full rounded-xl border border-wb-line bg-white p-3.5 text-[14px] text-wb-ink focus:border-wb-orange focus:outline-none"
                />
              </div>
            </div>

            {/* Submit & Google Calendar Actions */}
            <div className="border-t border-wb-line pt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!horarioValido}
                className="wb-btn wb-btn-primary h-13 px-7 text-[15.5px] flex-1 sm:flex-initial disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Calendar className="h-5 w-5" />
                <span>Confirmar e Abrir no Google Agenda</span>
                <ExternalLink className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="wb-btn border border-wb-line bg-white h-13 px-5 text-[14px] text-wb-ink hover:bg-wb-bench"
              >
                <Download className="h-4 w-4 text-wb-green" />
                <span>Baixar Arquivo .ICS</span>
              </button>

              {GOOGLE_CALENDAR_CONFIG.bookingPageUrl && (
                <a
                  href={GOOGLE_CALENDAR_CONFIG.bookingPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wb-btn wb-btn-dark h-13 px-5 text-[14px]"
                >
                  <Calendar className="h-4 w-4 text-wb-orange" />
                  <span>Reservar pela página do Google</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {bookingConfirmed && (
              <div className="rounded-2xl border border-wb-green bg-wb-green/10 p-4 text-[14px] text-wb-ink flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-wb-green shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Evento gerado para o Google Agenda do IF MAKER Breves!
                  </p>
                  <p className="text-[13px] text-wb-ink-2 mt-0.5">
                    Caso a aba do Google Calendar não tenha aberto automaticamente,{' '}
                    <a
                      href={buildGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-wb-orange underline"
                    >
                      clique aqui para salvar o agendamento na sua Google Agenda
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}
          </form>

          {/* Right: Live Booking Ticket Preview & Lab Rules */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="wb-panel overflow-hidden">
              <div className="bg-wb-ink text-white p-5">
                <div className="flex items-center justify-between">
                  <span className="font-key text-[11px] text-wb-orange font-bold">
                    Ticket de reserva · Google Agenda
                  </span>
                  <span className="wb-key bg-white/15 text-white border-white/20 text-[10px]">
                    IFPA Breves
                  </span>
                </div>
                <h2 className="mt-2 font-brand text-xl font-bold">{currentEq.name}</h2>
              </div>

              <div className="p-6 space-y-4">
                <img
                  src={currentEq.image}
                  alt={currentEq.name}
                  className="h-40 w-full object-cover rounded-xl border border-wb-line"
                />

                <div className="space-y-2.5 text-[13.5px] border-t border-wb-line pt-4">
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Data Selecionada:</span>
                    <span className="font-key font-bold text-wb-ink">
                      {bookingDate.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Horário:</span>
                    <span className="font-key font-bold text-wb-orange">
                      {horaInicio} - {horaFim}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Modalidade:</span>
                    <span className="font-bold text-wb-ink text-right max-w-[200px] truncate">
                      {selectedService}
                    </span>
                  </div>
                  {currentEq.fileFormats.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-wb-ink-3">Formatos Aceitos:</span>
                      <span className="font-key font-bold text-wb-green">
                        {currentEq.fileFormats.join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Agenda Destino:</span>
                    <span className="font-key text-[12px] text-wb-ink-2">
                      {GOOGLE_CALENDAR_CONFIG.calendarId}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-wb-bench p-3.5 text-[12.5px] text-wb-ink-2">
                  <p className="font-bold text-wb-ink flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-wb-orange shrink-0" />
                    Como funciona a integração Google Agenda:
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Ao confirmar, o evento é criado no seu Google Calendar já convidando a agenda
                    oficial do LabMaker (<code>{GOOGLE_CALENDAR_CONFIG.calendarId}</code>). Assim
                    que entra na agenda do laboratório, o horário aparece como ocupado neste site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

