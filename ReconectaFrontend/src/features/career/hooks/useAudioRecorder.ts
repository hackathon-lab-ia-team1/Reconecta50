import { useCallback, useEffect, useRef, useState } from 'react';
import { fixWebmDuration } from '@fix-webm-duration/fix';

type RecordingStatus = 'idle' | 'requesting' | 'recording' | 'stopping' | 'ready';

export function useAudioRecorder() {
  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runRef = useRef(0);
  const busyRef = useRef(false);
  const stoppedAtRef = useRef<number | null>(null);

  const release = useCallback((keepBusy = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    if (!keepBusy) busyRef.current = false;
  }, []);

  useEffect(
    () => () => {
      runRef.current++;
      release();
    },
    [release],
  );
  useEffect(() => {
    if (!audio) {
      setAudioUrl('');
      return;
    }
    const url = URL.createObjectURL(audio);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state !== 'recording') return;
    stoppedAtRef.current = performance.now();
    setStatus('stopping');
    release(true);
  }, [release]);

  function reset() {
    runRef.current++;
    release();
    setAudio(null);
    setDuration(0);
    setError('');
    setStatus('idle');
  }

  async function start() {
    if (!supported || busyRef.current) return;
    const run = ++runRef.current;
    busyRef.current = true;
    setError('');
    setAudio(null);
    setDuration(0);
    setStatus('requesting');
    stoppedAtRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (runRef.current !== run) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const startedAt = performance.now();
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (runRef.current !== run || !event.data.size) return;
        chunks.push(event.data);
      };
      recorder.onstop = async () => {
        if (runRef.current !== run) return;
        const elapsed = Math.max(1, (stoppedAtRef.current ?? performance.now()) - startedAt);
        const recordedAudio = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type });
        release(true);
        if (!recordedAudio.size) {
          busyRef.current = false;
          setError('Não foi possível obter o áudio. Grave novamente ou use texto.');
          setStatus('idle');
          return;
        }
        setStatus('stopping');
        busyRef.current = true;
        try {
          const preparedAudio = recordedAudio.type.includes('webm')
            ? await fixWebmDuration(recordedAudio, elapsed, { logger: false })
            : recordedAudio;
          if (runRef.current !== run) return;
          setAudio(preparedAudio);
          setDuration(Math.floor(elapsed / 1000));
          setStatus('ready');
        } catch {
          if (runRef.current !== run) return;
          setError(
            'Não foi possível preparar o áudio para reprodução. Grave novamente ou use texto.',
          );
          setStatus('idle');
        } finally {
          if (runRef.current === run) busyRef.current = false;
        }
      };
      recorder.onerror = () => {
        if (runRef.current !== run) return;
        runRef.current++;
        release();
        setError('A gravação foi interrompida. Tente novamente ou use a opção de texto.');
        setStatus('idle');
      };
      recorder.start(1000);
      setStatus('recording');
      timerRef.current = setInterval(
        () => setDuration(Math.floor((performance.now() - startedAt) / 1000)),
        1000,
      );
      return true;
    } catch (cause) {
      if (runRef.current !== run) return;
      release();
      const denied = cause instanceof DOMException && cause.name === 'NotAllowedError';
      setError(
        denied
          ? 'O microfone não foi autorizado. Você pode permitir o acesso no navegador ou usar a opção de texto.'
          : 'Não foi possível acessar o microfone. Confira se ele está disponível ou use a opção de texto.',
      );
      setStatus('idle');
      return false;
    }
  }

  return { supported, status, audio, audioUrl, duration, error, start, stop, reset };
}
