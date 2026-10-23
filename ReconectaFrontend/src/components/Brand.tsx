import brandStyles from './Brand.module.css';
import { HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Brand({ href = './' }: { href?: string }) {
  return (
    <Link className={brandStyles['brand']} to={href} aria-label="Reconecta 50+, início">
      <span className={brandStyles['brand-icon']}>
        <HeartHandshake size={28} aria-hidden="true" />
      </span>
      <span>
        Reconecta{' '}
        <strong>
          50<span className={brandStyles['brand-plus']}>+</span>
        </strong>
        <small>EXPERIÊNCIA QUE CONECTA</small>
      </span>
    </Link>
  );
}
