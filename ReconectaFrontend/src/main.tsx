import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppErrorFallback } from './app/AppErrorFallback';
import './styles/global.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={() => <AppErrorFallback />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
