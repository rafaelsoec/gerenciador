import { StatusPedidoEnum } from '../../enums/StatusPedidoEnum';
import { FormaPagamentoEnum } from '../../enums/FormaPagamentoEnum';

export class PedidoDTO {
  id = 0;
  clienteNome = '';
  status = StatusPedidoEnum.PENDENTE;
  formaPagamento = FormaPagamentoEnum.DINHEIRO;
  desconto = 0;
  frete = 0;
  valorTotal = 0;
  observacao = '';
  dataEntrega = '';
  criadoEm = '';
}
