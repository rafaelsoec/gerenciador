export enum ModalidadeFreteEnum {
  CIF= "CIF",
  FOB= "FOB",
  TERCEIROS= "TERCEIROS",
  PROPRIO_REMETENTE= "PROPRIO_REMETENTE",
  PROPRIO_DESTINATARIO= "PROPRIO_DESTINATARIO",
  SEM_FRETE= "SEM_FRETE",
}

export const modalidadeFreteLabel: Record<ModalidadeFreteEnum, string> = {
  [ModalidadeFreteEnum.CIF]: 'Contratação do frete por conta do remetente',
  [ModalidadeFreteEnum.FOB]: 'Contratação do frete por conta do destinatário',
  [ModalidadeFreteEnum.TERCEIROS]: 'Contratação do frete por conta de terceiros',
  [ModalidadeFreteEnum.PROPRIO_REMETENTE]: 'Transporte próprio por conta do remetente',
  [ModalidadeFreteEnum.PROPRIO_DESTINATARIO]: 'Transporte próprio por conta do destinatário',
  [ModalidadeFreteEnum.SEM_FRETE]: 'Sem frete',
};
