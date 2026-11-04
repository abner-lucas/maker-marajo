export interface LabVideoItem {
  id: string;
  reelCode: string;
  title: string;
  subtitle: string;
  date: string;
  author: string;
  instagramUrl: string;
  videoSrc: string;
  posterSrc: string;
  category: 'Inauguração & Estrutura' | 'Robótica em Ação' | 'Fabricação Digital (Laser & 3D)';
  accentColor: string;
  summary: string;
  equipmentsSeen: string[];
  frameByFrameHighlights: {
    timeLabel: string;
    seconds: number;
    title: string;
    detail: string;
    thumbSrc: string;
  }[];
}

export interface EquipmentItem {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  category: 'impressoras-3d' | 'cortadora-laser-cnc' | 'scanners-3d' | 'kits-robotica' | 'arduino-eletronica';
  badge: string;
  accentColor: string;
  unitsAvailable: number;
  status: 'Operacional' | 'Em Manutenção' | 'Reserva Prioritária';
  image: string;
  realGallery?: { src: string; caption: string }[];
  videoSrc?: string;
  description: string;
  applications: string[];
  specs: { label: string; value: string }[];
  materialsOrComponents: string[];
  fileFormats: string[];
  safetyRules: string[];
  modelsInLab: {
    modelName: string;
    qty: number;
    highlight: string;
  }[];
}

export interface LabService {
  id: string;
  title: string;
  category: 'Prototipagem' | 'Ensino' | 'Pesquisa' | 'Extensão' | 'Capacitação';
  shortDesc: string;
  fullDesc: string;
  durationEstimate: string;
  targetAudience: string[];
  equipmentsUsed: string[];
  deliverables: string[];
  requiredFiles: string[];
  accentColor: string;
  iconName: string;
}

export interface MakerProject {
  id: string;
  title: string;
  subtitle: string;
  status: 'Produzido' | 'Em Andamento';
  progress: number;
  pillar: 'Ensino' | 'Pesquisa' | 'Extensão' | 'Inovação';
  category: string;
  image: string;
  videoSrc?: string;
  instagramUrl?: string;
  gallery?: string[];
  summary: string;
  impactMarajo: string;
  authors: string[];
  advisor: string;
  equipmentsUsed: string[];
  year: string;
  metrics: { label: string; value: string }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge: 'Coordenação' | 'Docente / Pesquisador' | 'Técnico' | 'Monitor Bolsista' | 'Extensionista';
  area: string;
  bio: string;
  projectsCount: number;
  avatarColor: string;
  initials: string;
  lattesOrEmail: string;
}

export interface CalendarActivity {
  id: string;
  title: string;
  date: string;
  dayOfMonth: number;
  month: number;
  year: number;
  startTime: string;
  endTime: string;
  type: 'Oficina' | 'Agendamento Bancada' | 'Pesquisa & TCC' | 'Extensão Escolar' | 'Makeathon';
  equipment: string;
  instructorOrResponsible: string;
  spotsAvailable: number;
  totalSpots: number;
  description: string;
  location: string;
}

/**
 * Central mapping of real photos (extracted from the lab's Instagram Reels) + generated assets.
 */
export const IMAGE_ASSETS = {
  posterOriginal: '/images/ifmaker-poster-original.jpg',
  labHero: '/images/lab-hero.png',
  impressora3d: '/images/eq-impressora-3d.png',
  cortadoraLaser: '/images/eq-cortadora-laser.png',
  scanner3d: '/images/eq-scanner-3d.png',
  kitsRobotica: '/images/eq-kits-robotica.png',
  arduino: '/images/eq-arduino.png',
  projEstacaoMarajo: '/images/proj-estacao-marajo.png',
  projBracoBionico: '/images/proj-braco-bionico.png',
  projRoboResgate: '/images/proj-robo-resgate.png',
  projCeramica3d: '/images/proj-ceramica-3d.png',
  oficina1: '/images/oficina-maker-1.png',
  oficina2: '/images/oficina-maker-2.png',

  // Real frames extracted from the 3 Instagram Reels of Laboratório IFPA MAKER Marajó
  real: {
    inauguracaoPorta: '/images/real/inauguracao-porta.jpg',
    inauguracaoEspaco: '/images/real/inauguracao-espaco.jpg',
    bancadaImpressoras: '/images/real/bancada-geral-impressoras.jpg',
    estacaoCadSlicer: '/images/real/estacao-cad-slicer.jpg',
    cortadoraLaserCo2Azul: '/images/real/cortadora-laser-co2-azul.jpg',
    elegooCentauriCarbon: '/images/real/elegoo-centauri-carbon.jpg',
    elegooAberta: '/images/real/elegoo-aberta.jpg',
    vitrine3d: '/images/real/vitrine-3d.jpg',
    bancadaCanetas3dAcai: '/images/real/bancada-canetas-3d-acai.jpg',
    canoasMarajoaras3d: '/images/real/canoas-marajoaras-3d.jpg',
    robotSoccerArena: '/images/real/robot-soccer-arena.jpg',
    robotSoccerDisputa: '/images/real/robot-soccer-disputa.jpg',
    robotSoccerChute: '/images/real/robot-soccer-chute.jpg',
    robotSoccerGol: '/images/real/robot-soccer-gol.jpg',
    laserDiodoMdf: '/images/real/laser-diodo-mdf.jpg',
    monitorVetorMedalhas: '/images/real/monitor-vetor-medalhas.jpg',
    laserCo2CortandoAcrilico: '/images/real/laser-co2-cortando-acrilico.jpg',
    alunasMontagemMedalhas: '/images/real/alunas-montagem-medalhas.jpg',
    alunosRetificaAcrilico: '/images/real/alunos-retifica-acrilico.jpg',
    loteMedalhasBancada: '/images/real/lote-medalhas-bancada.jpg',
    pinturaSprayMedalhas: '/images/real/pintura-spray-medalhas.jpg',
    medalhaJinsPronta: '/images/real/medalha-jins-pronta.jpg',
  },
};

/**
 * The 3 Official Instagram Reels analyzed frame-by-frame
 */
