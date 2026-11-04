import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Fontes auto-hospedadas (sem depender do Google Fonts em tempo de execução)
import '@fontsource-variable/hanken-grotesk';
import '@fontsource/familjen-grotesk/500.css';
import '@fontsource/familjen-grotesk/600.css';
import '@fontsource/familjen-grotesk/700.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
