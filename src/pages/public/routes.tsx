import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import CaseStudiesPage from './CaseStudiesPage';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

const publicRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'about', element: <CaseStudiesPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default publicRoutes;
