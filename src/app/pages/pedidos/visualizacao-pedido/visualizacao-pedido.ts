import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertaService } from '../../../services/alerta.service';
import { PedidoService } from '../../../services/pedido.service';
import { PedidoDTO } from '../../../dtos/pedido/PedidoDTO';
import { SelectAutocompleteComponent } from '../../../shared/auto-select/auto-select';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { ItensPedidoComponent } from '../itens/item-pedido';
import { MatIcon } from '@angular/material/icon';
import { OpcaoCampo } from '../../../shared/form-cadastro/form-cadastro';

@Component({
  selector: 'app-visualizacao-pedido',
  standalone: true,
  templateUrl: './visualizacao-pedido.html',
  styleUrl: './visualizacao-pedido.css',
  imports: [
    SelectAutocompleteComponent,
    FormsModule,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatDatepickerInput,
    MatDatepickerToggle,
    ItensPedidoComponent,
    MatIcon,
    MatDatepicker,
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

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  // ── Dados do pedido ───────────────────────────────────────────
  readonly clienteIdSignal = signal<number | null>(null);
  readonly clientes = signal<OpcaoCampo[]>([]);

  readonly formaPagamentoSignal = signal<string | null>(null);

  readonly dataEntregaSignal = signal<Date | null>(null);

  readonly itensPedido = signal<any[]>([]);

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

  // ── Inicialização ─────────────────────────────────────────────

  ngOnInit(): void {
    this.buscarPedido();
  }

  // ── Consulta ──────────────────────────────────────────────────

  private buscarPedido(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.alerta.erro('Identificador do pedido inválido.');
      this.voltar();
      return;
    }

    this.loading.set(true);

    this.pedidoService
      .buscarPorId(this.id)
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
    this.clientes.set([{ value: pedido.clienteId, label: pedido.clienteNome }]);

    this.formaPagamentoSignal.set(pedido.formaPagamento ?? null);

    this.dataEntregaSignal.set(pedido.dataEntrega ? new Date(pedido.dataEntrega) : null);

    this.form = {
      desconto: String(pedido.desconto ?? '0,00'),
      frete: String(pedido.frete ?? '0,00'),
      observacao: pedido.observacao ?? '',
    };

    this.itensPedido.set(pedido.itens ?? []);
  }

  // ── Eventos dos itens ─────────────────────────────────────────

  onItensAlterados(itens: any[]): void {
    this.itensPedido.set(itens);
  }

  onTotalAlterado(total: number): void {
    // Página de visualização: não altera os dados do pedido.
  }

  // ── Navegação ─────────────────────────────────────────────────

  onCancelar(): void {
    this.voltar();
  }

  private voltar(): void {
    this.router.navigate(['/pedidos']);
  }
}
