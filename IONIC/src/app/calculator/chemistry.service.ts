import { PERIODIC_TABLE } from './periodic-table';
export class ChemistryService {
  readonly elements = PERIODIC_TABLE;
  molarMass(formula: string): number {
    const subscripts: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
    const source = formula.trim().replace(/[₀-₉]/g, digit => subscripts[digit]);
    if (!source || source.length > 300) throw new Error('Saisissez une formule chimique valide (300 caractères maximum).');
    let index = 0;
    const count = () => {
      const match = source.slice(index).match(/^\d+/);
      if (!match) return 1;
      index += match[0].length;
      const value = Number(match[0]);
      if (!Number.isSafeInteger(value) || value < 1 || value > 1000000) throw new Error('Indice chimique invalide.');
      return value;
    };
    const group = (depth: number): number => {
      if (depth > 20) throw new Error('Formule trop imbriquée.');
      let mass = 0, terms = 0;
      while (index < source.length && source[index] !== ')' && source[index] !== ']') {
        let part: number;
        if (source[index] === '(' || source[index] === '[') {
          const closing = source[index++] === '(' ? ')' : ']';
          part = group(depth+1);
          if (source[index++] !== closing) throw new Error('Parenthèses non équilibrées.');
        } else {
          const symbol = source.slice(index).match(/^[A-Z][a-z]?/);
          if (!symbol) throw new Error('Symbole ou caractère chimique invalide.');
          index += symbol[0].length;
          const element = this.elements.find(item => item.symbol === symbol[0]);
          if (!element) throw new Error(`Élément inconnu : ${symbol[0]}`);
          part = element.atomicMass;
        }
        mass += part * count(); terms++;
      }
      if (!terms) throw new Error('Groupe chimique vide.');
      return mass;
    };
    const result = group(0);
    if (index !== source.length || !Number.isFinite(result)) throw new Error('Formule chimique invalide.');
    return result;
  }
}
