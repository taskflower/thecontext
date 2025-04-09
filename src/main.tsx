import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importowanie funkcji inicjalizacji szablonów
import { initializeTemplates } from './templates';

// Inicjalizacja wszystkich szablonów przed renderowaniem aplikacji
initializeTemplates();

// Render the new App with template-based architecture
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);