// src/pages/users/routes.tsx
import { RouteObject } from 'react-router-dom';
import DocumentsPage from './DocumentsPage';


const usersRoutes: RouteObject[] = [
  { index: true, element: <DocumentsPage /> },
];

export default usersRoutes;