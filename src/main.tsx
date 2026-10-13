import React from 'react';
import ReactDOM from 'react-dom/client';
import { CrmProvider } from './context/CrmContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CrmProvider>
      <App />
    </CrmProvider>
  </React.StrictMode>
);
