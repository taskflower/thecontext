// src/paes/public/routes.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import CaseStudiesPage from './CaseStudiesPage';
import MarketingBackoffice from './Example-dashboard';
import SummerCampaignFlow from './Example-campagin';
import MarketingBackofficeFlow from './Example-flow';
import SmartHomeScenario from './Example-launch';
import EmailAutomationWorkflow from './Example-email';
import CateringMarketingDashboard from './Example-cattering';
import MarketingScenarioApp from './Example-mix';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
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
