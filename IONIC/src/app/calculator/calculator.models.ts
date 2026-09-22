export type Subject = 'maths' | 'physics' | 'chemistry' | 'statistics' | 'conversions';
export const SUBJECTS: { id: Subject; name: string }[] = [
  { id: 'maths', name: 'Mathématiques' }, { id: 'physics', name: 'Physique' },
  { id: 'chemistry', name: 'Chimie' }, { id: 'statistics', name: 'Statistiques' },
  { id: 'conversions', name: 'Conversions' },
];
export interface CalculationEntry {
  id: string;
  subject: Subject;
  expression: string;
  inputs: Record<string, string>;
  result: number;
  unit: string;
  createdAt: string;
  text?: string;
  tool?: string;
  angleMode?: 'DEG' | 'RAD';
}
export interface FormulaInput { id: string; label: string; unit: string; positive?: boolean; nonnegative?: boolean; }
export interface FormulaDefinition {
  id: string; subject: Subject; category: string; name: string; display: string;
  expression: string; unit: string; inputs: FormulaInput[]; note?: string;
}
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', Math.abs(value) !== 0 && (Math.abs(value) < 1e-6 || Math.abs(value) >= 1e12)
    ? { notation: 'scientific', maximumSignificantDigits: 12 } : { maximumSignificantDigits: 12 }).format(value);
}
export function readNumber(value: string): number {
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(value.trim())) throw new Error('Saisissez un nombre valide.');
  const result = Number(value.trim().replace(',', '.'));
  if (!Number.isFinite(result)) throw new Error('Nombre hors limites.');
  return result;
}
