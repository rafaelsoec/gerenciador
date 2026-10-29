import { SituacaoEnum } from '../../enums/SituacaoEnum';
import { TipoPessoaEnum } from '../../enums/TipoPessoaEnum';

export interface ClienteDTO {
  id: number;
  nome: string;
  identificador: string;
  email: string;
  tipo: TipoPessoaEnum;
  situacao: SituacaoEnum;
}
