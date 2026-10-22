import authStyles from '../features/auth/components/AuthForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../features/auth/components/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { login } from '../features/auth/services/authService';
import { useAuth } from '../features/auth/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated, enterDemo } = useAuth();
  return (
    <AuthLayout
      eyebrow="BOM TER VOCÊ POR AQUI"
      title="Vamos nos reconectar?"
      description="Entre para cuidar do seu currículo e acompanhar suas oportunidades."
      helpLabel="Precisa de ajuda para entrar?"
      helpText="Informe seu CPF ou telefone com DDD e a senha do cadastro. Se ainda não tem conta, use Cadastre-se gratuitamente. O painel de demonstração permite conhecer os recursos sem entrar em uma conta."
    >
      <LoginForm
        onAuthenticate={async (credentials) => {
          const user = await login(credentials);
          setAuthenticated(true, user);
        }}
        onSuccess={() => {
          navigate('/dashboard');
        }}
        registerLink={
          <Link className={authStyles['text-button']} to="/cadastro">
            Cadastre-se gratuitamente
          </Link>
        }
      />
      {!isAuthenticated && (
        <div className={authStyles.signup}>
          <Link className={authStyles['text-button']} to="/dashboard" onClick={enterDemo}>
            Conhecer o painel de demonstração
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
