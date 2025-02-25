// src/paes/public/routes.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import CaseStudiesPage from './CaseStudiesPage';

const HomePage = lazy(() => import('@/pages/public/HomePage'));

const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));


const publicRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'casestudies', element: <CaseStudiesPage /> },

  { path: 'login', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default publicRoutes;
