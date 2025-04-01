// App.js

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Dynamic imports
const Studio = lazy(() => import("./pages/StudioLayout"));
const WorkspacePage = lazy(() => import("./pages/WorkspacePage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));


// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-spinner absolute w-full h-full flex items-center justify-center">
    <p><Loader2 className="h-5 w-5 animate-spin" /></p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <div className="content">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<>studio</>} />
                <Route path="/:slug" element={<WorkspacePage />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;