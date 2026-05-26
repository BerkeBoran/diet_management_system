import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const tree = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

const rootEl = document.getElementById('root');

// Prerendered HTML varsa hydrate et; aksi takdirde standart SPA render
if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, tree);
} else {
  ReactDOM.createRoot(rootEl).render(tree);
}