export const LAB_VIDEOS: LabVideoItem[] = [
  {
    id: 'vid-jins',
    reelCode: 'DYXZogrx6So',
    title: 'Produção das Medalhas do IV JINs do @ifpabreves',
    subtitle: 'Corte a laser CNC em MDF e acrílico, acabamento com micro-retífica, pintura metálica e montagem em equipe',
    date: '15 de Maio de 2026',
    author: '@abner.luks · LabMaker Marajó',
    instagramUrl: 'https://www.instagram.com/reel/DYXZogrx6So/',
    videoSrc: '/videos/DYXZogrx6So.mp4',
    posterSrc: IMAGE_ASSETS.real.laserCo2CortandoAcrilico,
    category: 'Fabricação Digital (Laser & 3D)',
    accentColor: '#FF6B35',
    summary:
      'Processo completo de fabricação digital em série das medalhas de Campeão 2026 do IV Jogos dos Integrados (IV JINs) do IFPA Campus Breves. Mostra desde a preparação da matriz vetorial no computador até o corte a laser, usinagem manual com micro-retífica, pintura spray (ouro, prata e bronze) e montagem colaborativa pelos estudantes.',
    equipmentsSeen: [
      'Gravadora/Cortadora a Laser Diodo CNC (Eixo Aberto com Régua)',
      'Cortadora a Laser CO2 Industrial (Mesa Colmeia & Cabeçote Dourado)',
      'Workstation com Monitor Curvo Samsung (Software Laser)',
      'Micro-retífica Rotativa (Dremel) & Óculos de Proteção EPI',
      'Paquímetro Digital Inox & Kit de Acabamento/Pintura',
    ],
    frameByFrameHighlights: [
      {
        timeLabel: '00:00',
        seconds: 0,
        title: 'Corte a Laser Diodo CNC em MDF',
        detail: 'Módulo laser azul cortando com precisão milimetrada a chapa de MDF na bancada com régua graduada.',
        thumbSrc: IMAGE_ASSETS.real.laserDiodoMdf,
      },
      {
        timeLabel: '00:01',
        seconds: 1,
        title: 'Matriz Vetorial de 25 Medalhas no Monitor Curvo',
        detail: 'Software enviando os dados ("Sending Data to Laser") da arte oficial do IV Jogos dos Integrados — Campeão 2026.',
        thumbSrc: IMAGE_ASSETS.real.monitorVetorMedalhas,
      },
      {
        timeLabel: '00:03',
        seconds: 3,
        title: 'Laser CO2 Industrial Cortando e Gravando Acrílico',
        detail: 'Cabeçote óptico dourado sobre mesa colmeia cortando os centros transparentes de acrílico das medalhas.',
        thumbSrc: IMAGE_ASSETS.real.laserCo2CortandoAcrilico,
      },
      {
        timeLabel: '00:05',
        seconds: 5,
        title: 'Montagem Colaborativa na Bancada de Robótica',
        detail: 'Estudantes retirando películas protetoras e unindo as molduras octogonais de MDF aos centros de acrílico.',
        thumbSrc: IMAGE_ASSETS.real.alunasMontagemMedalhas,
      },
      {
        timeLabel: '00:07',
        seconds: 7,
        title: 'Acabamento com Micro-Retífica e EPIs',
        detail: 'Alunos utilizando óculos de proteção e micro-retífica rotativa amarela para ajuste fino das chapas.',
        thumbSrc: IMAGE_ASSETS.real.alunosRetificaAcrilico,
      },
      {
        timeLabel: '00:10',
        seconds: 10,
        title: 'Pintura Metálica em Série (Ouro, Prata e Bronze)',
        detail: 'Aplicação de pintura spray metálica nas dezenas de molduras octogonais e organização por lotes.',
        thumbSrc: IMAGE_ASSETS.real.pinturaSprayMedalhas,
      },
      {
        timeLabel: '00:12',
        seconds: 12,
        title: 'Medalha IV JINs 2026 Finalizada',
        detail: 'Resultado final de altíssimo padrão combinando MDF metalizado e acrílico cristal gravado a laser.',
        thumbSrc: IMAGE_ASSETS.real.medalhaJinsPronta,
      },
    ],
  },
  {
    id: 'vid-soccer',
    reelCode: 'DYOI0SHRQBN',
    title: 'Robot Soccer — Futebol de Robôs no LabMaker Marajó',
    subtitle: 'Arena própria no laboratório com 5 robôs impressos em 3D, rodas de tração e display LCD frontal',
    date: '12 de Maio de 2026',
    author: '@abner.luks · LabMaker Marajó',
    instagramUrl: 'https://www.instagram.com/reel/DYOI0SHRQBN/',
    videoSrc: '/videos/DYOI0SHRQBN.mp4',
    posterSrc: IMAGE_ASSETS.real.robotSoccerDisputa,
    category: 'Robótica em Ação',
    accentColor: '#23963C',
    summary:
      'Demonstração prática de robótica móvel e competição no Laboratório IF MAKER Marajó. Cinco robôs com carenagens impressas em 3D (laranja, azul, cinza, branco e vermelho), pás de condução/chute e telas LCD 16x2 embarcadas disputam uma partida de futebol de robôs na arena de madeira do laboratório.',
    equipmentsSeen: [
      '5 Robôs Móveis com Chassi e Carenagem Impressos em 3D',
      'Displays LCD 16x2 Embarcados em cada Robô',
      'Motores DC com Rodas Esportivas Amarelas',
      'Arena de Futebol de Robôs em MDF/Madeira com Placar Digital',
    ],
    frameByFrameHighlights: [
      {
        timeLabel: '00:03',
        seconds: 3,
        title: 'Posicionamento Inicial na Arena Robot Soccer',
        detail: 'Bola branca no círculo central e robôs posicionados no campo com placar digital na lateral.',
        thumbSrc: IMAGE_ASSETS.real.robotSoccerArena,
      },
      {
        timeLabel: '00:07',
        seconds: 7,
        title: 'Disputa de Bola entre Robôs Laranja, Azul e Cinza',
        detail: 'Robôs com chassis impressos em 3D e display LCD frontal manobrando em alta velocidade.',
        thumbSrc: IMAGE_ASSETS.real.robotSoccerDisputa,
      },
      {
        timeLabel: '00:10',
        seconds: 10,
        title: 'Condução com Pá Frontal Impressa em 3D',
        detail: 'O robô laranja domina a bola próximo à linha lateral e prepara o giro em direção ao gol.',
        thumbSrc: IMAGE_ASSETS.real.robotSoccerChute,
      },
      {
        timeLabel: '00:15',
        seconds: 15,
        title: 'Gol na Arena do LabMaker Marajó!',
        detail: 'Finalização certeira no gol ao fundo, validando tração, controle e resistência dos chassis 3D.',
        thumbSrc: IMAGE_ASSETS.real.robotSoccerGol,
      },
    ],
  },
  {
    id: 'vid-inauguracao',
    reelCode: 'DWCiTZDEavR',
    title: 'Inauguração do Laboratório IFPA MAKER Marajó',
    subtitle: 'Tour completo pela estrutura, impressoras Elegoo Centauri Carbon, laser CO2, canetas 3D e canoas marajoaras',
    date: '18 de Março de 2026',
    author: '@abner.luks · LabMaker Marajó',
    instagramUrl: 'https://www.instagram.com/reel/DWCiTZDEavR/',
    videoSrc: '/videos/DWCiTZDEavR.mp4',
    posterSrc: IMAGE_ASSETS.real.canoasMarajoaras3d,
    category: 'Inauguração & Estrutura',
    accentColor: '#0092D6',
    summary:
      'Registro da inauguração do Laboratório IFPA MAKER Marajó no IFPA Campus Breves. Apresenta a porta com laço inaugural, o espaço de convivência com iluminação RGB, o mural temático amazônico (Robótica, Impressão 3D, Prototipagem e Eletrônica), a bancada de impressoras Elegoo Centauri Carbon, as cortadoras a laser, as canetas 3D e os ribeirinhos em canoas impressos em 3D.',
    equipmentsSeen: [
      'Impressoras 3D CoreXY ELEGOO Centauri Carbon (Câmara Fechada)',
      'Cortadora a Laser CO2 Industrial Azul e Branca (CE/FDA)',
      'Gravadora Laser Diodo CNC de Bancada + Óculos de Proteção',
      'Canetas de Impressão 3D (3D Pens) na Bancada de Eletrônica',
      'Estação CAD com Monitor Curvo Samsung',
    ],
    frameByFrameHighlights: [
      {
        timeLabel: '00:00',
        seconds: 0,
        title: 'Porta Oficial com Laço de Inauguração',
        detail: 'Identidade visual oficial "INSTITUTO FEDERAL Pará — LABORATÓRIO IFPA MAKER" na entrada.',
        thumbSrc: IMAGE_ASSETS.real.inauguracaoPorta,
      },
      {
        timeLabel: '00:01',
        seconds: 1,
        title: 'Espaço de Convivência, Pufes, Cubos Mágicos e Mural RGB',
        detail: 'Ambiente acolhedor e criativo com iluminação cênica colorida e mesas colaborativas.',
        thumbSrc: IMAGE_ASSETS.real.inauguracaoEspaco,
      },
      {
        timeLabel: '00:04',
        seconds: 4,
        title: 'Estação CAD/Slicer e Cortadora a Laser CO2',
        detail: 'Monitor curvo Samsung exibindo o fatiamento 3D das canoas ao lado da Cortadora a Laser CO2 azul e branca.',
        thumbSrc: IMAGE_ASSETS.real.estacaoCadSlicer,
      },
      {
        timeLabel: '00:07',
        seconds: 7,
        title: 'Parque de Impressoras 3D ELEGOO Centauri Carbon',
        detail: 'Impressoras CoreXY de alta velocidade com gabinete fechado e tela touch frontal.',
        thumbSrc: IMAGE_ASSETS.real.elegooCentauriCarbon,
      },
      {
        timeLabel: '00:12',
        seconds: 12,
        title: 'Vitrine de Protótipos Impressos em 3D',
        detail: 'Exposição de vasos geométricos, Torre Eiffel, cubos e medalhas produzidas no laboratório.',
        thumbSrc: IMAGE_ASSETS.real.vitrine3d,
      },
      {
        timeLabel: '00:13',
        seconds: 13,
        title: 'Mural Amazônico de Eletrônica & Canetas 3D',
        detail: 'Ilustração dos açaizeiros do Marajó e mesa circular equipada com canetas de impressão 3D.',
        thumbSrc: IMAGE_ASSETS.real.bancadaCanetas3dAcai,
      },
      {
        timeLabel: '00:14',
        seconds: 14,
        title: 'Ribeirinhos em Canoas Marajoaras Impressos em 3D',
        detail: 'Peças icônicas unindo a identidade ribeirinha do Marajó à manufatura aditiva 3D e base cortada a laser.',
        thumbSrc: IMAGE_ASSETS.real.canoasMarajoaras3d,
      },
    ],
  },
];

