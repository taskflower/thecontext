import { RouteObject, Navigate } from "react-router-dom";
import { lazy } from "react";

// Lazy loaded components
const ContainerEdit = lazy(() => import("./ContainerEdit"));
const ContainerDocuments = lazy(() =>
  import("./ContainerDocuments").then((module) => ({
    default: module.ContainerDocuments,
  }))
);
const ContainerList = lazy(() =>
  import("./ContainerList").then((module) => ({
    default: module.ContainerList,
  }))
);
const ContainerNew = lazy(() =>
  import("./ContainerNew").then((module) => ({
    default: module.ContainerNew,
  }))
);
const DocumentEdit = lazy(() =>
  import("./DocumentEdit").then((module) => ({
    default: module.DocumentEdit,
  }))
);
const DocumentNew = lazy(() =>
  import("./DocumentNew").then((module) => ({
    default: module.DocumentNew,
  }))
);
const AllDocuments = lazy(() =>
  import("./AllDocuments").then((module) => ({
    default: module.AllDocuments,
  }))
);

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
