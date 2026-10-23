import { useRef } from 'react';
import { AppHeader } from '../components/AppHeader';
import { AppFooter } from '../components/AppFooter';
import { AccessibilityToolbar } from '../components/AccessibilityToolbar';
import { Button } from '../components/Button';
import { LinkButton } from '../components/LinkButton';
import { RecoveryPanel } from '../components/RecoveryPanel';
import { usePageReader } from '../features/accessibility/usePageReader';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
  variant: 'notFound' | 'unexpected';
  onRetry?: () => void;
}

export function ErrorPage({ variant, onRetry }: ErrorPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { speaking, audioAvailable, readingError, readPage } = usePageReader(contentRef);
  const notFound = variant === 'notFound';

  return (
    <div ref={contentRef} className={styles.shell}>
      <a href="#recovery-content" className={styles.skipLink} data-read-skip>
        Pular para o conteúdo
      </a>
      <AppHeader homeHref="/">
        <AccessibilityToolbar
          speaking={speaking}
          audioAvailable={audioAvailable}
          onRead={readPage}
        />
      </AppHeader>
      <main id="recovery-content" className={styles.main}>
        <RecoveryPanel
          code={notFound ? '404 · PÁGINA NÃO ENCONTRADA' : 'VAMOS TENTAR NOVAMENTE'}
          title={notFound ? 'Não encontramos esta página' : 'Não foi possível abrir esta tela'}
          description={
            notFound
              ? 'O endereço pode ter mudado ou estar incompleto. Você pode voltar ao início e continuar por lá.'
              : 'Encontramos um problema ao exibir esta tela. Tente novamente ou volte ao início para continuar.'
          }
        >
          {!notFound && onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
          <LinkButton to="/" variant={notFound ? 'primary' : 'secondary'} replace>
            Voltar ao início
          </LinkButton>
          {!notFound && (
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Recarregar aplicativo
            </Button>
          )}
        </RecoveryPanel>
        {readingError && (
          <p role="status" className={styles.feedback} data-read-skip>
            {readingError}
          </p>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
