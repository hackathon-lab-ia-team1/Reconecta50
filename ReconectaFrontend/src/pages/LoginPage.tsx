import authStyles from '../features/auth/components/AuthForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '../features/auth/components/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { login } from '../features/auth/services/authService';
import { useAuth } from '../features/auth/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();
  return (
    <AuthLayout
      eyebrow="BOM TER VOCÊ POR AQUI"
      title="Vamos nos reconectar?"
      description="Entre para cuidar do seu currículo e acompanhar suas oportunidades."
      helpLabel="Precisa de ajuda para entrar?"
      helpText="Informe seu CPF ou telefone com DDD e a senha do cadastro. Se ainda não tem conta, use Cadastre-se gratuitamente."
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
          <Link className={authStyles['signup-cta']} to="/cadastro">
            Cadastre-se gratuitamente
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        }
      />
    </AuthLayout>
  );
}
