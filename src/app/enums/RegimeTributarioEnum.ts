export enum RegimeTributarioEnum {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  SIMPLES_NACIONAL_EXCESSO_SUBLIMITE = 'SIMPLES_NACIONAL_EXCESSO_SUBLIMITE',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  LUCRO_REAL = 'LUCRO_REAL',
  MEI = 'MEI',
}

export const RegimeTributarioLabel: Record<RegimeTributarioEnum, string> = {
  [RegimeTributarioEnum.SIMPLES_NACIONAL]: 'Simples Nacional',
  [RegimeTributarioEnum.SIMPLES_NACIONAL_EXCESSO_SUBLIMITE]: 'Simples Nacional (Excesso)',
  [RegimeTributarioEnum.LUCRO_PRESUMIDO]: 'Lucro Presumido',
  [RegimeTributarioEnum.LUCRO_REAL]: 'Lucro Real',
  [RegimeTributarioEnum.MEI]: 'MEI',
};
