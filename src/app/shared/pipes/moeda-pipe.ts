import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moeda',
  standalone: true,
})
export class MoedaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor ?? 0);
  }
}
