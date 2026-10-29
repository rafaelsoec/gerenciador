import { Component, input, output, signal, computed, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageEvent } from '@angular/material/paginator';
import { Paginador } from '../paginador/paginador';

/** Definição de uma coluna da tabela genérica. */
export interface ColunaTabela {
  /** Chave do campo no objeto de dados (também usada como matColumnDef). */
  campo: string;
  /** Texto exibido no cabeçalho da coluna. */
  header: string;
  editavel: boolean;
}

@Component({
  selector: 'app-tabela',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatIconButton, MatIconModule, MatTooltipModule, Paginador],
  templateUrl: './tabela.html',
  styleUrl: './tabela.css',
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TabelaComponent<T extends Record<string, any>> {
  /** Lista de objetos a exibir na tabela. */
  readonly dados = input.required<T[]>();

  /** Definição das colunas: campo (chave do objeto) + header (rótulo exibido). */
  readonly colunas = input.required<ColunaTabela[]>();

  /** Cor de fundo do cabeçalho da tabela. */
  readonly corHeader = input<string | null>(null);

  /** Cor do texto do cabeçalho da tabela. */
  readonly corTextoHeader = input<string | null>(null);

  /** Quantidade de itens por página. Padrão: 10. */
  readonly itensPorPagina = input<number>(10);

  /** Opções disponíveis no seletor de tamanho de página. */
  readonly opcoesPagina = input<number[]>([5, 10, 25]);

  /** Exibe o botão de edição na coluna de ações. Padrão: false. */
  readonly exibirEdicao = input<boolean>(false);

  /** Exibe o botão de exclusão na coluna de ações. Padrão: false. */
  readonly exibirExclusao = input<boolean>(false);

  /**
   * Campo usado como chave única de cada row para identificar qual está em edição.
   * Padrão: 'id'.
   */
  readonly campoId = input<string>('id');

  /** Emite o objeto com os dados alterados ao confirmar a edição. */
  readonly salvar = output<T>();

  /** Emite a row ao clicar em excluir. */
  readonly excluir = output<T>();

  // ── paginação ─────────────────────────────────────────────────────────────

  readonly _pageIndex = signal<number>(0);
  readonly _pageSize  = signal<number | null>(null);

  private readonly _tamanhoPaginaEfetivo = computed<number>(() =>
    this._pageSize() ?? this.itensPorPagina()
  );

  readonly dadosPagina = computed<T[]>(() => {
    const inicio = this._pageIndex() * this._tamanhoPaginaEfetivo();
    return this.dados().slice(inicio, inicio + this._tamanhoPaginaEfetivo());
  });

  // ── edição inline ─────────────────────────────────────────────────────────

  /**
   * Valor do campoId da row em edição.
   * Usar valor primitivo (não referência) garante comparação estável.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly _idEditando = signal<any>(null);

  /**
   * Cópia rasa da row em edição.
   * O ngModel faz two-way binding aqui, sem tocar no array original.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly _rascunho = signal<Record<string, any>>({});

  // ── computed ──────────────────────────────────────────────────────────────

  readonly exibirAcoes = computed<boolean>(
    () => this.exibirEdicao() || this.exibirExclusao()
  );

  // ── CSS variables ─────────────────────────────────────────────────────────

  @HostBinding('style.--tabela-header-bg')
  get _hostHeaderBg(): string | null { return this.corHeader(); }

  @HostBinding('style.--tabela-header-color')
  get _hostHeaderColor(): string | null { return this.corTextoHeader(); }

  // ── helpers ───────────────────────────────────────────────────────────────

  get campos(): string[] {
    const base = this.colunas().map((c) => c.campo);
    return this.exibirAcoes() ? [...base, 'acoes'] : base;
  }

  estaEditando(row: T): boolean {
    const id = this._idEditando();
    return id !== null && id === row[this.campoId()];
  }

  // ── handlers ──────────────────────────────────────────────────────────────

  iniciarEdicao(row: T): void {
    this._idEditando.set(row[this.campoId()]);
    this._rascunho.set({ ...row });
  }

  /** Atualiza um campo do rascunho chamando set() para notificar o signal. */
  atualizarRascunho(campo: string, valor: string): void {
    this._rascunho.set({ ...this._rascunho(), [campo]: valor });
  }

  confirmarEdicao(row: T): void {
    this.salvar.emit({ ...row, ...this._rascunho() } as T);
    this._idEditando.set(null);
    this._rascunho.set({});
  }

  cancelarEdicao(): void {
    this._idEditando.set(null);
    this._rascunho.set({});
  }

  onPaginaAlterada(event: PageEvent): void {
    this._pageIndex.set(event.pageIndex);
    this._pageSize.set(event.pageSize);
    // Cancela edição pendente ao trocar de página
    this._idEditando.set(null);
    this._rascunho.set({});
  }
}
