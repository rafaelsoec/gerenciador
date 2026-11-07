export enum TipoNotaFiscalEnum {
  NFE = 'NFE',
  NFCE = 'NFCE',
  NFSE = 'NFSE',
}

export const TipoNotaFiscalLabel: Record<TipoNotaFiscalEnum, string> = {
  [TipoNotaFiscalEnum.NFE]: 'NF-e (Produto)',
  [TipoNotaFiscalEnum.NFCE]: 'NFC-e (Consumidor)',
  [TipoNotaFiscalEnum.NFSE]: 'NFS-e (Servico)',
};
