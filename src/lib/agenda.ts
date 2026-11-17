import { useEffect, useRef, useState } from 'react';
import { CALENDAR_ACTIVITIES, type CalendarActivity } from '../data/labData';

/*
 * Agenda ao vivo do LabMaker Marajó.
 * Os eventos vêm da Google Agenda pública do laboratório através de /api/agenda.php
 * (que só repassa título, horário e local). A página consulta de novo a cada 60 s
 * e sempre que o visitante volta para a aba.
 */

export interface EventoAgenda {
  id: string;
  titulo: string;
  inicio: Date;
  fim: Date;
  diaInteiro: boolean;
  local?: string | null;
  /** Só existe nos exemplos internos (fallback); eventos do Google não trazem descrição */
  descricao?: string;
  tipo?: CalendarActivity['type'];
  equipamento?: string;
  responsavel?: string;
  vagas?: { livres: number; total: number };
}

export type StatusAgenda = 'carregando' | 'ao-vivo' | 'nao-publica' | 'indisponivel';

export const INTERVALO_ATUALIZACAO_MS = 60_000;

/** Atividades de exemplo usadas enquanto a agenda do Google não estiver pública */
export const EVENTOS_EXEMPLO: EventoAgenda[] = CALENDAR_ACTIVITIES.map((a) => ({
  id: a.id,
  titulo: a.title,
  inicio: new Date(`${a.date}T${a.startTime}:00-03:00`),
  fim: new Date(`${a.date}T${a.endTime}:00-03:00`),
  diaInteiro: false,
  local: a.location,
  descricao: a.description,
  tipo: a.type,
  equipamento: a.equipment,
  responsavel: a.instructorOrResponsible,
  vagas: { livres: a.spotsAvailable, total: a.totalSpots },
}));

interface RespostaApi {
  ok: boolean;
  motivo?: string;
  atualizadoEm?: string;
  desatualizado?: boolean;
  eventos?: { id: string; titulo: string; local: string | null; inicio: string; fim: string; diaInteiro: boolean }[];
}

export function useAgendaAoVivo() {
  const [eventos, setEventos] = useState<EventoAgenda[]>(EVENTOS_EXEMPLO);
  const [status, setStatus] = useState<StatusAgenda>('carregando');
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const emAndamento = useRef(false);

  useEffect(() => {
    let cancelado = false;

    const buscar = async () => {
      if (emAndamento.current || document.visibilityState === 'hidden') return;
      emAndamento.current = true;
      try {
        const r = await fetch(`/api/agenda.php?t=${Date.now()}`, { cache: 'no-store' });
        const tipo = r.headers.get('content-type') ?? '';
        if (!r.ok || !tipo.includes('json')) throw new Error(`HTTP ${r.status}`);
        const dados = (await r.json()) as RespostaApi;
        if (cancelado) return;
        if (dados.ok && dados.eventos) {
          setEventos(
            dados.eventos.map((e) => ({
              id: e.id,
              titulo: e.titulo,
              local: e.local,
              inicio: new Date(e.inicio),
              fim: new Date(e.fim),
              diaInteiro: e.diaInteiro,
            }))
          );
          setStatus('ao-vivo');
          setAtualizadoEm(dados.atualizadoEm ? new Date(dados.atualizadoEm) : new Date());
        } else {
          setEventos(EVENTOS_EXEMPLO);
          setStatus(dados.motivo === 'agenda-nao-publica' ? 'nao-publica' : 'indisponivel');
        }
      } catch {
        if (!cancelado) {
          // mantém o que já estava na tela; só marca indisponível se nunca carregou
          setStatus((s) => (s === 'ao-vivo' ? s : 'indisponivel'));
        }
      } finally {
        emAndamento.current = false;
      }
    };

    buscar();
    const id = window.setInterval(buscar, INTERVALO_ATUALIZACAO_MS);
    const aoVoltar = () => document.visibilityState === 'visible' && buscar();
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('focus', aoVoltar);
    return () => {
      cancelado = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', aoVoltar);
      window.removeEventListener('focus', aoVoltar);
    };
  }, []);

  return { eventos, status, atualizadoEm, aoVivo: status === 'ao-vivo' };
}

/* ------------------------------------------------------------------ utilitários */

const FUSO = 'America/Belem';

/** "AAAA-MM-DD" do evento no fuso de Belém */
export const chaveDia = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export const hora = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }).format(d);

export const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: 'short' }).format(d).replace('.', '');

export const dataLonga = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'long', day: '2-digit', month: 'long' }).format(d);

export const faixaHorario = (e: EventoAgenda) => (e.diaInteiro ? 'Dia inteiro' : `${hora(e.inicio)} – ${hora(e.fim)}`);

/** Eventos que ocupam um dia (inclui eventos de vários dias) */
export function eventosDoDia(eventos: EventoAgenda[], dia: string) {
  const ini = new Date(`${dia}T00:00:00-03:00`).getTime();
  const fim = ini + 86_400_000;
  return eventos.filter((e) => e.inicio.getTime() < fim && e.fim.getTime() > ini);
}

/** Eventos que se sobrepõem ao intervalo [inicio, fim) */
export function conflitos(eventos: EventoAgenda[], inicio: Date, fim: Date) {
  return eventos.filter((e) => e.inicio < fim && e.fim > inicio);
}
