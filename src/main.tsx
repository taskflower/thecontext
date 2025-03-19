// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';
import { loadPlugins } from './modules/plugin/loader';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
loadPlugins();
root.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);