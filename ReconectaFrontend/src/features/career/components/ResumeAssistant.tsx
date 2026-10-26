import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../../components/Button';
import type { ResumeDraft } from '../types/career';
import type { GenerateResume } from '../types/resumeGeneration';
import styles from './ResumeAssistant.module.css';
import { ResumeVoiceInterview } from './ResumeVoiceInterview';

interface ResumeAssistantProps {
  onGenerate: GenerateResume;
  onGenerated: (resume: ResumeDraft) => void;
  manualAction?: ReactNode;
  onPendingChange?: (pending: boolean) => void;
  audioGenerationAvailable?: boolean;
  guidedAudio?: boolean;
  isResumeReady?: boolean;
}

export function ResumeAssistant({
  onGenerate,
  onGenerated,
  manualAction,
  onPendingChange,
  isResumeReady = false,
}: ResumeAssistantProps) {
  const [expanded, setExpanded] = useState(!isResumeReady);

  useEffect(() => {
    setExpanded(!isResumeReady);
  }, [isResumeReady]);

  if (isResumeReady && !expanded) {
    return (
      <div className={styles.collapsedWrapper}>
        <Button
          variant="secondary"
          aria-expanded={false}
          onClick={() => setExpanded(true)}
          className={styles.collapsedTrigger}
        >
          🎙️ Quer refazer ou atualizar seu currículo com a IA? Clique aqui
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.assistantWrapper}>
      <div className={styles.assistantIntro}>
        <span className={styles.icon}>
          <Sparkles size={25} aria-hidden="true" />
        </span>
        <div className={styles.introContent}>
          <h2>Conte sua história. A IA ajuda a escrever.</h2>
          <p>
            Fale no microfone ou digite nas 4 etapas abaixo. O currículo criado será atualizado
            automaticamente e você poderá revisar cada campo em seguida.
          </p>
        </div>
        {isResumeReady && (
          <Button variant="secondary" onClick={() => setExpanded(false)}>
            Recolher assistente
          </Button>
        )}
      </div>
      <ResumeVoiceInterview
        onGenerate={onGenerate}
        onGenerated={(generated) => {
          onGenerated(generated);
          setExpanded(false);
        }}
        onPendingChange={onPendingChange}
        manualAction={manualAction}
      />
    </div>
  );
}
