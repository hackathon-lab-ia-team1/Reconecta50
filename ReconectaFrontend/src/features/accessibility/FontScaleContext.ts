import { createContext } from 'react';

export interface FontScaleContextValue {
  fontScale: number;
  canDecrease: boolean;
  canIncrease: boolean;
  decrease: () => void;
  increase: () => void;
}

export const FontScaleContext = createContext<FontScaleContextValue | null>(null);
