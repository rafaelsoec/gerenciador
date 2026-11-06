import { Pipe, PipeTransform } from '@angular/core';
import { NumberUtils } from '../utils/NumberUtils';

@Pipe({
  name: 'moeda',
  standalone: true,
})
export class MoedaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(NumberUtils.toNumber(valor ?? 0));
  }
}
