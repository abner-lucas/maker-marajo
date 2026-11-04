import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { EquipmentsPage } from './pages/EquipmentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BookingPage } from './pages/BookingPage';
import { MonthlyCalendarPage } from './pages/MonthlyCalendarPage';
import { TeamPage } from './pages/TeamPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-wb-canvas text-wb-ink">
        <Navbar />
        <main id="conteudo" className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/equipamentos" element={<EquipmentsPage />} />
            <Route path="/equipamentos/:slug" element={<EquipmentsPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/projetos" element={<ProjectsPage />} />
            <Route path="/agendamento" element={<BookingPage />} />
            <Route path="/agenda-mensal" element={<MonthlyCalendarPage />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

