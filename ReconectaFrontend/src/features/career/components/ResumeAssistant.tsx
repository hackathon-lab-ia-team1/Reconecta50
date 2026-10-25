import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
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
}

export function ResumeAssistant({
  onGenerate,
  onGenerated,
  manualAction,
  onPendingChange,
}: ResumeAssistantProps) {
  return (
    <div className={styles.assistantWrapper}>
      <div className={styles.assistantIntro}>
        <span className={styles.icon}>
          <Sparkles size={25} aria-hidden="true" />
        </span>
        <div>
          <h2>Conte sua história. A IA ajuda a escrever.</h2>
          <p>
            Fale no microfone ou digite nas 4 etapas abaixo. O currículo criado será atualizado
            automaticamente e você poderá revisar cada campo em seguida.
          </p>
        </div>
      </div>
      <ResumeVoiceInterview
        onGenerate={onGenerate}
        onGenerated={onGenerated}
        onPendingChange={onPendingChange}
        manualAction={manualAction}
      />
    </div>
  );
}
