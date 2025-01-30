// src/pages/documents/routes.tsx
import { RouteObject } from "react-router-dom";
import { Settings } from "./Settings";


const settingsRoutes: RouteObject[] = [
  { path: "settings", element: <Settings /> },
 
];

export default settingsRoutes;