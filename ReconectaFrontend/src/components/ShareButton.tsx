import shareStyles from './ShareButton.module.css';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
export interface ShareButtonProps {
    title?: string;
    text?: string;
    url?: string;
    label?: string;
}
export function ShareButton({ title = 'Reconecta 50+', text = 'Sua experiência tem valor, e seu próximo capítulo pode começar agora! Conheça o Reconecta 50+: uma plataforma para pessoas com 50 anos ou mais encontrarem oportunidades de trabalho e criarem um currículo personalizado, de um jeito simples e acessível. Acesse e compartilhe com quem também pode aproveitar essa oportunidade:', url: shareUrl, label = 'Compartilhar aplicativo', }: ShareButtonProps = {}) {
    const [message, setMessage] = useState('');
    const [manualText, setManualText] = useState('');
    async function share() {
        const url = shareUrl ?? new URL(window.location.pathname, window.location.origin).href;
        const invitation = text;
        const shareText = `${invitation}\n\n${url}`;
        setMessage('');
        setManualText('');
        if (navigator.share) {
            try {
                await navigator.share({ title, text: invitation, url });
                return;
            }
            catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError')
                    return;
            }
        }
        try {
            await navigator.clipboard.writeText(shareText);
            setMessage('Mensagem e link copiados! Cole em uma conversa para compartilhar.');
        }
        catch {
            setManualText(shareText);
            setMessage('Selecione e copie a mensagem com o link abaixo para compartilhar.');
        }
    }
    return <div className={shareStyles['share-control']}>
    <button type="button" className={shareStyles['share-button']} onClick={share}><Share2 size={19} aria-hidden="true"/><span>{label}</span></button>
    {message && <div className={shareStyles['share-feedback']} role="status" data-read-skip><p>{message}</p>{manualText && <textarea aria-label="Mensagem e link do aplicativo para copiar" readOnly rows={5} value={manualText} onFocus={event => event.currentTarget.select()}/>}</div>}
  </div>;
}
