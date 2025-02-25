// src/routes.tsx
import LanguageWrapper from "./components/common/LanguageWrapper";
import { Navigate, RouteObject } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import publicRoutes from "@/pages/public/routes";
import documentsRoute from "@/pages/ragnarokDocuments/routes"
import tasksRoute from "@/pages/ragnarokTasks/routes"
import settingsRoutes from "@/pages/settings/routes";
import usersRoutes from "@/pages/users/routes"; // Importujemy routingi dla użytkowników
import { LanguageProvider } from "./context/LanguageContext";


export const DEFAULT_LANGUAGE = "en";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />,
  },
  {
    // Publiczne routy opakowane w LanguageWrapper (zapewnia I18nProvider)
    path: "/:lang",
    element: (
      <LanguageWrapper>
        <MainLayout />
      </LanguageWrapper>
    ),
    children: [
      ...publicRoutes,
      // { path: "projects", element: <ProjectRenderer /> }, // Keep existing projects route
      // { path: ":projectSlug", element: <ProjectRenderer /> }, // Add dynamic project route
    ],
  },
  {
    // Admin routy opakowane w dodatkowy LanguageProvider oraz LanguageWrapper
    path: "/admin/:lang",
    element: (
      <LanguageProvider>
        <LanguageWrapper>
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        </LanguageWrapper>
      </LanguageProvider>
    ),
    children: [

      { path: "documents/*", children: documentsRoute },
      { path: "tasks/*", children: tasksRoute },
      { path: "settings/*", children: settingsRoutes },
      { path: "users/*", children: usersRoutes },

    ],
  },
];
