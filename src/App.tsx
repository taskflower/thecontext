import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppRenderer } from "./AppRenderer";
import { DBProvider } from "./provideDB/dbProvider.tsx";
import { AuthProvider } from "./themes/test/useMockAuth";

// App.tsx
export default function App() {
  return (
    <BrowserRouter>
    <DBProvider>
      <AuthProvider>
      
        <Routes>
          <Route path="/:config/:workspace" element={<AppRenderer />} />
          <Route path="/:config/:workspace/:scenario" element={<AppRenderer />} />
          <Route path="/:config/:workspace/:scenario/:step" element={<AppRenderer />} />
          <Route path="/:config/:workspace/:scenario/:step/:id" element={<AppRenderer />} />
        </Routes>
      
      </AuthProvider>
      </DBProvider>
    </BrowserRouter>
  );
}