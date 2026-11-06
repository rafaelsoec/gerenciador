import { Pipe, PipeTransform } from '@angular/core';
import { NumberUtils } from '../utils/NumberUtils';

@Pipe({
  name: 'percentual',
  standalone: true,
})
export class PercentualPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (!valor) {
      return '';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(NumberUtils.toNumber(valor));
  }
}
