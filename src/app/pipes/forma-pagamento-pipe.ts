import { Pipe, PipeTransform } from '@angular/core';
import { FormaPagamentoEnum } from '../enums/FormaPagamentoEnum';

@Pipe({
  name: 'formaPagamento',
  standalone: true,
})
export class FormaPagamentoPipe implements PipeTransform {
  private readonly labels: Record<FormaPagamentoEnum, string> = {
    [FormaPagamentoEnum.DINHEIRO]: 'Dinheiro',
    [FormaPagamentoEnum.CARTAO_CREDITO]: 'Cartão de Crédito',
    [FormaPagamentoEnum.CARTAO_DEBITO]: 'Cartão de Débito',
    [FormaPagamentoEnum.PIX]: 'Pix',
    [FormaPagamentoEnum.BOLETO]: 'Boleto',
    [FormaPagamentoEnum.TRANSFERENCIA]: 'Transferência',
  };

  transform(value: FormaPagamentoEnum | string | null | undefined): string {
    if (!value) {
      return '';
    }

    return this.labels[value as FormaPagamentoEnum] ?? value;
  }
}
