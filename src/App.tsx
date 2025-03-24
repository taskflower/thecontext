// App.js

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Studio from "./pages/StudioLayout";
import WorkspacePage from "./pages/WorkspacePage";

function App() {
  return (
    <Router>
      <div className="app">
        <div className="content">
          <Routes>
            <Route
              path="/"
              element={<>
               <nav className="navbar">
                  <Link to="/">Strona główna</Link>
                  <span className="p-2">|</span>
                  <Link to="/studio">Studio</Link>
                </nav>
                <WorkspacePage/>
              </>
               
              }
            />
            <Route path="/studio" element={<Studio />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
