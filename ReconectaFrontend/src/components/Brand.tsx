import brandStyles from './Brand.module.css';
import { HeartHandshake } from 'lucide-react';
export function Brand({ href = './' }: {
    href?: string;
}) {
    return <a className={brandStyles['brand']} href={href} aria-label="Reconecta 50+, início">
    <span className={brandStyles['brand-icon']}><HeartHandshake size={28} aria-hidden="true"/></span>
    <span>Reconecta <strong>50<span className={brandStyles['brand-plus']}>+</span></strong><small>EXPERIÊNCIA QUE CONECTA</small></span>
  </a>;
}
