// src/pages/users/routes.tsx
import { RouteObject } from 'react-router-dom';
import TasksPage from './TasksPage';


const usersRoutes: RouteObject[] = [
  { index: true, element: <TasksPage /> },
];

export default usersRoutes;