export const GOOGLE_CALENDAR_CONFIG = {
  calendarId: 'makermarajo@ifpa.edu.br',
  publicEmbedUrl:
    'https://calendar.google.com/calendar/embed?src=pt.brazilian%23holiday%40group.v.calendar.google.com&ctz=America%2FBelem&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0',
  appointmentScheduleUrl: 'https://calendar.google.com/calendar/u/0/r/eventedit',
  campusLocation: 'Laboratório IFPA MAKER Marajó — IFPA Campus Breves, PA, Brasil',
};

export const EQUIPMENTS: EquipmentItem[] = [
  {
    id: 'eq-3d',
    slug: 'impressoras-3d',
    name: 'Impressoras 3D (Elegoo Centauri Carbon & CoreXY) + Canetas 3D',
    shortName: 'Impressoras 3D',
    tagline:
      'Bancada real equipada com impressoras CoreXY fechadas ELEGOO Centauri Carbon, fatiamento em monitor curvo e Canetas 3D.',
    category: 'impressoras-3d',
    badge: 'Impressão 3D e Prototipagem',
    accentColor: '#FF6B35',
    unitsAvailable: 6,
    status: 'Operacional',
    image: IMAGE_ASSETS.real.elegooCentauriCarbon,
    videoSrc: '/videos/DWCiTZDEavR.mp4',
    realGallery: [
      {
        src: IMAGE_ASSETS.real.elegooCentauriCarbon,
        caption: 'Impressoras 3D ELEGOO Centauri Carbon instaladas na bancada do LabMaker Marajó',
      },
      {
        src: IMAGE_ASSETS.real.elegooAberta,
        caption: 'Detalhe da câmara fechada em vidro fumê e tela touch da Elegoo Centauri Carbon',
      },
      {
        src: IMAGE_ASSETS.real.canoasMarajoaras3d,
        caption: 'Ribeirinhos em canoas marajoaras impressos em 3D no laboratório',
      },
      {
        src: IMAGE_ASSETS.real.bancadaCanetas3dAcai,
        caption: 'Mesa redonda com Canetas 3D para oficinas de criação livre',
      },
    ],
    description:
      'O parque de manufatura aditiva do Laboratório IFPA MAKER Marajó conta com impressoras 3D CoreXY de alta velocidade ELEGOO Centauri Carbon (com gabinete fechado, câmera integrada e tela touch capacitiva), impressora FDM fechada com visor LCD e um conjunto de Canetas 3D para oficinas pedagógicas. Nelas já foram produzidos desde os chassis do Futebol de Robôs até as canoas ribeirinhas marajoaras.',
    applications: [
      'Impressão dos chassis coloridos e pás de chute dos robôs da Arena Robot Soccer',
      'Produção de peças culturais marajoaras (como os ribeirinhos em canoas 3D) e troféus',
      'Peças mecânicas, engrenagens, suportes de sensores e gabinetes para Arduino/ESP32',
      'Oficinas criativas mão na massa com Canetas de Impressão 3D para estudantes',
    ],
    specs: [
      { label: 'Modelo Destaque na Bancada', value: 'ELEGOO Centauri Carbon (CoreXY Câmara Fechada)' },
      { label: 'Volume de Construção', value: '256 × 256 × 256 mm' },
      { label: 'Velocidade & Aceleração', value: 'Até 500 mm/s · Aceleração de 20.000 mm/s²' },
      { label: 'Estação de Preparo', value: 'Monitor Curvo Samsung com Elegoo Slicer / OrcaSlicer' },
    ],
    materialsOrComponents: [
      'PLA / PLA+ (Laranja, Vermelho, Azul, Cinza, Branco)',
      'PETG (Resistência mecânica e umidade amazônica)',
      'ABS / ASA & Filamentos com Fibra de Carbono (Centauri Carbon)',
      'TPU 95A Flexível',
      'Canetas de Impressão 3D (3D Pens) com filamento 1.75 mm',
    ],
    fileFormats: ['.STL', '.3MF', '.STEP', '.OBJ', '.GCODE'],
    safetyRules: [
      'Mantenha a porta de vidro da Elegoo Centauri Carbon fechada durante impressões em alta velocidade.',
      'Não toque no bico extrusor aquecido nem na ponta metálica das Canetas 3D durante o uso.',
      'Valide o fatiamento na estação com monitor curvo Samsung junto ao monitor do laboratório.',
    ],
    modelsInLab: [
      {
        modelName: 'ELEGOO Centauri Carbon (CoreXY Fechada)',
        qty: 3,
        highlight: 'Alta velocidade · Câmara fechada · Tela Touch',
      },
      {
        modelName: 'Impressora 3D Fechada com Painel LCD Frontal',
        qty: 1,
        highlight: 'Prototipagem estrutural FDM',
      },
      {
        modelName: 'Kit de Canetas de Impressão 3D (3D Pens)',
        qty: 6,
        highlight: 'Desenho tridimensional livre em oficinas',
      },
    ],
  },
  {
    id: 'eq-laser',
    slug: 'cortadora-laser-cnc',
    name: 'Cortadoras a Laser CNC (CO2 Industrial + Laser Diodo de Bancada)',
    shortName: 'Cortadora Laser CNC',
    tagline:
      'Duas estações reais de corte e gravação a laser: Laser CO2 Industrial com mesa colmeia e Gravadora Laser Diodo CNC com régua milimetrada.',
    category: 'cortadora-laser-cnc',
    badge: 'Corte e Gravação a Laser',
    accentColor: '#E5484D',
    unitsAvailable: 2,
    status: 'Operacional',
    image: IMAGE_ASSETS.real.laserCo2CortandoAcrilico,
    videoSrc: '/videos/DYXZogrx6So.mp4',
    realGallery: [
      {
        src: IMAGE_ASSETS.real.laserCo2CortandoAcrilico,
        caption: 'Cortadora a Laser CO2 Industrial cortando e gravando acrílico das medalhas do IV JINs',
      },
      {
        src: IMAGE_ASSETS.real.laserDiodoMdf,
        caption: 'Gravadora/Cortadora a Laser Diodo CNC de bancada cortando MDF com régua graduada',
      },
      {
        src: IMAGE_ASSETS.real.cortadoraLaserCo2Azul,
        caption: 'Gabinete azul e branco da Cortadora a Laser CO2 com painel digital no LabMaker Marajó',
      },
      {
        src: IMAGE_ASSETS.real.monitorVetorMedalhas,
        caption: 'Matriz de 25 medalhas preparada no software de corte a laser no monitor Samsung',
      },
    ],
    description:
      'O Laboratório IFPA MAKER Marajó dispõe de duas máquinas complementares de fabricação subtrativa a laser, amplamente utilizadas na produção das medalhas do IV JINs do @ifpabreves e nas bases das canoas marajoaras: (1) uma Cortadora a Laser CO2 Industrial (gabinete azul e branco, mesa colmeia honeycomb e cabeçote óptico dourado) e (2) uma Gravadora/Cortadora a Laser de Diodo CNC de bancada aberta com eixos milimetrados.',
    applications: [
      'Produção completa de medalhas, troféus e placas em MDF e acrílico (como no IV JINs 2026)',
      'Corte de bases de madeira/MDF para protótipos 3D (como as canoas ribeirinhas)',
      'Corte de chassis de robôs, caixas finger-joint para Arduino e letras-caixa',
      'Gravação de alta precisão em acrílico cristal, madeira, couro e brindes institucionais',
    ],
    specs: [
      { label: 'Máquina 1 — Laser CO2 Industrial', value: 'Gabinete Azul/Branco · Mesa Colmeia · Cabeçote Dourado' },
      { label: 'Máquina 2 — Laser Diodo CNC', value: 'Estrutura Aberta Milimetrada (Eixos X/Y graduados)' },
      { label: 'Materiais Validados no Lab', value: 'Acrílico Cristal, MDF 3mm/6mm, Compensado e Papelão' },
      { label: 'Acabamento Integrado', value: 'Bancada com Micro-retíficas (Dremel), Álcool Isopropílico e Pintura' },
    ],
    materialsOrComponents: [
      'Acrílico Cristal Transparente e Colorido',
      'MDF Cru 3 mm e 6 mm (bases e anéis octogonais)',
      'Óculos de Proteção Verde para Laser Diodo (EPIs na bancada)',
      'Micro-retífica rotativa amarela e Paquímetro Digital pol/mm',
    ],
    fileFormats: ['.DXF', '.SVG', '.AI', '.CDR', '.PDF (Vetor)'],
    safetyRules: [
      'Utilize obrigatoriamente os óculos de proteção verdes ao operar a Gravadora Laser Diodo aberta.',
      'Mantenha a tampa da Cortadora a Laser CO2 fechada e o exaustor azul ligado durante os cortes em acrílico.',
      'Ao usar a micro-retífica para acabamento das peças cortadas, utilize sempre óculos de proteção.',
    ],
    modelsInLab: [
      {
        modelName: 'Cortadora a Laser CO2 Industrial (Azul/Branca)',
        qty: 1,
        highlight: 'Mesa colmeia · Corte e gravação em acrílico e MDF',
      },
      {
        modelName: 'Gravadora & Cortadora Laser Diodo CNC Aberta',
        qty: 1,
        highlight: 'Eixos milimetrados · Corte rápido de MDF e gravações',
      },
    ],
  },
  {
    id: 'eq-scanner',
    slug: 'scanners-3d',
    name: 'Scanners 3D Ópticos & Engenharia Reversa',
    shortName: 'Scanners 3D',
    tagline:
      'Digitalização tridimensional de objetos físicos e artefatos marajoaras para modelagem CAD e impressão 3D.',
    category: 'scanners-3d',
    badge: 'Digitalização e Modelagem 3D',
    accentColor: '#0092D6',
    unitsAvailable: 2,
    status: 'Operacional',
    image: IMAGE_ASSETS.scanner3d,
    description:
      'Os Scanners 3D do laboratório permitem capturar a geometria de peças físicas reais e convertê-las em malhas digitais (.STL / .OBJ) prontas para edição na estação CAD e impressão nas máquinas Elegoo Centauri Carbon.',
    applications: [
      'Digitalização 3D de artefatos culturais, cerâmicas e embarcações tradicionais do Marajó',
      'Engenharia reversa de engrenagens e peças plásticas quebradas para reposição',
      'Escaneamento anatômico para projetos de tecnologia assistiva e ensino de biologia',
      'Geração de acervos tridimensionais para aulas interativas no IFPA Campus Breves',
    ],
    specs: [
      { label: 'Precisão Volumétrica', value: 'Até 0.05 mm (50 mícrons)' },
      { label: 'Velocidade de Captura', value: 'Até 18 fps · Nuvem de pontos de alta densidade' },
      { label: 'Modos de Uso', value: 'Portátil Manual (Handheld) + Mesa Giratória' },
      { label: 'Integração Direta', value: 'Exportação direta para o Elegoo Slicer na estação Samsung' },
    ],
    materialsOrComponents: [
      'Scanner Óptico de Luz Estruturada',
      'Mesa Giratória Motorizada para peças pequenas/médias',
      'Marcadores de Alinhamento Óptico',
      'Workstation com Monitor Curvo para fechamento de malha',
    ],
    fileFormats: ['.OBJ', '.STL', '.PLY', '.3MF'],
    safetyRules: [
      'Utilize sempre a alça de segurança no pulso ao operar o scanner no modo portátil.',
      'Posicione o objeto no centro da mesa giratória antes de iniciar a captura.',
      'Evite apontar o feixe de luz estruturada diretamente para os olhos a curta distância.',
    ],
    modelsInLab: [
      {
        modelName: 'Scanner 3D Óptico Luz Estruturada + Turntable',
        qty: 1,
        highlight: 'Alta precisão para engenharia reversa e cultura',
      },
      {
        modelName: 'Scanner 3D Portátil de Bancada',
        qty: 1,
        highlight: 'Captura rápida de objetos médios e grandes',
      },
    ],
  },
  {
    id: 'eq-robotica',
    slug: 'kits-robotica',
    name: 'Kits de Robótica & Arena Oficial Robot Soccer',
    shortName: 'Kits de Robótica',
    tagline:
      'Arena própria de Futebol de Robôs (Robot Soccer) com 5 robôs impressos em 3D + LCD, kits educacionais e competições.',
    category: 'kits-robotica',
    badge: 'Robótica e Competição',
    accentColor: '#23963C',
    unitsAvailable: 12,
    status: 'Operacional',
    image: IMAGE_ASSETS.real.robotSoccerDisputa,
    videoSrc: '/videos/DYOI0SHRQBN.mp4',
    realGallery: [
      {
        src: IMAGE_ASSETS.real.robotSoccerArena,
        caption: 'Arena Robot Soccer no LabMaker Marajó com robôs posicionados para o início da partida',
      },
      {
        src: IMAGE_ASSETS.real.robotSoccerDisputa,
        caption: 'Disputa acirrada entre os robôs Laranja, Azul e Cinza com display LCD frontal',
      },
      {
        src: IMAGE_ASSETS.real.robotSoccerChute,
        caption: 'Robô conduzindo a bola com pá frontal impressa em 3D e rodas amarelas',
      },
      {
        src: IMAGE_ASSETS.real.robotSoccerGol,
        caption: 'Lance de gol na arena de madeira construída no próprio laboratório',
      },
    ],
    description:
      'A área de Robótica do Laboratório IFPA MAKER Marajó é um dos grandes destaques reais do campus! Conta com uma Arena de Futebol de Robôs (Robot Soccer) completa com placar digital e 5 robôs jogadores desenvolvidos com carenagens impressas em 3D (nas cores laranja, azul, cinza, branco e vermelho), rodas de tração amarelas, pá de chute frontal e display LCD 16x2 embarcado.',
    applications: [
      'Torneios internos e demonstrações de Futebol de Robôs (Robot Soccer) no IFPA Breves',
      'Projeto e impressão 3D de novos chassis, pás de chute e suportes de motores',
      'Preparação de equipes para a Olimpíada Brasileira de Robótica (OBR) e JINs',
      'Aulas práticas de cinemática, controle sem fio (Bluetooth/Wi-Fi) e mecatrônica',
    ],
    specs: [
      { label: 'Destaque Real do Lab', value: 'Arena Robot Soccer + 5 Robôs Jogadores com Display LCD' },
      { label: 'Estrutura dos Robôs', value: 'Chassi e carenagem 100% impressos em 3D + Rodas Amarelas' },
      { label: 'Interface Visual', value: 'Display LCD 16x2 frontal integrado em cada robô' },
      { label: 'Kits Complementares', value: 'Kits de Robótica Educacional, Servos e Sensores Ultrassônicos' },
    ],
    materialsOrComponents: [
      '5 Robôs Robot Soccer (Laranja, Azul, Cinza, Branco e Vermelho)',
      'Arena Oficial de Madeira com Demarcação e Traves',
      'Placar / Cronômetro Digital Lateral',
      'Motores DC com Caixa de Redução, Rodas Amarelas e Baterias Recarregáveis',
    ],
    fileFormats: ['.INO', '.CPP', '.STL (Chassi)', '.PY'],
    safetyRules: [
      'Desligue a chave geral dos robôs após o término das partidas na arena para preservar as baterias.',
      'Não apoie objetos pesados ou líquidos sobre o piso branco da Arena Robot Soccer.',
      'Recarregue os robôs apenas nas estações supervisionadas pela equipe técnica.',
    ],
    modelsInLab: [
      {
        modelName: 'Esquadrão Robot Soccer (5 Robôs 3D + LCD + Arena)',
        qty: 5,
        highlight: 'Futebol de robôs em funcionamento no LabMaker Marajó',
      },
      {
        modelName: 'Kits de Robótica Educacional e Competição',
        qty: 7,
        highlight: 'Sensores, servomotores e estruturas modulares',
      },
    ],
  },
  {
    id: 'eq-arduino',
    slug: 'arduino-eletronica',
    name: 'Placas Arduino, ESP32, Displays LCD & Bancada de Eletrônica',
    shortName: 'Placas Arduino',
    tagline:
      'Microcontroladores, displays LCD, sensores e instrumentação que dão vida aos robôs e projetos do LabMaker Marajó.',
    category: 'arduino-eletronica',
    badge: 'Eletrônica e Programação',
    accentColor: '#70388E',
    unitsAvailable: 20,
    status: 'Operacional',
    image: IMAGE_ASSETS.arduino,
    realGallery: [
      {
        src: IMAGE_ASSETS.real.bancadaCanetas3dAcai,
        caption: 'Setor de Eletrônica do LabMaker Marajó com o mural artístico dos açaizeiros',
      },
      {
        src: IMAGE_ASSETS.real.robotSoccerDisputa,
        caption: 'Eletrônica embarcada e displays LCD 16x2 em ação nos robôs do Robot Soccer',
      },
    ],
    description:
      'Setor dedicado à prototipagem eletrônica, programação embarcada e Internet das Coisas (IoT), identificado pelo grande mural "ELETRÔNICA" com grafismo de açaizeiros do Marajó. É onde os estudantes montam e programam os circuitos com placas Arduino e ESP32, pontes H para controle de motores, módulos Bluetooth/Wi-Fi e os displays LCD que equipam os robôs do laboratório.',
    applications: [
      'Controle eletrônico, drivers Ponte-H e displays LCD dos robôs do Robot Soccer',
      'Automação e monitoramento ambiental com sensores para a região do Marajó',
      'Oficinas de iniciação ao Arduino Uno, protoboard, LEDs e sensores para o Ensino Médio',
      'Integração de circuitos eletrônicos dentro de gabinetes impressos em 3D e cortados a laser',
    ],
    specs: [
      { label: 'Microcontroladores', value: 'Arduino Uno R3, Nano, Mega 2560 e ESP32 (Wi-Fi / Bluetooth)' },
      { label: 'Displays & Atuadores', value: 'Displays LCD 16x2 I2C, OLED, Pontes H, Servos e Relés' },
      { label: 'Instrumentação', value: 'Paquímetro Digital pol/mm, Jogos de Chaves de Precisão e Multímetros' },
      { label: 'Programação', value: 'Arduino IDE (C/C++) e Programação em Blocos' },
    ],
    materialsOrComponents: [
      'Placas Arduino Uno R3, Nano e ESP32',
      'Displays LCD 16x2 com módulo I2C (usados nos robôs)',
      'Drivers de Motor Ponte-H, Módulos Bluetooth/RF e Baterias',
      'Sensores Ultrassônicos, Temperatura, Umidade, Luminosidade e Infravermelho',
    ],
    fileFormats: ['.INO', '.CPP', '.H', '.HEX'],
    safetyRules: [
      'Verifique sempre a polaridade (VCC e GND) antes de energizar a placa Arduino ou a Ponte-H.',
      'Desconecte a bateria antes de alterar fiações nos robôs ou na protoboard.',
      'Guarde os componentes eletrônicos e chaves de precisão nos estojos organizadores após o uso.',
    ],
    modelsInLab: [
      {
        modelName: 'Kits Arduino Uno / Nano + Protoboard e Sensores',
        qty: 15,
        highlight: 'Aulas práticas de eletrônica e programação',
      },
      {
        modelName: 'Kits Controle de Robótica (ESP32 / Bluetooth + Ponte H + LCD)',
        qty: 5,
        highlight: 'Eletrônica embarcada da Arena Robot Soccer',
      },
    ],
  },
];

