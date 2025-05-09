// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * Poniżej mamy dwa sposoby uruchomienia aplikacji:
 * 
 * 1. Z lokalną, prekompilowaną konfiguracją (błyskawiczne ładowanie)
 *    <App /> lub <App configSource="local" />
 * 
 * 2. Z konfiguracją pobieraną z Firebase (ładowanie przy starcie)  
 *    <App configSource="firebase" />
 */

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Błąd krytyczny. Odśwież stronę.</div>}>
      {/* Lokalna konfiguracja - natychmiastowe ładowanie */}
      <App />
      
      {/* Firebase konfiguracja 
      <App configSource="firebase" /> 
      */}
    </ErrorBoundary>
  </React.StrictMode>
);