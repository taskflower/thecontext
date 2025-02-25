// src/routes/documentsRoutes.tsx
import { RouteObject, Navigate } from 'react-router-dom';
import ContainerEdit from '@/pages/documents/ContainerEdit';
import AllDocuments from '@/pages/documents/AllDocuments';
import ContainerDocuments from '@/pages/documents/ContainerDocuments';
import ContainerList from '@/pages/documents/ContainerList';
import ContainerNew from '@/pages/documents/ContainerNew';
import DocumentEdit from '@/pages/documents/DocumentEdit';
import DocumentNew from '@/pages/documents/DocumentNew';
import ContainerRelations from './ContainerRelations';
import ContainersManager from './ContainersManager';
import { AIRagnarokPage } from './AIRagnarokPage';


const documentsRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="containers" replace /> },
  { path: 'all', element: <AllDocuments /> },
  { path: 'manager', element: <ContainersManager /> },
  { path: 'ragnarok', element: <AIRagnarokPage /> },
  { path: 'containers', element: <ContainerList /> },
  { path: 'containers/list', element: <ContainerList /> },
  { path: 'containers/new', element: <ContainerNew /> },
  { path: ':id/edit', element: <ContainerEdit /> },
  { path: ':containerId/relations', element: <ContainerRelations /> },
  { path: ':containerId', element: <ContainerDocuments /> },
  { path: ':containerId/document/new', element: <DocumentNew /> },
  { path: ':containerId/document/:documentId/edit', element: <DocumentEdit /> },
];

export default documentsRoutes;
