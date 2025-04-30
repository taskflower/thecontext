// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Header from "./components/homeLayout/Header";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={
        <div>
          <Header />
          Błąd krytyczny. Odśwież stronę.
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
