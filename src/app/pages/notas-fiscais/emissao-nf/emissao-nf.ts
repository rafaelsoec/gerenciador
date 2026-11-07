import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMaskDirective } from 'ngx-mask';
import { catchError, forkJoin, tap, throwError } from 'rxjs';

import { PedidoService } from '../../../services/pedido.service';
import { NotaFiscalService } from '../../../services/nota-fiscal.service';
import { EmpresaService } from '../../../services/empresa.service';
import { AlertaService } from '../../../services/alerta.service';
import { PedidoDTO } from '../../../dtos/pedido/PedidoDTO';
import { EmpresaDTO } from '../../../dtos/empresa/EmpresaDTO';
import { NotaFiscalDTO } from '../../../dtos/nota-fiscal/NotaFiscalDTO';
import { ItemNotaFiscalDTO } from '../../../dtos/nota-fiscal/ItemNotaFiscalDTO';
import { TipoNotaFiscalEnum, TipoNotaFiscalLabel } from '../../../enums/TipoNotaFiscalEnum';
import { NaturezaOperacaoEnum, NaturezaOperacaoLabel } from '../../../enums/NaturezaOperacaoEnum';
import { FormaPagamentoEnum } from '../../../enums/FormaPagamentoEnum';
import { MoedaPipe } from '../../../pipes/moeda-pipe';
import { FormaPagamentoPipe } from '../../../pipes/forma-pagamento-pipe';

interface ItemNFForm extends ItemNotaFiscalDTO {}

interface EmissaoNFForm {
  // Identificacao
  tipo: TipoNotaFiscalEnum | '';
  naturezaOperacao: NaturezaOperacaoEnum | '';
  serie: string;
  dataEmissao: string;
  dataEntradaSaida: string;

  // Destinatario
  destinatarioNome: string;
  destinatarioIdentificador: string;
  destinatarioEmail: string;
  destinatarioLogradouro: string;
  destinatarioNumero: string;
  destinatarioBairro: string;
  destinatarioMunicipio: string;
  destinatarioUf: string;
  destinatarioCep: string;

  // Totais / frete
  valorFrete: number;
  valorSeguro: number;
  valorOutros: number;
  formaPagamento: string;

  // Complemento
  informacoesAdicionais: string;
}

