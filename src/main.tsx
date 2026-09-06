import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { ToastProvider } from '@/components/Toast';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/textures.css';
import '@/styles/layout.css';

const el = document.getElementById('root');
if (!el) throw new Error('Root element missing');

createRoot(el).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);
