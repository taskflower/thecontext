// Then update your routes.tsx to use this layout
// src/pages/tasks/routes.tsx
import { RouteObject } from 'react-router-dom';
import TaskNavigator from './components/navigator/TaskNavigator';



const taskRoutes: RouteObject[] = [
  
      { index: true, element: <TaskNavigator /> },
      { path: 'navigator', element: <TaskNavigator /> },

  
];

export default taskRoutes;