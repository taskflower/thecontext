// App.js

import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Studio from "./pages/StudioLayout";
import WorkspacePage from "./pages/WorkspacePage";

function App() {
  return (
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
  );
}

export default App;
