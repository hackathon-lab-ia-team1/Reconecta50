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
import { AuthProvider } from '../features/auth/AuthProvider';
import { useAuth } from '../features/auth/useAuth';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorPage } from '../pages/ErrorPage';
import type { ReactNode } from 'react';
import { JobApplicationProvider } from '../features/jobs/JobApplicationProvider';

function SessionProviders({ children }: { children: ReactNode }) {
  const { sessionVersion } = useAuth();
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
        <Route element={<WorkspaceLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/curriculo" element={<ResumePage />} />
          <Route path="/minhas-vagas" element={<MyJobsPage />} />
          <Route path="/vagas-recomendadas" element={<RecommendedJobsPage />} />
        </Route>
        <Route path="*" element={<ErrorPage variant="notFound" />} />
      </Routes>
    </ErrorBoundary>
  );
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
