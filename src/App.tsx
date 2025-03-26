// App.js

import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Studio from "./pages/StudioLayout";
import WorkspacePage from "./pages/WorkspacePage";
import { AuthProvider } from "./context/AuthContext";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import EnergyTraderTraining from "./components/RD2/EnergyTraderTraining";



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <div className="content">
            <Routes>
              <Route path="/" element={<WorkspacePage />} />
              <Route path="/rd" element={<EnergyTraderTraining/>} />
  
              <Route path="/:slug" element={<WorkspacePage />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;