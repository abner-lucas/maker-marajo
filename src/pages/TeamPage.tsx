import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { TEAM_MEMBERS, IMAGE_ASSETS } from '../data/labData';
import { WordRise } from '../components/BrandLogo';

export const TeamPage: React.FC = () => {
  return (
    <div className="pt-[76px] bg-wb-canvas min-h-screen font-ui text-wb-ink">
      {/* Header */}
      <section className="border-b border-wb-line bg-wb-bench py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <span className="rotulo"><span aria-hidden="true" className="marajo-glifo text-wb-green" />Nossa equipe · IFPA Campus Breves</span>
          <h1
            className="mt-4 font-brand font-bold text-wb-ink max-w-[16em]"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 58px)',
              lineHeight: 1.04,
              letterSpacing: '-0.028em',
            }}
          >
            <WordRise text="Equipe do Laboratório IF MAKER Breves." />
          </h1>
          <p className="mt-4 max-w-[42em] text-[17px] leading-relaxed text-wb-ink-2">
            Professores, técnicos e estudantes monitores que fazem o laboratório funcionar.
          </p>
        </div>
      </section>

      {/* Team Cards Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.id}
                className="wb-panel wb-panel-hover flex flex-col justify-between p-6 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl font-brand text-lg font-bold text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.initials}
                    </div>
                    <span className="wb-key font-bold">{member.badge}</span>
                  </div>

                  <h2 className="mt-5 font-brand text-xl font-bold text-wb-ink">{member.name}</h2>
                  <p className="mt-1 text-[13.5px] font-bold text-wb-orange">{member.role}</p>

                  <div className="mt-3 rounded-xl bg-wb-bench px-3 py-2 font-key text-[11.5px] text-wb-ink-2">
                    <strong>Atuação:</strong> {member.area}
                  </div>

                  <p className="mt-3.5 text-[14.5px] leading-relaxed text-wb-ink-2">
                    {member.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-wb-line flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-wb-ink-3 font-key">
                    <Mail className="h-3.5 w-3.5 text-wb-green" />
                    {member.lattesOrEmail}
                  </span>
                  <span className="wb-key">{member.projectsCount} projetos</span>
                </div>
              </article>
            ))}
          </div>

          {/* Join the Lab / Monitoria Callout */}
          <div className="mt-16 wb-panel overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
            <div className="p-7 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="rotulo">
                  <span aria-hidden="true" className="marajo-glifo text-wb-orange" />
                  Participe da equipe · Monitoria e pesquisa
                </span>
                <h2 className="mt-2 font-brand text-2xl sm:text-3xl font-bold text-wb-ink">
                  Faça parte da Equipe de Monitores e Pesquisadores Maker
                </h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-wb-ink-2">
                  Semestralmente o Laboratório IF MAKER Breves abre chamadas para estudantes
                  voluntários e bolsistas de Ensino, Pesquisa (PIBITI/PIBIC) e Extensão interessados
                  em aprender operação de Impressoras 3D, Corte a Laser CNC, Scanners 3D, Robótica e
                  Arduino.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="border-t border-wb-line py-3.5">
                    <div className="font-bold text-[14px] text-wb-ink flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-wb-green" />
                      Monitoria Maker
                    </div>
                    <p className="text-[12.5px] text-wb-ink-2 mt-1">
                      Certificação de horas complementares e treinamento prático em todas as
                      máquinas.
                    </p>
                  </div>
                  <div className="border-t border-wb-line py-3.5">
                    <div className="font-bold text-[14px] text-wb-ink flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-wb-orange" />
                      Submissão de Oficinas
                    </div>
                    <p className="text-[12.5px] text-wb-ink-2 mt-1">
                      Docentes e técnicos podem propor minicursos e desafios na agenda mensal do
                      laboratório.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/agendamento"
                  className="wb-btn wb-btn-primary h-12 px-6 text-[14.5px]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Agendar Conversa com a Coordenação</span>
                </Link>
              </div>
            </div>

            <div className="bg-wb-bench border-t lg:border-t-0 lg:border-l border-wb-line overflow-hidden">
              <img
                src={IMAGE_ASSETS.oficina1}
                alt="Equipe e estudantes do Laboratório IF MAKER Breves"
                className="h-full w-full object-cover min-h-[280px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

