import { useNavigate } from 'react-router-dom';
import { ArrowRight, CircleAlert, HeartHandshake, RefreshCw, ShieldCheck } from 'lucide-react';
import brandStyles from './Brand.module.css';
import { Button } from './Button';
import styles from './ServerConnectingScreen.module.css';

interface ServerConnectingScreenProps {
  sessionError?: string;
  onRetry: () => void;
  onEnterDemo: () => void;
}

export function ServerConnectingScreen({
  sessionError,
  onRetry,
  onEnterDemo,
}: ServerConnectingScreenProps) {
  const navigate = useNavigate();

  function handleEnterDemo() {
    onEnterDemo();
    navigate('/dashboard');
  }

  return (
    <main className={styles.screen}>
      <section className={styles.card} aria-label="Conexão com o Reconecta 50+">
        <div className={styles.brandHeader}>
          <div className={brandStyles['brand']}>
            <span className={brandStyles['brand-icon']}>
              <HeartHandshake size={28} aria-hidden="true" />
            </span>
            <span>
              Reconecta{' '}
              <strong>
                50<span className={brandStyles['brand-plus']}>+</span>
              </strong>
              <small>EXPERIÊNCIA QUE CONECTA</small>
            </span>
          </div>
        </div>

        {!sessionError ? (
          <div className={styles.loadingContent}>
            <div className={styles.spinnerWrap} aria-hidden="true">
              <div className={styles.spinner} />
              <ShieldCheck size={28} className={styles.spinnerIcon} />
            </div>

            <h1 className={styles.title} role="status">
              Verificando conexão com o servidor seguro...
            </h1>

            <p className={styles.description}>
              Estamos preparando seu ambiente seguro. Na primeira conexão, nosso servidor de
              Inteligência Artificial pode levar alguns segundos para carregar.
            </p>

            <div className={styles.pulseBadge} aria-hidden="true">
              <span className={styles.pulseDot} />
              <span>Aguarde um instante...</span>
            </div>
          </div>
        ) : (
          <div className={styles.errorContent}>
            <div className={styles.alertBox} role="alert">
              <CircleAlert size={24} className={styles.alertIcon} aria-hidden="true" />
              <div>
                <h1 className={styles.alertTitle}>
                  O servidor está demorando um pouco mais que o normal para responder. Isso pode
                  acontecer quando a conexão em nuvem está aquecendo.
                </h1>
                <p className={styles.alertDetail}>{sessionError}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <Button type="button" onClick={onRetry}>
                <RefreshCw size={18} aria-hidden="true" />
                Tentar verificar novamente
              </Button>
              <Button type="button" variant="secondary" onClick={handleEnterDemo}>
                Conhecer o painel de demonstração
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
