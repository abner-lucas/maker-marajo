import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCode,
  Info,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import { EQUIPMENTS, GOOGLE_CALENDAR_CONFIG, IMAGE_ASSETS, LAB_SERVICES } from '../data/labData';
import { chaveDia, conflitos, dataCurta, faixaHorario, useAgendaAoVivo } from '../lib/agenda';
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

/** Reservas semanais (ex.: projeto de pesquisa toda quarta e quinta) */
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MAX_ENCONTROS = 80;
const diaDaSemana = (d: string) => {
  const [a, m, dia] = d.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, dia)).getUTCDay();
};
const somarDias = (d: string, n: number) => {
  const [a, m, dia] = d.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, dia + n)).toISOString().slice(0, 10);
};
const dataBR = (d: string) => d.split('-').reverse().join('/');

/** Opção do seletor que libera um campo para digitar a finalidade */
const OUTRA = 'Outra finalidade';
const ehServicoListado = (t: string | null) => !!t && LAB_SERVICES.some((s) => s.title === t);

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedEquipment, setSelectedEquipment] = useState<string>(
    searchParams.get('equipamento') || SALA.slug
  );
  const [selectedService, setSelectedService] = useState<string>(() => {
    const p = searchParams.get('servico');
    return p ? (ehServicoListado(p) ? p : OUTRA) : LAB_SERVICES[0].title;
  });
  const [outraFinalidade, setOutraFinalidade] = useState<string>(() => {
    const p = searchParams.get('servico');
    return p && !ehServicoListado(p) ? p : '';
  });
  const [bookingDate, setBookingDate] = useState<string>(() => chaveDia(new Date()));
  const [horaInicio, setHoraInicio] = useState<string>('14:00');
  const [horaFim, setHoraFim] = useState<string>('15:45');
  const { eventos, aoVivo, status, atualizar } = useAgendaAoVivo();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userProfile, setUserProfile] = useState<string>('Estudante IFPA Breves');
  const [projectDesc, setProjectDesc] = useState<string>('');
  // estado do envio para a agenda do LabMaker
  const [envio, setEnvio] = useState<
    'parado' | 'enviando' | 'ok' | 'conflito' | 'limite' | 'indisponivel' | 'falha'
  >('parado');
  const [armadilha, setArmadilha] = useState('');
  // repetição semanal
  const [repetir, setRepetir] = useState(false);
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [repetirAte, setRepetirAte] = useState('');
  const [datasOcupadas, setDatasOcupadas] = useState<string[]>([]);

  useEffect(() => {
    const eqParam = searchParams.get('equipamento');
    const srvParam = searchParams.get('servico');
    if (eqParam) setSelectedEquipment(eqParam);
    if (srvParam) {
      if (ehServicoListado(srvParam)) setSelectedService(srvParam);
      else {
        setSelectedService(OUTRA);
        setOutraFinalidade(srvParam);
      }
    }
  }, [searchParams]);

  const currentEq = ALVOS.find((e) => e.slug === selectedEquipment) || SALA;
  const formatos = currentEq.fileFormats.length ? ` (${currentEq.fileFormats.join(', ')})` : '';

  // Intervalo escolhido no fuso de Belém (UTC-3, sem horário de verão)
  const inicioEm = new Date(`${bookingDate}T${horaInicio}:00-03:00`);
  const fimEm = new Date(`${bookingDate}T${horaFim}:00-03:00`);
  const horarioValido = !Number.isNaN(inicioEm.getTime()) && fimEm > inicioEm;
  // finalidade efetivamente enviada (lista ou texto digitado)
  const finalidade = selectedService === OUTRA ? outraFinalidade.trim() : selectedService;
  const finalidadeValida = finalidade.length > 0;
  // dias em que a reserva acontece (um só, ou todos os da repetição semanal)
  const ocorrencias = useMemo(() => {
    if (!repetir) return [bookingDate];
    if (!repetirAte || repetirAte < bookingDate || !diasSemana.length) return [];
    const lista: string[] = [];
    for (let d = bookingDate; d <= repetirAte && lista.length <= MAX_ENCONTROS; d = somarDias(d, 1)) {
      if (diasSemana.includes(diaDaSemana(d))) lista.push(d);
    }
    return lista;
  }, [repetir, bookingDate, repetirAte, diasSemana]);
  const repeticaoValida = !repetir || (ocorrencias.length > 0 && ocorrencias.length <= MAX_ENCONTROS);
  const choques = horarioValido
    ? ocorrencias.flatMap((d) =>
        conflitos(eventos, new Date(`${d}T${horaInicio}:00-03:00`), new Date(`${d}T${horaFim}:00-03:00`))
      )
    : [];
  const alternarRepeticao = (ligar: boolean) => {
    setRepetir(ligar);
    if (ligar) {
      if (!diasSemana.length) setDiasSemana([diaDaSemana(bookingDate)]);
      if (!repetirAte || repetirAte < bookingDate) setRepetirAte(somarDias(bookingDate, 28));
    }
  };
  const hhmmss = (h: string) => h.replace(':', '') + '00';
  const slotConflita = (sl: (typeof TIME_SLOTS)[number]) =>
    aoVivo &&
    conflitos(eventos, new Date(`${bookingDate}T${sl.inicio}:00-03:00`), new Date(`${bookingDate}T${sl.fim}:00-03:00`)).length > 0;

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
      `DESCRIPTION:Equipamento: ${currentEq.name}\\nServiço: ${finalidade}\\nPerfil: ${userProfile}\\nProjeto: ${projectDesc}`,
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

  /**
   * Envia a reserva ao servidor do site, que cria o evento direto na Google Agenda
   * do LabMaker. Se o serviço ainda não estiver configurado, cai no modo antigo
   * (abre a programação de horários "Reserva LabMaker" para concluir lá).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioValido || !finalidadeValida || !repeticaoValida || envio === 'enviando') return;
    setEnvio('enviando');
    setDatasOcupadas([]);
    try {
      const r = await fetch('/api/reservar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alvo: currentEq.name,
          servico: finalidade,
          nome: userName,
          email: userEmail,
          vinculo: userProfile,
          descricao: projectDesc,
          // na repetição, começa no primeiro dia escolhido que cai num dos dias marcados
          inicio: new Date(`${ocorrencias[0] ?? bookingDate}T${horaInicio}:00-03:00`).toISOString(),
          fim: new Date(`${ocorrencias[0] ?? bookingDate}T${horaFim}:00-03:00`).toISOString(),
          dias: repetir ? [...diasSemana].sort().join(',') : '',
          ate: repetir ? repetirAte : '',
          site: armadilha,
        }),
      });
      const dados = (await r.json().catch(() => ({}))) as { ok?: boolean; motivo?: string; datas?: string[] };
      if (dados.ok) {
        setEnvio('ok');
        atualizar();
        return;
      }
      if (dados.motivo === 'conflito') {
        setDatasOcupadas(Array.isArray(dados.datas) ? dados.datas : []);
        return setEnvio('conflito');
      }
      if (dados.motivo === 'limite') return setEnvio('limite');
      // nada é aberto: se o serviço não estiver ligado, só avisa
      if (dados.motivo === 'nao-configurado') return setEnvio('indisponivel');
      setEnvio('falha');
    } catch {
      setEnvio('falha');
    }
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
                    <option value={OUTRA}>Outra finalidade (digitar)</option>
                  </select>
                  {selectedService === OUTRA && (
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={160}
                      value={outraFinalidade}
                      onChange={(e) => setOutraFinalidade(e.target.value)}
                      placeholder="Descreva a finalidade da reserva"
                      aria-label="Outra finalidade"
                      className="mt-2 w-full rounded-xl border border-wb-line bg-white px-4 py-2.5 text-[14px] font-semibold text-wb-ink placeholder:font-normal placeholder:text-wb-ink-3 focus:border-wb-orange focus:outline-none"
                    />
                  )}
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

              {/* Repetição semanal */}
              <div className="mt-5 rounded-xl border border-wb-line bg-white p-4">
                <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-bold text-wb-ink">
                  <input
                    type="checkbox"
                    checked={repetir}
                    onChange={(e) => alternarRepeticao(e.target.checked)}
                    className="h-4 w-4 accent-[#FF6B35]"
                  />
                  Repetir toda semana
                </label>
                {repetir && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <span className="mb-1.5 block text-[12.5px] font-bold text-wb-ink-3">Nos dias:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {DIAS_SEMANA.map((nome, i) => {
                          const marcado = diasSemana.includes(i);
                          return (
                            <button
                              key={nome}
                              type="button"
                              aria-pressed={marcado}
                              onClick={() =>
                                setDiasSemana((atual) =>
                                  marcado ? atual.filter((x) => x !== i) : [...atual, i]
                                )
                              }
                              className={`h-9 min-w-[48px] rounded-lg border px-2.5 text-[13px] font-bold transition-colors ${
                                marcado
                                  ? 'border-wb-orange bg-wb-orange text-white'
                                  : 'border-wb-line bg-white text-wb-ink-2 hover:bg-wb-bench'
                              }`}
                            >
                              {nome}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="block max-w-[240px]">
                      <span className="mb-1.5 block text-[12.5px] font-bold text-wb-ink-3">Até o dia:</span>
                      <input
                        type="date"
                        onClick={abrirSeletor}
                        required
                        min={bookingDate}
                        value={repetirAte}
                        onChange={(e) => setRepetirAte(e.target.value)}
                        className="w-full rounded-xl border border-wb-line bg-white px-4 py-2.5 text-[14.5px] font-semibold text-wb-ink focus:border-wb-orange focus:outline-none"
                      />
                    </label>
                    <p className={`text-[13px] ${repeticaoValida ? 'text-wb-ink-2' : 'font-semibold text-wb-red'}`}>
                      {!diasSemana.length
                        ? 'Marque pelo menos um dia da semana.'
                        : !ocorrencias.length
                          ? 'Nenhum encontro nesse período. Confira a data inicial e a final.'
                          : ocorrencias.length > MAX_ENCONTROS
                            ? `Muitos encontros (máximo ${MAX_ENCONTROS}). Encurte o período.`
                            : `${ocorrencias.length} encontro${ocorrencias.length > 1 ? 's' : ''}, de ${dataBR(
                                ocorrencias[0]
                              )} a ${dataBR(ocorrencias[ocorrencias.length - 1])}.`}
                    </p>
                  </div>
                )}
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
                          <li key={`${c.id}-${c.inicio.getTime()}`}>
                            <span className="font-key font-semibold">
                              {repetir && `${dataCurta(c.inicio)} · `}
                              {faixaHorario(c)}
                            </span>{' '}
                            · {c.titulo}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1 text-[12.5px] text-wb-ink-2">
                        Você ainda pode enviar o pedido; a equipe confirma pela agenda.
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-xl bg-wb-green/10 px-4 py-3 font-semibold text-wb-green">
                      {repetir && ocorrencias.length > 1
                        ? `Horário livre em todos os ${ocorrencias.length} encontros (agenda atualizada ao vivo).`
                        : 'Horário livre na agenda do LabMaker (atualizada ao vivo).'}
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

            {/* Campo invisível contra robôs (pessoas não veem nem preenchem) */}
            <input
              type="text"
              name="site"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={armadilha}
              onChange={(e) => setArmadilha(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {/* Submit & Google Calendar Actions */}
            <div className="border-t border-wb-line pt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!horarioValido || !finalidadeValida || !repeticaoValida || envio === 'enviando'}
                className="wb-btn wb-btn-primary h-13 px-7 text-[15.5px] flex-1 sm:flex-initial disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Calendar className="h-5 w-5" />
                <span>{envio === 'enviando' ? 'Enviando reserva…' : 'Confirmar reserva'}</span>
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

            <div role="status" aria-live="polite">
              {envio === 'ok' && (
                <div className="rounded-2xl border border-wb-green bg-wb-green/10 p-4 text-[14px] text-wb-ink flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-wb-green shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Reserva registrada na agenda do LabMaker!</p>
                    <p className="text-[13px] text-wb-ink-2 mt-0.5">
                      Você vai receber o convite no e-mail informado. O horário já aparece como ocupado
                      na agenda do site.
                    </p>
                  </div>
                </div>
              )}
              {envio === 'conflito' && (
                <p className="rounded-2xl bg-wb-red/10 p-4 text-[14px] font-semibold text-wb-red">
                  {datasOcupadas.length
                    ? `Horário já ocupado em: ${datasOcupadas.map(dataBR).join(', ')}. Ajuste e envie de novo.`
                    : 'Esse horário acabou de ser ocupado. Escolha outro e envie de novo.'}
                </p>
              )}
              {envio === 'limite' && (
                <p className="rounded-2xl bg-wb-red/10 p-4 text-[14px] font-semibold text-wb-red">
                  Muitas reservas seguidas. Tente novamente mais tarde.
                </p>
              )}
              {(envio === 'falha' || envio === 'indisponivel') && (
                <p className="rounded-2xl bg-wb-red/10 p-4 text-[14px] text-wb-ink">
                  {envio === 'indisponivel'
                    ? 'As reservas pelo site estão sendo ativadas.'
                    : 'Não foi possível registrar a reserva agora.'}{' '}
                  Tente de novo em instantes ou escreva para{' '}
                  <a
                    href={`mailto:${GOOGLE_CALENDAR_CONFIG.calendarId}`}
                    className="font-bold text-wb-orange underline"
                  >
                    {GOOGLE_CALENDAR_CONFIG.calendarId}
                  </a>
                  .
                </p>
              )}
            </div>

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
                      {finalidade || '—'}
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
                    Ao confirmar, a reserva é registrada direto na agenda oficial do LabMaker
                    (<code>{GOOGLE_CALENDAR_CONFIG.calendarId}</code>) e você recebe o convite por
                    e-mail. O horário passa a aparecer como ocupado neste site.
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