export const LAB_SERVICES: LabService[] = [
  {
    id: 'srv-1',
    title: 'Impressão 3D de Protótipos, Chassis e Peças Culturais',
    category: 'Prototipagem',
    shortDesc:
      'Materialização de peças nas impressoras ELEGOO Centauri Carbon e oficinas com Canetas 3D.',
    fullDesc:
      'Atendimento gratuito a estudantes, servidores e projetos do IFPA Campus Breves. Imprimimos desde chassis completos para robótica (como os robôs do Robot Soccer) até peças de identidade amazônica (como as canoas marajoaras) e modelos didáticos.',
    durationEstimate: '1h a 12h (conforme volume e quantidade)',
    targetAudience: ['Estudantes IFPA', 'Docentes e Pesquisadores', 'Projetos de Ensino e Extensão'],
    equipmentsUsed: ['Impressoras 3D ELEGOO Centauri Carbon', 'Canetas 3D'],
    deliverables: ['Peça física impressa em PLA/PETG/ABS', 'Fatiamento otimizado na estação CAD'],
    requiredFiles: ['.STL', '.3MF', '.STEP'],
    accentColor: '#FF6B35',
    iconName: 'Printer',
  },
  {
    id: 'srv-2',
    title: 'Corte e Gravação a Laser CNC (MDF & Acrílico)',
    category: 'Prototipagem',
    shortDesc:
      'Produção de medalhas, troféus, bases, placas e estruturas encaixáveis nas nossas 2 máquinas a laser.',
    fullDesc:
      'Comprovado na fabricação das medalhas oficiais do IV JINs do @ifpabreves! Realizamos corte e gravação a laser em acrílico cristal e MDF utilizando tanto a Cortadora a Laser CO2 Industrial quanto a Gravadora Laser Diodo CNC, incluindo bancada para acabamento e montagem.',
    durationEstimate: '15 min a 2h por lote',
    targetAudience: ['Comissões de Eventos IFPA (JINs, Feiras)', 'Projetos de Robótica e TCC', 'Escolas Parceiras'],
    equipmentsUsed: ['Cortadora Laser CO2 Industrial', 'Laser Diodo CNC', 'Micro-retífica Dremel'],
    deliverables: ['Chapas de MDF ou acrílico cortadas e gravadas com precisão milimetrada'],
    requiredFiles: ['.DXF', '.SVG', '.CDR', '.PDF Vetorial'],
    accentColor: '#E5484D',
    iconName: 'Zap',
  },
  {
    id: 'srv-3',
    title: 'Treinamento e Competições na Arena Robot Soccer',
    category: 'Ensino',
    shortDesc:
      'Vivência prática de robótica móvel, programação de microcontroladores e partidas de Futebol de Robôs.',
    fullDesc:
      'Estudantes e turmas podem agendar sessões na Arena Robot Soccer do LabMaker Marajó para aprender como funcionam os robôs impressos em 3D, programar movimentos, configurar os displays LCD embarcados e disputar partidas educativas.',
    durationEstimate: '1h30 a 3h',
    targetAudience: ['Turmas do Integrado e Subsequente', 'Equipes de Robótica', 'Visitas Escolares'],
    equipmentsUsed: ['Arena Robot Soccer', '5 Robôs Jogadores 3D + LCD', 'Bancada Arduino'],
    deliverables: ['Prática de controle, programação e trabalho em equipe'],
    requiredFiles: ['Não requer arquivo prévio (roteiro guiado no lab)'],
    accentColor: '#23963C',
    iconName: 'Cpu',
  },
  {
    id: 'srv-4',
    title: 'Digitalização 3D & Engenharia Reversa',
    category: 'Pesquisa',
    shortDesc:
      'Escaneamento óptico de objetos físicos para gerar malhas 3D editáveis e réplicas fiéis.',
    fullDesc:
      'Captura tridimensional de peças mecânicas, objetos artesanais marajoaras e modelos biológicos para preservação digital, adaptação em CAD e posterior reprodução nas impressoras 3D do laboratório.',
    durationEstimate: '1h a 3h',
    targetAudience: ['Grupos de Pesquisa', 'Projetos Culturais e Assistivos'],
    equipmentsUsed: ['Scanners 3D Ópticos', 'Estação CAD Monitor Curvo Samsung'],
    deliverables: ['Malha 3D fechada (.STL / .OBJ) pronta para impressão'],
    requiredFiles: ['Objeto físico a ser digitalizado'],
    accentColor: '#0092D6',
    iconName: 'Scan',
  },
  {
    id: 'srv-5',
    title: 'Oficinas de Canetas 3D, Arduino e Cultura Maker',
    category: 'Capacitação',
    shortDesc:
      'Aulas práticas "aprender fazendo" no espaço colaborativo do laboratório.',
    fullDesc:
      'Oficinas dinâmicas utilizando nossa bancada de Canetas 3D, kits Arduino, cubos mágicos e ferramentas de prototipagem para estimular a criatividade e o raciocínio espacial de estudantes.',
    durationEstimate: '2h por turma',
    targetAudience: ['Docentes e Turmas do IFPA Breves', 'Novos Monitores'],
    equipmentsUsed: ['Canetas 3D', 'Kits Arduino', 'Espaço de Convivência RGB'],
    deliverables: ['Protótipo criado pelo próprio estudante durante a oficina'],
    requiredFiles: ['Agendamento pelo professor responsável'],
    accentColor: '#70388E',
    iconName: 'GraduationCap',
  },
  {
    id: 'srv-6',
    title: 'Visitas Guiadas & Extensão para Escolas do Marajó',
    category: 'Extensão',
    shortDesc:
      'Portas abertas para escolas de Breves conhecerem as impressoras 3D, o corte a laser e o Futebol de Robôs.',
    fullDesc:
      'Recebemos estudantes da rede pública e privada de Breves para um tour interativo: eles assistem às impressoras Elegoo Centauri Carbon e ao laser em operação, testam as Canetas 3D e jogam uma partida na Arena Robot Soccer!',
    durationEstimate: '2h (Manhã ou Tarde)',
    targetAudience: ['Escolas Municipais e Estaduais de Breves', 'Comunidade do Marajó'],
    equipmentsUsed: ['Todo o Laboratório IFPA MAKER Marajó'],
    deliverables: ['Experiência imersiva de divulgação científica e tecnológica'],
    requiredFiles: ['Reserva prévia via Google Agenda'],
    accentColor: '#F9B814',
    iconName: 'Users',
  },
];

