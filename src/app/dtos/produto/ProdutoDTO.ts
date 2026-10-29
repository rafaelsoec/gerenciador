import { SituacaoEnum } from '../../enums/SituacaoEnum';

export interface ProdutoDTO {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  situacao: SituacaoEnum;
}
