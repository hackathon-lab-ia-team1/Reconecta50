import { Link } from 'react-router-dom';
import type { ComponentProps } from 'react';
import styles from './Action.module.css';

export function LinkButton({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<typeof Link> & { variant?: 'primary' | 'secondary' | 'light' }) {
  return <Link {...props} className={`${styles.action} ${styles[variant]} ${className}`} />;
}
