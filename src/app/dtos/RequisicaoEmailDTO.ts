export interface RequisicaoEmailDTO {
  destinatarios: string[];
  copiasOcultas?: string[];
  parametros?: Map<string, any>;
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
  conteudo: Blob | null;
}
