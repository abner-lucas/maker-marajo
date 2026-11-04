import React, { useState } from 'react';
import { BracoVisual, ScannerVisual } from '../components/simuladores/visuais';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Cpu,
  FileCode,
  Layers,
  Printer,
  Scan,
  ShieldCheck,
  Sliders,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { EQUIPMENTS, EquipmentItem } from '../data/labData';
import { WordRise } from '../components/BrandLogo';

/**
 * Interactive Simulator tailored to each of the 5 equipment pages
 */
const EquipmentInteractiveSimulator: React.FC<{ equipment: EquipmentItem }> = ({ equipment }) => {
  // 1. 3D Printer Slicer Simulator
  const [material3d, setMaterial3d] = useState<'PLA+' | 'PETG' | 'ABS' | 'TPU' | 'Resina 8K'>('PLA+');
  const [layerHeight, setLayerHeight] = useState(0.2);
  const [infill, setInfill] = useState(25);

  // 2. Laser CNC Simulator
  const [laserMat, setLaserMat] = useState<'MDF 3mm' | 'MDF 6mm' | 'Acrílico 4mm' | 'Compensado 4mm'>('MDF 3mm');
  const [laserMode, setLaserMode] = useState<'Corte' | 'Gravação'>('Corte');

  // 3. 3D Scanner Mesh Simulator
  const [scanMode, setScanMode] = useState<'points' | 'wireframe' | 'solid'>('wireframe');
  const [scanDensity, setScanDensity] = useState(85);

  // 4. Robotics Arm Joint Controller
  const [shoulderDeg, setShoulderDeg] = useState(-25);
  const [elbowDeg, setElbowDeg] = useState(45);
  const [gripperOpen, setGripperOpen] = useState(true);

  // 5. Arduino Interactive Pinout
  const [selectedPin, setSelectedPin] = useState<'PWM' | 'ANALOG' | 'POWER' | 'I2C'>('PWM');

  if (equipment.slug === 'impressoras-3d') {
    const temps: Record<string, { nozzle: string; bed: string; speed: string }> = {
      'PLA+': { nozzle: '210 °C', bed: '60 °C', speed: '300 mm/s' },
      PETG: { nozzle: '240 °C', bed: '75 °C', speed: '220 mm/s' },
      ABS: { nozzle: '255 °C', bed: '100 °C', speed: '200 mm/s' },
      TPU: { nozzle: '225 °C', bed: '50 °C', speed: '90 mm/s' },
      'Resina 8K': { nozzle: 'UV 405nm', bed: '25 °C', speed: '45 mm/h' },
    };
    const estMinutes = Math.round((48 / (layerHeight / 0.2)) * (0.7 + infill / 140));
    const estGrams = Math.round(32 * (0.6 + infill / 120));

    return (
      <div className="wb-panel p-6 sm:p-8 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wb-line pb-4">
          <div>
            <span className="rotulo">
              <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
              Simulador interativo · Impressão 3D
            </span>
            <h3 className="font-brand text-xl font-bold text-wb-ink">
              Configurador de Fatiamento 3D (Slicer)
            </h3>
          </div>
          <span className="wb-key">COREXY · ORCASLICER / PRUSASLICER</span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-wb-ink mb-2">
                1. Escolha o Filamento / Material:
              </label>
              <div className="flex flex-wrap gap-2">
                {(['PLA+', 'PETG', 'ABS', 'TPU', 'Resina 8K'] as const).map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => setMaterial3d(mat)}
                    className={`rounded-xl px-3.5 py-2 text-[13px] font-bold border transition-all ${
                      material3d === mat
                        ? 'border-wb-orange bg-wb-orange text-white shadow-sm'
                        : 'border-wb-line bg-wb-bench text-wb-ink-2 hover:text-wb-ink'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex justify-between text-[13px] font-bold text-wb-ink">
                <span>2. Altura de Camada (Qualidade vs. Velocidade):</span>
                <span className="font-key text-wb-orange">{layerHeight.toFixed(2)} mm</span>
              </label>
              <input
                type="range"
                min={0.08}
                max={0.28}
                step={0.04}
                value={layerHeight}
                onChange={(e) => setLayerHeight(Number(e.target.value))}
                className="mt-2 w-full accent-wb-orange cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-[13px] font-bold text-wb-ink">
                <span>3. Preenchimento Interno (Infill Gyroid):</span>
                <span className="font-key text-wb-green">{infill}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={infill}
                onChange={(e) => setInfill(Number(e.target.value))}
                className="mt-2 w-full accent-wb-green cursor-pointer"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-wb-line bg-[#111715] p-5 text-white font-key">
            <div className="flex items-center justify-between text-[11px] text-white/60 border-b border-white/10 pb-2.5">
              <span>PARÂMETROS RECOMENDADOS</span>
              <span className="text-emerald-400">● PRONTO P/ IMPRIMIR</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/50 text-[10.5px]">Temp. Extrusor</div>
                <div className="text-base font-bold text-wb-orange mt-0.5">
                  {temps[material3d].nozzle}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/50 text-[10.5px]">Temp. Mesa</div>
                <div className="text-base font-bold text-sky-400 mt-0.5">
                  {temps[material3d].bed}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/50 text-[10.5px]">Tempo Estimado</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{estMinutes} min</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/50 text-[10.5px]">Consumo Peça Padrão</div>
                <div className="text-base font-bold text-amber-300 mt-0.5">{estGrams} g</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (equipment.slug === 'cortadora-laser-cnc') {
    const laserPresets: Record<string, { cutPwr: number; cutSpd: number; engPwr: number; engSpd: number }> = {
      'MDF 3mm': { cutPwr: 65, cutSpd: 18, engPwr: 22, engSpd: 300 },
      'MDF 6mm': { cutPwr: 88, cutSpd: 9, engPwr: 24, engSpd: 280 },
      'Acrílico 4mm': { cutPwr: 72, cutSpd: 14, engPwr: 18, engSpd: 350 },
      'Compensado 4mm': { cutPwr: 75, cutSpd: 15, engPwr: 25, engSpd: 260 },
    };
    const p = laserPresets[laserMat];
    const power = laserMode === 'Corte' ? p.cutPwr : p.engPwr;
    const speed = laserMode === 'Corte' ? p.cutSpd : p.engSpd;

    return (
      <div className="wb-panel p-6 sm:p-8 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wb-line pb-4">
          <div>
            <span className="rotulo">
              <span aria-hidden="true" className="marajo-glifo text-wb-red" />
              Simulador interativo · Corte e Gravação a Laser
            </span>
            <h3 className="font-brand text-xl font-bold text-wb-ink">
              Tabela Dinâmica de Potência × Velocidade (Laser CO2 100W)
            </h3>
          </div>
          <span className="wb-key">ARQUIVOS .DXF / .SVG</span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-wb-ink mb-2">
                Escolha a Chapa na Mesa de Corte (1000 × 800 mm):
              </label>
              <div className="flex flex-wrap gap-2">
                {(['MDF 3mm', 'MDF 6mm', 'Acrílico 4mm', 'Compensado 4mm'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLaserMat(m)}
                    className={`rounded-xl px-3.5 py-2 text-[13px] font-bold border transition-all ${
                      laserMat === m
                        ? 'border-wb-red bg-wb-red text-white'
                        : 'border-wb-line bg-wb-bench text-wb-ink-2'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-wb-ink mb-2">
                Tipo de Operação no Vetor:
              </label>
              <div className="inline-flex border-t border-wb-line py-1">
                {(['Corte', 'Gravação'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLaserMode(mode)}
                    className={`rounded-lg px-4 py-2 text-[13px] font-bold transition-colors ${
                      laserMode === mode ? 'bg-wb-ink text-white' : 'text-wb-ink-2'
                    }`}
                  >
                    {mode === 'Corte'
                      ? '🔴 Linha Vermelha (Corte Passante)'
                      : '⚫ Preenchimento Preto (Gravação)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-wb-line bg-[#141112] p-5 text-white font-key">
            <div className="text-[11px] text-rose-400 font-bold">
              Configuração recomendada no RDWorks / LightBurn
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="text-[11px] text-white/60">Potência do Tubo CO2</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">{power}%</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="text-[11px] text-white/60">Velocidade dos Eixos</div>
                <div className="text-2xl font-bold text-amber-300 mt-1">{speed} mm/s</div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-white/60">
              *Compensação de feixe (Kerf) sugerida para encaixes justos: 0.12 mm.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (equipment.slug === 'scanners-3d') {
    return (
      <div className="wb-panel p-6 sm:p-8 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wb-line pb-4">
          <div>
            <span className="rotulo">
              <span aria-hidden="true" className="marajo-glifo text-wb-blue" />
              Simulador interativo · Digitalização 3D
            </span>
            <h3 className="font-brand text-xl font-bold text-wb-ink">
              Simulador de Digitalização 3D por Luz Estruturada
            </h3>
          </div>
          <span className="wb-key">PRECISÃO 0.05 MM</span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-center">
          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { k: 'points', label: 'Nuvem de Pontos' },
                { k: 'wireframe', label: 'Malha Poligonal (.STL)' },
                { k: 'solid', label: 'Textura RGB (.OBJ)' },
              ].map((m) => (
                <button
                  key={m.k}
                  type="button"
                  onClick={() => setScanMode(m.k as 'points' | 'wireframe' | 'solid')}
                  className={`rounded-xl px-3.5 py-2 text-[12.5px] font-bold border ${
                    scanMode === m.k
                      ? 'border-wb-blue bg-wb-blue text-white'
                      : 'border-wb-line bg-wb-bench text-wb-ink-2'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="flex justify-between text-[13px] font-bold text-wb-ink">
                <span>Densidade de Triângulos da Malha:</span>
                <span className="font-key text-wb-blue">
                  {(scanDensity * 14200).toLocaleString('pt-BR')} vértices
                </span>
              </label>
              <input
                type="range"
                min={20}
                max={100}
                value={scanDensity}
                onChange={(e) => setScanDensity(Number(e.target.value))}
                className="mt-2 w-full accent-wb-blue cursor-pointer"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(80%_70%_at_50%_30%,#123048,#070d14)] p-4 flex items-center justify-center h-56">
            <ScannerVisual modo={scanMode} densidade={scanDensity} />
          </div>
        </div>
      </div>
    );
  }

  if (equipment.slug === 'kits-robotica') {
    return (
      <div className="wb-panel p-6 sm:p-8 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wb-line pb-4">
          <div>
            <span className="rotulo">
              <span aria-hidden="true" className="marajo-glifo text-wb-green" />
              Simulador interativo · Robótica
            </span>
            <h3 className="font-brand text-xl font-bold text-wb-ink">
              Teste os Servomotores do Braço Robótico Educacional
            </h3>
          </div>
          <span className="wb-key">CONTROLE PWM</span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-[13px] font-bold text-wb-ink">
                <span>Junta 1 — Ombro (Servo MG996R):</span>
                <span className="font-key text-wb-green">{shoulderDeg}°</span>
              </label>
              <input
                type="range"
                min={-60}
                max={45}
                value={shoulderDeg}
                onChange={(e) => setShoulderDeg(Number(e.target.value))}
                className="mt-1.5 w-full accent-wb-green cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-[13px] font-bold text-wb-ink">
                <span>Junta 2 — Cotovelo:</span>
                <span className="font-key text-wb-orange">{elbowDeg}°</span>
              </label>
              <input
                type="range"
                min={-45}
                max={90}
                value={elbowDeg}
                onChange={(e) => setElbowDeg(Number(e.target.value))}
                className="mt-1.5 w-full accent-wb-orange cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => setGripperOpen((v) => !v)}
              className="wb-btn wb-btn-dark h-10 px-4 text-[13px]"
            >
              {gripperOpen ? 'Fechar Garra Mecânica' : 'Abrir Garra Mecânica'}
            </button>
          </div>

          <div className="rounded-[18px] wb-grid-bg h-56 flex items-center justify-center">
            <BracoVisual ombro={shoulderDeg} cotovelo={elbowDeg} garraAberta={gripperOpen} />
          </div>
        </div>
      </div>
    );
  }

  // Default: Arduino Interactive Pinout
  const pinDetails = {
    PWM: {
      title: 'Pinos Digitais & PWM (D0 a D13)',
      desc: 'Usados para leitura de botões, acionamento de relés, controle de velocidade de motores (pontes H) e servomotores nos pinos ~3, ~5, ~6, ~9, ~10 e ~11.',
      code: 'analogWrite(6, 200); // Controla motor via PWM',
    },
    ANALOG: {
      title: 'Entradas Analógicas ADC 10-bits (A0 a A5)',
      desc: 'Convertem tensões de 0V a 5V em valores de 0 a 1023. Ideais para sensores de umidade do solo, luminosidade (LDR), potenciômetros e qualidade da água.',
      code: 'int umidade = analogRead(A0);',
    },
    POWER: {
      title: 'Barramento de Energia (3.3V, 5V, GND, VIN)',
      desc: 'Fornece alimentação regulada de 5V e 3.3V para sensores e módulos na protoboard. Lembre-se sempre de unir o GND de todas as fontes.',
      code: '// Conecte VCC no 5V e GND no Terra Comum',
    },
    I2C: {
      title: 'Comunicação Serial, I2C (SDA/SCL) & SPI',
      desc: 'Permite conectar displays OLED, relógios RTC, acelerômetros IMU e múltiplos sensores usando apenas 2 fios de dados.',
      code: 'Wire.begin(); display.println("IF MAKER BREVES");',
    },
  };

  return (
    <div className="wb-panel p-6 sm:p-8 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wb-line pb-4">
        <div>
          <span className="rotulo">
            <span aria-hidden="true" className="marajo-glifo text-wb-purple" />
            Simulador interativo · Eletrônica e Arduino
          </span>
          <h3 className="font-brand text-xl font-bold text-wb-ink">
            Explorador de Barramentos Arduino Uno R3 & ESP32
          </h3>
        </div>
        <span className="wb-key">ATMEGA328P · 5V / 3.3V</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ['PWM', 'Digitais & PWM (D0-D13)'],
            ['ANALOG', 'Analógicos (A0-A5)'],
            ['POWER', 'Alimentação (5V / 3.3V / GND)'],
            ['I2C', 'Barramento I2C / OLED'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelectedPin(k)}
            className={`rounded-xl px-4 py-2 text-[13px] font-bold border transition-all ${
              selectedPin === k
                ? 'border-wb-purple bg-wb-purple text-white'
                : 'border-wb-line bg-wb-bench text-wb-ink-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-wb-line py-5">
        <h4 className="font-brand text-lg font-bold text-wb-ink">
          {pinDetails[selectedPin].title}
        </h4>
        <p className="mt-1.5 text-[14.5px] text-wb-ink-2">{pinDetails[selectedPin].desc}</p>
        <pre className="mt-3 rounded-xl bg-[#111715] p-3 font-key text-[12px] text-emerald-300 overflow-x-auto">
          {pinDetails[selectedPin].code}
        </pre>
      </div>
    </div>
  );
};

export const EquipmentsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const selectedEquipment = slug ? EQUIPMENTS.find((e) => e.slug === slug) : undefined;

  // === DEDICATED SINGLE EQUIPMENT PAGE (`/equipamentos/:slug`) ===
  if (selectedEquipment) {
    return (
      <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
        {/* Top Hero Banner for this specific Equipment */}
        <section className="relative overflow-hidden border-b border-wb-line bg-wb-bench py-14 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
            {/* Breadcrumb & Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <Link
                to="/equipamentos"
                className="inline-flex items-center gap-2 rounded-full border border-wb-line bg-white px-4 py-2 text-[13.5px] font-bold text-wb-ink hover:bg-wb-canvas shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Todos os Equipamentos</span>
              </Link>

              {/* Quick Subpage Pills */}
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENTS.map((eq) => (
                  <Link
                    key={eq.id}
                    to={`/equipamentos/${eq.slug}`}
                    className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                      eq.slug === selectedEquipment.slug
                        ? 'bg-wb-ink text-white'
                        : 'bg-white border border-wb-line text-wb-ink-2 hover:text-wb-ink'
                    }`}
                  >
                    {eq.shortName}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
              <div>
                <span
                  className="inline-flex items-center rounded-full px-3.5 py-1 font-key text-[11px] font-bold text-white"
                  style={{ backgroundColor: selectedEquipment.accentColor }}
                >
                  {selectedEquipment.badge}
                </span>

                <h1
                  className="mt-4 font-brand font-bold text-wb-ink"
                  style={{
                    fontSize: 'clamp(30px, 4vw, 52px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.028em',
                  }}
                >
                  <WordRise text={selectedEquipment.name} />
                </h1>

                <p className="mt-4 text-[16.5px] leading-relaxed text-wb-ink-2">
                  {selectedEquipment.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="border-t border-wb-line py-2.5">
                    <span className="font-key text-[11px] text-wb-ink-3 block">Disponibilidade</span>
                    <span className="font-bold text-[15px] text-wb-green">
                      ● {selectedEquipment.unitsAvailable} Unidades Operacionais
                    </span>
                  </div>

                  <div className="border-t border-wb-line py-2.5">
                    <span className="font-key text-[11px] text-wb-ink-3 block">
                      Formatos aceitos
                    </span>
                    <span className="font-key font-bold text-[13.5px] text-wb-ink">
                      {selectedEquipment.fileFormats.join(' · ')}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={`/agendamento?equipamento=${selectedEquipment.slug}`}
                    className="wb-btn wb-btn-primary h-12 px-6 text-[15px]"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Agendar {selectedEquipment.shortName} no Google Agenda</span>
                  </Link>
                </div>
              </div>

              <div className="wb-panel overflow-hidden p-3 bg-white">
                <img
                  src={selectedEquipment.image}
                  alt={selectedEquipment.name}
                  className="w-full aspect-[4/3] object-cover rounded-[14px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Technical Content & Interactive Simulator */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 space-y-14">
            {/* Real Lab Video & Photo Gallery (when available from Reels) */}
            {(selectedEquipment.realGallery || selectedEquipment.videoSrc) && (
              <div className="wb-panel p-6 sm:p-8 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wb-line pb-4">
                  <div>
                    <span className="rotulo">
                      <span aria-hidden="true" className="marajo-glifo text-wb-green" />
                      Galeria do laboratório · Fotos e vídeos reais
                    </span>
                    <h2 className="font-brand text-xl font-bold text-wb-ink">
                      {selectedEquipment.shortName} em Operação no IFPA Campus Breves
                    </h2>
                  </div>
                  <span className="wb-key">FOTOS & VÍDEO REAIS</span>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
                  {selectedEquipment.videoSrc && (
                    <div className="overflow-hidden border-t border-wb-line bg-black aspect-[9/15] max-w-[280px] mx-auto w-full">
                      <video
                        src={selectedEquipment.videoSrc}
                        poster={selectedEquipment.image}
                        controls
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {selectedEquipment.realGallery && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEquipment.realGallery.map((img, i) => (
                        <figure
                          key={i}
                          className="overflow-hidden border-t border-wb-line flex flex-col"
                        >
                          <img
                            src={img.src}
                            alt={img.caption}
                            className="h-48 w-full object-cover"
                          />
                          <figcaption className="p-3 text-[12.5px] font-semibold text-wb-ink-2">
                            {img.caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Equipment Simulator */}
            <EquipmentInteractiveSimulator equipment={selectedEquipment} />

            {/* Specs + Applications + Models Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technical Specs */}
              <div className="wb-panel p-6">
                <h2 className="font-brand text-lg font-bold text-wb-ink flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-wb-orange" />
                  Especificações Técnicas
                </h2>
                <dl className="mt-4 space-y-3 divide-y divide-wb-line">
                  {selectedEquipment.specs.map((s) => (
                    <div key={s.label} className="pt-3 first:pt-0">
                      <dt className="font-key text-[11.5px] text-wb-ink-3">{s.label}</dt>
                      <dd className="mt-0.5 text-[14.5px] font-bold text-wb-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Applications & Materials */}
              <div className="wb-panel p-6">
                <h2 className="font-brand text-lg font-bold text-wb-ink flex items-center gap-2">
                  <Layers className="h-5 w-5 text-wb-green" />
                  O que você pode criar
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {selectedEquipment.applications.map((app) => (
                    <li key={app} className="flex items-start gap-2.5 text-[14px] text-wb-ink-2">
                      <CheckCircle2 className="h-4 w-4 text-wb-green shrink-0 mt-0.5" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-6 font-key text-[11.5px] font-bold text-wb-ink-3">
                  Insumos / Componentes Suportados
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {selectedEquipment.materialsOrComponents.map((m) => (
                    <span key={m} className="wb-key text-[11.5px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Models in Lab + Safety Rules */}
              <div className="wb-panel p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-brand text-lg font-bold text-wb-ink flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-wb-blue" />
                    Bancada Disponível no Campus Breves
                  </h2>
                  <div className="mt-4 space-y-2.5">
                    {selectedEquipment.modelsInLab.map((m) => (
                      <div
                        key={m.modelName}
                        className="border-t border-wb-line py-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13.5px] font-bold text-wb-ink">{m.modelName}</span>
                          <span className="wb-key">{m.qty}x</span>
                        </div>
                        <p className="text-[12px] text-wb-ink-3 mt-0.5">{m.highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    Normas de Segurança na Bancada
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[12.5px] text-amber-900/90">
                    {selectedEquipment.safetyRules.map((rule) => (
                      <li key={rule}>• {rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // === ALL EQUIPMENTS HUB (`/equipamentos`) ===
  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      <section className="relative overflow-hidden border-b border-wb-line bg-wb-bench py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-orange" />Equipamentos · IFPA Campus Breves</span>
          <h1
            className="mt-4 font-brand font-bold text-wb-ink max-w-[16em]"
            style={{
              fontSize: 'clamp(34px, 4.5vw, 60px)',
              lineHeight: 1.04,
              letterSpacing: '-0.028em',
            }}
          >
            <WordRise text="Páginas de Equipamentos do IF MAKER Breves." />
          </h1>
          <p className="mt-4 max-w-[40em] text-[17px] leading-relaxed text-wb-ink-2">
            Clique em qualquer equipamento abaixo para acessar sua página exclusiva com simulador
            interativo de parâmetros, especificações técnicas, formatos aceitos e agendamento direto
            pelo Google Agenda.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 space-y-10">
          {EQUIPMENTS.map((eq, idx) => (
            <article
              key={eq.id}
              className="wb-panel overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_1.35fr]"
            >
              <div
                className={`relative min-h-[280px] bg-wb-bench border-b lg:border-b-0 lg:border-r border-wb-line overflow-hidden ${
                  idx % 2 === 1 ? 'lg:order-2 lg:border-r-0 lg:border-l' : ''
                }`}
              >
                <img
                  src={eq.image}
                  alt={eq.name}
                  className="h-full w-full object-cover"
                />
                <span
                  className="absolute top-4 left-4 rounded-full px-3 py-1 font-key text-[11px] font-bold text-white shadow"
                  style={{ backgroundColor: eq.accentColor }}
                >
                  {eq.unitsAvailable} unidades no lab
                </span>
              </div>

              <div className="p-6 sm:p-9 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-ink-3" />
                      {eq.badge}
                    </span>
                    <span className="wb-key text-wb-green font-bold">● {eq.status}</span>
                  </div>

                  <h2 className="mt-2 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                    {eq.name}
                  </h2>

                  <p className="mt-3 text-[15.5px] leading-relaxed text-wb-ink-2">
                    {eq.description}
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {eq.specs.slice(0, 4).map((sp) => (
                      <div
                        key={sp.label}
                        className="border-t border-wb-line py-2.5"
                      >
                        <div className="font-key text-[10.5px] text-wb-ink-3">
                          {sp.label}
                        </div>
                        <div className="text-[13.5px] font-bold text-wb-ink mt-0.5">{sp.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 pt-5 border-t border-wb-line flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {eq.fileFormats.map((fmt) => (
                      <span key={fmt} className="wb-key">
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Link
                      to={`/equipamentos/${eq.slug}`}
                      className="wb-btn wb-btn-dark h-11 px-5 text-[14px]"
                    >
                      <span>Página Exclusiva & Simulador</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/agendamento?equipamento=${eq.slug}`}
                      className="wb-btn wb-btn-primary h-11 px-5 text-[14px]"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Reservar</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

