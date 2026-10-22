import { Button } from '../components/Button';
import { RecoveryPanel } from '../components/RecoveryPanel';
import actionStyles from '../components/Action.module.css';
import styles from '../components/RecoveryPanel.module.css';
export function AppErrorFallback() {
  return (
    <main className={styles.standalone}>
      <RecoveryPanel
        code="RECONECTA 50+"
        title="Vamos reabrir o aplicativo?"
        description="Ocorreu um problema ao carregar o aplicativo. Reabra a página para tentar novamente. Alterações ainda não salvas podem precisar ser preenchidas novamente."
      >
        <Button onClick={() => window.location.reload()}>Recarregar aplicativo</Button>
        <a href="/login" className={`${actionStyles.action} ${actionStyles.secondary}`}>
          Ir para o login
        </a>
      </RecoveryPanel>
    </main>
  );
}
