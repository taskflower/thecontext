// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Błąd krytyczny. Odśwież stronę.</div>}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
