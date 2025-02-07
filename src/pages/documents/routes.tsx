import { RouteObject, Navigate } from "react-router-dom";

import ContainerEdit from "./ContainerEdit";
import { ContainerDocuments } from "./ContainerDocuments";
import { ContainerList } from "./ContainerList";
import { ContainerNew } from "./ContainerNew";
import { DocumentEdit } from "./DocumentEdit";
import { DocumentNew } from "./DocumentNew";
import { AllDocuments } from "./AllDocuments";

const documentsRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="containers" replace /> },
  { path: "containers", element: <ContainerList /> },
  { path: "containers/list", element: <ContainerList /> },
  { path: "containers/new", element: <ContainerNew /> },
  { path: "all", element: <AllDocuments /> },
  { path: ":id/edit", element: <ContainerEdit /> },
  { path: ":containerId", element: <ContainerDocuments /> },
  { path: ":containerId/document/new", element: <DocumentNew /> },
  { path: ":containerId/document/:documentId/edit", element: <DocumentEdit /> },
];

export default documentsRoutes;