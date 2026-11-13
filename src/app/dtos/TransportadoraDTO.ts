import { ModalidadeFreteEnum } from '../enums/ModalidadeFreteEnum';

export class TransportadoraDTO {
  id: number | null = null;
  nome: string = '';
  modalidadeFrete: ModalidadeFreteEnum = ModalidadeFreteEnum.SEM_FRETE;
  telefone: string = '';
  inscricaoEstadual: string = '';
  identificador: string = '';
  cep: string = '';
  logradouro: string = '';
  numero: string = '';
  complemento: string = '';
  bairro: string = '';
  municipio: string = '';
  uf: string = '';
}
