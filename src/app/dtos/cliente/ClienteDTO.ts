import { SituacaoEnum } from '../../enums/SituacaoEnum';
import { TipoPessoaEnum } from '../../enums/TipoPessoaEnum';

export class ClienteDTO {
  id = 0;
  nome = '';
  identificador = '';
  email = '';
  tipo = TipoPessoaEnum.PF;
  situacao = SituacaoEnum.ATIVO;
}