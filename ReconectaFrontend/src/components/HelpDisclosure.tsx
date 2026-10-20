import helpStyles from './HelpDisclosure.module.css';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';
export function HelpDisclosure({ label, children }: {
    label: string;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const id = useId();
    return <div className={helpStyles['help-area']}>
    <button className={helpStyles['help-button']} type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={id}><CircleHelp size={19}/>{label}</button>
    <p id={id} hidden={!open}>{children}</p>
  </div>;
}
