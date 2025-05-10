// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import konkretnej konfiguracji
import config from "./_configs/marketingApp/config";

// W przypadku, gdy chcemy użyć innej konfiguracji, wystarczy zmienić import:
// import config from "./_configs/salesApp/config";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Błąd krytyczny. Odśwież stronę.</div>}>
      <App initialConfig={config} />
    </ErrorBoundary>
  </React.StrictMode>
);