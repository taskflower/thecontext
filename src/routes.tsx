// src/routes.tsx
import { RouteObject } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import publicRoutes from "@/pages/public/routes";

import boardsRoutes from "@/pages/boards/routes";
import tasksRoutes from "@/pages/tasks/routes"; 
import settingsRoutes from "@/pages/settings/routes";
import containerRoutes from "./pages/documents/routes";

export const routes: RouteObject[] = [
  {
    path: "/",
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
      { path: "documents/*", children: containerRoutes },
      { path: "boards/*", children: boardsRoutes },
      { path: "tasks/*", children: tasksRoutes },
      { path: "settings/*", children: settingsRoutes },
    ],
  },
];
