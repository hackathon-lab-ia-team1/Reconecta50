import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { collectReadableText } from './utils/collectReadableText';

function cancelSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {}
}

function supportsSpeech() {
  return (
    typeof window.speechSynthesis?.speak === 'function' &&
    typeof window.speechSynthesis?.cancel === 'function' &&
    typeof SpeechSynthesisUtterance === 'function'
  );
}
export function usePageReader(contentRef: RefObject<HTMLElement | null>) {
  const [speaking, setSpeaking] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [readingError, setReadingError] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const runRef = useRef(0);
  const stopReading = useCallback(() => {
    runRef.current++;
    cancelSpeech();
    utteranceRef.current = null;
    setSpeaking(false);
    setReadingError('');
  }, []);
  useEffect(() => {
    const runState = runRef;
    setAudioAvailable(supportsSpeech());
    return () => {
      runState.current++;
      cancelSpeech();
    };
  }, []);
  function readPage() {
    if (!audioAvailable || !supportsSpeech()) return;
    const run = ++runRef.current;
    cancelSpeech();
    setReadingError('');
    if (speaking) {
      utteranceRef.current = null;
      setSpeaking(false);
      return;
    }
    const text = contentRef.current ? collectReadableText(contentRef.current) : '';
    const chunks = text.match(/.{1,180}(?:\s|$)|\S{1,180}/g) ?? [];
    let index = 0;
    function speakNext() {
      if (runRef.current !== run) return;
      if (index >= chunks.length) {
        setSpeaking(false);
        utteranceRef.current = null;
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(chunks[index++]);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.onend = speakNext;
        utterance.onerror = () => {
          if (runRef.current !== run) return;
          runRef.current++;
          cancelSpeech();
          setSpeaking(false);
          utteranceRef.current = null;
          setReadingError(
            'Não foi possível concluir a leitura. Toque em Ouvir a página para tentar novamente.',
          );
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        if (runRef.current !== run) return;
        runRef.current++;
        cancelSpeech();
        utteranceRef.current = null;
        setSpeaking(false);
        setReadingError('Não foi possível iniciar a leitura. Tente novamente.');
      }
    }
    setSpeaking(true);
    speakNext();
  }
  return { speaking, audioAvailable, readingError, readPage, stopReading };
}