export const MAKER_PROJECTS: MakerProject[] = [
  {
    id: 'proj-jins-medalhas',
    title: 'Produção das Medalhas Oficiais do IV JINs (@ifpabreves)',
    subtitle:
      'Fabricação híbrida em série: corte a laser em MDF e acrílico cristal, micro-retífica, pintura metálica e montagem colaborativa',
    status: 'Produzido',
    progress: 100,
    pillar: 'Extensão',
    category: 'Fabricação Digital CNC & Eventos Institucionais',
    image: IMAGE_ASSETS.real.medalhaJinsPronta,
    videoSrc: '/videos/DYXZogrx6So.mp4',
    instagramUrl: 'https://www.instagram.com/reel/DYXZogrx6So/',
    gallery: [
      IMAGE_ASSETS.real.medalhaJinsPronta,
      IMAGE_ASSETS.real.laserCo2CortandoAcrilico,
      IMAGE_ASSETS.real.monitorVetorMedalhas,
      IMAGE_ASSETS.real.alunasMontagemMedalhas,
      IMAGE_ASSETS.real.alunosRetificaAcrilico,
      IMAGE_ASSETS.real.pinturaSprayMedalhas,
    ],
    summary:
      'Projeto real executado integralmente pela equipe e estudantes do Laboratório IFPA MAKER Marajó para premiar os atletas campeões do IV Jogos dos Integrados (IV JINs 2026) do IFPA Campus Breves. As medalhas combinam molduras octogonais de MDF cortadas a laser e pintadas em ouro, prata e bronze com núcleos de acrílico cristal gravados a laser.',
    impactMarajo:
      'Demonstrou a autonomia tecnológica do Campus Breves para produzir internamente toda a premiação oficial dos jogos estudantis com qualidade industrial e protagonismo discente.',
    authors: ['Ábner Lucas (@abner.luks)', 'Estudantes Monitores e Voluntários do LabMaker Marajó'],
    advisor: 'Coordenação IFPA MAKER — Campus Breves',
    equipmentsUsed: [
      'Cortadora Laser CO2 Industrial',
      'Gravadora Laser Diodo CNC',
      'Micro-retífica Rotativa',
      'Estação CAD Samsung',
    ],
    year: 'Maio / 2026',
    metrics: [
      { label: 'Matriz por Chapa', value: '25 medalhas/vez' },
      { label: 'Materiais', value: 'MDF + Acrílico Cristal' },
      { label: 'Categorias', value: 'Ouro, Prata e Bronze' },
    ],
  },
  {
    id: 'proj-robot-soccer',
    title: 'Robot Soccer — Futebol de Robôs LabMaker Marajó',
    subtitle:
      'Desenvolvimento de 5 robôs jogadores com chassis impressos em 3D, displays LCD 16x2 e arena oficial no laboratório',
    status: 'Produzido',
    progress: 100,
    pillar: 'Ensino',
    category: 'Robótica Móvel & Competições Maker',
    image: IMAGE_ASSETS.real.robotSoccerDisputa,
    videoSrc: '/videos/DYOI0SHRQBN.mp4',
    instagramUrl: 'https://www.instagram.com/reel/DYOI0SHRQBN/',
    gallery: [
      IMAGE_ASSETS.real.robotSoccerDisputa,
      IMAGE_ASSETS.real.robotSoccerArena,
      IMAGE_ASSETS.real.robotSoccerChute,
      IMAGE_ASSETS.real.robotSoccerGol,
    ],
    summary:
      'Projeto completo de robótica interativa desenvolvido no laboratório. Cinco robôs compactos tiveram seus chassis e pás frontais modelados e impressos em 3D em diferentes cores (laranja, azul, cinza, branco e vermelho), integrando rodas amarelas de alto aderência, eletrônica embarcada e tela LCD frontal para partidas em uma arena própria de madeira com placar digital.',
    impactMarajo:
      'Transforma o aprendizado de robótica, eletrônica e programação em uma experiência gamificada e empolgante que atrai estudantes de todo o campus e escolas visitantes.',
    authors: ['Ábner Lucas (@abner.luks)', 'Equipe de Robótica LabMaker Marajó'],
    advisor: 'Coordenação de Robótica — IFPA Breves',
    equipmentsUsed: [
      'Impressoras 3D ELEGOO Centauri Carbon',
      'Placas Arduino / Embarcados + LCD',
      'Arena Robot Soccer em MDF',
    ],
    year: 'Maio / 2026',
    metrics: [
      { label: 'Robôs em Campo', value: '5 unidades 3D' },
      { label: 'Interface Frontal', value: 'Display LCD 16x2' },
      { label: 'Arena Própria', value: 'Com Placar Digital' },
    ],
  },
  {
    id: 'proj-canoas-marajoaras',
    title: 'Ribeirinhos e Canoas Marajoaras em Impressão 3D & Laser',
    subtitle:
      'Identidade cultural do Arquipélago do Marajó materializada nas impressoras Elegoo Centauri Carbon e corte a laser',
    status: 'Produzido',
    progress: 100,
    pillar: 'Inovação',
    category: 'Cultura Amazônica & Manufatura Aditiva',
    image: IMAGE_ASSETS.real.canoasMarajoaras3d,
    videoSrc: '/videos/DWCiTZDEavR.mp4',
    instagramUrl: 'https://www.instagram.com/reel/DWCiTZDEavR/',
    gallery: [
      IMAGE_ASSETS.real.canoasMarajoaras3d,
      IMAGE_ASSETS.real.estacaoCadSlicer,
      IMAGE_ASSETS.real.elegooCentauriCarbon,
      IMAGE_ASSETS.real.vitrine3d,
    ],
    summary:
      'Coleção inaugural produzida no Laboratório IFPA MAKER Marajó do IFPA Campus Breves. Representa o caboclo/ribeirinho marajoara com chapéu remando sua canoa tradicional, fatiada na estação Samsung e impressa em 3D em filamentos vibrantes (laranja, vermelho e cinza) sobre base oval de MDF cortada a laser.',
    impactMarajo:
      'Simboliza a união entre a tradição ribeirinha de Breves/Marajó e as tecnologias da Indústria 4.0.',
    authors: ['Equipe Inaugural Laboratório IFPA MAKER Marajó'],
    advisor: 'Coordenação Geral IF MAKER Breves',
    equipmentsUsed: [
      'Impressoras 3D ELEGOO Centauri Carbon',
      'Cortadora a Laser CNC',
      'Estação CAD Slicer',
    ],
    year: 'Março / 2026',
    metrics: [
      { label: 'Impressora Usada', value: 'Elegoo Centauri Carbon' },
      { label: 'Base de Apoio', value: 'MDF Corte Laser' },
      { label: 'Identidade', value: 'Cultura Marajoara' },
    ],
  },
  {
    id: 'proj-1',
    title: 'Estação Hidrometeorológica IoT para Rios do Marajó',
    subtitle:
      'Monitoramento autônomo de nível de maré, qualidade da água e pluviosidade via ESP32 e gabinete impresso em 3D',
    status: 'Em Andamento',
    progress: 82,
    pillar: 'Pesquisa',
    category: 'IoT & Sustentabilidade Amazônica',
    image: IMAGE_ASSETS.projEstacaoMarajo,
    summary:
      'Estação compacta com gabinete impresso em 3D nas impressoras Elegoo Centauri Carbon em filamento PETG resistente ao sol e chuva, equipada com ESP32, sensor ultrassônico para leitura do nível dos rios/furos de Breves e alimentação solar.',
    impactMarajo:
      'Gera dados ambientais para apoiar comunidades ribeirinhas e pesquisas climáticas no arquipélago.',
    authors: ['Grupo de Pesquisa em IoT & Meio Ambiente — IFPA Breves'],
    advisor: 'Docentes Pesquisadores IF MAKER',
    equipmentsUsed: ['Impressoras 3D Elegoo', 'Placas Arduino & ESP32', 'Cortadora a Laser CNC'],
    year: '2026',
    metrics: [
      { label: 'Autonomia Solar', value: '100% Off-Grid' },
      { label: 'Progresso Atual', value: '82% concluído' },
      { label: 'Gabinete 3D', value: 'PETG Impermeável' },
    ],
  },
  {
    id: 'proj-2',
    title: 'Kits Didáticos e Protótipos Táteis para Escolas de Breves',
    subtitle:
      'Produção em série de materiais pedagógicos usando Corte a Laser, Impressão 3D e Canetas 3D',
    status: 'Em Andamento',
    progress: 75,
    pillar: 'Extensão',
    category: 'Educação Básica & Aprendizagem Mão na Massa',
    image: IMAGE_ASSETS.real.bancadaCanetas3dAcai,
    summary:
      'Desenvolvimento contínuo de jogos geométricos, modelos anatômicos/moleculares e kits montáveis em MDF e PLA para fortalecer o ensino prático de ciências e matemática nas turmas do IFPA e escolas públicas parceiras.',
    impactMarajo:
      'Leva a filosofia do "aprender fazendo" diretamente para a sala de aula na região do Marajó.',
    authors: ['Monitores e Licenciandos do IFPA Campus Breves'],
    advisor: 'Núcleo de Ensino e Extensão IF MAKER',
    equipmentsUsed: ['Cortadora a Laser CNC', 'Impressoras 3D', 'Canetas 3D'],
    year: '2026',
    metrics: [
      { label: 'Foco Pedagógico', value: 'STEAM & Inclusão' },
      { label: 'Progresso Atual', value: '75% concluído' },
      { label: 'Atendimento', value: 'Gratuito p/ Escolas' },
    ],
  },
  {
    id: 'proj-3',
    title: 'Protótipo de Prótese e Dispositivos Assistivos Impressos em 3D',
    subtitle:
      'Digitalização com Scanner 3D e impressão personalizada com atuadores controlados por Arduino',
    status: 'Em Andamento',
    progress: 65,
    pillar: 'Pesquisa',
    category: 'Tecnologia Assistiva & Bioengenharia',
    image: IMAGE_ASSETS.projBracoBionico,
    summary:
      'Pesquisa aplicada unindo o Scanner 3D óptico do laboratório e as impressoras CoreXY Elegoo Centauri Carbon para criar órteses e mãos mecânicas articuladas de baixo custo.',
    impactMarajo:
      'Desenvolve soluções de reabilitação e acessibilidade localmente no arquipélago do Marajó.',
    authors: ['Bolsistas de Iniciação Tecnológica — LabMaker Marajó'],
    advisor: 'Equipe Docente IF MAKER Breves',
    equipmentsUsed: ['Scanners 3D', 'Impressoras 3D Elegoo', 'Placas Arduino'],
    year: '2026',
    metrics: [
      { label: 'Precisão Scanner', value: '0.05 mm' },
      { label: 'Progresso Atual', value: '65% concluído' },
      { label: 'Filamentos', value: 'PLA+ e TPU Flex' },
    ],
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Ábner Lucas (@abner.luks) & Coordenação',
    role: 'Coordenação & Gestão do Laboratório IFPA MAKER Marajó',
    badge: 'Coordenação',
    area: 'Fabricação Digital (3D & Laser CNC), Robótica e Projetos de Inovação',
    bio: 'À frente da estruturação, inauguração e produção tecnológica do Laboratório IFPA MAKER Marajó no IFPA Campus Breves, coordenando projetos como o Robot Soccer, a produção das medalhas do IV JINs e as oficinas mão na massa.',
    projectsCount: 18,
    avatarColor: '#FF6B35',
    initials: 'AL',
    lattesOrEmail: 'makermarajo@ifpa.edu.br',
  },
  {
    id: 'tm-2',
    name: 'Equipe Docente de Robótica & Embarcados',
    role: 'Professores Orientadores — Robótica, Arduino e Competição',
    badge: 'Docente / Pesquisador',
    area: 'Arena Robot Soccer, Sistemas Embarcados Arduino/ESP32 e OBR',
    bio: 'Orientam o desenvolvimento dos robôs móveis impressos em 3D, programação de microcontroladores, integração de sensores e torneios estudantis no campus.',
    projectsCount: 12,
    avatarColor: '#23963C',
    initials: 'ER',
    lattesOrEmail: 'makermarajo@ifpa.edu.br',
  },
  {
    id: 'tm-3',
    name: 'Equipe de Manufatura Digital (Laser & 3D)',
    role: 'Operação de Impressoras Elegoo Centauri Carbon & Laser CO2/Diodo',
    badge: 'Técnico',
    area: 'Modelagem CAD, Fatiamento 3D, Corte/Gravação a Laser e Acabamento',
    bio: 'Responsável pela operação segura das impressoras CoreXY, das cortadoras a laser CO2 e Diodo CNC, manutenção preventiva e treinamento de estudantes no uso de EPIs e ferramentas de bancada.',
    projectsCount: 25,
    avatarColor: '#0092D6',
    initials: 'MD',
    lattesOrEmail: 'makermarajo@ifpa.edu.br',
  },
  {
    id: 'tm-4',
    name: 'Estudantes Monitores & Voluntários IF MAKER',
    role: 'Protagonismo Discente na Bancada ("Aprender Fazendo")',
    badge: 'Monitor Bolsista',
    area: 'Montagem de Protótipos, Acabamento com Micro-retífica, Pintura e Oficinas',
    bio: 'Estudantes do IFPA Campus Breves que atuam diretamente na produção de grandes demandas do campus — como o corte, usinagem, pintura e montagem das medalhas do IV JINs — e no acolhimento de colegas.',
    projectsCount: 15,
    avatarColor: '#F9B814',
    initials: 'EM',
    lattesOrEmail: 'makermarajo@ifpa.edu.br',
  },
  {
    id: 'tm-5',
    name: 'Núcleo de Ensino, Pesquisa e Extensão Marajó',
    role: 'Articulação Curricular e Atendimento às Escolas de Breves',
    badge: 'Extensionista',
    area: 'Visitas Guiadas, Oficinas com Canetas 3D e Projetos Regionais',
    bio: 'Conecta o laboratório aos cursos técnicos e superiores do IFPA e às escolas públicas do município de Breves, promovendo a divulgação científica na ilha do Marajó.',
    projectsCount: 14,
    avatarColor: '#70388E',
    initials: 'NE',
    lattesOrEmail: 'makermarajo@ifpa.edu.br',
  },
];

