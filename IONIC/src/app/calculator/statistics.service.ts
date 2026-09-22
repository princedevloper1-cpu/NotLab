export interface StatisticsResult {
  values: number[]; count: number; sum: number; mean: number; median: number; modes: number[];
  min: number; max: number; range: number; variance: number; standardDeviation: number;
}
export class StatisticsService {
  calculate(source: string, sample = false): StatisticsResult {
    const parts = source.trim().split(/[\s,;]+/).filter(Boolean);
    if (!parts.length || parts.length > 10000) throw new Error('Saisissez entre 1 et 10 000 valeurs.');
    const values = parts.map(part => {
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(part)) throw new Error('Valeur invalide. Utilisez le point pour les d?cimales.');
      return Number(part);
    });
    if (values.some(value => !Number.isFinite(value))) throw new Error('Valeur hors limites.');
    if (sample && values.length < 2) throw new Error('Un ?chantillon doit contenir au moins deux valeurs.');
    const sorted = [...values].sort((a,b) => a-b);
    let mean = 0, m2 = 0, sum = 0;
    const frequencies = new Map<number,number>();
    values.forEach((value,index) => {
      sum += value;
      const delta = value - mean;
      mean += delta / (index + 1);
      m2 += delta * (value - mean);
      frequencies.set(value, (frequencies.get(value) || 0) + 1);
    });
    const maxFrequency = Math.max(...frequencies.values());
    const modes = maxFrequency === 1 ? [] : [...frequencies].filter(([,count]) => count === maxFrequency).map(([value]) => value).sort((a,b) => a-b);
    const mid = Math.floor(values.length/2);
    const variance = Math.max(0,m2 / (values.length - (sample ? 1 : 0)));
    const result = { values, count: values.length, sum, mean, median: values.length % 2 ? sorted[mid] : sorted[mid-1]/2 + sorted[mid]/2,
      modes, min: sorted[0], max: sorted[sorted.length-1], range: sorted[sorted.length-1]-sorted[0], variance, standardDeviation: Math.sqrt(variance) };
    if (Object.values(result).some(value => typeof value === 'number' && !Number.isFinite(value))) throw new Error('R?sultat hors limites.');
    return result;
  }
}
