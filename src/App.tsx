// App.js

import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Studio from "./pages/StudioLayout";
import WorkspacePage from "./pages/WorkspacePage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <div className="content">
            <Routes>
              <Route path="/" element={<WorkspacePage />} />
              <Route path="/:slug" element={<WorkspacePage />} />
              <Route path="/studio" element={<Studio />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;