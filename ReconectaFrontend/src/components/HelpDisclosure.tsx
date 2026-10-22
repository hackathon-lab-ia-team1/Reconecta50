import helpStyles from './HelpDisclosure.module.css';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';
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
        <CircleHelp size={19} />
        {label}
      </button>
      <div className={helpStyles['help-content']} id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
