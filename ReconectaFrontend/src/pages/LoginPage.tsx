import authStyles from '../features/auth/components/AuthForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../features/auth/components/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { login } from '../features/auth/services/authService';
import { useAuth } from '../features/auth/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated } = useAuth();
  return (
    <AuthLayout
      eyebrow="BOM TER VOCÊ POR AQUI"
      title="Vamos nos reconectar?"
      description="Entre para cuidar do seu currículo e acompanhar suas oportunidades."
      helpLabel="Precisa de ajuda para entrar?"
      helpText="Informe seu CPF ou telefone com DDD e a senha do cadastro. Você também pode abrir a página de cadastro para conhecer o formulário. Nesta demonstração, o acesso e a criação de contas ainda não estão disponíveis."
    >
      <LoginForm
        onAuthenticate={login}
        onSuccess={() => {
          setAuthenticated(true);
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
          <Link className={authStyles['text-button']} to="/dashboard">
            Conhecer o painel de demonstração
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
