/** Espelho do RespostaPaginada<T> retornado pela API Spring. */
export interface RespostaPaginada<T> {
  conteudo: T[];
  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanhoPagina: number;
  ultima: boolean;
  primeira: boolean;
}
