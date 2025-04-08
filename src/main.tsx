import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importowanie i rejestracja szablonów
import { registerDefaultTemplates, registerNewYorkTemplates } from './templates';

// Rejestracja wszystkich szablonów przed renderowaniem aplikacji
registerDefaultTemplates();
registerNewYorkTemplates();

// Render the new App with template-based architecture
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);