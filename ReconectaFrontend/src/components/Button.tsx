import type { ComponentProps } from 'react';
import styles from './Action.module.css';

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: 'primary' | 'secondary' }) {
  return (
    <button {...props} type={type} className={`${styles.action} ${styles[variant]} ${className}`} />
  );
}
