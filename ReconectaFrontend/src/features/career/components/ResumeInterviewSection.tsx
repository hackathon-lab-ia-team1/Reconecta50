import { useEffect } from 'react';
import { Button } from '../../../components/Button';
import { TextAreaField } from '../../../components/TextAreaField';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechTranscription } from '../hooks/useSpeechTranscription';
import type { InterviewField } from '../types/resumeInterview';
import styles from './ResumeAssistant.module.css';

interface Props {
  field: InterviewField;
  title: string;
  hint: string;
  value: string;
  active: InterviewField | null;
  pending: boolean;
  onActive: (field: InterviewField | null) => void;
  onChange: (value: string) => void;
}

export function ResumeInterviewSection({
  field,
  title,
  hint,
  value,
  active,
  pending,
  onActive,
  onChange,
}: Props) {
  const recording = useAudioRecorder();
  const speech = useSpeechTranscription(onChange, () => {});
  const busy = ['requesting', 'recording', 'stopping'].includes(recording.status);
  useEffect(() => {
    if (active === field && !busy && !speech.listening) onActive(null);
  }, [active, field, busy, speech.listening, onActive]);
  const blocked = pending || (active !== null && active !== field);
  async function start() {
    if (blocked || busy || speech.listening) return;
    onActive(field);
    if (!(await recording.start())) {
      onActive(null);
      return;
    }
    if (speech.supported) speech.start(value);
  }
  return (
    <section className={styles.interviewStep}>
      <h3>{title}</h3>
      <p>{hint}</p>
      {!speech.supported && (
        <p>
          Este navegador não oferece transcrição por voz. Você pode gravar e ouvir o áudio, mas
          precisa preencher ou colar o texto desta etapa para enviar à IA.
        </p>
      )}
      {!recording.supported && (
        <p role="status">
          A gravação não está disponível neste navegador ou endereço. Abra o aplicativo em HTTPS ou
          localhost e permita o acesso ao microfone. Você também pode preencher o texto.
        </p>
      )}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          disabled={
            blocked ||
            !recording.supported ||
            (busy && recording.status !== 'recording') ||
            (speech.listening && recording.status !== 'recording')
          }
          onClick={() => {
            if (recording.status === 'recording') {
              recording.stop();
              speech.stop();
            } else void start();
          }}
        >
          {recording.status === 'recording' ? `Concluir áudio: ${title}` : `Gravar áudio: ${title}`}
        </Button>
      </div>
      {busy && (
        <p role="status">
          {recording.status === 'recording'
            ? `Gravando ${recording.duration} segundos. Fale no seu ritmo.`
            : 'Preparando a gravação…'}
        </p>
      )}
      {speech.interim && <p aria-live="off">Transcrição em andamento: {speech.interim}</p>}
      {recording.audioUrl && (
        <audio
          controls
          preload="metadata"
          src={recording.audioUrl}
          aria-label={`Ouvir áudio: ${title}`}
        />
      )}
      <TextAreaField
        label={`Texto revisável: ${title}`}
        value={value}
        rows={4}
        disabled={pending || busy || speech.listening}
        onChange={(event) => onChange(event.target.value)}
        hint="Revise a transcrição antes de enviar à IA. Você também pode escrever ou corrigir aqui."
      />
      {(recording.error || speech.error) && (
        <p role="alert" className={styles.error}>
          {recording.error || speech.error}
        </p>
      )}
    </section>
  );
}
