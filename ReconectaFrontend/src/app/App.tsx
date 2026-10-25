import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { FontScaleProvider } from '../features/accessibility/FontScaleProvider';
import { CareerProvider } from '../features/career/CareerProvider';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ResumePage } from '../pages/ResumePage';
import { MyJobsPage } from '../pages/MyJobsPage';
import { RecommendedJobsPage } from '../pages/RecommendedJobsPage';
import { TrainingPage } from '../pages/TrainingPage';
import { AuthProvider } from '../features/auth/AuthProvider';
import { useAuth } from '../features/auth/useAuth';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorPage } from '../pages/ErrorPage';
import type { ReactNode } from 'react';
import { JobApplicationProvider } from '../features/jobs/JobApplicationProvider';
import { Button } from '../components/Button';

function SessionProviders({ children }: { children: ReactNode }) {
  const { sessionVersion, checkingSession, sessionError, retrySession } = useAuth();
  if (checkingSession)
    return (
      <main>
        <p role="status">Verificando sua sessão…</p>
      </main>
    );
  if (sessionError)
    return (
      <main>
        <p role="alert">{sessionError}</p>
        <Button onClick={retrySession}>Tentar verificar novamente</Button>
      </main>
    );
  return (
    <CareerProvider key={sessionVersion}>
      <JobApplicationProvider>{children}</JobApplicationProvider>
    </CareerProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  return (
    <ErrorBoundary
      key={location.key}
      fallback={(retry) => <ErrorPage variant="unexpected" onRetry={retry} />}
    >
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route element={<WorkspaceAccess />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/curriculo" element={<ResumePage />} />
          <Route path="/minhas-vagas" element={<MyJobsPage />} />
          <Route path="/vagas-recomendadas" element={<RecommendedJobsPage />} />
          <Route path="/capacitacao" element={<TrainingPage />} />
        </Route>
        <Route path="*" element={<ErrorPage variant="notFound" />} />
      </Routes>
    </ErrorBoundary>
  );
}

function WorkspaceAccess() {
  const { isAuthenticated, isDemo } = useAuth();
  const connected = !!(import.meta.env.VITE_AUTH_LOGIN_URL || import.meta.env.VITE_AUTH_ME_URL);
  if (connected && !isAuthenticated && !isDemo) return <Navigate to="/login" replace />;
  return <WorkspaceLayout />;
}

export function App() {
  return (
    <FontScaleProvider>
      <AuthProvider>
        <BrowserRouter>
          <SessionProviders>
            <AppRoutes />
          </SessionProviders>
        </BrowserRouter>
      </AuthProvider>
    </FontScaleProvider>
  );
}
