// Build-time prerender — react-dom/server.renderToString ile landing'i statik HTML'e çevirir.
// Çağrı sırası: vite build (client) → vite build --ssr entry-server (Node bundle) → bu script
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const ROUTES = ['/']; // sadece landing — diğer route'lar SPA olarak kalır
const TEMPLATE_PATH = path.join(root, 'dist', 'index.html');
const SSR_ENTRY = path.join(root, 'dist-ssr', 'entry-server.js');

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const { render } = await import(SSR_ENTRY);

for (const url of ROUTES) {
  const { html, helmet } = render(url);

  let output = template.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`,
  );

  if (helmet) {
    const headInject = [
      helmet.title?.toString() ?? '',
      helmet.meta?.toString() ?? '',
      helmet.link?.toString() ?? '',
    ].join('');
    if (headInject) {
      output = output.replace('</head>', `${headInject}</head>`);
    }
  }

  const outPath =
    url === '/'
      ? path.join(root, 'dist', 'index.html')
      : path.join(root, 'dist', url.replace(/^\//, ''), 'index.html');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');
  console.log(`✓ prerendered ${url} → ${path.relative(root, outPath)}`);
}

// SSR bundle artık gereksiz — dist'i temiz tut
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
