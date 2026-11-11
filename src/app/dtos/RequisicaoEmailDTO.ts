export interface RequisicaoEmailDTO {
  destinatarios: string[];
  copiasOcultas: string[];
  copias: string[];
  assunto: string;
  titulo: string;
  mensagem: string;
  html: boolean;
  anexos: RequisicaoEmailAnexoDTO[];
}

export interface RequisicaoEmailAnexoDTO {
  nome: string;
  contentType: string;
  conteudo: any[];
}
