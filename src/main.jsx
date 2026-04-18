import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Providers } from './app/provider.jsx';
import { bootstrapAppData } from './app/bootstrapData.js';
import './index.css';

bootstrapAppData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);