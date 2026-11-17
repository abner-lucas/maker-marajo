/**
 * Reservas do site makermarajo.com → Google Agenda do LabMaker.
 *
 * Como publicar (uma vez, logado em labmaker.breves@ifpa.edu.br):
 *   1. script.google.com → Novo projeto → apague o conteúdo e cole este arquivo.
 *   2. Implantar → Nova implantação → tipo "App da Web"
 *        Executar como: Eu (labmaker.breves@ifpa.edu.br)
 *        Quem pode acessar: Qualquer pessoa
 *   3. Autorize o acesso à Agenda e copie a "URL do app da Web" (termina em /exec).
 *
 * Para atualizar depois: cole o código novo, salve e use
 *   Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar
 * (assim a URL /exec continua a mesma).
 *
 * O que ele faz:
 *   - recebe os dados do formulário do site;
 *   - aceita reserva de um dia ou repetida toda semana (ex.: quarta e quinta até 12/12);
 *   - recusa horários já ocupados, datas passadas e pedidos fora dos limites;
 *   - cria o evento como PRIVADO (o público vê só "ocupado"; nome e e-mail ficam
 *     visíveis apenas para a equipe) e envia convite por e-mail para quem reservou.
 */

const AGENDA_ID = 'labmaker.breves@ifpa.edu.br';
const LOCAL = 'Laboratório IFPA MAKER Marajó — IFPA Campus Breves, PA';
const MAX_HORAS = 8; // duração máxima de cada encontro
const MAX_DIAS_ANTECEDENCIA = 180;
const MAX_ENCONTROS = 80; // limite de encontros numa reserva semanal
const MAX_POR_EMAIL_DIA = 3; // proteção contra abuso
const MAX_POR_DIA = 60;
const FUSO_MS = -3 * 3600000; // Belém (UTC-3, sem horário de verão)
const DIA_MS = 86400000;
const NOMES_DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function doPost(e) {
  const trava = LockService.getScriptLock();
  if (!trava.tryLock(15000)) return resposta({ ok: false, motivo: 'ocupado-tente-de-novo' });
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // campo-armadilha: robôs preenchem, pessoas não veem
    if (d.site) return resposta({ ok: true });

    const erro = validar(d);
    if (erro) return resposta({ ok: false, motivo: 'invalido', detalhe: erro });

    const inicio = new Date(d.inicio);
    const fim = new Date(d.fim);
    const duracao = fim.getTime() - inicio.getTime();
    const agenda = CalendarApp.getCalendarById(AGENDA_ID) || CalendarApp.getDefaultCalendar();

    // limites de uso
    const cache = CacheService.getScriptCache();
    const chaveEmail = 'email:' + d.email.toLowerCase();
    const usosEmail = Number(cache.get(chaveEmail) || 0);
    const usosDia = Number(cache.get('total') || 0);
    if (usosEmail >= MAX_POR_EMAIL_DIA || usosDia >= MAX_POR_DIA) {
      return resposta({ ok: false, motivo: 'limite' });
    }

    // encontros: um só, ou um por dia marcado da semana até a data final
    const dias = lerDias(d.dias);
    let ate = null;
    let encontros = [inicio.getTime()];
    if (dias.length) {
      ate = new Date(d.ate + 'T23:59:59-03:00');
      if (isNaN(ate) || ate < inicio) return resposta({ ok: false, motivo: 'invalido', detalhe: 'Data final inválida' });
      if (ate.getTime() > Date.now() + MAX_DIAS_ANTECEDENCIA * DIA_MS) {
        return resposta({ ok: false, motivo: 'invalido', detalhe: 'Data final muito distante' });
      }
      encontros = [];
      for (let t = inicio.getTime(); t <= ate.getTime(); t += DIA_MS) {
        if (dias.indexOf(new Date(t + FUSO_MS).getUTCDay()) >= 0) encontros.push(t);
      }
      if (!encontros.length) return resposta({ ok: false, motivo: 'invalido', detalhe: 'Nenhum encontro no período' });
      if (encontros.length > MAX_ENCONTROS) {
        return resposta({ ok: false, motivo: 'invalido', detalhe: 'Muitos encontros' });
      }
    }

    // conflito com qualquer evento que bloqueie o horário
    // (eventos marcados como "disponível" não bloqueiam; na dúvida, conta como ocupado)
    const existentes = agenda
      .getEvents(new Date(encontros[0]), new Date(encontros[encontros.length - 1] + duracao))
      .filter(function (ev) {
        try {
          return String(ev.getTransparency()).toUpperCase() !== 'TRANSPARENT';
        } catch (_) {
          return true;
        }
      });
    const ocupadas = [];
    encontros.forEach(function (t) {
      const choca = existentes.some(function (ev) {
        return ev.getStartTime().getTime() < t + duracao && ev.getEndTime().getTime() > t;
      });
      if (choca) ocupadas.push(new Date(t + FUSO_MS).toISOString().slice(0, 10));
    });
    if (ocupadas.length) return resposta({ ok: false, motivo: 'conflito', datas: ocupadas });

    const titulo = 'Reserva LabMaker: ' + limpar(d.alvo, 80);
    const linhas = [
      'Reserva feita pelo site makermarajo.com',
      '',
      'Espaço / equipamento: ' + limpar(d.alvo, 120),
      'Finalidade: ' + limpar(d.servico, 160),
      'Solicitante: ' + limpar(d.nome, 120) + ' (' + limpar(d.vinculo, 80) + ')',
      'E-mail: ' + d.email,
    ];
    if (dias.length) {
      linhas.push(
        'Repete: toda semana (' +
          dias.map(function (i) { return NOMES_DIAS[i]; }).join(', ') +
          ') até ' + d.ate.split('-').reverse().join('/') +
          ' — ' + encontros.length + ' encontros'
      );
    }
    linhas.push('', 'Descrição: ' + limpar(d.descricao || '—', 1500));
    const opcoes = {
      description: linhas.join('\n'),
      location: LOCAL,
      guests: d.email,
      sendInvites: true,
    };

    const primeiro = new Date(encontros[0]);
    const evento = dias.length
      ? agenda.createEventSeries(
          titulo,
          primeiro,
          new Date(encontros[0] + duracao),
          CalendarApp.newRecurrence()
            .addWeeklyRule()
            .onlyOnWeekdays(dias.map(function (i) { return DIAS_APP()[i]; }))
            .until(ate),
          opcoes
        )
      : agenda.createEvent(titulo, inicio, fim, opcoes);

    // ajustes extras: se algum falhar, a reserva já está feita e não deve virar erro
    tentar(function () { evento.setVisibility(CalendarApp.Visibility.PRIVATE); });
    tentar(function () { evento.setGuestsCanSeeOtherGuests(false); });
    tentar(function () { evento.setGuestsCanInviteOthers(false); });

    cache.put(chaveEmail, String(usosEmail + 1), 21600);
    cache.put('total', String(usosDia + 1), 21600);

    return resposta({ ok: true, id: evento.getId(), encontros: encontros.length });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, motivo: 'erro-interno' });
  } finally {
    trava.releaseLock();
  }
}

