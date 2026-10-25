import { useContext } from 'react';
import { CareerContext } from './CareerContext';

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error('useCareer deve ser usado dentro de CareerProvider.');
  return context;
}
