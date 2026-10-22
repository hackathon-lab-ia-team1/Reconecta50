import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { FilePenLine, Printer } from 'lucide-react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { TextAreaField } from '../components/TextAreaField';
import { LinkButton } from '../components/LinkButton';
import { ResumePreview } from '../features/career/components/ResumePreview';
import { ResumeAssistant } from '../features/career/components/ResumeAssistant';
import { generateResume } from '../features/career/services/resumeGenerationService';
import { useCareer } from '../features/career/useCareer';
import { normalizeResume, validateResume } from '../features/career/utils/validateResume';
import type { ResumeErrors } from '../features/career/utils/validateResume';
import type { ResumeDraft } from '../features/career/types/career';
import styles from './CareerPage.module.css';

export function ResumePage() {
  const { profile, resume, updateResume } = useCareer();
  const [draft, setDraft] = useState(resume);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ResumeErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const hasUnsavedChanges = JSON.stringify(normalizeResume(draft)) !== JSON.stringify(resume);

  useEffect(() => {
    if (manualOpen && !generating)
      formRef.current?.querySelector<HTMLElement>('[name="summary"]')?.focus();
  }, [manualOpen, generating]);

  function update(field: keyof ResumeDraft, value: string) {
    if (generating) return;
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage('');
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (generating) return;
    const nextErrors = validateResume(draft);
    setErrors(nextErrors);
    setMessage('');
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    updateResume(normalizeResume(draft));
    setMessage(
      'Prévia atualizada. Você pode imprimir ou escolher Salvar como PDF na janela de impressão.',
    );
  }
  return (
    <>
      <header className={`${styles.heading} ${styles.noPrint}`}>
        <span>SUA TRAJETÓRIA EM DESTAQUE</span>
        <h1 tabIndex={-1}>Meu currículo</h1>
        <p>Conte suas experiências com suas palavras. Aqui, cada aprendizado tem valor.</p>
      </header>
      {!profile.fullName && (
        <div className={`${styles.profileNotice} ${styles.noPrint}`}>
          <p>Preencha seu perfil para incluir seu nome e contato no currículo.</p>
          <LinkButton to="/perfil" variant="secondary">
            Preencher meu perfil
          </LinkButton>
        </div>
      )}
      <div className={styles.noPrint}>
        <ResumeAssistant
          onGenerate={generateResume}
          onPendingChange={setGenerating}
          manualAction={
            <Button
              variant="secondary"
              aria-expanded={manualOpen}
              aria-controls="resume-manual-editor"
              onClick={() => setManualOpen((open) => !open)}
            >
              <FilePenLine size={19} aria-hidden="true" />
              Preencher currículo manualmente
            </Button>
          }
          onGenerated={(generated) => {
            setDraft(generated);
            updateResume(generated);
            setManualOpen(true);
            setErrors({});
            setMessage(
              'Currículo atualizado automaticamente. Confira os campos e ajuste o que precisar antes de imprimir.',
            );
          }}
        />
      </div>
      <div className={`${styles.resumeGrid} ${!manualOpen ? styles.resumeGridCollapsed : ''}`}>
        <section
          id="resume-manual-editor"
          hidden={!manualOpen}
          className={`${styles.panel} ${styles.noPrint}`}
          aria-labelledby="resume-editor-title"
        >
          <h2 id="resume-editor-title">Vamos organizar sua história</h2>
          <p>Comece com uma experiência de trabalho que você gostaria de destacar.</p>
          {generating && (
            <p role="status">
              Aguarde a criação com IA terminar ou cancele para editar manualmente.
            </p>
          )}
          <form ref={formRef} onSubmit={submit} noValidate aria-busy={generating}>
            <fieldset className={styles.resumeFields} disabled={generating}>
              <legend className={styles.visuallyHidden}>Dados do currículo</legend>
              <TextAreaField
                label="Apresentação profissional"
                name="summary"
                hint="Conte em poucas frases o que você faz e quais são seus pontos fortes."
                value={draft.summary}
                onChange={(event) => update('summary', event.target.value)}
                error={errors.summary}
                required
              />
              <FormField
                label="Função ou trabalho"
                name="role"
                placeholder="Ex.: Recepcionista"
                value={draft.role}
                onChange={(event) => update('role', event.target.value)}
                error={errors.role}
                required
              />
              <FormField
                label="Empresa ou local de trabalho (opcional)"
                name="company"
                value={draft.company}
                onChange={(event) => update('company', event.target.value)}
              />
              <FormField
                label="Período (opcional)"
                name="period"
                placeholder="Ex.: 2018 a 2024"
                value={draft.period}
                onChange={(event) => update('period', event.target.value)}
              />
              <TextAreaField
                label="O que você fazia nesse trabalho?"
                name="activities"
                value={draft.activities}
                onChange={(event) => update('activities', event.target.value)}
              />
              <TextAreaField
                label="Suas habilidades (opcional)"
                name="skills"
                hint="Separe por vírgulas. Ex.: organização, atendimento, trabalho em equipe."
                value={draft.skills}
                onChange={(event) => update('skills', event.target.value)}
                rows={3}
              />
              <div className={styles.actions}>
                <Button type="submit">Atualizar prévia do currículo</Button>
              </div>
            </fieldset>
            {message && (
              <p className={styles.feedback} role="status">
                {message}
              </p>
            )}
          </form>
        </section>
        <div>
          <ResumePreview profile={profile} resume={resume} />
        </div>
      </div>
      <div className={`${styles.printActions} ${styles.noPrint}`}>
        <Button
          variant="secondary"
          onClick={() => window.print()}
          disabled={generating || hasUnsavedChanges || !resume.summary || !profile.fullName}
        >
          <Printer size={19} aria-hidden="true" />
          Imprimir / salvar em PDF
        </Button>
      </div>
      {hasUnsavedChanges && !generating && (
        <p className={`${styles.feedback} ${styles.noPrint}`}>
          Atualize o currículo para incluir suas alterações no PDF.
        </p>
      )}
    </>
  );
}
