// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import StudioLayout from "./pages/StudioLayout";
import WorkspacePage from "./pages/WorkspacePage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<>/studio</>} />
        <Route path="/:slug" element={<WorkspacePage />} />
        <Route path="/studio/*" element={<StudioLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
