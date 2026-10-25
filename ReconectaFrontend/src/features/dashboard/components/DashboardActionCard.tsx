import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './DashboardActionCard.module.css';

interface DashboardActionCardProps {
  to: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  tone: 'green' | 'blue' | 'olive';
}

export function DashboardActionCard({
  to,
  title,
  description,
  action,
  icon: Icon,
  tone,
}: DashboardActionCardProps) {
  return (
    <Link to={to} className={`${styles.card} ${styles[tone]}`}>
      <span className={styles.icon}>
        <Icon size={26} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={styles.action}>
        {action}
        <ArrowUpRight size={20} aria-hidden="true" />
      </span>
    </Link>
  );
}
