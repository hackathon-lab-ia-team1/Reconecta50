import authStyles from './AuthForm.module.css';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  IdCard,
  LockKeyhole,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react';
import { FormField } from '../../../components/FormField';
import { validateRegistration } from '../utils/validateRegistration';
import type {
  RegistrationData,
  RegistrationErrors,
  RegistrationValues,
} from '../types/registration';
import formStyles from './RegisterForm.module.css';

interface RegisterFormProps {
  onRegister: (data: RegistrationData) => Promise<void>;
  onSuccess?: () => void | Promise<void>;
}

const initialValues: RegistrationValues = {
  fullName: '',
  phone: '',
  cpf: '',
  birthDate: '',
  address: '',
  password: '',
};

export function RegisterForm({ onRegister, onSuccess }: RegisterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field: keyof RegistrationValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || success) return;
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setMessage('');
    const firstInvalid = (Object.keys(nextErrors) as (keyof RegistrationValues)[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setPending(true);
    try {
      await onRegister({
        fullName: values.fullName.trim(),
        phone: values.phone.replace(/\D/g, ''),
        cpf: values.cpf.replace(/\D/g, ''),
        birthDate: values.birthDate,
        address: values.address.trim(),
        password: values.password,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Não foi possível criar a conta. Tente novamente.',
      );
      setPending(false);
      return;
    }
    setValues(initialValues);
    setSuccess(true);
    setMessage('Cadastro realizado com sucesso! Você já pode entrar na sua conta.');
    try {
      await onSuccess?.();
    } catch {
      setMessage(
        'Sua conta foi criada, mas não foi possível abrir a próxima etapa. Use o link Entrar na minha conta para continuar.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className={formStyles.form}
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={pending}
    >
      <fieldset className={authStyles['form-fields']} disabled={pending || success}>
        <legend className={authStyles['visually-hidden']}>Seus dados de cadastro</legend>
        <FormField
          label="Nome completo"
          name="fullName"
          autoComplete="name"
          placeholder="Digite seu nome e sobrenome"
          icon={<UserRound size={20} aria-hidden="true" />}
          value={values.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          error={errors.fullName}
          required
        />
        <FormField
          label="Telefone com DDD"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Ex.: (85) 99999-9999"
          hint="Você usará este número para entrar na sua conta."
          icon={<Phone size={20} aria-hidden="true" />}
          value={values.phone}
          onChange={(event) => update('phone', event.target.value)}
          error={errors.phone}
          required
        />
        <FormField
          label="CPF"
          name="cpf"
          inputMode="numeric"
          placeholder="Ex.: 000.000.000-00"
          hint="Digite os 11 números do seu CPF, com ou sem pontuação."
          icon={<IdCard size={20} aria-hidden="true" />}
          value={values.cpf}
          onChange={(event) => update('cpf', event.target.value)}
          error={errors.cpf}
          required
        />
        <FormField
          label="Data de nascimento"
          name="birthDate"
          type="date"
          autoComplete="bday"
          hint="Informe sua data de nascimento."
          icon={<CalendarDays size={20} aria-hidden="true" />}
          value={values.birthDate}
          onChange={(event) => update('birthDate', event.target.value)}
          error={errors.birthDate}
          required
        />
        <FormField
          label="Endereço"
          name="address"
          autoComplete="street-address"
          placeholder="Rua, número, bairro, cidade e estado"
          hint="Inclua o complemento, se houver, ou informe sem número."
          icon={<MapPin size={20} aria-hidden="true" />}
          value={values.address}
          onChange={(event) => update('address', event.target.value)}
          error={errors.address}
          required
        />
        <FormField
          label="Crie uma senha"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Digite sua senha"
          hint="Use pelo menos 8 caracteres. Você pode usar uma frase fácil de lembrar."
          icon={<LockKeyhole size={20} aria-hidden="true" />}
          value={values.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
          required
        />
      </fieldset>
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
        {pending ? 'Criando sua conta…' : success ? 'Cadastro realizado' : 'Criar minha conta'}
        <ArrowRight size={21} aria-hidden="true" />
      </button>
      <div className={authStyles['signup']}>
        Já tem uma conta?{' '}
        <Link className={authStyles['text-button']} to="/login">
          Entrar na minha conta <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </form>
  );
}