export const CALENDAR_ACTIVITIES: CalendarActivity[] = [
  {
    id: 'act-1',
    title: 'Oficina Prática: Fatiamento e Impressão 3D na Elegoo Centauri Carbon',
    date: '2026-11-05',
    dayOfMonth: 5,
    month: 11,
    year: 2026,
    startTime: '09:00',
    endTime: '11:30',
    type: 'Oficina',
    equipment: 'Impressoras 3D ELEGOO Centauri Carbon',
    instructorOrResponsible: 'Equipe LabMaker Marajó',
    spotsAvailable: 8,
    totalSpots: 16,
    description:
      'Aprenda a preparar modelos 3D na estação com monitor curvo Samsung e operar as impressoras CoreXY fechadas Elegoo Centauri Carbon.',
    location: 'Lab IFPA MAKER Marajó — Campus Breves',
  },
  {
    id: 'act-2',
    title: 'Torneio e Treino Aberto na Arena Robot Soccer (Futebol de Robôs)',
    date: '2026-11-06',
    dayOfMonth: 6,
    month: 11,
    year: 2026,
    startTime: '14:30',
    endTime: '17:30',
    type: 'Oficina',
    equipment: 'Arena Robot Soccer + 5 Robôs 3D com LCD',
    instructorOrResponsible: 'Equipe de Robótica IF MAKER',
    spotsAvailable: 10,
    totalSpots: 20,
    description:
      'Manutenção dos chassis impressos em 3D, calibração de motores/LCD e partidas amistosas na arena de Futebol de Robôs do laboratório.',
    location: 'Lab IFPA MAKER Marajó — Setor Robótica',
  },
  {
    id: 'act-3',
    title: 'Sessão de Corte e Gravação a Laser (MDF e Acrílico)',
    date: '2026-11-09',
    dayOfMonth: 9,
    month: 11,
    year: 2026,
    startTime: '08:30',
    endTime: '12:00',
    type: 'Agendamento Bancada',
    equipment: 'Laser CO2 Industrial & Laser Diodo CNC',
    instructorOrResponsible: 'Equipe Técnica IF MAKER',
    spotsAvailable: 4,
    totalSpots: 6,
    description:
      'Horário dedicado ao corte de chapas de MDF e acrílico cristal para projetos de ensino, placas, medalhas e estruturas mecânicas.',
    location: 'Lab IFPA MAKER Marajó — Área CNC',
  },
  {
    id: 'act-4',
    title: 'Visita Guiada Escolar: Circuito 3D, Canetas 3D e Robot Soccer',
    date: '2026-11-11',
    dayOfMonth: 11,
    month: 11,
    year: 2026,
    startTime: '09:00',
    endTime: '11:00',
    type: 'Extensão Escolar',
    equipment: 'Parque Completo + Mesa de Canetas 3D',
    instructorOrResponsible: 'Núcleo de Extensão IF MAKER',
    spotsAvailable: 1,
    totalSpots: 1,
    description:
      'Recepção de estudantes da rede pública de Breves com demonstração das canoas marajoaras 3D, uso das Canetas 3D e partida de Futebol de Robôs.',
    location: 'Lab IFPA MAKER Marajó — Campus Breves',
  },
  {
    id: 'act-5',
    title: 'Digitalização com Scanner 3D & Modelagem de Artefatos Regionais',
    date: '2026-11-13',
    dayOfMonth: 13,
    month: 11,
    year: 2026,
    startTime: '14:30',
    endTime: '17:30',
    type: 'Pesquisa & TCC',
    equipment: 'Scanners 3D + Estação CAD',
    instructorOrResponsible: 'Pesquisadores & Monitores Maker',
    spotsAvailable: 4,
    totalSpots: 6,
    description:
      'Sessão técnica de escaneamento 3D e preparação de malhas para reprodução em impressora 3D.',
    location: 'Lab IFPA MAKER Marajó — Estação CAD',
  },
  {
    id: 'act-6',
    title: 'Oficina de Eletrônica e Arduino no Setor Açaí Maker',
    date: '2026-11-18',
    dayOfMonth: 18,
    month: 11,
    year: 2026,
    startTime: '14:00',
    endTime: '17:00',
    type: 'Oficina',
    equipment: 'Bancada Arduino, Sensores e Displays LCD',
    instructorOrResponsible: 'Docentes e Monitores de Eletrônica',
    spotsAvailable: 8,
    totalSpots: 16,
    description:
      'Prática de montagem em protoboard, programação de displays LCD 16x2 e acionamento de motores DC.',
    location: 'Lab IFPA MAKER Marajó — Setor Eletrônica',
  },
  {
    id: 'act-7',
    title: '1º Makeathon IFPA Breves & Copa Robot Soccer Marajó',
    date: '2026-11-26',
    dayOfMonth: 26,
    month: 11,
    year: 2026,
    startTime: '08:00',
    endTime: '18:00',
    type: 'Makeathon',
    equipment: 'Todas as Impressoras Elegoo, Lasers, Scanners e Arena Robot Soccer',
    instructorOrResponsible: 'Coordenação Geral IFPA MAKER Marajó',
    spotsAvailable: 12,
    totalSpots: 40,
    description:
      'Grande maratona de prototipagem rápida e torneio de Futebol de Robôs integrando todas as turmas do IFPA Campus Breves.',
    location: 'Lab IFPA MAKER Marajó — Campus Breves',
  },
];

