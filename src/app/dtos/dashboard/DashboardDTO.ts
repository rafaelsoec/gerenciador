export class DashboardDTO {
  data!: Date;
  faturamento: number = 0;
  vendas: VendaDTO[] = [];
  pedidosRecentes: PedidoRecenteDTO[] = [];
  produtosMaisVendidos: ProdutoMaisVendidoDTO[] = [];
  meta: MetaDTO = new MetaDTO();
}

export class VendaDTO {
  data!: Date;
  valor: number = 0;
}

export class PedidoRecenteDTO {
  id!: number;
  cliente!: string;
  data!: Date;
  valor!: number;
  status!: string;
}

export class ProdutoMaisVendidoDTO {
  id!: number;
  nome!: string;
  quantidadeVendida: number = 0;
  valorTotal: number = 0;
}

export class MetaDTO {
  percentualAtingido: number = 0;
  percentualEmAberto: number = 0;
  pedidosEmAberto: number = 0;
  pedidosConcluidos: number = 0;
  total: number = 0;
}
