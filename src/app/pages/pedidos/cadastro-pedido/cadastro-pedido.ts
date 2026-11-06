import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { catchError, tap, throwError } from 'rxjs';

import { HeaderPaginaComponent } from '../../../shared/header-pagina/header-pagina';
import { SelectAutocompleteComponent } from '../../../shared/auto-select/auto-select';
import { ItemPedido, ItensPedidoComponent } from '../itens/item-pedido';
import { OpcaoCampo } from '../../../shared/form-cadastro/form-cadastro';
import { FormaPagamentoEnum } from '../../../enums/FormaPagamentoEnum';
import { FormaPagamentoPipe } from '../../../pipes/forma-pagamento-pipe';
import { ClienteService } from '../../../services/cliente.service';
import { PedidoService } from '../../../services/pedido.service';
import { AlertaService } from '../../../services/alerta.service';
import { BrDateAdapter } from '../../../shared/form-cadastro/form-cadastro';
import { DataUtil } from '../../../utils/DataUtils';

const BR_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: DateAdapter, useClass: BrDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
  ],
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
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<CadastroPedidoComponent>, { optional: true });

  readonly clientes = signal<OpcaoCampo[]>([]);

  readonly mascara =
    '000.000.000,00||00.000.000,00||0.000.000,00||000.000,00||00.000,00||0.000,00||000,00||00,00||0,00';

  readonly formasPagamento: OpcaoCampo[] = (() => {
    const pipe = new FormaPagamentoPipe();
    return Object.values(FormaPagamentoEnum).map((v) => ({
      value: v,
      label: pipe.transform(v),
    }));
  })();

  form: CadastroPedidoForm = {
    clienteId: null,
    valor: '',
    formaPagamento: '',
    desconto: '',
    frete: '',
    dataEntrega: null,
    observacao: '',
  };

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
    this.clienteService.listar({ size: 200 }).subscribe((pagina) => {
      this.clientes.set(
        pagina.conteudo.map((c) => ({ value: c.id, label: c.nome }))
      );
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
      typeof clienteRaw === 'object' && clienteRaw !== null
        ? clienteRaw['value']
        : clienteRaw;

    const payload: any = {
      clienteId,
      valorTotal: this.form.valor,
      formaPagamento: this.formaPagamentoSignal(),
      desconto: this.form.desconto || '0',
      frete: this.form.frete || '0',
      dataEntrega: DataUtil.formatar(this.dataEntregaSignal()),
      observacao: this.form.observacao,
      itens: this.itensSelecionados().map((item) => ({
        produtoId:
          typeof item.produtoId === 'object' && item.produtoId !== null
            ? (item.produtoId as any)['value']
            : item.produtoId,
        quantidade: item.quantidade,
      })),
    };

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
        })
      )
      .subscribe();
  }

  onCancelar(): void {
    if (this.dialogRef) {
      this.dialogRef.close(null);
    } else {
      this.router.navigate(['/pedidos']);
    }
  }
}
