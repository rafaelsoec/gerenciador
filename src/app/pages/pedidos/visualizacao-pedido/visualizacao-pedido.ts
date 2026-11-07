import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertaService } from '../../../services/alerta.service';
import { PedidoService } from '../../../services/pedido.service';
import { PedidoDTO } from '../../../dtos/pedido/PedidoDTO';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { ItemPedidoDTO } from '../../../dtos/pedido/ItemPedidoDTO';
import { HttpResponse } from '@angular/common/http';
import { NgxMaskDirective } from 'ngx-mask';
import { FormaPagamentoPipe } from '../../../pipes/forma-pagamento-pipe';
import { FormaPagamentoEnum } from '../../../enums/FormaPagamentoEnum';

@Component({
  selector: 'app-visualizacao-pedido',
  standalone: true,
  templateUrl: './visualizacao-pedido.html',
  styleUrl: './visualizacao-pedido.css',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    NgxMaskDirective,
    FormaPagamentoPipe,
  ],
})
export class VisualizacaoPedidoComponent implements OnInit {
  // â”€â”€ DependÃªncias â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly pedidoService = inject(PedidoService);
  private readonly alerta = inject(AlertaService);

  // â”€â”€ Estado da pÃ¡gina â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  readonly disabled = signal(true);
  readonly loading = signal(false);

  readonly pedidoSignal = signal<PedidoDTO | null>(null);

  // â”€â”€ Dados do pedido â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly clienteIdSignal = signal<number | null>(null);
  readonly clienteNome = signal<string>('');

  readonly formaPagamentoSignal = signal<string | null>(null);

  readonly dataEntregaSignal = signal<string | null>(null);

  readonly itensPedido = signal<ItemPedidoDTO[]>([]);

  readonly valorCalculado = computed(() => {
    const pedido = this.pedidoSignal();

    if (!pedido) {
      return '0,00';
    }

    return pedido.valorTotal ?? 0;
  });

  // â”€â”€ FormulÃ¡rio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  form = {
    desconto: '0,00',
    frete: '0,00',
    observacao: '',
  };

  // â”€â”€ OpÃ§Ãµes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  readonly formasPagamento = Object.values(FormaPagamentoEnum);

  public id: number | undefined;
  // â”€â”€ InicializaÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) ?? 0;
    this.buscarPedido();
  }

  // â”€â”€ Consulta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private buscarPedido(): void {
    if (!Number.isInteger(this.id) || this.id == 0) {
      this.alerta.erro('Identificador do pedido invÃ¡lido.');
      this.voltar();
      return;
    }

    this.loading.set(true);

    this.pedidoService
      .buscarPorId(this.id ?? 0)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (pedido) => {
          this.pedidoSignal.set(pedido);
          this.preencherFormulario(pedido);
        },
        error: (erro) => {
          this.alerta.erro(erro);
          this.voltar();
        },
      });
  }

  // â”€â”€ Preenchimento dos dados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private preencherFormulario(pedido: PedidoDTO): void {
    this.clienteIdSignal.set(pedido.clienteId ?? null);
    this.clienteNome.set(pedido.clienteNome);

    this.formaPagamentoSignal.set(pedido.formaPagamento ?? null);
    this.dataEntregaSignal.set(pedido.dataEntrega);

    this.form = {
      desconto: String(pedido.desconto ?? '0,00'),
      frete: String(pedido.frete ?? '0,00'),
      observacao: pedido.observacao ?? '',
    };

    this.itensPedido.set(pedido.itens ?? []);
  }

  onCancelar(): void {
    this.voltar();
  }

  emitirNF(): void {
    if (this.id) {
      this.router.navigate(['/notas-fiscais/nova/pedido', this.id]);
    }
  }
  private voltar(): void {
    this.router.navigate(['/pedidos']);
  }

  imprimir(): void {
    this.pedidoService.gerarPdf(this.id ?? 0).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const pdf = response.body!;
        const contentDisposition = response.headers.get('Content-Disposition');

        const nomeArquivo =
          contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] ?? `pedido-${this.id}.pdf`;
        const url = window.URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;

        link.click();

        window.URL.revokeObjectURL(url);
      },
      error: (erro) => {
        this.alerta.erro(erro);
      },
    });
  }
}
