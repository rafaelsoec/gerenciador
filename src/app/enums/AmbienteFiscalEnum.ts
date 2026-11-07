export enum AmbienteFiscalEnum {
  HOMOLOGACAO = 'HOMOLOGACAO',
  PRODUCAO = 'PRODUCAO',
}

export const AmbienteFiscalLabel: Record<AmbienteFiscalEnum, string> = {
  [AmbienteFiscalEnum.HOMOLOGACAO]: 'Homologação',
  [AmbienteFiscalEnum.PRODUCAO]: 'Produção',
};
