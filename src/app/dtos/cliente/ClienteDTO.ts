import { SituacaoEnum } from '../../enums/SituacaoEnum';
import { TipoPessoaEnum } from '../../enums/TipoPessoaEnum';

export class ClienteDTO {
  id = 0;
  nome = '';
  identificador = '';
  email = '';
  tipo = TipoPessoaEnum.PF;
  situacao = SituacaoEnum.ATIVO;
  logradouro: string = '';
  numero: string = '';
  bairro: string = '';
  municipio: string = '';
  uf: string = '';
  cep: string = '';
  complemento: string = '';
}
