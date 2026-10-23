import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { FontScaleContext } from './FontScaleContext';

const STORAGE_KEY = 'reconecta.fontScale';
const MIN_SCALE = 100;
const MAX_SCALE = 140;
const DEFAULT_SCALE = 130;

function readSavedScale(): number {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(saved) && saved >= MIN_SCALE && saved <= MAX_SCALE && saved % 10 === 0)
      return saved;
  } catch {}
  return DEFAULT_SCALE;
}

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScale] = useState(readSavedScale);

  useEffect(() => {
    const previous = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = `${fontScale}%`;
    try {
      localStorage.setItem(STORAGE_KEY, String(fontScale));
    } catch {}
    return () => {
      document.documentElement.style.fontSize = previous;
    };
  }, [fontScale]);

  return (
    <FontScaleContext.Provider
      value={{
        fontScale,
        canDecrease: fontScale > MIN_SCALE,
        canIncrease: fontScale < MAX_SCALE,
        decrease: () => setFontScale((value) => Math.max(MIN_SCALE, value - 10)),
        increase: () => setFontScale((value) => Math.min(MAX_SCALE, value + 10)),
      }}
    >
      {children}
    </FontScaleContext.Provider>
  );
}
