// src/paes/public/routes.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import CaseStudiesPage from './CaseStudiesPage';







const HomePage = lazy(() => import('@/pages/public/HomePage'));
const MarketingScenarioApp = lazy(() => import('@/pages/public/Example-mix'));
const CateringMarketingDashboard = lazy(() => import('@/pages/public/Example-cattering'));
const EmailAutomationWorkflow = lazy(() => import('@/pages/public/Example-email'));
const SmartHomeScenario = lazy(() => import('@/pages/public/Example-launch'));
const MarketingBackofficeFlow = lazy(() => import('@/pages/public/Example-flow'));
const SummerCampaignFlow = lazy(() => import('@/pages/public/Example-campagin'));
const MarketingBackoffice = lazy(() => import('@/pages/public/Example-dashboard'));

const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));


const publicRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'casestudies', element: <CaseStudiesPage /> },
  { path: 'example-dashboard', element: <MarketingBackoffice /> },
  { path: 'example-campagin', element: <SummerCampaignFlow /> },
  { path: 'example-flow', element: <MarketingBackofficeFlow /> },
  { path: 'example-launch', element: <SmartHomeScenario /> },
  { path: 'example-email', element: <EmailAutomationWorkflow /> },
  { path: 'example-cattering', element: <CateringMarketingDashboard /> },
  { path: 'example-mix', element: < MarketingScenarioApp /> },
  

 
  { path: 'login', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default publicRoutes;
