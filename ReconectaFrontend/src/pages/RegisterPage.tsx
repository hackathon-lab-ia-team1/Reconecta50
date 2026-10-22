import { AuthLayout } from '../features/auth/components/AuthLayout';
import { RegisterForm } from '../features/auth/components/RegisterForm';

async function registerDemo() {
  throw new Error(
    'Esta é uma demonstração: seus dados foram validados, mas não foram enviados nem salvos. A criação de contas estará disponível em breve.',
  );
}

export function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="UM NOVO CAPÍTULO COMEÇA AQUI"
      title="Vamos criar sua conta?"
      description="Conte um pouco sobre você. É simples dar o primeiro passo para encontrar novas oportunidades."
      helpLabel="Precisa de ajuda para se cadastrar?"
      helpText="Preencha seu nome, telefone com DDD, CPF, data de nascimento e endereço. Crie uma senha com pelo menos 8 caracteres. Use o botão ao lado da senha para conferir o que digitou. Nesta demonstração, seus dados não são enviados nem salvos."
    >
      <RegisterForm onRegister={registerDemo} />
    </AuthLayout>
  );
}
