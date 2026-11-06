import { Pipe, PipeTransform } from '@angular/core';
import { StatusPedidoEnum } from '../enums/StatusPedidoEnum';

@Pipe({
  name: 'statusPedido',
  standalone: true,
})
export class StatusPedidoPipe implements PipeTransform {
  private readonly labels: Record<StatusPedidoEnum, string> = {
    [StatusPedidoEnum.CANCELADO]: 'Cancelado',
    [StatusPedidoEnum.CONFIRMADO]: 'Confirmado',
    [StatusPedidoEnum.EM_PREPARO]: 'Em Preparo',
    [StatusPedidoEnum.ENVIADO]: 'Enviado',
    [StatusPedidoEnum.ENTREGUE]: 'Entregue',
    [StatusPedidoEnum.PENDENTE]: 'Pendente',
  };

  transform(value: StatusPedidoEnum | string | null | undefined): string {
    if (!value) {
      return '';
    }

    return this.labels[value as StatusPedidoEnum] ?? value;
  }
}
