import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption, IonInput } from '@ionic/angular';
import { CalculationEntry, Subject, formatNumber, readNumber } from './calculator.models';
import { PhysicsFormulaService } from './physics-formula.service';
import { ChemistryService } from './chemistry.service';
import { StatisticsService } from './statistics.service';
import { UnitConversionService } from './unit-conversion.service';

@Component({
  selector: 'app-subject-tools', standalone: true,
  imports: [CommonModule, FormsModule, IonSelect, IonSelectOption, IonInput],
  templateUrl: './subject-tools.component.html', styleUrl: './subject-tools.component.scss',
})
export class SubjectToolsComponent implements OnChanges {
  @Input() subject: Subject = 'maths';
  @Input() restored?: CalculationEntry;
  @Output() calculated = new EventEmitter<CalculationEntry>();
  @Output() invalidated = new EventEmitter<void>();
  readonly formulas = new PhysicsFormulaService();
  readonly chemistry = new ChemistryService();
  readonly statistics = new StatisticsService();
  readonly units = new UnitConversionService();
  readonly format = formatNumber;
  category = '';
  formulaId = '';
  values: Record<string,string> = {};
  selectedUnits: Record<string,string> = {};
  outputUnit = '';
  molecule = '';
  dataset = '';
  sample = false;
  conversionCategory = 'Longueur';
  conversionValue = '';
  from = 'm';
  to = 'km';
  search = '';
  resultText = '';
  error = '';
  get categories() {
    const categories = [...new Set(this.formulas.formulas.filter(item => item.subject === this.subject).map(item => item.category))];
    return this.subject === 'chemistry' ? [...categories, 'Masse molaire', 'Tableau périodique'] : categories;
  }
  get availableFormulas() { return this.formulas.formulas.filter(item => item.subject === this.subject && item.category === this.category); }
  get formula() { return this.availableFormulas.find(item => item.id === this.formulaId); }
  get elements() {
    const query = this.search.trim().toLocaleLowerCase('fr');
    return this.chemistry.elements.filter(item => `${item.symbol} ${item.name} ${item.atomicNumber}`.toLocaleLowerCase('fr').includes(query));
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['subject']) { this.category = this.categories[0] || ''; this.selectCategory(false); }
    if (this.restored && (changes['restored'] || changes['subject'])) this.restore(this.restored);
  }
  invalidate() { this.resultText = ''; this.error = ''; this.invalidated.emit(); }
  selectCategory(notify = true) { this.formulaId = this.availableFormulas[0]?.id || ''; this.selectFormula(notify); }
  selectFormula(notify = true) {
    this.values = {}; this.selectedUnits = {};
    this.formula?.inputs.forEach(field => { this.selectedUnits[field.id] = field.unit; });
    this.outputUnit = this.formula?.unit || '';
    if (notify) this.invalidate();
  }
  selectConversionCategory() {
    const units = this.units.forCategory(this.conversionCategory);
    this.from = units[0].id; this.to = units[1]?.id || units[0].id; this.invalidate();
  }
  private restore(entry: CalculationEntry) {
    const inputs = entry.inputs || {};
    if (entry.tool === 'molar') { this.category = 'Masse molaire'; this.molecule = inputs['molecule'] || ''; }
    else if (entry.tool === 'statistics') { this.dataset = inputs['dataset'] || ''; this.sample = inputs['sample'] === 'true'; }
    else if (entry.tool === 'conversion') {
      this.conversionCategory = inputs['category']; this.conversionValue = inputs['value']; this.from = inputs['from']; this.to = inputs['to'];
    } else {
      const formula = this.formulas.formulas.find(item => item.id === entry.tool && item.subject === this.subject);
      if (formula) {
        this.category = formula.category; this.formulaId = formula.id; this.selectFormula(false);
        formula.inputs.forEach(field => { this.values[field.id] = inputs[field.id] || ''; this.selectedUnits[field.id] = inputs[field.id + ':unit'] || field.unit; });
        this.outputUnit = entry.unit;
      }
    }
    this.resultText = entry.text || `${entry.expression} = ${formatNumber(entry.result)} ${entry.unit}`;
  }
  calculate() {
    this.invalidate();
    try {
      let result: number, text: string, expression: string, unit = '', tool = '';
      let inputs: Record<string,string> = {};
      if (this.subject === 'statistics') {
        const stats = this.statistics.calculate(this.dataset, this.sample);
        result = stats.mean; expression = this.dataset; tool = 'statistics';
        inputs = { dataset: this.dataset, sample: String(this.sample) };
        text = ['Statistiques ? ' + (this.sample ? '?chantillon (n ? 1)' : 'Population (n)'),
          `Valeurs : ${this.dataset}`, `Nombre de valeurs : ${stats.count}`, `Somme : ${formatNumber(stats.sum)}`,
          `Moyenne : ${formatNumber(stats.mean)}`, `M?diane : ${formatNumber(stats.median)}`,
          `Mode : ${stats.modes.length ? stats.modes.map(formatNumber).join(' ; ') : 'Aucun'}`,
          `Minimum : ${formatNumber(stats.min)}`, `Maximum : ${formatNumber(stats.max)}`, `?tendue : ${formatNumber(stats.range)}`,
          `Variance : ${formatNumber(stats.variance)}`, `?cart-type : ${formatNumber(stats.standardDeviation)}`].join('\n');
      } else if (this.subject === 'conversions') {
        result = this.units.convert(readNumber(this.conversionValue), this.from, this.to);
        expression = `${this.conversionValue} ${this.from}`; unit = this.to; tool = 'conversion';
        inputs = { category: this.conversionCategory, value: this.conversionValue, from: this.from, to: this.to };
        text = `${expression} = ${formatNumber(result)} ${unit}`;
      } else if (this.subject === 'chemistry' && this.category === 'Masse molaire') {
        result = this.chemistry.molarMass(this.molecule); expression = this.molecule; unit = 'g/mol'; tool = 'molar';
        inputs = { molecule: this.molecule }; text = `Masse molaire\n${this.molecule}\nM = ${formatNumber(result)} g/mol`;
      } else {
        const formula = this.formula;
        if (!formula) throw new Error('S?lectionnez une formule.');
        const calculation = this.formulas.calculate(formula, this.values, this.selectedUnits, this.outputUnit);
        result = calculation.result; expression = formula.display; text = calculation.text; unit = this.outputUnit; tool = formula.id;
        inputs = { ...this.values, ...Object.fromEntries(Object.entries(this.selectedUnits).map(([key,value]) => [key + ':unit',value])) };
      }
      this.resultText = text;
      this.calculated.emit({ id: crypto.randomUUID(), subject: this.subject, expression, inputs, result, unit, text, tool, createdAt: new Date().toISOString() });
    } catch (error) { this.error = error instanceof Error ? error.message : 'Calcul impossible.'; }
  }
}
