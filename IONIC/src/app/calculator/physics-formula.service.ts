import { FormulaEngine } from './formula-engine';
import { FORMULAS } from './formula-catalog';
import { FormulaDefinition, readNumber, formatNumber } from './calculator.models';
import { UnitConversionService } from './unit-conversion.service';
// The same evaluator serves physics, chemistry and mathematical formula definitions.
export class PhysicsFormulaService {
  readonly formulas = FORMULAS;
  private readonly engine = new FormulaEngine();
  private readonly units = new UnitConversionService();
  calculate(formula: FormulaDefinition, inputs: Record<string,string>, selectedUnits: Record<string,string>, outputUnit: string) {
    const values: Record<string,number> = {};
    for (const field of formula.inputs) {
      const value = readNumber(inputs[field.id] || '');
      const base = field.unit ? this.units.convert(value, selectedUnits[field.id] || field.unit, field.unit) : value;
      if (field.positive && base <= 0 || field.nonnegative && base < 0) throw new Error(`${field.label} : valeur ${field.positive ? 'strictement positive' : 'positive ou nulle'} requise.`);
      values[field.id] = base;
    }
    if (formula.id === 'dilution' && values['c2'] > values['c1']) throw new Error('Une dilution ne peut pas augmenter la concentration.');
    const substitute = (source: string) => source.replace(/\b[a-z][a-z0-9]*\b/g, token => Object.hasOwn(values, token) ? `(${values[token]})` : token);
    const expression = substitute(formula.expression);
    let result = this.engine.evaluate(expression);
    let extra = '';
    if (formula.id === 'quadratic') {
      const {a,b,c} = values;
      if (a === 0) throw new Error('a doit ?tre non nul pour une ?quation du second degr?.');
      const discriminant = b*b - 4*a*c;
      if (discriminant < 0) throw new Error('Aucune racine r?elle (discriminant n?gatif).');
      const q = -.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(discriminant));
      const first = q === 0 ? -b / (2*a) : q/a;
      const second = q === 0 ? first : c/q;
      if (!Number.isFinite(first) || !Number.isFinite(second)) throw new Error('R?sultat hors limites.');
      result = first;
      extra = `x? = ${formatNumber(first)} ; x? = ${formatNumber(second)}`;
    }
    if (result === undefined) throw new Error('Calcul impossible : v?rifiez les valeurs et les d?nominateurs.');
    if (formula.unit) result = this.units.convert(result, formula.unit, outputUnit || formula.unit);
    const text = [formula.name, formula.display, ...formula.inputs.map(field => `${field.label} = ${inputs[field.id]} ${selectedUnits[field.id] || field.unit}`.trim()), extra || `R?sultat = ${formatNumber(result)} ${outputUnit}`.trim()].join('\n');
    return { result, expression, text };
  }
}
