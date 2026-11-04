# 🛠️ Laboratório IFPA MAKER Marajó — IFPA Campus Breves

Portal interativo, imersivo e dinâmico do **Laboratório IFPA MAKER Marajó** (5º Laboratório IF MAKER entregue pelo Instituto Federal do Pará em março de 2026 no **Campus Breves**), voltado para **prototipagem, robótica, ensino, pesquisa e extensão** sob a filosofia do *"aprender fazendo" (learning by doing)*.

---

## ✨ Destaques e Recursos do Portal

- **Bancada 3D Interativa em Three.js (`Hero3DWorkbench`)**:
  - Visualização 3D interativa com 4 modelos alternáveis (*Robô Explorador 4WD*, *Impressora 3D CoreXY*, *Braço Robótico 6-Eixos* e *Kit Arduino + Sensores*), rotação orbital 360°, explosão de peças em gravidade zero e remontagem animada.
- **Scrollytelling / Scroll-Driven Animations (`ScrollytellingSection`)**:
  - Experiência guiada pela rolagem (`460svh`) demonstrando as 3 etapas criativas na bancada: `01 Modelagem CAD 3D & Corte a Laser CNC`, `02 Eletrônica Arduino Pino a Pino` e `03 Programação C++ & Simulação Robótica`.
- **Vídeos Reais e Inspeção Quadro a Quadro (`LabVideosSection`)**:
  - Player de vídeo vertical `9:16` integrado com controles **`-1 Quadro`** e **`+1 Quadro`** e navegação por capítulos dos Reels reais do laboratório:
    1. **Produção das Medalhas do IV JINs (`@ifpabreves`)** — Corte e gravação a laser em MDF e acrílico cristal, acabamento com micro-retífica e pintura metálica.
    2. **Robot Soccer — Futebol de Robôs LabMaker Marajó** — Arena própria com 5 robôs impressos em 3D e display LCD 16x2 frontal.
    3. **Inauguração do Laboratório IFPA MAKER Marajó** — Tour pelas impressoras **ELEGOO Centauri Carbon**, cortadoras a laser CO2 e Diodo CNC, Canetas 3D e canoas marajoaras impressas em 3D.
- **Páginas Exclusivas para Equipamentos (`/equipamentos/:slug`) com Simuladores**:
  - `/equipamentos/impressoras-3d` — Impressoras 3D (Elegoo Centauri Carbon) + Canetas 3D e Simulador de Fatiamento (Slicer).
  - `/equipamentos/cortadora-laser-cnc` — Cortadoras a Laser CO2 Industrial e Diodo CNC + Calculadora de Potência × Velocidade.
  - `/equipamentos/scanners-3d` — Scanners 3D Ópticos + Simulador de Nuvem de Pontos e Malha.
  - `/equipamentos/kits-robotica` — Kits de Robótica & Arena Robot Soccer + Controlador Cinemático de Braço Robótico.
  - `/equipamentos/arduino-eletronica` — Placas Arduino, ESP32 e Eletrônica + Mapa de Pinos Interativo.
- **Integração com Google Agenda**:
  - **Agendamento (`/agendamento`)**: Reserva de máquinas e bancadas com criação direta de evento no Google Calendar e download de arquivo `.ICS`.
  - **Agenda Mensal (`/agenda-mensal`)**: Calendário mensal interativo de oficinas, treinos e visitas + visualização incorporada (*Iframe Embed*) do Google Agenda.

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Gerar build de produção
npm run build
```

