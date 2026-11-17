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
 * O que ele faz:
 *   - recebe os dados do formulário do site;
 *   - recusa horários já ocupados, datas passadas e pedidos fora dos limites;
 *   - cria o evento como PRIVADO (o público vê só "ocupado"; nome e e-mail ficam
 *     visíveis apenas para a equipe) e envia convite por e-mail para quem reservou.
 */

const AGENDA_ID = 'labmaker.breves@ifpa.edu.br';
const LOCAL = 'Laboratório IFPA MAKER Marajó — IFPA Campus Breves, PA';
const MAX_HORAS = 8; // duração máxima de uma reserva
const MAX_DIAS_ANTECEDENCIA = 180;
const MAX_POR_EMAIL_DIA = 3; // proteção contra abuso
const MAX_POR_DIA = 60;

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
    const agenda = CalendarApp.getCalendarById(AGENDA_ID) || CalendarApp.getDefaultCalendar();

    // limites de uso
    const cache = CacheService.getScriptCache();
    const chaveEmail = 'email:' + d.email.toLowerCase();
    const usosEmail = Number(cache.get(chaveEmail) || 0);
    const usosDia = Number(cache.get('total') || 0);
    if (usosEmail >= MAX_POR_EMAIL_DIA || usosDia >= MAX_POR_DIA) {
      return resposta({ ok: false, motivo: 'limite' });
    }

    // conflito com qualquer evento que bloqueie o horário
    // (eventos marcados como "disponível" não bloqueiam; na dúvida, conta como ocupado)
    const choques = agenda.getEvents(inicio, fim).filter(function (ev) {
      try {
        return String(ev.getTransparency()).toUpperCase() !== 'TRANSPARENT';
      } catch (_) {
        return true;
      }
    });
    if (choques.length) return resposta({ ok: false, motivo: 'conflito' });

    const titulo = 'Reserva LabMaker: ' + limpar(d.alvo, 80);
    const descricao = [
      'Reserva feita pelo site makermarajo.com',
      '',
      'Espaço / equipamento: ' + limpar(d.alvo, 120),
      'Finalidade: ' + limpar(d.servico, 160),
      'Solicitante: ' + limpar(d.nome, 120) + ' (' + limpar(d.vinculo, 80) + ')',
      'E-mail: ' + d.email,
      '',
      'Descrição: ' + limpar(d.descricao || '—', 1500),
    ].join('\n');

    const evento = agenda.createEvent(titulo, inicio, fim, {
      description: descricao,
      location: LOCAL,
      guests: d.email,
      sendInvites: true,
    });
    // ajustes extras: se algum falhar, a reserva já está feita e não deve virar erro
    tentar(function () { evento.setVisibility(CalendarApp.Visibility.PRIVATE); });
    tentar(function () { evento.setGuestsCanSeeOtherGuests(false); });
    tentar(function () { evento.setGuestsCanInviteOthers(false); });

    cache.put(chaveEmail, String(usosEmail + 1), 21600);
    cache.put('total', String(usosDia + 1), 21600);

    return resposta({ ok: true, id: evento.getId() });
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
  if (inicio.getTime() > agora + MAX_DIAS_ANTECEDENCIA * 86400000) return 'Data muito distante';
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
