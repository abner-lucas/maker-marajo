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
import { EQUIPMENTS, GOOGLE_CALENDAR_CONFIG, LAB_SERVICES } from '../data/labData';
import { WordRise } from '../components/BrandLogo';

const TIME_SLOTS = [
  { id: 'm1', label: '08:30 - 10:00', period: 'Manhã · Bloco 1', start: '083000', end: '100000', status: 'Disponível' },
  { id: 'm2', label: '10:15 - 11:45', period: 'Manhã · Bloco 2', start: '101500', end: '114500', status: 'Disponível' },
  { id: 't1', label: '14:00 - 15:45', period: 'Tarde · Bloco 1', start: '140000', end: '154500', status: 'Disponível' },
  { id: 't2', label: '16:00 - 17:45', period: 'Tarde · Bloco 2', start: '160000', end: '174500', status: 'Últimas Vagas' },
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedEquipment, setSelectedEquipment] = useState<string>(
    searchParams.get('equipamento') || EQUIPMENTS[0].slug
  );
  const [selectedService, setSelectedService] = useState<string>(
    searchParams.get('servico') || LAB_SERVICES[0].title
  );
  const [bookingDate, setBookingDate] = useState<string>('2026-11-10');
  const [selectedSlot, setSelectedSlot] = useState<string>('t1');
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

  const currentEq =
    EQUIPMENTS.find((e) => e.slug === selectedEquipment) || EQUIPMENTS[0];
  const currentSlot =
    TIME_SLOTS.find((s) => s.id === selectedSlot) || TIME_SLOTS[2];

  /**
   * Builds the official Google Calendar Event Template URL
   */
  const buildGoogleCalendarUrl = () => {
    const cleanDate = bookingDate.replace(/-/g, '');
    const datesParam = `${cleanDate}T${currentSlot.start}/${cleanDate}T${currentSlot.end}`;
    const title = `[IF MAKER Breves] Reserva: ${currentEq.shortName} — ${userName || 'Protótipo'}`;
    const details = [
      `Laboratório IF MAKER — IFPA Campus Breves (5º Lab IFPA)`,
      `Equipamento Reservado: ${currentEq.name}`,
      `Serviço / Modalidade: ${selectedService}`,
      `Solicitante: ${userName || 'A preencher'} (${userProfile})`,
      `E-mail: ${userEmail || 'A preencher'}`,
      `Descrição do Projeto / Arquivo (${currentEq.fileFormats.join(', ')}): ${
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
      `DTSTART;TZID=America/Belem:${cleanDate}T${currentSlot.start}`,
      `DTEND;TZID=America/Belem:${cleanDate}T${currentSlot.end}`,
      `SUMMARY:[IF MAKER Breves] ${currentEq.shortName} - ${userName || 'Agendamento'}`,
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
              <span className="wb-key text-wb-orange font-bold">
                RESERVA DE BANCADA & MÁQUINAS · INTEGRAÇÃO GOOGLE AGENDA
              </span>
              <h1
                className="mt-4 font-brand font-bold text-wb-ink"
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 54px)',
                  lineHeight: 1.04,
                  letterSpacing: '-0.045em',
                }}
              >
                <WordRise text="Agendamento no Laboratório IF MAKER." />
              </h1>
              <p className="mt-3 max-w-[40em] text-[16.5px] leading-relaxed text-wb-ink-2">
                Escolha o equipamento, selecione o dia e o bloco de horário e sincronize sua sessão
                diretamente com o <strong>Google Agenda</strong> do IFPA Campus Breves.
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
                Escolha qual estação tecnológica do IF MAKER Breves você utilizará:
              </p>
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EQUIPMENTS.map((eq) => {
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
                          Formatos: {eq.fileFormats.join(', ')}
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
                2. Data e Bloco de Horário
              </label>
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[13px] font-bold text-wb-ink-2 mb-1.5">
                    Data da Sessão (Seg a Sex):
                  </span>
                  <input
                    type="date"
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

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const active = selectedSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-wb-orange bg-wb-orange/10 text-wb-ink ring-2 ring-wb-orange/30'
                          : 'border-wb-line bg-white text-wb-ink-2 hover:bg-wb-bench'
                      }`}
                    >
                      <div>
                        <div className="font-key text-[13.5px] font-bold text-wb-ink">
                          {slot.label}
                        </div>
                        <div className="text-[11.5px] text-wb-ink-3">{slot.period}</div>
                      </div>
                      <span className="rounded-full bg-wb-green/15 px-2.5 py-0.5 font-key text-[10.5px] font-bold text-wb-green">
                        {slot.status}
                      </span>
                    </button>
                  );
                })}
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
                  Resumo do que será produzido / arquivos ({currentEq.fileFormats.join(', ')}):
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
                className="wb-btn wb-btn-primary h-13 px-7 text-[15.5px] flex-1 sm:flex-initial"
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
                  <span className="font-key text-[11px] uppercase tracking-wider text-wb-orange font-bold">
                    TICKET DE RESERVA · GOOGLE AGENDA
                  </span>
                  <span className="wb-key bg-white/15 text-white border-white/20 text-[10px]">
                    IFPA BREVES
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
                    <span className="font-key font-bold text-wb-ink">{bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Bloco de Horário:</span>
                    <span className="font-key font-bold text-wb-orange">{currentSlot.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Modalidade:</span>
                    <span className="font-bold text-wb-ink text-right max-w-[200px] truncate">
                      {selectedService}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Formatos Aceitos:</span>
                    <span className="font-key font-bold text-wb-green">
                      {currentEq.fileFormats.join(', ')}
                    </span>
                  </div>
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
                    Ao confirmar, o evento é criado no seu Google Calendar já convidando o e-mail
                    oficial do laboratório (<code>{GOOGLE_CALENDAR_CONFIG.calendarId}</code>) e
                    registrando o local e as especificações da máquina.
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

