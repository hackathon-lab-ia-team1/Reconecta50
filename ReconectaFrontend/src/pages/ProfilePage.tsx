import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { LinkButton } from '../components/LinkButton';
import { useCareer } from '../features/career/useCareer';
import { useAuth } from '../features/auth/useAuth';
import { ChangePasswordForm } from '../features/auth/components/ChangePasswordForm';
import { validateProfile } from '../features/career/utils/validateProfile';
import type { ProfileErrors } from '../features/career/utils/validateProfile';
import styles from './CareerPage.module.css';
import profileStyles from './ProfilePage.module.css';

async function changePasswordDemo() {
  throw new Error(
    'A alteração de senha ainda não está disponível nesta versão. Nenhuma senha foi alterada ou salva.',
  );
}

export function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { profileStatus, profileError, reloadProfile } = useCareer();
  const loading = isAuthenticated && (profileStatus === 'idle' || profileStatus === 'loading');
  const failed = isAuthenticated && profileStatus === 'error';
  return (
    <>
      <header className={styles.heading}>
        <span>UM POUCO SOBRE VOCÊ</span>
        <h1 tabIndex={-1}>Meu perfil</h1>
        <p>Deixe seus dados de contato prontos para os próximos passos.</p>
      </header>
      {loading ? (
        <p role="status">Carregando seus dados…</p>
      ) : failed ? (
        <div className={styles.panel}>
          <p role="alert">{profileError}</p>
          <div className={styles.actions}>
            <Button onClick={() => void reloadProfile()}>Tentar carregar novamente</Button>
          </div>
        </div>
      ) : (
        <ProfileEditor />
      )}
    </>
  );
}

function ProfileEditor() {
  const { profile, updateProfile } = useCareer();
  const [draft, setDraft] = useState(profile);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);
    setMessage('');
    const firstInvalid = (Object.keys(nextErrors) as (keyof typeof draft)[]).find(
      (key) => nextErrors[key],
    );
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    updateProfile({
      fullName: draft.fullName.trim(),
      phone: draft.phone.trim(),
      birthDate: draft.birthDate,
      address: draft.address.trim(),
      email: draft.email?.trim() ?? '',
    });
    setMessage('Perfil atualizado nesta prévia. Seus dados já podem ser usados no currículo.');
  }

  return (
    <>
      <div className={profileStyles.grid}>
        <section
          className={`${styles.panel} ${profileStyles.panel}`}
          aria-labelledby="profile-form-title"
        >
          <h2 id="profile-form-title">Como podemos apresentar você?</h2>
          <form ref={formRef} onSubmit={submit} noValidate>
            <FormField
              label="E-mail (opcional)"
              name="email"
              type="email"
              autoComplete="email"
              hint="Será incluído no seu currículo para contato."
              value={draft.email ?? ''}
              onChange={(event) => {
                setDraft((current) => ({ ...current, email: event.target.value }));
                setErrors((current) => ({ ...current, email: undefined }));
                setMessage('');
              }}
              error={errors.email}
            />
            <FormField
              label="Nome completo"
              name="fullName"
              autoComplete="name"
              value={draft.fullName}
              onChange={(event) => {
                setDraft({ ...draft, fullName: event.target.value });
                setErrors((current) => ({ ...current, fullName: undefined }));
                setMessage('');
              }}
              error={errors.fullName}
              required
            />
            <FormField
              label="Telefone com DDD"
              name="phone"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              hint="Use o número pelo qual você prefere ser contatado."
              value={draft.phone}
              onChange={(event) => {
                setDraft({ ...draft, phone: event.target.value });
                setErrors((current) => ({ ...current, phone: undefined }));
                setMessage('');
              }}
              error={errors.phone}
              required
            />
            <FormField
              label="Data de nascimento"
              name="birthDate"
              type="date"
              autoComplete="bday"
              hint="Informe sua data de nascimento."
              value={draft.birthDate}
              onChange={(event) => {
                setDraft({ ...draft, birthDate: event.target.value });
                setErrors((current) => ({ ...current, birthDate: undefined }));
                setMessage('');
              }}
              error={errors.birthDate}
              required
            />
            <FormField
              label="Endereço"
              name="address"
              autoComplete="street-address"
              placeholder="Rua, número, bairro, cidade e estado"
              value={draft.address}
              onChange={(event) => {
                setDraft({ ...draft, address: event.target.value });
                setErrors((current) => ({ ...current, address: undefined }));
                setMessage('');
              }}
              error={errors.address}
              required
            />
            <div className={styles.actions}>
              <Button type="submit">Atualizar meu perfil</Button>
              <LinkButton to="/curriculo" variant="secondary">
                Ir para meu currículo
                <ArrowRight size={18} aria-hidden="true" />
              </LinkButton>
            </div>
            {message && (
              <p className={styles.feedback} role="status">
                {message}
              </p>
            )}
          </form>
        </section>
        <section
          className={`${styles.panel} ${profileStyles.panel}`}
          aria-labelledby="password-title"
        >
          <h2 id="password-title">Alterar senha</h2>
          <p>
            Para mudar apenas a senha, preencha os campos abaixo. Seus outros dados não serão
            alterados.
          </p>
          <ChangePasswordForm onChangePassword={changePasswordDemo} />
        </section>
      </div>
    </>
  );
}
