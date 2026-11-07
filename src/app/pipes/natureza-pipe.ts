import { Pipe, PipeTransform } from '@angular/core';
import { NaturezaOperacaoEnum, NaturezaOperacaoLabel } from '../enums/NaturezaOperacaoEnum';

@Pipe({
  name: 'NaturezaOperacaoPipe',
  standalone: true,
})
export class NaturezaOperacaoPipePipe implements PipeTransform {
  transform(valor: NaturezaOperacaoEnum): string {
    if (!valor) {
      return '';
    }

    return NaturezaOperacaoLabel[valor];
  }
}
