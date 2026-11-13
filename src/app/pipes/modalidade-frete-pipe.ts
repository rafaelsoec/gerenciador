import { Pipe, PipeTransform } from '@angular/core';
import { FormaPagamentoEnum } from '../enums/FormaPagamentoEnum';
import { ModalidadeFreteEnum, modalidadeFreteLabel } from '../enums/ModalidadeFreteEnum';

@Pipe({
  name: 'modalidadeFrete',
  standalone: true,
})
export class ModalidadeFretePipe implements PipeTransform {
  private readonly labels: Record<ModalidadeFreteEnum, string> = modalidadeFreteLabel;

  transform(value: ModalidadeFreteEnum | string | null | undefined): string {
    if (!value) {
      return '';
    }

    return this.labels[value as ModalidadeFreteEnum] ?? value;
  }
}
