import { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routes } from '@/routes';

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div>Ładowanie...</div>}>
        <AppRoutes />
      </Suspense>
    </Router>
  );
}
