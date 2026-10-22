import footerStyles from './AppFooter.module.css';
import { Heart } from 'lucide-react';
export function AppFooter() {
    return <footer className={footerStyles['footer']}>
    <span>© {new Date().getFullYear()} Reconecta 50+. Todos os direitos reservados.</span>
    <span>Feito para conectar histórias a novos caminhos.<Heart size={14} aria-hidden="true"/></span>
  </footer>;
}
