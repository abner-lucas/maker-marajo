import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalendarActivity } from '../data/labData';

/*
 * Agenda ao vivo do LabMaker Marajó.
 * Os eventos vêm da Google Agenda pública do laboratório através de /api/agenda.php
 * (que só repassa título, horário e local). A página consulta de novo a cada 60 s
 * e sempre que o visitante volta para a aba.
 */

/** Datas que não são atividades do laboratório (vêm do calendário de feriados) */
export type DataEspecial = 'feriado' | 'ponto-facultativo' | 'comemorativa';

export const ROTULO_ESPECIAL: Record<DataEspecial, string> = {
  feriado: 'Feriado',
  'ponto-facultativo': 'Ponto facultativo',
  comemorativa: 'Data comemorativa',
};

export interface EventoAgenda {
  id: string;
  /** Preenchido só para feriados, pontos facultativos e datas comemorativas */
  especial?: DataEspecial;
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

interface RespostaApi {
  ok: boolean;
  motivo?: string;
  atualizadoEm?: string;
  desatualizado?: boolean;
  eventos?: {
    id: string;
    titulo: string;
    local: string | null;
    inicio: string;
    fim: string;
    diaInteiro: boolean;
    tipo?: string;
  }[];
}

export function useAgendaAoVivo() {
  // começa vazia: só mostra o que vier da agenda real do LabMaker (nada de exemplos)
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [status, setStatus] = useState<StatusAgenda>('carregando');
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const emAndamento = useRef(false);
  const buscarRef = useRef<() => void>(() => {});

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
              especial:
                e.tipo === 'feriado' || e.tipo === 'ponto-facultativo' || e.tipo === 'comemorativa'
                  ? e.tipo
                  : undefined,
            }))
          );
          setStatus('ao-vivo');
          setAtualizadoEm(dados.atualizadoEm ? new Date(dados.atualizadoEm) : new Date());
        } else {
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

    buscarRef.current = buscar;
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

  /** Força nova consulta ao Google (ex.: ao trocar de mês) */
  const atualizar = useCallback(() => buscarRef.current(), []);

  return {
    eventos,
    status,
    atualizadoEm,
    aoVivo: status === 'ao-vivo',
    carregando: status === 'carregando',
    atualizar,
  };
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
  // feriados e datas comemorativas não ocupam o laboratório (viram aviso, não bloqueio)
  return eventos.filter((e) => !e.especial && e.inicio < fim && e.fim > inicio);
}

/** Feriados / pontos facultativos / datas comemorativas de um dia "AAAA-MM-DD" */
export function datasEspeciaisDoDia(eventos: EventoAgenda[], dia: string) {
  return eventos.filter((e) => e.especial && chaveDia(e.inicio) === dia);
}
