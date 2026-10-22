import { AuthLayout } from '../features/auth/components/AuthLayout';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { register } from '../features/auth/services/authService';
import { useAuth } from '../features/auth/useAuth';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();
  return (
    <AuthLayout
      eyebrow="UM NOVO CAPÍTULO COMEÇA AQUI"
      title="Vamos criar sua conta?"
      description="Conte um pouco sobre você. É simples dar o primeiro passo para encontrar novas oportunidades."
      helpLabel="Precisa de ajuda para se cadastrar?"
      helpText="Preencha seu nome, telefone com DDD, CPF, data de nascimento e endereço. Crie uma senha com pelo menos 8 caracteres. Use o botão ao lado da senha para conferir o que digitou. Após criar a conta, você entrará no seu painel."
    >
      <RegisterForm
        onRegister={async (data) => {
          const user = await register(data);
          setAuthenticated(true, user);
        }}
        onSuccess={() => navigate('/dashboard', { replace: true })}
      />
    </AuthLayout>
  );
}
