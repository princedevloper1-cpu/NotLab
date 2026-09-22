export interface UnitDefinition { id: string; category: string; factor: number; offset?: number; }
// Base value = value * factor + offset. Digital prefixes KB/MB are decimal.
const groups: [string, [string, number, number?][]][] = [
  ['Longueur', [['m',1],['km',1000],['cm',.01],['mm',.001],['mile',1609.344],['ft',.3048],['in',.0254]]],
  ['Masse', [['kg',1],['g',.001],['mg',.000001],['lb',.45359237]]],
  ['Temp?rature', [['K',1],['?C',1,273.15],['?F',5/9,255.3722222222222]]],
  ['Surface', [['m?',1],['cm?',.0001],['mm?',.000001],['km?',1000000],['ha',10000]]],
  ['Volume', [['m?',1],['L',.001],['mL',.000001],['cm?',.000001]]],
  ['Temps', [['s',1],['ms',.001],['min',60],['h',3600],['jour',86400]]],
  ['Vitesse', [['m/s',1],['km/h',1/3.6],['mph',.44704]]],
  ['Pression', [['Pa',1],['kPa',1000],['bar',100000],['atm',101325]]],
  ['?nergie', [['J',1],['kJ',1000],['Wh',3600],['kWh',3600000]]],
  ['Puissance', [['W',1],['kW',1000],['MW',1000000]]],
  ['Donn?es num?riques', [['B',1],['KB',1e3],['MB',1e6],['GB',1e9],['TB',1e12],['KiB',1024],['MiB',1048576],['GiB',1073741824],['bit',1/8]]],
  ['Acc?l?ration', [['m/s?',1],['cm/s?',.01]]],
  ['Force', [['N',1],['kN',1000]]],
  ['Tension', [['V',1],['mV',.001],['kV',1000]]],
  ['R?sistance', [['?',1],['k?',1000]]],
  ['Courant', [['A',1],['mA',.001]]],
  ['Charge', [['C',1],['mC',.001]]],
  ['Fr?quence', [['Hz',1],['kHz',1000],['MHz',1e6]]],
  ['Quantit? de mati?re', [['mol',1],['mmol',.001]]],
  ['Masse molaire', [['g/mol',1],['kg/mol',1000]]],
  ['Concentration molaire', [['mol/L',1],['mmol/L',.001],['mol/m?',.001]]],
  ['Concentration massique', [['g/L',1],['mg/L',.001],['kg/m?',1]]],
  ['Masse volumique', [['kg/m?',1],['g/cm?',1000],['g/mL',1000]]],
  ['Capacit? thermique massique', [['J/(kg?K)',1],['kJ/(kg?K)',1000]]],
  ['?cart de temp?rature', [['?K',1],['??C',1],['??F',5/9]]],
];
export class UnitConversionService {
  readonly units: UnitDefinition[] = groups.flatMap(([category, values]) => values.map(([id,factor,offset]) => ({id,category,factor,offset})));
  readonly categories = groups.slice(0,11).map(([category]) => category);
  forCategory(category: string) { return this.units.filter(unit => unit.category === category); }
  compatible(id: string) { const unit = this.units.find(item => item.id === id); return unit ? this.forCategory(unit.category) : []; }
  convert(value: number, from: string, to: string): number {
    const source = this.units.find(unit => unit.id === from);
    const target = this.units.find(unit => unit.id === to);
    if (!source || !target || source.category !== target.category || !Number.isFinite(value)) throw new Error('Unit?s incompatibles ou valeur invalide.');
    const base = value * source.factor + (source.offset || 0);
    if (source.category === 'Temp?rature' && base < -1e-9) throw new Error('La temp?rature doit ?tre sup?rieure ou ?gale au z?ro absolu.');
    const result = (base - (target.offset || 0)) / target.factor;
    if (!Number.isFinite(result)) throw new Error('R?sultat hors limites.');
    return result;
  }
}
