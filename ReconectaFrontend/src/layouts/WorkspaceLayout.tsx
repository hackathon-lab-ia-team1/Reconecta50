import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  FileUser,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  UserRound,
} from 'lucide-react';
import { Button } from '../components/Button';
import { logout } from '../features/auth/services/authService';
import { useAuth } from '../features/auth/useAuth';
import { AppHeader } from '../components/AppHeader';
import { AppFooter } from '../components/AppFooter';
import { AccessibilityToolbar } from '../components/AccessibilityToolbar';
import { ShareButton } from '../components/ShareButton';
import { WorkspaceHelp } from './WorkspaceHelp';
import { usePageReader } from '../features/accessibility/usePageReader';
import styles from './WorkspaceLayout.module.css';

const navigation = [
  { to: '/dashboard', label: 'Visão geral', tabTitle: 'Painel', icon: LayoutDashboard },
  { to: '/perfil', label: 'Meu perfil', tabTitle: 'Meu perfil', icon: UserRound },
  { to: '/curriculo', label: 'Meu currículo', tabTitle: 'Meu currículo', icon: FileUser },
  { to: '/vagas-recomendadas', label: 'Vagas recomendadas', tabTitle: 'Vagas', icon: Search },
  { to: '/minhas-vagas', label: 'Minhas vagas', tabTitle: 'Minhas vagas', icon: BriefcaseBusiness },
  { to: '/capacitacao', label: 'Capacitação', tabTitle: 'Capacitação', icon: GraduationCap },
];

export function WorkspaceLayout() {
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const logoutPending = useRef(false);
  const { speaking, audioAvailable, readingError, readPage, stopReading } =
    usePageReader(contentRef);

  async function handleLogout() {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setLoggingOut(true);
    setLogoutError('');
    stopReading();
    try {
      await logout();
      setAuthenticated(false);
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Não foi possível sair. Tente novamente.',
      );
    } finally {
      logoutPending.current = false;
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    stopReading();
    const title = mainRef.current?.querySelector('h1');
    const section = navigation.find((item) => item.to === pathname)?.tabTitle ?? 'Painel';
    document.title = `Reconecta 50+ · ${section}`;
    window.scrollTo(0, 0);
    title?.focus({ preventScroll: true });
  }, [pathname, stopReading]);

  return (
    <div ref={contentRef} className={styles.shell}>
      <a className={styles.skipLink} href="#workspace-content" data-read-skip>
        Pular para o conteúdo
      </a>
      <AppHeader homeHref="/dashboard">
        <AccessibilityToolbar
          speaking={speaking}
          audioAvailable={audioAvailable}
          onRead={readPage}
        />
        <ShareButton url={new URL('/login', window.location.origin).href} />
        {isAuthenticated && (
          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
          >
            <LogOut size={20} aria-hidden="true" />
            {loggingOut ? 'Saindo…' : 'Sair'}
          </Button>
        )}
      </AppHeader>
      <div className={styles.navigation} data-read-skip>
        <nav aria-label="Navegação do painel">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      {readingError && (
        <p className={styles.readingError} role="status" data-read-skip>
          {readingError}
        </p>
      )}
      <main id="workspace-content" className={styles.main} ref={mainRef}>
        {logoutError && (
          <p className={styles.readingError} role="alert">
            {logoutError}
          </p>
        )}
        <div className={styles.help}>
          <WorkspaceHelp />
        </div>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
