import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../../../components/Button';
import { TextAreaField } from '../../../components/TextAreaField';
import { ResumeInterviewSection } from './ResumeInterviewSection';
import { emptyInterview, interviewSections, interviewToText } from '../types/resumeInterview';
import type { InterviewField, ResumeInterview } from '../types/resumeInterview';
import type { GenerateResume } from '../types/resumeGeneration';
import type { ResumeDraft } from '../types/career';
import styles from './ResumeAssistant.module.css';
import { useEffect } from 'react';

interface Props {
  onGenerate: GenerateResume;
  onGenerated: (resume: ResumeDraft) => void;
  onPendingChange?: (pending: boolean) => void;
  manualAction?: ReactNode;
  onBusyChange?: (busy: boolean) => void;
}

export function ResumeVoiceInterview({
  onGenerate,
  onGenerated,
  onPendingChange,
  manualAction,
  onBusyChange,
}: Props) {
  const [values, setValues] = useState<ResumeInterview>(emptyInterview);
  const [active, setActive] = useState<InterviewField | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => {
    onBusyChange?.(active !== null);
  }, [active, onBusyChange]);
  useEffect(
    () => () => {
      requestRef.current?.abort();
      requestRef.current = null;
    },
    [],
  );
  function cancel() {
    requestRef.current?.abort();
    requestRef.current = null;
    setPending(false);
    onPendingChange?.(false);
  }
  async function generate() {
    if (requestRef.current || active) return;
    if (!values.targetRole.trim() || !values.experience.trim()) {
      setError('Informe a função que procura e suas experiências. As outras etapas são opcionais.');
      return;
    }
    const text = interviewToText(values);
    if (text.length > 12000) {
      setError(
        'O conjunto dos textos ultrapassa 12.000 caracteres. Revise os textos antes de enviar. Suas gravações continuam disponíveis.',
      );
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(true);
    onPendingChange?.(true);
    setError('');
    setCompleted(false);
    try {
      const resume = await onGenerate(
        { source: 'text', text, sections: { ...values } },
        controller.signal,
      );
      if (requestRef.current !== controller || controller.signal.aborted) return;
      onGenerated({
        ...resume,
        targetRole: values.targetRole.trim(),
        education: values.education.trim(),
        languages: values.languages.trim(),
        additionalContacts: values.additionalContacts.trim(),
      });
      setCompleted(true);
    } catch (cause) {
      if (requestRef.current === controller && !controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível criar o currículo. Tente novamente.',
        );
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setPending(false);
        onPendingChange?.(false);
      }
    }
  }
  return (
    <section
      className={styles.assistant}
      aria-labelledby="voice-interview-title"
      aria-busy={pending}
    >
      <h2 id="voice-interview-title">Monte seu currículo por etapas</h2>
      <p>
        Grave um áudio para cada uma das cinco primeiras partes e revise o texto que aparecer. No
        passo 6, digite ou cole os links de contato. Você pode repetir a gravação para acrescentar
        informações. A função desejada e as experiências são necessárias; as outras partes são
        opcionais.
      </p>
      <p>
        A transcrição usa o serviço de voz do seu navegador e pode precisar de internet. Ao gravar,
        sua fala pode ser processada pelo provedor do navegador. Apenas os textos revisados serão
        enviados ao serviço de IA quando você escolher criar o currículo.
      </p>
      {interviewSections.map((section, index) =>
        section.key === 'additionalContacts' ? (
          <section key={section.key} className={styles.interviewStep}>
            <h3>
              {index + 1}. {section.title}
            </h3>
            <TextAreaField
              label="Links de contato (opcional)"
              hint="Digite ou cole o link do LinkedIn, portfólio ou outro endereço profissional. Use uma linha para cada link."
              placeholder="https://www.linkedin.com/in/seu-perfil"
              rows={3}
              value={values.additionalContacts}
              disabled={pending}
              onChange={(event) => {
                setValues((current) => ({ ...current, additionalContacts: event.target.value }));
                setError('');
                setCompleted(false);
              }}
            />
          </section>
        ) : (
          <ResumeInterviewSection
            key={section.key}
            field={section.key}
            title={`${index + 1}. ${section.title}`}
            hint={section.hint}
            value={values[section.key]}
            active={active}
            pending={pending}
            onActive={setActive}
            onChange={(value) => {
              setValues((current) => ({ ...current, [section.key]: value }));
              setError('');
              setCompleted(false);
            }}
          />
        ),
      )}
      <p>
        Confira os textos, especialmente nomes, e-mails e links. O currículo criado substituirá a
        prévia atual automaticamente.
      </p>
      <div className={styles.actions}>
        <Button disabled={pending || active !== null} onClick={() => void generate()}>
          {pending ? 'Organizando seu currículo…' : 'Criar currículo com os textos das etapas'}
        </Button>
        {pending && (
          <Button variant="secondary" onClick={cancel}>
            Cancelar criação
          </Button>
        )}
      </div>
      {manualAction && <div className={styles.actions}>{manualAction}</div>}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {completed && (
        <p role="status">
          Currículo atualizado. Confira as informações e baixe o PDF quando estiver pronto.
        </p>
      )}
    </section>
  );
}
