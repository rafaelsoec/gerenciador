export enum StatusNotaFiscalEnum {
  RASCUNHO = 'RASCUNHO',
  EMITIDA = 'EMITIDA',
  CANCELADA = 'CANCELADA',
  REJEITADA = 'REJEITADA',
}

export const StatusNotaFiscalLabel: Record<StatusNotaFiscalEnum, string> = {
  [StatusNotaFiscalEnum.RASCUNHO]: 'Rascunho',
  [StatusNotaFiscalEnum.EMITIDA]: 'Emitida',
  [StatusNotaFiscalEnum.CANCELADA]: 'Cancelada',
  [StatusNotaFiscalEnum.REJEITADA]: 'Rejeitada',
};
