// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudioLayout from "./layouts/StudioLayout";
// import LandingPage from "./pages/LandingPage";
// import AuthPage from "./pages/AuthPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<>/studio</>} />
        {/* <Route path="/auth" element={<AuthPage />} /> */}
        <Route path="/studio/*" element={<StudioLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;