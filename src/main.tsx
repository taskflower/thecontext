import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
import 'reactflow/dist/style.css';
import './index.css';
import { PluginProvider } from './modules/plugins/pluginContext';

// Other imports like CSS, etc.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
    <PluginProvider>
      <App />
      </PluginProvider>
    </ThemeProvider>
  </React.StrictMode>
);