import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { FormField } from '../../../components/FormField';
import { Button } from '../../../components/Button';
import styles from './ChangePasswordForm.module.css';

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordFormProps {
  onChangePassword: (data: PasswordChangeData) => Promise<void>;
}

const emptyValues = { currentPassword: '', newPassword: '', confirmation: '' };
type PasswordErrors = Partial<Record<keyof typeof emptyValues, string>>;

export function ChangePasswordForm({ onChangePassword }: ChangePasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const nextErrors: PasswordErrors = {};
    if (!values.currentPassword) nextErrors.currentPassword = 'Informe sua senha atual.';
    if (values.newPassword.length < 8 || !values.newPassword.trim())
      nextErrors.newPassword = 'Crie uma senha com pelo menos 8 caracteres.';
    else if (values.newPassword === values.currentPassword)
      nextErrors.newPassword = 'Escolha uma senha diferente da atual.';
    if (!values.confirmation) nextErrors.confirmation = 'Digite a nova senha novamente.';
    else if (values.newPassword !== values.confirmation)
      nextErrors.confirmation = 'As senhas precisam ser iguais.';
    setErrors(nextErrors);
    setMessage('');
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstError}"]`)?.focus();
      return;
    }
    setPending(true);
    setSuccess(false);
    try {
      await onChangePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      setMessage('Sua senha foi alterada com sucesso.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a senha. Tente novamente.',
      );
    } finally {
      setPending(false);
      setValues(emptyValues);
    }
  }

  return (
    <form className={styles.form} ref={formRef} onSubmit={submit} noValidate aria-busy={pending}>
      <fieldset disabled={pending}>
        <legend className={styles.legend}>Dados para alterar sua senha</legend>
        <FormField
          label="Senha atual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) => update('currentPassword', event.target.value)}
          error={errors.currentPassword}
          required
        />
        <FormField
          label="Nova senha"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          hint="Use pelo menos 8 caracteres. Você pode usar uma frase fácil de lembrar."
          value={values.newPassword}
          onChange={(event) => update('newPassword', event.target.value)}
          error={errors.newPassword}
          required
        />
        <FormField
          label="Confirme a nova senha"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          value={values.confirmation}
          onChange={(event) => update('confirmation', event.target.value)}
          error={errors.confirmation}
          required
        />
      </fieldset>
      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? 'Alterando senha…' : 'Alterar minha senha'}
        </Button>
      </div>
      {message && (
        <p className={styles.message} role={success ? 'status' : 'alert'}>
          {message}
        </p>
      )}
    </form>
  );
}
