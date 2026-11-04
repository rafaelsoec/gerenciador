import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moedaSemSufixo',
  standalone: true,
})
export class MoedaSemSufixoPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor ?? 0)
      .replaceAll("R$", "")
      .trim();
  }
}
