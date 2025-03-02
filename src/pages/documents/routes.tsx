// src/pages/documents/routes.tsx
import { RouteObject } from "react-router-dom";
import DocumentsView from "./components/DocumentsView";

const documentRoutes: RouteObject[] = [
  { 
    index: true, 
    element: <DocumentsView /> 
  },
  { 
    path: ':folderId', 
    element: <DocumentsView /> 
  },
];

export default documentRoutes;