import layoutStyles from './AuthLayout.module.css';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AppHeader } from '../../../components/AppHeader';
import { AppFooter } from '../../../components/AppFooter';
import { AccessibilityToolbar } from '../../../components/AccessibilityToolbar';
import { ShareButton } from '../../../components/ShareButton';
import { HelpDisclosure } from '../../../components/HelpDisclosure';
import { usePageReader } from '../../accessibility/usePageReader';
import { WelcomePanel } from './WelcomePanel';

interface AuthLayoutProps {
  title: string;
  eyebrow: string;
  description: string;
  helpLabel: string;
  helpText: string;
  children: ReactNode;
}

export function AuthLayout({
  title,
  eyebrow,
  description,
  helpLabel,
  helpText,
  children,
}: AuthLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { speaking, audioAvailable, readingError, readPage } = usePageReader(contentRef);

  useEffect(() => {
    document.title = `${title} | Reconecta 50+`;
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [title]);

  return (
    <div ref={contentRef} className={layoutStyles['app-shell']}>
      <a className={layoutStyles['skip-link']} href="#auth-content" data-read-skip>
        Pular para o formulário
      </a>
      <AppHeader homeHref="/login">
        <AccessibilityToolbar
          speaking={speaking}
          audioAvailable={audioAvailable}
          onRead={readPage}
        />
        <ShareButton url={new URL('/login', window.location.origin).href} />
      </AppHeader>
      {readingError && (
        <p className={layoutStyles['reading-error']} role="status" data-read-skip>
          {readingError}
        </p>
      )}
      <main className={layoutStyles['login-layout']} data-read-order>
        <WelcomePanel />
        <section
          className={layoutStyles['login-section']}
          aria-labelledby="auth-title"
          id="auth-content"
        >
          <div className={layoutStyles['login-card']}>
            <span className={layoutStyles['section-label']}>{eyebrow}</span>
            <h2 id="auth-title" ref={titleRef} tabIndex={-1}>
              {title}
            </h2>
            <p className={layoutStyles['login-description']}>{description}</p>
            {children}
            <p className={layoutStyles['demo-note']}>
              Versão de demonstração · autenticação em preparação
            </p>
          </div>
          <HelpDisclosure label={helpLabel}>{helpText}</HelpDisclosure>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
