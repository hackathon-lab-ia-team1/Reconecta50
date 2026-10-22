import { useId } from 'react';
import type { ComponentProps } from 'react';
import styles from './TextAreaField.module.css';

interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({
  label,
  hint,
  error,
  id: providedId,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const description = error || hint;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <textarea
        {...props}
        id={id}
        rows={props.rows ?? 4}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], description ? `${id}-description` : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {description && (
        <p className={error ? styles.error : undefined} id={`${id}-description`}>
          {description}
        </p>
      )}
    </div>
  );
}
