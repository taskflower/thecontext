// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from 'react-router-dom';
import TasksPage from './TasksPage';
import { TaskVisualizer } from '@/components/tasks/TaskVisualizer';
import TaskFlow from './TaskFlow/TaskFlow';
import TaskStepView from './TaskFlow/task-steps/components/TaskStepView';




const taskRoutes: RouteObject[] = [
  { index: true, element: <TasksPage /> },
  { path: ':userId/view', element: <TaskVisualizer taskId={''} /> },
  { path: 'flow', element: <TaskFlow/> },
  { path: 'step', element: < TaskStepView/> },
 

];

export default taskRoutes;