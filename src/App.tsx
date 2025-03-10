import { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routes } from './pages/routes';
import StepWizard from './pages/steps/StepWizard';


function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
 
  return (
    <Router>
      <Suspense fallback={<div>Ładowanie...</div>}>
        <AppRoutes />
        <StepWizard />
      </Suspense>
    </Router>
  );
}
