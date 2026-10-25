import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../../../components/Button';
import { ResumeInterviewSection } from './ResumeInterviewSection';
import { emptyInterview, interviewSections, interviewToText } from '../types/resumeInterview';
import type { InterviewField, ResumeInterview } from '../types/resumeInterview';
import type { GenerateResume } from '../types/resumeGeneration';
import type { ResumeDraft } from '../types/career';
import styles from './ResumeAssistant.module.css';

const LOADING_MESSAGES = [
  'Lendo suas experiências...',
  'A IA está formalizando suas competências profissionais...',
  'Quase pronto! Organizando a apresentação do seu currículo...',
] as const;

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
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onBusyChange?.(active !== null);
  }, [active, onBusyChange]);

  useEffect(() => {
    if (!pending) {
      setLoadingStage(0);
      return;
    }
    setLoadingStage(0);
    const stage1Timer = window.setTimeout(() => {
      setLoadingStage(1);
    }, 5000);
    const stage2Timer = window.setTimeout(() => {
      setLoadingStage(2);
    }, 12000);
    return () => {
      window.clearTimeout(stage1Timer);
      window.clearTimeout(stage2Timer);
    };
  }, [pending]);

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
        targetRole: resume.targetRole?.trim() || values.targetRole.trim(),
        education: resume.education?.trim() || values.education.trim(),
        languages: resume.languages?.trim() || 'Português (Nativo/Fluente)',
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
      <h2 id="voice-interview-title">Monte seu currículo em 4 passos simples</h2>
      <p>
        Responda às <strong>4 perguntas fundamentais</strong> abaixo falando no microfone ou
        digitando. O idioma Português já é incluído automaticamente como nativo. A função desejada e
        suas experiências são necessárias; as outras duas etapas são opcionais.
      </p>
      {interviewSections.map((section, index) => (
        <ResumeInterviewSection
          key={section.key}
          field={section.key}
          title={`${index + 1}. ${section.title}`}
          hint={section.hint}
          value={values[section.key]}
          active={active}
          pending={pending}
          featured={section.key === 'experience'}
          onActive={setActive}
          onChange={(value) => {
            setValues((current) => ({ ...current, [section.key]: value }));
            setError('');
            setCompleted(false);
          }}
        />
      ))}
      <p>
        Confira os textos antes de finalizar. O currículo criado atualizará a prévia abaixo
        automaticamente.
      </p>
      <div className={styles.actions}>
        <Button disabled={pending || active !== null} onClick={() => void generate()}>
          {pending ? LOADING_MESSAGES[loadingStage] : 'Criar currículo com os textos das etapas'}
        </Button>
        {pending && (
          <Button variant="secondary" onClick={cancel}>
            Cancelar criação
          </Button>
        )}
      </div>
      {pending && (
        <div role="status" className={styles.loadingProgressBanner}>
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <strong>{LOADING_MESSAGES[loadingStage]}</strong>
        </div>
      )}
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
