import { TipoNotaFiscalEnum } from '../../enums/TipoNotaFiscalEnum';
import { StatusNotaFiscalEnum } from '../../enums/StatusNotaFiscalEnum';
import { NaturezaOperacaoEnum } from '../../enums/NaturezaOperacaoEnum';
import { ItemNotaFiscalDTO } from './ItemNotaFiscalDTO';

export class NotaFiscalDTO {
  id?: number;

  // Vinculo
  pedidoId!: number;
  empresaId!: number;

  // Identificacao
  tipo!: TipoNotaFiscalEnum;
  status!: StatusNotaFiscalEnum;
  naturezaOperacao!: NaturezaOperacaoEnum;
  numero?: string;
  serie!: string;
  chaveAcesso?: string;
  protocolo?: string;
  dataEmissao!: string;
  dataEntradaSaida?: string;

  // Destinatario (snapshoted do cliente)
  destinatarioNome!: string;
  destinatarioIdentificador!: string;
  destinatarioEmail?: string;
  destinatarioLogradouro?: string;
  destinatarioNumero?: string;
  destinatarioBairro?: string;
  destinatarioMunicipio?: string;
  destinatarioUf?: string;
  destinatarioCep?: string;

  // Totais
  valorProdutos!: number;
  valorDesconto!: number;
  valorFrete!: number;
  valorSeguro!: number;
  valorOutros!: number;
  valorIcms!: number;
  valorIpi!: number;
  valorPis!: number;
  valorCofins!: number;
  valorTotal!: number;

  // Pagamento
  formaPagamento!: string;
  valorPago!: number;

  // Complemento
  informacoesAdicionais?: string;
  transportadoraId!: number | null;

  itens!: ItemNotaFiscalDTO[];
}
