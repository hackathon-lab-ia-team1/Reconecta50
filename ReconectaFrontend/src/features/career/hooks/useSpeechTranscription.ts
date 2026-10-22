import { useEffect, useRef, useState } from 'react';

export interface RecognitionResultEvent {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
export interface SpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognizer;
  webkitSpeechRecognition?: new () => SpeechRecognizer;
};

export function useSpeechTranscription(onText: (text: string) => void, onEnd: () => void) {
  const browser = window as SpeechWindow;
  const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  const recognitionRef = useRef<SpeechRecognizer | null>(null);
  const callbacks = useRef({ onText, onEnd });
  callbacks.current = { onText, onEnd };
  const [error, setError] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  useEffect(
    () => () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.abort();
    },
    [],
  );

  function start(prefix: string) {
    if (!Constructor || recognitionRef.current) return false;
    setError('');
    setInterim('');
    try {
      const recognition = new Constructor();
      recognitionRef.current = recognition;
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        if (recognitionRef.current !== recognition) return;
        const final: string[] = [];
        const partial: string[] = [];
        for (let index = 0; index < event.results.length; index++) {
          const result = event.results[index];
          (result.isFinal ? final : partial).push(result[0].transcript);
        }
        if (final.length)
          callbacks.current.onText(
            [prefix.trim(), final.join(' ').trim()].filter(Boolean).join('\n'),
          );
        setInterim(partial.join(' '));
      };
      recognition.onerror = (event) => {
        if (recognitionRef.current !== recognition) return;
        setError(
          event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'A transcrição não foi autorizada. Permita o microfone ou preencha o texto.'
            : 'A transcrição foi interrompida. Confira o texto recebido e grave novamente para continuar, ou digite.',
        );
        recognitionRef.current = null;
        setListening(false);
        setInterim('');
        recognition.abort();
        callbacks.current.onEnd();
      };
      recognition.onend = () => {
        if (recognitionRef.current !== recognition) return;
        recognitionRef.current = null;
        setListening(false);
        setInterim('');
        callbacks.current.onEnd();
      };
      setListening(true);
      recognition.start();
      return true;
    } catch {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setListening(false);
      setError('Não foi possível iniciar a transcrição. Use o texto ou tente novamente.');
      return false;
    }
  }
  function stop() {
    recognitionRef.current?.stop();
  }
  return { supported: !!Constructor, listening, interim, error, start, stop };
}
