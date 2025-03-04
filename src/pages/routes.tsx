// src/routes.tsx

import { Navigate, RouteObject } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import publicRoutes from "@/pages/public/routes";
import tasksRoute from "@/pages/tasks/routes";
import scenariosRoute from "@/pages/scenarios/routes";
import documentsRoute from "@/pages/documents/routes";
import settingsRoutes from "@/pages/settings/routes";
import usersRoutes from "@/pages/users/routes";
import LanguageWrapper from "@/components/common/LanguageWrapper";
import { LanguageProvider } from "@/context/LanguageContext";

export const DEFAULT_LANGUAGE = "en";
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />,
  },
  {
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
      { path: "tasks/*", children: tasksRoute },
      { path: "scenarios/*", children: scenariosRoute },
      { path: "documents/*", children: documentsRoute },
      { path: "settings/*", children: settingsRoutes },
      { path: "users/*", children: usersRoutes },
    ],
  },
];
