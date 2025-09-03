import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceLevelLabel',
  standalone: true
})
export class PriceLevelLabelPipe implements PipeTransform {
  private readonly labels: Record<number, string> = {
    1: '$',
    2: '$$',
    3: '$$$',
    4: '$$$$'
  };

  transform(value: number | null | undefined): string {
    if (!value) return '';
    return this.labels[value] ?? '';
  }
}
