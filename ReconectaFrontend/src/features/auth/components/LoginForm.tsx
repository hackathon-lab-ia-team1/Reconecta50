import authStyles from './AuthForm.module.css';
import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowRight, LockKeyhole, UserRound, CircleAlert, CheckCircle2 } from 'lucide-react';
import { FormField } from '../../../components/FormField';
import type { LoginCredentials } from '../types/login';

export interface LoginFormProps {
  onAuthenticate: (credentials: LoginCredentials) => Promise<void>;
  onSuccess?: () => void | Promise<void>;
  onRegister?: () => void;
  onForgotPassword?: () => void;
  successMessage?: string;
  registerLink?: ReactNode;
}

export function LoginForm({
  onAuthenticate,
  onSuccess,
  onRegister,
  onForgotPassword,
  registerLink,
  successMessage = 'Acesso realizado com sucesso.',
}: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || success) return;
    const nextErrors = {
      identifier: !identifier.trim()
        ? 'Informe seu CPF ou telefone.'
        : !/^\d{10,11}$/.test(identifier.replace(/\D/g, '')) || /[^\d\s().+-]/.test(identifier)
          ? 'Informe um CPF com 11 dígitos ou telefone com DDD.'
          : undefined,
      password: !password ? 'Informe sua senha.' : undefined,
    };
    setErrors(nextErrors);
    setMessage('');
    if (nextErrors.identifier || nextErrors.password) {
      (nextErrors.identifier ? identifierRef : passwordRef).current?.focus();
      return;
    }
    setPending(true);
    try {
      await onAuthenticate({ identifier: identifier.replace(/\D/g, ''), password });
    } catch (error) {
      setMessage(
        error instanceof TypeError ||
          (error instanceof DOMException && error.name === 'TimeoutError')
          ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
          : error instanceof Error
            ? error.message
            : 'Não foi possível entrar. Tente novamente.',
      );
      setPending(false);
      return;
    }

    setPassword('');
    setSuccess(true);
    setMessage(successMessage);
    try {
      await onSuccess?.();
    } catch {
      setMessage(
        'Seu acesso foi realizado, mas não foi possível abrir a próxima etapa. Recarregue a página para continuar.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}>
      <fieldset className={authStyles['form-fields']} disabled={pending || success}>
        <legend className={authStyles['visually-hidden']}>Dados de acesso</legend>
        <FormField
          ref={identifierRef}
          label="CPF ou telefone"
          name="username"
          autoComplete="username"
          inputMode="tel"
          placeholder="Digite seu CPF ou telefone com DDD"
          icon={<UserRound size={20} aria-hidden="true" />}
          value={identifier}
          onChange={(event) => {
            setIdentifier(event.target.value);
            setErrors((current) => ({ ...current, identifier: undefined }));
          }}
          error={errors.identifier}
          hint="Use os dados informados no seu cadastro."
          required
        />
        <FormField
          ref={passwordRef}
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          icon={<LockKeyhole size={20} aria-hidden="true" />}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          required
        />
      </fieldset>
      <div className={authStyles['recovery']}>
        <button
          type="button"
          className={authStyles['text-button']}
          onClick={() => {
            if (onForgotPassword) {
              onForgotPassword();
              return;
            }
            setMessage('A recuperação de senha ainda não está disponível nesta versão.');
          }}
        >
          Esqueci minha senha
        </button>
      </div>
      {message && (
        <div
          className={`${authStyles['form-message']} ${success ? authStyles['success'] : ''}`}
          role={success ? 'status' : 'alert'}
        >
          {success ? (
            <CheckCircle2 size={21} aria-hidden="true" />
          ) : (
            <CircleAlert size={21} aria-hidden="true" />
          )}
          <span>{message}</span>
        </div>
      )}
      <button className={authStyles['primary-button']} type="submit" disabled={pending || success}>
        {pending ? 'Entrando…' : success ? 'Acesso realizado' : 'Entrar na minha conta'}
        <ArrowRight size={21} aria-hidden="true" />
      </button>
      <div className={`${authStyles['signup']} ${authStyles['signup-card']}`}>
        <p className={authStyles['signup-prompt']}>
          Primeira vez por aqui? Crie sua conta gratuita em 1 minuto.
        </p>
        {registerLink ?? (
          <button
            className={authStyles['signup-cta']}
            type="button"
            onClick={() => {
              if (onRegister) {
                onRegister();
                return;
              }
              setMessage(
                'O cadastro estará disponível em breve. Esta versão apresenta a tela de login.',
              );
            }}
          >
            Cadastre-se gratuitamente <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
