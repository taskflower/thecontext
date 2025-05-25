// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Router } from "./ngn2/cre";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/:config?/:workspace?/:scenario?/:step?/:id?"
          element={<Router />}
        />
        <Route path="/" element={<Navigate to="/testApp/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
