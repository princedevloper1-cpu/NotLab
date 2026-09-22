// Extracted from the existing calculator; also used by note formula blocks.
export class FormulaEngine {
  evaluate(expression: string, angleMode: 'DEG' | 'RAD' = 'DEG'): number | undefined {
    if (!expression || expression.length > 1000) return undefined;
    const normalized = expression.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '').replace(/π/g, 'pi');
    let index = 0;
    const parseExpression = (): number | undefined => {
      let value = parseTerm();
      while (value !== undefined && (normalized[index] === '+' || normalized[index] === '-')) {
        const operator = normalized[index++];
        const right = parseTerm();
        if (right === undefined) return undefined;
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    };
    const parseTerm = (): number | undefined => {
      let value = parseUnary();
      while (value !== undefined && (normalized[index] === '*' || normalized[index] === '/')) {
        const operator = normalized[index++];
        const right = parseUnary();
        if (right === undefined || (operator === '/' && right === 0)) return undefined;
        value = operator === '*' ? value * right : value / right;
      }
      return value;
    };
    const parsePower = (): number | undefined => {
      let value = parsePostfix();
      if (value !== undefined && normalized[index] === '^') {
        index++;
        const exponent = parseUnary();
        if (exponent === undefined) return undefined;
        value = Math.pow(value, exponent);
      }
      return value;
    };
    const parseUnary = (): number | undefined => {
      if (normalized[index] === '+') { index++; return parseUnary(); }
      if (normalized[index] === '-') { index++; const value = parseUnary(); return value === undefined ? undefined : -value; }
      return parsePower();
    };
    const parsePostfix = (): number | undefined => {
      let value = parsePrimary();
      while (value !== undefined && (normalized[index] === '%' || normalized[index] === '!')) {
        const operator = normalized[index++];
        value = operator === '%' ? value / 100 : this.applyCalculatorFunction('factorial', value, angleMode);
      }
      return value;
    };
    const parsePrimary = (): number | undefined => {
      if (normalized[index] === '(') {
        index++;
        const value = parseExpression();
        if (normalized[index++] !== ')') return undefined;
        return value;
      }
      const functionMatch = normalized.slice(index).match(/^(asin|acos|atan|sin|cos|tan|log|ln|sqrt|cbrt|abs|factorial)/);
      if (functionMatch) {
        index += functionMatch[0].length;
        if (normalized[index++] !== '(') return undefined;
        const argument = parseExpression();
        if (normalized[index++] !== ')' || argument === undefined) return undefined;
        return this.applyCalculatorFunction(functionMatch[0], argument, angleMode);
      }
      if (normalized.slice(index, index + 2) === 'pi') { index += 2; return Math.PI; }
      if (normalized[index] === 'e') { index++; return Math.E; }
      const number = normalized.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!number) return undefined;
      index += number[0].length;
      return Number(number[0]);
    };
    let result: number | undefined;
    try { result = parseExpression(); } catch { return undefined; }
    return result !== undefined && index === normalized.length && Number.isFinite(result) ? result : undefined;
  }

  private applyCalculatorFunction(name: string, value: number, angleMode: 'DEG' | 'RAD'): number | undefined {
    if (name === 'sin' || name === 'cos' || name === 'tan') {
      const angle = angleMode === 'DEG' ? value * Math.PI / 180 : value;
      if (name === 'tan' && Math.abs(Math.cos(angle)) < 1e-14) return undefined;
      return name === 'sin' ? Math.sin(angle) : name === 'cos' ? Math.cos(angle) : Math.tan(angle);
    }
    if (['asin', 'acos', 'atan'].includes(name)) {
      const radians = name === 'asin' ? Math.asin(value) : name === 'acos' ? Math.acos(value) : Math.atan(value);
      return angleMode === 'DEG' ? radians * 180 / Math.PI : radians;
    }
    if (name === 'cbrt') return Math.cbrt(value);
    if (name === 'log') return value > 0 ? Math.log10(value) : undefined;
    if (name === 'ln') return value > 0 ? Math.log(value) : undefined;
    if (name === 'sqrt') return value >= 0 ? Math.sqrt(value) : undefined;
    if (name === 'abs') return Math.abs(value);
    if (name === 'factorial') return value >= 0 && Number.isInteger(value) && value <= 170 ? Array.from({ length: value }, (_, i) => i + 1).reduce((total, current) => total * current, 1) : undefined;
    return undefined;
  }

}
