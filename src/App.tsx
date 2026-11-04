import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';

// Páginas internas em arquivos separados: a home não baixa o código delas.
const EquipmentsPage = lazy(() => import('./pages/EquipmentsPage').then((m) => ({ default: m.EquipmentsPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const BookingPage = lazy(() => import('./pages/BookingPage').then((m) => ({ default: m.BookingPage })));
const MonthlyCalendarPage = lazy(() =>
  import('./pages/MonthlyCalendarPage').then((m) => ({ default: m.MonthlyCalendarPage }))
);
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

/** Espaço reservado enquanto a página chega (evita o rodapé "pular" para cima) */
const Carregando: React.FC = () => (
  <div className="flex min-h-[80vh] items-center justify-center pt-[76px]" role="status" aria-live="polite">
    <span aria-hidden="true" className="marajo-glifo h-6 w-6 text-wb-orange" />
    <span className="sr-only">Carregando página…</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-wb-canvas text-wb-ink">
        <Navbar />
        <main id="conteudo" className="flex-1">
          <Suspense fallback={<Carregando />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/equipamentos" element={<EquipmentsPage />} />
              <Route path="/equipamentos/:slug" element={<EquipmentsPage />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/projetos" element={<ProjectsPage />} />
              <Route path="/agendamento" element={<BookingPage />} />
              <Route path="/agenda-mensal" element={<MonthlyCalendarPage />} />
              <Route path="/equipe" element={<TeamPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