/** Teste rápido no navegador: abrir a URL /exec deve mostrar {"ok":true,"servico":"reservas"} */
function doGet() {
  return resposta({ ok: true, servico: 'reservas' });
}

function DIAS_APP() {
  const W = CalendarApp.Weekday;
  return [W.SUNDAY, W.MONDAY, W.TUESDAY, W.WEDNESDAY, W.THURSDAY, W.FRIDAY, W.SATURDAY];
}

/** "3,4" → [3, 4] (0 = domingo … 6 = sábado); vazio = reserva de um dia só */
function lerDias(v) {
  if (!v || typeof v !== 'string') return [];
  const lista = [];
  v.split(',').forEach(function (x) {
    const n = Number(x);
    if (Number.isInteger(n) && n >= 0 && n <= 6 && lista.indexOf(n) < 0) lista.push(n);
  });
  return lista.sort();
}

function validar(d) {
  const campos = ['alvo', 'servico', 'nome', 'email', 'vinculo', 'inicio', 'fim'];
  for (let i = 0; i < campos.length; i++) {
    if (!d[campos[i]] || typeof d[campos[i]] !== 'string') return 'Campo ausente: ' + campos[i];
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.email.length > 160) return 'E-mail inválido';
  const inicio = new Date(d.inicio);
  const fim = new Date(d.fim);
  if (isNaN(inicio) || isNaN(fim)) return 'Data inválida';
  if (fim <= inicio) return 'O término precisa ser depois do início';
  if (fim - inicio > MAX_HORAS * 3600000) return 'Reserva maior que ' + MAX_HORAS + ' horas';
  const agora = Date.now();
  if (inicio.getTime() < agora - 5 * 60000) return 'Horário no passado';
  if (inicio.getTime() > agora + MAX_DIAS_ANTECEDENCIA * DIA_MS) return 'Data muito distante';
  if (d.dias && !/^\d{4}-\d{2}-\d{2}$/.test(String(d.ate || ''))) return 'Data final ausente';
  return null;
}

function tentar(fn) {
  try {
    fn();
  } catch (err) {
    console.warn(err);
  }
}

function limpar(v, max) {
  return String(v || '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
    .slice(0, max);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
