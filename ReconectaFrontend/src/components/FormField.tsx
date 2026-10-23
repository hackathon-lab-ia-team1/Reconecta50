import fieldStyles from './FormField.module.css';
import { useId, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps extends ComponentProps<'input'> {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  icon,
  id: providedId,
  type = 'text',
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [visible, setVisible] = useState(false);
  const description = error || hint;
  return (
    <div className={fieldStyles['field']}>
      <label htmlFor={id}>{label}</label>
      <div className={fieldStyles['input-wrap']}>
        {icon}
        <input
          {...inputProps}
          id={id}
          type={type === 'password' && visible ? 'text' : type}
          aria-invalid={error ? true : inputProps['aria-invalid']}
          aria-describedby={
            [inputProps['aria-describedby'], description ? `${id}-description` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {type === 'password' && (
          <button
            className={fieldStyles['password-toggle']}
            type="button"
            disabled={inputProps.disabled}
            aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff size={21} /> : <Eye size={21} />}
          </button>
        )}
      </div>
      {description && (
        <p
          className={error ? fieldStyles['field-error'] : fieldStyles['field-hint']}
          id={`${id}-description`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
