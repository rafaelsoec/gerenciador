import { AmbienteFiscalEnum } from '../../enums/AmbienteFiscalEnum';
import { RegimeTributarioEnum } from '../../enums/RegimeTributarioEnum';

export class EmpresaDTO {
  id = 0;
  razaoSocial = '';
  nomeFantasia = '';
  cnpj = '';
  inscricaoEstadual = '';
  inscricaoMunicipal = '';
  email = '';
  telefone = '';
  cep = '';
  logradouro = '';
  numero = '';
  complemento = '';
  bairro = '';
  municipio = '';
  uf = '';
  codigoMunicipioIbge = '';
  regimeTributario: RegimeTributarioEnum | null = null;
  ambienteFiscal: AmbienteFiscalEnum | null = null;
  codigoCnae = '';
  ativo = true;
}
