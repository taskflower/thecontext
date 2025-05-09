// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

import config from "./_configs/marketingApp.config";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Błąd krytyczny. Odśwież stronę.</div>}>
      <App initialConfig={config} />
    </ErrorBoundary>
  </React.StrictMode>
);
