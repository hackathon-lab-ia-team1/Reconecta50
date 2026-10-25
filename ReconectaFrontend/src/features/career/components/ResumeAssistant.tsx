import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Mic, Square, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { TextAreaField } from '../../../components/TextAreaField';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { interviewSections } from '../types/resumeInterview';
import type { ResumeDraft } from '../types/career';
import type { GenerateResume, ResumeGenerationInput } from '../types/resumeGeneration';
import styles from './ResumeAssistant.module.css';
import { ResumeVoiceInterview } from './ResumeVoiceInterview';

const LOADING_MESSAGES = [
  'Lendo suas experiências...',
  'A IA está formalizando suas competências profissionais...',
  'Quase pronto! Organizando a apresentação do seu currículo...',
] as const;

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
  audioGenerationAvailable = true,
  guidedAudio = false,
}: ResumeAssistantProps) {
  const recording = useAudioRecorder();
  const [mode, setMode] = useState<'audio' | 'text'>(
    recording.supported && audioGenerationAvailable ? 'audio' : 'text',
  );
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const recordingBusy = ['requesting', 'recording', 'stopping'].includes(recording.status);

  useEffect(() => {
    const request = requestRef;
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, []);

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

  function cancelGeneration() {
    requestRef.current?.abort();
    requestRef.current = null;
    setPending(false);
    onPendingChange?.(false);
  }

  async function generate() {
    if (requestRef.current || recordingBusy) return;
    let input: ResumeGenerationInput;
    if (mode === 'audio') {
      if (!recording.audio) return;
      input = { source: 'audio', audio: recording.audio };
    } else {
      if (!text.trim()) return;
      input = { source: 'text', text: text.trim() };
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setError('');
    setCompleted(false);
    setPending(true);
    onPendingChange?.(true);
    try {
      const result = await onGenerate(input, controller.signal);
      if (requestRef.current !== controller || controller.signal.aborted) return;
      onGenerated(result);
      setCompleted(true);
    } catch (cause) {
      if (requestRef.current !== controller || controller.signal.aborted) return;
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
      aria-labelledby="resume-assistant-title"
      aria-busy={pending}
    >
      <div className={styles.heading}>
        <span className={styles.icon}>
          <Sparkles size={25} aria-hidden="true" />
        </span>
        <div>
          <h2 id="resume-assistant-title">Conte sua história. A IA ajuda a escrever.</h2>
          <p>
            Fale sobre seus trabalhos, o que você fazia e suas habilidades. O currículo criado será
            atualizado automaticamente. Depois, você pode conferir e editar os campos.
          </p>
        </div>
      </div>
      <div className={styles.guidance}>
        <strong>Roteiro simples em 4 pontos (fale ou escreva do seu jeito):</strong>
        <ol className={styles.fourQuestionsList}>
          {interviewSections.map((item, idx) => (
            <li key={item.key}>
              <strong>
                {idx + 1}. {item.title}:
              </strong>{' '}
              {item.hint}
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.modes} role="group" aria-label="Como contar sua experiência">
        <Button
          variant="secondary"
          aria-pressed={mode === 'audio'}
          disabled={pending || recordingBusy || voiceBusy}
          onClick={() => {
            setMode('audio');
            setError('');
            setCompleted(false);
          }}
        >
          Falar minha experiência
        </Button>
        <Button
          variant="secondary"
          aria-pressed={mode === 'text'}
          disabled={pending || recordingBusy || voiceBusy}
          onClick={() => {
            setMode('text');
            setError('');
            setCompleted(false);
          }}
        >
          Escrever minha experiência
        </Button>
      </div>
      {guidedAudio && (
        <div hidden={mode !== 'audio'}>
          <ResumeVoiceInterview
            onGenerate={onGenerate}
            onGenerated={onGenerated}
            onBusyChange={setVoiceBusy}
            onPendingChange={(busy) => {
              setPending(busy);
              onPendingChange?.(busy);
            }}
            manualAction={manualAction}
          />
        </div>
      )}
      {mode === 'audio' && guidedAudio ? null : mode === 'audio' ? (
        <div className={styles.recorder}>
          {!audioGenerationAvailable && (
            <p>
              O serviço atual ainda não transforma gravações em currículo. Você pode gravar e ouvir
              seu relato como apoio, mas para criar o currículo use Escrever minha experiência.
              Nenhum áudio será enviado.
            </p>
          )}
          {!recording.supported ? (
            <p>
              Este navegador não disponibiliza a gravação de áudio. Use a opção Escrever minha
              experiência ou os campos manuais abaixo.
            </p>
          ) : (
            <>
              <p>
                A gravação começa quando você tocar no botão e permitir o microfone. Fale no seu
                ritmo e toque para parar quando terminar. Nada é enviado enquanto você grava.
              </p>
              <div className={styles.actions}>
                {recording.status === 'recording' ? (
                  <Button
                    variant="secondary"
                    className={styles.stopRecordingButton}
                    aria-label="Concluir gravação"
                    onClick={recording.stop}
                  >
                    <Square size={18} aria-hidden="true" />
                    ⏹️ Parar gravação e salvar texto
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setError('');
                      setCompleted(false);
                      void recording.start();
                    }}
                    disabled={pending || recordingBusy}
                  >
                    <Mic size={20} aria-hidden="true" />
                    {recording.status === 'requesting'
                      ? 'Aguardando microfone…'
                      : recording.status === 'stopping'
                        ? 'Preparando áudio…'
                        : recording.audio
                          ? 'Gravar novamente'
                          : 'Começar gravação'}
                  </Button>
                )}
                {(recording.audio || recordingBusy) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      recording.reset();
                      setCompleted(false);
                      setError('');
                    }}
                    disabled={pending}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                    Descartar gravação
                  </Button>
                )}
              </div>
              <p
                role="status"
                className={
                  recording.status === 'recording'
                    ? styles.recordingBanner
                    : recording.status === 'ready'
                      ? styles.capturedBanner
                      : undefined
                }
              >
                {recording.status === 'recording' ? (
                  <>
                    <span className={styles.pulsingDot} aria-hidden="true" />
                    <span>🔴 Gravando sua fala... Fale no seu ritmo</span>
                  </>
                ) : recording.status === 'ready' ? (
                  '✓ Áudio capturado com sucesso! Você pode ouvir abaixo antes de enviar.'
                ) : recording.status === 'stopping' ? (
                  'Concluindo a gravação.'
                ) : (
                  ''
                )}
              </p>
              {recording.status === 'recording' && (
                <p aria-live="off">Tempo gravado: {recording.duration} segundos.</p>
              )}
              {recording.audioUrl && (
                <audio
                  key={recording.audioUrl}
                  controls
                  preload="metadata"
                  src={recording.audioUrl}
                  aria-label="Ouvir minha gravação"
                />
              )}
              {recording.error && (
                <p className={styles.error} role="alert">
                  {recording.error}
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <TextAreaField
          label="Conte sua experiência para a IA"
          hint="Responda às 4 perguntas acima com suas palavras (função desejada, onde trabalhou e o que fazia, habilidades e escolaridade). Até 12.000 caracteres."
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError('');
            setCompleted(false);
          }}
          maxLength={12000}
          disabled={pending}
        />
      )}
      {!(mode === 'audio' && guidedAudio) && (
        <>
          <p className={styles.notice}>
            Ao escolher Criar currículo com IA, você envia apenas o texto acima ou, quando houver
            suporte, a gravação ao serviço de criação de currículo. O novo currículo substituirá o
            atual automaticamente. Confira o resultado e ajuste o que precisar.
          </p>
          <div className={styles.actions}>
            <Button
              onClick={() => void generate()}
              disabled={
                pending ||
                recordingBusy ||
                (mode === 'audio' ? !audioGenerationAvailable || !recording.audio : !text.trim())
              }
            >
              <Sparkles size={19} aria-hidden="true" />
              {pending ? 'Organizando seu currículo…' : 'Criar currículo com IA'}
            </Button>
            {pending && (
              <Button variant="secondary" onClick={cancelGeneration}>
                Cancelar criação
              </Button>
            )}
          </div>
          {manualAction && <div className={styles.actions}>{manualAction}</div>}
          {pending && (
            <p role="status" className={styles.loadingProgressBanner}>
              <span className={styles.loadingSpinner} aria-hidden="true" />
              <span>{LOADING_MESSAGES[loadingStage]}</span>
            </p>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {completed && (
            <p role="status">
              Currículo atualizado automaticamente. Você pode revisar e editar os campos abaixo.
            </p>
          )}
        </>
      )}
    </section>
  );
}
