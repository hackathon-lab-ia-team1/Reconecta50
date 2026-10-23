import accessibilityStyles from './AccessibilityToolbar.module.css';
import { Volume2, VolumeX } from 'lucide-react';
import { useFontScale } from '../features/accessibility/useFontScale';
interface AccessibilityToolbarProps {
  speaking: boolean;
  audioAvailable: boolean;
  onRead: () => void;
}
export function AccessibilityToolbar({
  speaking,
  audioAvailable,
  onRead,
}: AccessibilityToolbarProps) {
  const { canDecrease, canIncrease, decrease, increase } = useFontScale();
  return (
    <nav className={accessibilityStyles['accessibility']} aria-label="Acessibilidade">
      <span className={accessibilityStyles['accessibility-label']}>Tamanho do texto</span>
      <button
        className={accessibilityStyles['accessibility-button']}
        aria-label="Diminuir texto"
        disabled={!canDecrease}
        onClick={decrease}
      >
        A−
      </button>
      <button
        className={accessibilityStyles['accessibility-button']}
        aria-label="Aumentar texto"
        disabled={!canIncrease}
        onClick={increase}
      >
        A+
      </button>
      {audioAvailable && (
        <button
          className={`${accessibilityStyles['accessibility-button']} ${accessibilityStyles['read-button']}`}
          onClick={onRead}
          aria-label={speaking ? 'Parar leitura' : 'Ouvir a página'}
          aria-pressed={speaking}
        >
          {speaking ? <VolumeX size={19} /> : <Volume2 size={19} />}
          <span>{speaking ? 'Parar leitura' : 'Ouvir a página'}</span>
        </button>
      )}
    </nav>
  );
}
