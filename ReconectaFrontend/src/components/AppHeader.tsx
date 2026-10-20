import headerStyles from './AppHeader.module.css';
import type { ReactNode } from 'react';
import { Brand } from './Brand';
export function AppHeader({ children, homeHref = './' }: {
    children?: ReactNode;
    homeHref?: string;
}) {
    return <header className={headerStyles['header']} data-read-skip><Brand href={homeHref}/><div className={headerStyles['header-actions']}>{children}</div></header>;
}