export const FAQ_ITEMS = [
  {
    q: 'O que já temos instalado e funcionando hoje no Laboratório IFPA MAKER Marajó?',
    a: 'Impressoras 3D Elegoo Centauri Carbon, cortadora a laser CO2, gravadora a laser diodo, scanners 3D, arena de Robot Soccer com 5 robôs, canetas 3D e estação CAD.',
  },
  {
    q: 'Quais projetos e ações já foram produzidos no laboratório até o momento?',
    a: 'As medalhas oficiais do IV JINs (MDF e acrílico a laser), a arena de Robot Soccer com robôs impressos em 3D e a coleção de ribeirinhos em canoas marajoaras.',
  },
  {
    q: 'O uso das impressoras Elegoo Centauri Carbon, das cortadoras a laser e da arena é gratuito?',
    a: 'Sim! Todas as atividades de ensino, pesquisa e extensão para estudantes, servidores e escolas parceiras do IFPA Campus Breves são 100% gratuitas, fortalecendo a cultura do "aprender fazendo".',
  },
  {
    q: 'Como faço para agendar uma impressora 3D, a cortadora a laser ou uma oficina?',
    a: 'Basta acessar a página "Agendamento" aqui no site, escolher a máquina ou bancada, selecionar o dia e bloco de horário e clicar em "Confirmar e Abrir no Google Agenda" para registrar o evento diretamente no Google Calendar do laboratório.',
  },
  {
    q: 'Escolas de Breves e da região do Marajó podem agendar visitas para ver os robôs e impressoras?',
    a: 'Com certeza! O laboratório está de portas abertas para visitas técnicas guiadas, onde os alunos conhecem o processo de impressão 3D, o corte a laser, desenham com Canetas 3D e disputam partidas na Arena Robot Soccer.',
  },
];
