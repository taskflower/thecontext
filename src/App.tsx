// App.tsx - Kompletny kod z poprawionym routingiem
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppRenderer } from "./AppRenderer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/:config/:workspace/:scenario/:step"
          element={<AppRenderer />}
        />
        <Route path="/:config/:workspace/:scenario" element={<AppRenderer />} />
        <Route path="/:config/:workspace" element={<AppRenderer />} />
      </Routes>
    </BrowserRouter>
  );
}
