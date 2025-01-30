// src/pages/documents/routes.tsx
import { RouteObject } from "react-router-dom";
import { DocumentList } from "./DocumentList";
import { DocumentContainerEdit } from "./DocumentContainerEdit";
import { DocumentContainerNew } from "./DocumentContainerNew";
import { ContainerDocuments } from "./ContainerDocuments";
import { DocumentNew } from "./DocumentNew";
import { DocumentEdit } from "./DocumentEdit";

const documentsRoutes: RouteObject[] = [
  { path: "documents", element: <DocumentList /> },
  { path: "documents/new", element: <DocumentContainerNew /> },
  { path: "documents/:id/edit", element: <DocumentContainerEdit /> },
  { path: "documents/:containerId", element: <ContainerDocuments /> },
  { path: "documents/:containerId/document/new", element: <DocumentNew /> },
  { path: "documents/:containerId/document/:documentId/edit", element: <DocumentEdit /> }
];

export default documentsRoutes;