// src/pages/documents/routes.tsx
import { RouteObject } from "react-router-dom";
import { DocumentList } from "./DocumentList";
import { DocumentContainerEdit } from "./DocumentContainerEdit";
import { DocumentContainerNew } from "./DocumentContainerNew";
import { ContainerDocuments } from "./ContainerDocuments";
import { DocumentNew } from "./DocumentNew";
import { DocumentEdit } from "./DocumentEdit";

const documentsRoutes: RouteObject[] = [
  { index: true, element: <DocumentList /> },
  { path: "new", element: <DocumentContainerNew /> },
  { path: ":id/edit", element: <DocumentContainerEdit /> },
  { path: ":containerId", element: <ContainerDocuments /> },
  { path: ":containerId/document/new", element: <DocumentNew /> },
  { path: ":containerId/document/:documentId/edit", element: <DocumentEdit /> }
];

export default documentsRoutes;