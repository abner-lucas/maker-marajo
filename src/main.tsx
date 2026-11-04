import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Fonte sans-serif moderna auto-hospedada (zero fontes serifadas)
import '@fontsource-variable/hanken-grotesk';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
