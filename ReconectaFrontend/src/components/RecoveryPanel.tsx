import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';
import styles from './RecoveryPanel.module.css';

interface RecoveryPanelProps {
  code: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function RecoveryPanel({ code, title, description, children }: RecoveryPanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  useEffect(() => {
    document.title = `${title} | Reconecta 50+`;
    titleRef.current?.focus();
  }, [title]);

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.symbol} aria-hidden="true">
        <Compass size={48} />
      </div>
      <span className={styles.code}>{code}</span>
      <h1 id={titleId} ref={titleRef} tabIndex={-1}>
        {title}
      </h1>
      <p>{description}</p>
      <div className={styles.actions}>{children}</div>
    </section>
  );
}
