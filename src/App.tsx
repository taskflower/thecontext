/// src/App.tsx
import { BrowserRouter, useRoutes } from "react-router-dom";
import ConfigPage from "./pages/ConfigPage";
import Layout from "./layout/Layout";

function AppRoutes() {
  const routes = [
    { path: ":config/:workspace/:scenario/:step?", element: <ConfigPage /> },
    { path: ":config/:workspace", element: <ConfigPage /> },
    { path: "*", element: <div>Not found</div> }
  ];
  return useRoutes(routes);
}

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}
