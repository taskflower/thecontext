import { RouteObject } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import publicRoutes from "@/pages/public/routes";
import tasksRoutes from "./pages/tasks/routes";
import boardsRoutes from "./pages/boards/routes";
import documentsRoutes from "./pages/documents/routes";
import settingsRoutes from "./pages/settings/routes";

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [...publicRoutes],
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      ...tasksRoutes,
      ...boardsRoutes,
      ...documentsRoutes,
      ...settingsRoutes,
    ],
  },
];
