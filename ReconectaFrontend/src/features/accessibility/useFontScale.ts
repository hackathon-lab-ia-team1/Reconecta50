import { useContext } from 'react';
import { FontScaleContext } from './FontScaleContext';

export function useFontScale() {
  const context = useContext(FontScaleContext);
  if (!context) throw new Error('useFontScale deve ser usado dentro de FontScaleProvider.');
  return context;
}
