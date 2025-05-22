import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppRenderer } from "./AppRenderer";
import { DBProvider } from "./provideDB/dbProvider.tsx";

// App.tsx
export default function App() {
  return (
    <BrowserRouter>
      <DBProvider>
        <Routes>
          <Route path="/:config/:workspace" element={<AppRenderer />} />
          <Route path="/:config/:workspace/:scenario" element={<AppRenderer />} />
          <Route path="/:config/:workspace/:scenario/:step" element={<AppRenderer />} />
          <Route path="/:config/:workspace/:scenario/:step/:id" element={<AppRenderer />} />
        </Routes>
      </DBProvider>
    </BrowserRouter>
  );
}