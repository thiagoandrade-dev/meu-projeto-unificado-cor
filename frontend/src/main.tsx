// Local: frontend/src/main.tsx (Corrigido)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- CORREÇÃO AQUI: removido o ".tsx"
import './index.css';

console.log("main.tsx carregado!");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

