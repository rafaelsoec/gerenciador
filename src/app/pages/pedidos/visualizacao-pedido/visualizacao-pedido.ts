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
  ],
})
export class VisualizacaoPedidoComponent implements OnInit {
  // ── Dependências ─────────────────────────────────────────────

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly pedidoService = inject(PedidoService);
  private readonly alerta = inject(AlertaService);

  // ── Estado da página ──────────────────────────────────────────

  readonly disabled = signal(true);
  readonly loading = signal(false);

  readonly pedidoSignal = signal<PedidoDTO | null>(null);

  // ── Dados do pedido ───────────────────────────────────────────
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

  // ── Formulário ────────────────────────────────────────────────

  form = {
    desconto: '0,00',
    frete: '0,00',
    observacao: '',
  };

  // ── Opções ────────────────────────────────────────────────────

  readonly formasPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'BOLETO', label: 'Boleto' },
  ];

  public id: number | undefined;
  // ── Inicialização ─────────────────────────────────────────────

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) ?? 0;
    this.buscarPedido();
  }

  // ── Consulta ──────────────────────────────────────────────────

  private buscarPedido(): void {
    if (!Number.isInteger(this.id) || this.id == 0) {
      this.alerta.erro('Identificador do pedido inválido.');
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

  // ── Preenchimento dos dados ───────────────────────────────────

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