@Component({
  selector: 'app-emissao-nf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    NgxMaskDirective,
    MoedaPipe,
    FormaPagamentoPipe,
  ],
  templateUrl: './emissao-nf.html',
  styleUrl: './emissao-nf.css',
})
export class EmissaoNFComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pedidoService = inject(PedidoService);
  private readonly nfService = inject(NotaFiscalService);
  private readonly empresaService = inject(EmpresaService);
  private readonly alertaService = inject(AlertaService);

  pedidoId!: number;
  pedido: PedidoDTO | null = null;
  empresa: EmpresaDTO | null = null;

  readonly salvando = signal(false);
  readonly carregando = signal(true);

  readonly tiposNF = Object.values(TipoNotaFiscalEnum).map((v) => ({
    value: v,
    label: TipoNotaFiscalLabel[v],
  }));

  readonly naturezas = Object.values(NaturezaOperacaoEnum).map((v) => ({
    value: v,
    label: NaturezaOperacaoLabel[v],
  }));

  readonly formasPagamento = Object.values(FormaPagamentoEnum);

  form: EmissaoNFForm = this._formVazio();
  itens: ItemNFForm[] = [];

  // totais calculados
  get valorProdutos(): number {
    return this.itens.reduce((s, i) => s + i.subtotal, 0);
  }
  get valorDesconto(): number {
    return this.itens.reduce((s, i) => s + i.desconto, 0);
  }
  get valorIcms(): number {
    return this.itens.reduce((s, i) => s + (i.subtotal * i.aliquotaIcms) / 100, 0);
  }
  get valorIpi(): number {
    return this.itens.reduce((s, i) => s + (i.subtotal * i.aliquotaIpi) / 100, 0);
  }
  get valorPis(): number {
    return this.itens.reduce((s, i) => s + (i.subtotal * i.aliquotaPis) / 100, 0);
  }
  get valorCofins(): number {
    return this.itens.reduce((s, i) => s + (i.subtotal * i.aliquotaCofins) / 100, 0);
  }
  get valorTotal(): number {
    return (
      this.valorProdutos -
      this.valorDesconto +
      (this.form.valorFrete || 0) +
      (this.form.valorSeguro || 0) +
      (this.form.valorOutros || 0)
    );
  }

  get invalido(): boolean {
    return (
      !this.form.tipo ||
      !this.form.naturezaOperacao ||
      !this.form.serie ||
      !this.form.dataEmissao ||
      !this.form.destinatarioNome ||
      !this.form.destinatarioIdentificador ||
      this.itens.length === 0
    );
  }

  ngOnInit(): void {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('pedidoId'));

    // Busca pedido + primeira empresa em paralelo
    forkJoin({
      pedido: this.pedidoService.buscarPorId(this.pedidoId),
      empresas: this.empresaService.listar({ page: 0, size: 1 }),
    }).subscribe({
      next: ({ pedido, empresas }) => {
        this.pedido = pedido;
        this.empresa = empresas.conteudo[0] ?? null;
        this._preencherForm(pedido);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.alertaService.erro(erro.error ?? 'Erro ao carregar dados do pedido.');
        this.carregando.set(false);
        this.router.navigate(['/notas-fiscais']);
      },
    });
  }

  private _preencherForm(pedido: PedidoDTO): void {
    const hoje = new Date().toISOString().slice(0, 10);

    this.form = {
      tipo: TipoNotaFiscalEnum.NFE,
      naturezaOperacao: NaturezaOperacaoEnum.VENDA,
      serie: '1',
      dataEmissao: hoje,
      dataEntradaSaida: hoje,
      destinatarioNome: pedido.clienteNome ?? '',
      destinatarioIdentificador: '',
      destinatarioEmail: '',
      destinatarioLogradouro: '',
      destinatarioNumero: '',
      destinatarioBairro: '',
      destinatarioMunicipio: '',
      destinatarioUf: '',
      destinatarioCep: '',
      valorFrete: pedido.frete ?? 0,
      valorSeguro: 0,
      valorOutros: 0,
      formaPagamento: pedido.formaPagamento ?? '',
      informacoesAdicionais: pedido.observacao ?? '',
    };

    this.itens = pedido.itens.map((item) => ({
      produtoId: item.produtoId,
      produtoNome: item.produtoNome,
      quantidade: item.quantidade,
      valorUnitario: item.precoUnitario,
      desconto: item.desconto,
      aliquotaIcms: 12,
      aliquotaIpi: 0,
      aliquotaPis: 0.65,
      aliquotaCofins: 3,
      ncm: '',
      cfop: '5102',
      subtotal: item.subtotal,
    }));
  }

  recalcularSubtotal(item: ItemNFForm): void {
    item.subtotal = item.quantidade * item.valorUnitario - item.desconto;
  }

  onSalvar(): void {
    if (this.invalido || !this.empresa) return;

    this.salvando.set(true);

    const payload: Omit<NotaFiscalDTO, 'id'> = {
      pedidoId: this.pedidoId,
      empresaId: this.empresa.id,
      tipo: this.form.tipo as TipoNotaFiscalEnum,
      status: 'RASCUNHO' as any,
      naturezaOperacao: this.form.naturezaOperacao as NaturezaOperacaoEnum,
      serie: this.form.serie,
      dataEmissao: this.form.dataEmissao,
      dataEntradaSaida: this.form.dataEntradaSaida || undefined,
      destinatarioNome: this.form.destinatarioNome,
      destinatarioIdentificador: this.form.destinatarioIdentificador,
      destinatarioEmail: this.form.destinatarioEmail || undefined,
      destinatarioLogradouro: this.form.destinatarioLogradouro || undefined,
      destinatarioNumero: this.form.destinatarioNumero || undefined,
      destinatarioBairro: this.form.destinatarioBairro || undefined,
      destinatarioMunicipio: this.form.destinatarioMunicipio || undefined,
      destinatarioUf: this.form.destinatarioUf || undefined,
      destinatarioCep: this.form.destinatarioCep || undefined,
      valorProdutos: this.valorProdutos,
      valorDesconto: this.valorDesconto,
      valorFrete: this.form.valorFrete || 0,
      valorSeguro: this.form.valorSeguro || 0,
      valorOutros: this.form.valorOutros || 0,
      valorIcms: this.valorIcms,
      valorIpi: this.valorIpi,
      valorPis: this.valorPis,
      valorCofins: this.valorCofins,
      valorTotal: this.valorTotal,
      formaPagamento: this.form.formaPagamento,
      valorPago: this.valorTotal,
      informacoesAdicionais: this.form.informacoesAdicionais || undefined,
      itens: this.itens,
    };

    this.nfService
      .emitir(payload)
      .pipe(
        tap((nf) => {
          this.alertaService.sucesso('Nota fiscal gerada com sucesso.');
          this.router.navigate(['/notas-fiscais']);
        }),
        catchError((erro) => {
          this.salvando.set(false);
          this.alertaService.erro(erro.error ?? 'Erro ao emitir nota fiscal.');
          return throwError(() => erro);
        }),
      )
      .subscribe();
  }

  onCancelar(): void {
    this.router.navigate(['/notas-fiscais']);
  }

  private _formVazio(): EmissaoNFForm {
    return {
      tipo: '',
      naturezaOperacao: '',
      serie: '1',
      dataEmissao: '',
      dataEntradaSaida: '',
      destinatarioNome: '',
      destinatarioIdentificador: '',
      destinatarioEmail: '',
      destinatarioLogradouro: '',
      destinatarioNumero: '',
      destinatarioBairro: '',
      destinatarioMunicipio: '',
      destinatarioUf: '',
      destinatarioCep: '',
      valorFrete: 0,
      valorSeguro: 0,
      valorOutros: 0,
      formaPagamento: '',
      informacoesAdicionais: '',
    };
  }
}
