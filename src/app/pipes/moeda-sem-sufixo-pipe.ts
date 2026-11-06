import { Pipe, PipeTransform } from '@angular/core';
import { NumberUtils } from '../utils/NumberUtils';

@Pipe({
  name: 'moedaSemSufixo',
  standalone: true,
})
export class MoedaSemSufixoPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(NumberUtils.toNumber(valor ?? 0))
      .replaceAll("R$", "")
      .trim();
  }
}
