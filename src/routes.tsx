// src/routes.tsx
import LanguageWrapper from "./components/common/LanguageWrapper";
import { Navigate, RouteObject } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import publicRoutes from "@/pages/public/routes";

import boardsRoutes from "@/pages/boards/routes";
import tasksRoutes from "@/pages/tasks/routes";
import settingsRoutes from "@/pages/settings/routes";
import containerRoutes from "./pages/documents/routes";
import usersRoutes from "@/pages/users/routes"; // Importujemy routingi dla użytkowników
import { LanguageProvider } from "./context/LanguageContext";
import ProjectRenderer from "@/components/projects/ProjectRenderer"; // Import nowego komponentu
import projectsRoutes from "./pages/projects/routes";

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
      { path: "projects", element: <ProjectRenderer /> }, // Keep existing projects route
      { path: ":projectSlug", element: <ProjectRenderer /> }, // Add dynamic project route
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
      { path: "documents/*", children: containerRoutes },
      { path: "boards/*", children: boardsRoutes },
      { path: "tasks/*", children: tasksRoutes },
      { path: "settings/*", children: settingsRoutes },
      { path: "users/*", children: usersRoutes },
      { path: "projects/*", children: projectsRoutes },
    ],
  },
];
