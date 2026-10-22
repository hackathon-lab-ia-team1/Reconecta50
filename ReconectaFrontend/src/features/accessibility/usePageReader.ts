import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
/** Lê textos e nomes dos controles, nunca os valores digitados no formulário. */
function collectText(element: HTMLElement): string {
    const style = getComputedStyle(element);
    if (element.hidden || element.getAttribute('aria-hidden') === 'true' || element.hasAttribute('data-read-skip') || style.display === 'none' || style.visibility === 'hidden')
        return '';
    if (element.matches('input, textarea, select')) {
        return element instanceof HTMLInputElement && element.placeholder ? ` ${element.placeholder}. ` : '';
    }
    if (element.matches('button, a') && element.getAttribute('aria-label'))
        return ` ${element.getAttribute('aria-label')}. `;
    const children = Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    if (children.length && element.hasAttribute('data-read-order')) {
        return children.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left).map(collectText).join('. ');
    }
    return Array.from(element.childNodes).map(node => {
        if (node.nodeType === Node.TEXT_NODE)
            return node.textContent ?? '';
        if (node instanceof HTMLElement)
            return ` ${collectText(node)} `;
        return '';
    }).join(' ').replace(/\s+/g, ' ').trim();
}
export function usePageReader(contentRef: RefObject<HTMLElement | null>) {
    const [speaking, setSpeaking] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);
    const [readingError, setReadingError] = useState('');
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const runRef = useRef(0);
    useEffect(() => {
        const runState = runRef;
        setAudioAvailable('speechSynthesis' in window);
        return () => {
            runState.current++;
            if ('speechSynthesis' in window)
                window.speechSynthesis.cancel();
        };
    }, []);
    function readPage() {
        if (!audioAvailable)
            return;
        const run = ++runRef.current;
        window.speechSynthesis.cancel();
        setReadingError('');
        if (speaking) {
            setSpeaking(false);
            return;
        }
        const text = contentRef.current ? collectText(contentRef.current) : '';
        // Trechos curtos evitam o corte de falas longas em alguns navegadores.
        const chunks = text.match(/.{1,180}(?:\s|$)|\S{1,180}/g) ?? [];
        let index = 0;
        function speakNext() {
            if (runRef.current !== run)
                return;
            if (index >= chunks.length) {
                setSpeaking(false);
                utteranceRef.current = null;
                return;
            }
            const utterance = new SpeechSynthesisUtterance(chunks[index++]);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            utterance.onend = speakNext;
            utterance.onerror = () => {
                if (runRef.current !== run)
                    return;
                setSpeaking(false);
                setReadingError('Não foi possível concluir a leitura. Toque em Ouvir a página para tentar novamente.');
            };
            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }
        setSpeaking(true);
        speakNext();
    }
    return { speaking, audioAvailable, readingError, readPage };
}
