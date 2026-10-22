import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { FontScaleProvider } from '../features/accessibility/FontScaleProvider';

export function App() {
  return <FontScaleProvider><BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter></FontScaleProvider>;
}
