import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck,
  GraduationCap,
  Layers,
  Printer,
  Scan,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { LAB_SERVICES } from '../data/labData';
import { WordRise } from '../components/BrandLogo';

const serviceIconMap: Record<string, React.ReactNode> = {
  Printer: <Printer className="h-6 w-6 text-[#FF6B35]" />,
  Zap: <Zap className="h-6 w-6 text-[#E5484D]" />,
  Scan: <Scan className="h-6 w-6 text-[#0092D6]" />,
  Cpu: <Cpu className="h-6 w-6 text-[#70388E]" />,
  GraduationCap: <GraduationCap className="h-6 w-6 text-[#23963C]" />,
  Users: <Users className="h-6 w-6 text-[#F9B814]" />,
};

export const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [estimatorService, setEstimatorService] = useState(LAB_SERVICES[0].id);
  const [estimatorScale, setEstimatorScale] = useState<'Pequeno' | 'Médio' | 'Grande'>('Médio');

  const categories = ['Todos', 'Prototipagem', 'Ensino', 'Pesquisa', 'Extensão'];
  const filteredServices =
    selectedCategory === 'Todos'
      ? LAB_SERVICES
      : LAB_SERVICES.filter((s) => s.category === selectedCategory);

  const activeEstService =
    LAB_SERVICES.find((s) => s.id === estimatorService) || LAB_SERVICES[0];

  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      {/* Hero Header */}
      <section className="border-b border-wb-line bg-wb-bench py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <span className="wb-key text-wb-green font-bold">
            CARTA DE SERVIÇOS · ENSINO, PESQUISA E EXTENSÃO
          </span>
          <h1
            className="mt-4 font-brand font-bold text-wb-ink max-w-[15em]"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 58px)',
              lineHeight: 1.04,
              letterSpacing: '-0.045em',
            }}
          >
            <WordRise text="O que pode ser realizado no IF MAKER Breves." />
          </h1>
          <p className="mt-4 max-w-[40em] text-[17px] leading-relaxed text-wb-ink-2">
            Da primeira modelagem 3D à fabricação de lotes didáticos para escolas do Marajó. Confira
            os serviços técnicos e pedagógicos oferecidos gratuitamente pelo laboratório.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-[13.5px] font-bold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-wb-ink text-white shadow-sm'
                    : 'bg-white border border-wb-line text-wb-ink-2 hover:text-wb-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => (
              <article
                key={srv.id}
                className="wb-panel wb-panel-hover flex flex-col justify-between p-6 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-wb-line bg-wb-bench">
                      {serviceIconMap[srv.iconName]}
                    </div>
                    <span
                      className="rounded-full px-3 py-1 font-key text-[11px] font-bold text-white"
                      style={{ backgroundColor: srv.accentColor }}
                    >
                      {srv.category}
                    </span>
                  </div>

                  <h2 className="mt-5 font-brand text-[21px] font-bold text-wb-ink leading-snug">
                    {srv.title}
                  </h2>

                  <p className="mt-3 text-[14.5px] leading-relaxed text-wb-ink-2">
                    {srv.fullDesc}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-wb-line pt-4">
                    <div className="flex items-center gap-2 text-[12.5px] font-semibold text-wb-ink">
                      <Clock className="h-4 w-4 text-wb-orange shrink-0" />
                      <span>Duração média: {srv.durationEstimate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12.5px] font-semibold text-wb-ink">
                      <FileCheck className="h-4 w-4 text-wb-green shrink-0" />
                      <span>Requisitos: {srv.requiredFiles.join(', ')}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-key text-[10.5px] uppercase text-wb-ink-3 font-bold">
                      Entregáveis na Bancada:
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {srv.deliverables.map((del) => (
                        <li
                          key={del}
                          className="flex items-start gap-2 text-[13px] text-wb-ink-2"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-wb-green shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-wb-line">
                  <Link
                    to={`/agendamento?servico=${encodeURIComponent(srv.title)}`}
                    className="wb-btn wb-btn-dark w-full h-11 text-[13.5px]"
                  >
                    <Calendar className="h-4 w-4 text-wb-orange" />
                    <span>Solicitar / Agendar Serviço</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Interactive Service Checklist & Estimator Widget */}
          <div className="mt-16 wb-panel p-6 sm:p-10 bg-wb-bench/60">
            <div className="max-w-[680px]">
              <span className="font-key text-[11.5px] font-bold uppercase text-wb-orange">
                ASSISTENTE INTERATIVO DE PREPARAÇÃO
              </span>
              <h2 className="mt-2 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                Prepare seu Projeto antes de vir para a Bancada
              </h2>
              <p className="mt-2 text-[15px] text-wb-ink-2">
                Selecione o serviço desejado e o porte da demanda para verificar o checklist técnico
                imediato.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13.5px] font-bold text-wb-ink mb-2">
                    1. Qual serviço você deseja realizar?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LAB_SERVICES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setEstimatorService(s.id)}
                        className={`text-left rounded-xl p-3 border text-[13px] font-bold transition-all ${
                          estimatorService === s.id
                            ? 'border-wb-ink bg-wb-ink text-white shadow-sm'
                            : 'border-wb-line bg-white text-wb-ink-2 hover:text-wb-ink'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13.5px] font-bold text-wb-ink mb-2">
                    2. Porte ou Complexidade do Protótipo / Turma:
                  </label>
                  <div className="inline-flex rounded-xl border border-wb-line bg-white p-1">
                    {(['Pequeno', 'Médio', 'Grande'] as const).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setEstimatorScale(sc)}
                        className={`rounded-lg px-5 py-2 text-[13px] font-bold transition-colors ${
                          estimatorScale === sc
                            ? 'bg-wb-orange text-white'
                            : 'text-wb-ink-2 hover:text-wb-ink'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-wb-line bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-wb-line pb-3">
                  <span className="font-key text-[11px] font-bold uppercase text-wb-green">
                    CHECKLIST DE ATENDIMENTO
                  </span>
                  <span className="wb-key">PORTE {estimatorScale.toUpperCase()}</span>
                </div>

                <h3 className="mt-4 font-brand text-lg font-bold text-wb-ink">
                  {activeEstService.title}
                </h3>

                <div className="mt-4 space-y-2.5 text-[13.5px]">
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Equipamentos Alocados:</span>
                    <span className="font-bold text-wb-ink text-right">
                      {activeEstService.equipmentsUsed.join(' + ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Arquivos Necessários:</span>
                    <span className="font-key font-bold text-wb-orange">
                      {activeEstService.requiredFiles.join(' / ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wb-ink-3">Público Atendido:</span>
                    <span className="font-semibold text-wb-ink text-right">
                      {activeEstService.targetAudience.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/agendamento?servico=${encodeURIComponent(activeEstService.title)}`}
                  className="mt-6 wb-btn wb-btn-primary w-full h-12 text-[14.5px]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Ir para Agendamento no Google Agenda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

