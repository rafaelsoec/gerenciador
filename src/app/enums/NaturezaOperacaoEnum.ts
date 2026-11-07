export enum NaturezaOperacaoEnum {
  VENDA = 'VENDA',
  DEVOLUCAO = 'DEVOLUCAO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  REMESSA = 'REMESSA',
  PRESTACAO_SERVICO = 'PRESTACAO_SERVICO',
}

export const NaturezaOperacaoLabel: Record<NaturezaOperacaoEnum, string> = {
  [NaturezaOperacaoEnum.VENDA]: 'Venda de Mercadoria',
  [NaturezaOperacaoEnum.DEVOLUCAO]: 'Devolucao de Mercadoria',
  [NaturezaOperacaoEnum.TRANSFERENCIA]: 'Transferencia',
  [NaturezaOperacaoEnum.REMESSA]: 'Remessa',
  [NaturezaOperacaoEnum.PRESTACAO_SERVICO]: 'Prestacao de Servico',
};
