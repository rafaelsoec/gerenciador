export interface ItemPedidoDTO {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
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
