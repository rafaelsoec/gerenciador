import { StatusPedidoEnum } from '../../enums/StatusPedidoEnum';
import { FormaPagamentoEnum } from '../../enums/FormaPagamentoEnum';
import { ItemPedidoDTO } from './ItemPedidoDTO';

export class PedidoDTO {
  id = 0;
  clienteNome = '';
  clienteId: number = 0;
  status = StatusPedidoEnum.PENDENTE;
  formaPagamento = FormaPagamentoEnum.DINHEIRO;
  desconto = 0;
  frete = 0;
  valorTotal = 0;
  observacao = '';
  dataEntrega = '';
  criadoEm = '';
  itens: ItemPedidoDTO[] = [];
}
