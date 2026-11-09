export interface ItemPedidoDTO {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  descricao: string;
  precoUnitario: number;
  desconto: number;
  subtotal: number;
  aliquotaIcms: number;
  aliquotaIpi: number;
  aliquotaPis: number;
  aliquotaCofins: number;
  ncm: string;
  cfop: string;
}
