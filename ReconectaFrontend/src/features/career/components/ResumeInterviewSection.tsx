import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/Button';
import { TextAreaField } from '../../../components/TextAreaField';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechTranscription } from '../hooks/useSpeechTranscription';
import type { InterviewField } from '../types/resumeInterview';
import styles from './ResumeAssistant.module.css';

export const MAX_STEP_CHARS = 1000;
export const MAX_AUDIO_DURATION_SEC = 120;

function playSubtleSuccessTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Ignore audio context restrictions in headless/test environments
  }
}

interface Props {
  field: InterviewField;
  title: string;
  hint: string;
  value: string;
  active: InterviewField | null;
  pending: boolean;
  featured?: boolean;
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
  featured = false,
  onActive,
  onChange,
}: Props) {
  const recording = useAudioRecorder();
  const speech = useSpeechTranscription((text) => onChange(text.slice(0, MAX_STEP_CHARS)), () => {});
  const busy = ['requesting', 'recording', 'stopping'].includes(recording.status);
  const prevStatusRef = useRef(recording.status);
  const [maxDurationReached, setMaxDurationReached] = useState(false);

  useEffect(() => {
    if (active === field && !busy && !speech.listening) onActive(null);
  }, [active, field, busy, speech.listening, onActive]);

  useEffect(() => {
    if (prevStatusRef.current === 'recording' && recording.status === 'ready') {
      playSubtleSuccessTone();
    }
    prevStatusRef.current = recording.status;
  }, [recording.status]);

  // Limite de segurança de 2 minutos (120 segundos) para auto-interromper a gravação
  useEffect(() => {
    if (recording.status !== 'recording') return;
    if (recording.duration >= MAX_AUDIO_DURATION_SEC) {
      setMaxDurationReached(true);
      recording.stop();
      speech.stop();
      return;
    }
    const remainingMs = (MAX_AUDIO_DURATION_SEC - recording.duration) * 1000;
    const timeoutId = window.setTimeout(() => {
      setMaxDurationReached(true);
      recording.stop();
      speech.stop();
    }, remainingMs);
    return () => window.clearTimeout(timeoutId);
  }, [recording, speech]);

  const blocked = pending || (active !== null && active !== field);

  async function start() {
    if (blocked || busy || speech.listening) return;
    setMaxDurationReached(false);
    onActive(field);
    if (!(await recording.start())) {
      onActive(null);
      return;
    }
    if (speech.supported) speech.start(value);
  }

  return (
    <section
      className={`${styles.interviewStep} ${featured ? styles.interviewStepFeatured : ''} ${
        recording.status === 'recording' ? styles.interviewStepRecording : ''
      }`}
    >
      <div className={styles.stepHeader}>
        <h3>{title}</h3>
        {featured && <span className={styles.featuredBadge}>★ Destaque principal</span>}
      </div>
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
          className={recording.status === 'recording' ? styles.stopRecordingButton : undefined}
          aria-label={
            recording.status === 'recording'
              ? `Concluir áudio: ${title}`
              : `Gravar áudio: ${title}`
          }
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
          {recording.status === 'recording'
            ? '⏹️ Parar gravação e salvar texto'
            : `🔴 Gravar áudio`}
        </Button>
      </div>
      {busy && (
        <div
          role="status"
          className={
            recording.status === 'recording' ? styles.recordingBanner : styles.preparingBanner
          }
        >
          {recording.status === 'recording' ? (
            <>
              <span className={styles.pulsingDot} aria-hidden="true" />
              <span>
                🔴 Gravando sua fala... Fale no seu ritmo ({recording.duration}s / 120s)
              </span>
            </>
          ) : (
            <span>Preparando a gravação…</span>
          )}
        </div>
      )}
      {recording.status === 'ready' && !busy && (
        <p role="status" className={styles.capturedBanner}>
          {maxDurationReached
            ? 'Tempo máximo de áudio atingido (2 min). Seu texto foi transcrito e você pode revisá-lo abaixo.'
            : '✓ Áudio capturado e transcrito com sucesso! Revise o texto abaixo se desejar.'}
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
        maxLength={MAX_STEP_CHARS}
        rows={featured ? 5 : 4}
        disabled={pending || busy || speech.listening}
        onChange={(event) => onChange(event.target.value.slice(0, MAX_STEP_CHARS))}
      />
      <div className={styles.charCounter}>
        <span>
          {value.length} / 1.000 caracteres
        </span>
      </div>
      {(recording.error || speech.error) && (
        <p role="alert" className={styles.error}>
          {recording.error || speech.error}
        </p>
      )}
    </section>
  );
}
