import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { catchError, tap, throwError } from 'rxjs';
import { SelectAutocompleteComponent } from '../../../shared/auto-select/auto-select';
import { ItemPedido, ItensPedidoComponent } from '../itens/item-pedido';
import { OpcaoCampo } from '../../../shared/form-cadastro/form-cadastro';
import { FormaPagamentoEnum } from '../../../enums/FormaPagamentoEnum';
import { FormaPagamentoPipe } from '../../../pipes/forma-pagamento-pipe';
import { ClienteService } from '../../../services/cliente.service';
import { PedidoService } from '../../../services/pedido.service';
import { AlertaService } from '../../../services/alerta.service';
import { DateUtils } from '../../../utils/DateUtils';
import { Constantes } from '../../../constantes/Constantes';

interface CadastroPedidoForm {
  clienteId: any;
  valor: string;
  formaPagamento: FormaPagamentoEnum | '';
  desconto: string;
  frete: string;
  dataEntrega: Date | null;
  observacao: string;
}

@Component({
  selector: 'app-cadastro-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    NgxMaskDirective,
    MatDialogModule,
    SelectAutocompleteComponent,
    ItensPedidoComponent,
  ],
  templateUrl: './cadastro-pedido.html',
  styleUrl: './cadastro-pedido.css',
})
export class CadastroPedidoComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly pedidoService = inject(PedidoService);
  private readonly alertaService = inject(AlertaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<CadastroPedidoComponent>, { optional: true });
  public id: number | undefined;
  public disabled = input<boolean>(false);
  readonly clientes = signal<OpcaoCampo[]>([]);

  readonly mascara = Constantes.MASCARA_MOEDA;
  readonly formasPagamento: OpcaoCampo[] = (() => {
    const pipe = new FormaPagamentoPipe();
    return Object.values(FormaPagamentoEnum).map((v) => ({
      value: v,
      label: pipe.transform(v),
    }));
  })();

  form!: CadastroPedidoForm;

  readonly valorCalculado = signal<string>('');
  readonly itensSelecionados = signal<ItemPedido[]>([]);

  // Signals reativos para os campos obrigatórios do form
  readonly clienteIdSignal = signal<any>(null);
  readonly formaPagamentoSignal = signal<string>('');
  readonly dataEntregaSignal = signal<Date | null>(null);

  itensPedido: ItemPedido[] = [];

  readonly invalido = computed(() => {
    return (
      !this.clienteIdSignal() ||
      !this.valorCalculado() ||
      !this.formaPagamentoSignal() ||
      !this.dataEntregaSignal() ||
      this.itensSelecionados().length === 0
    );
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) ?? 0;

    this.buscarPedido();
    this.clienteService.listar({ size: 200 }).subscribe((pagina) => {
      this.clientes.set(
        pagina.conteudo.map((c) => ({ value: c.id, label: c.nome, selected: this.id === c.id })),
      );
    });
  }

  private buscarPedido(): void {
    if (!Number.isInteger(this.id) || this.id == 0) {
      this.form = {
        clienteId: null,
        valor: '',
        formaPagamento: '',
        desconto: '',
        frete: '',
        dataEntrega: null,
        observacao: '',
      };
      return;
    }

    this.pedidoService.buscarPorId(this.id ?? 0).subscribe({
      next: (pedido) => {
        const dataConvertida = DateUtils.converterParaDate(pedido.dataEntrega);
        this.valorCalculado.set(pedido.valorTotal.toString());
        this.clienteIdSignal.set(pedido.clienteId.toString());
        this.formaPagamentoSignal.set(pedido.formaPagamento.toString());
        this.dataEntregaSignal.set(dataConvertida);
        this.itensPedido = pedido.itens.map((p) => ({
          produtoId: p.produtoId,
          quantidade: p.quantidade,
        }));

        this.form = {
          clienteId: pedido.clienteId,
          valor: pedido.valorTotal.toString(),
          formaPagamento: pedido.formaPagamento,
          desconto: pedido.desconto.toString(),
          frete: pedido.frete.toString(),
          dataEntrega: dataConvertida,
          observacao: pedido.observacao,
        };
      },
      error: (erro) => {
        this.alertaService.erro(erro);
      },
    });
  }

  onItensAlterados(itens: ItemPedido[] | null): void {
    this.itensSelecionados.set(itens ?? []);
  }

  onTotalAlterado(total: number): void {
    setTimeout(() => {
      const formatado = total.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      this.form.valor = formatado;
      this.valorCalculado.set(formatado);
    }, 0);
  }

  onSalvar(): void {
    if (this.invalido()) return;

    const clienteRaw = this.clienteIdSignal();
    const clienteId =
      typeof clienteRaw === 'object' && clienteRaw !== null ? clienteRaw['value'] : clienteRaw;

    const payload: any = {
      id: this.id,
      clienteId,
      valorTotal: this.form.valor,
      formaPagamento: this.formaPagamentoSignal(),
      desconto: this.form.desconto || '0',
      frete: this.form.frete || '0',
      dataEntrega: DateUtils.formatar(this.dataEntregaSignal()),
      observacao: this.form.observacao,
      itens: this.itensSelecionados().map((item) => ({
        produtoId:
          typeof item.produtoId === 'object' && item.produtoId !== null
            ? (item.produtoId as any)['value']
            : item.produtoId,
        quantidade: item.quantidade,
      })),
    };

    if (this.id) {
      this.pedidoService
        .atualizar(this.id, payload)
        .pipe(
          tap((novo) => {
            this.alertaService.sucesso('Pedido cadastrado com sucesso.');
            if (this.dialogRef) {
              this.dialogRef.close(novo);
            } else {
              this.router.navigate(['/pedidos']);
            }
          }),
          catchError((erro) => {
            this.alertaService.erro(erro.error);
            return throwError(() => erro);
          }),
        )
        .subscribe();
    } else {
      this.pedidoService
        .criar(payload)
        .pipe(
          tap((novo) => {
            this.alertaService.sucesso('Pedido cadastrado com sucesso.');
            if (this.dialogRef) {
              this.dialogRef.close(novo);
            } else {
              this.router.navigate(['/pedidos']);
            }
          }),
          catchError((erro) => {
            this.alertaService.erro(erro.error);
            return throwError(() => erro);
          }),
        )
        .subscribe();
    }
  }

  onCancelar(): void {
    if (this.dialogRef) {
      this.dialogRef.close(null);
    } else {
      this.router.navigate(['/pedidos']);
    }
  }
}
