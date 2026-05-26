import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { renderToString } from 'react-dom/server';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

export function render(url) {
  const helmetContext = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StaticRouter>
    </HelmetProvider>
  );
  return { html, helmet: helmetContext.helmet };
}
