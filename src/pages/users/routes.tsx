// src/pages/users/routes.tsx
import { RouteObject } from 'react-router-dom';
import UserList from './UserList';
import UserView from './UserView';
import UserEdit from './UserEdit';

const usersRoutes: RouteObject[] = [
  { index: true, element: <UserList /> },
  { path: ':userId/view', element: <UserView /> },
  { path: ':userId/edit', element: <UserEdit /> }
];

export default usersRoutes;