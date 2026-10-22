import authStyles from '../features/auth/components/AuthForm.module.css';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../features/auth/components/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { login } from '../features/auth/services/authService';

export function LoginPage() {
  return <AuthLayout
    eyebrow="BOM TER VOCÊ POR AQUI"
    title="Vamos nos reconectar?"
    description="Entre para cuidar do seu currículo e acompanhar suas oportunidades."
    helpLabel="Precisa de ajuda para entrar?"
    helpText="Informe seu CPF ou telefone com DDD e a senha do cadastro. Você também pode abrir a página de cadastro para conhecer o formulário. Nesta demonstração, o acesso e a criação de contas ainda não estão disponíveis."
  >
    <LoginForm onAuthenticate={login} successMessage="Acesso realizado com sucesso. Seu painel ainda não está disponível nesta versão." registerLink={<Link className={authStyles['text-button']} to="/cadastro">Cadastre-se gratuitamente</Link>} />
  </AuthLayout>;
}
