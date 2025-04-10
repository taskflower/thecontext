// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeTemplates } from './templates';
import { ErrorBoundary } from './components/ErrorBoundary';

initializeTemplates();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Błąd krytyczny. Odśwież stronę.</div>}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
