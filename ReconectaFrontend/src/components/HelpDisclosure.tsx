import helpStyles from './HelpDisclosure.module.css';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, CircleHelp } from 'lucide-react';

export function HelpDisclosure({
  label,
  children,
  defaultOpen = false,
  variant = 'default',
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'wide';
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`${helpStyles['help-area']} ${variant === 'wide' ? helpStyles.wide : ''}`}>
      <button
        className={helpStyles['help-button']}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
      >
        <CircleHelp size={19} aria-hidden="true" />
        <span className={helpStyles['help-label']}>{label}</span>
        <span className={helpStyles['help-hint']} aria-hidden="true">
          {open ? '(clique aqui para recolher)' : '(clique aqui para abrir dicas)'}
        </span>
        {open ? (
          <ChevronUp size={18} aria-hidden="true" />
        ) : (
          <ChevronDown size={18} aria-hidden="true" />
        )}
      </button>
      <div className={helpStyles['help-content']} id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
