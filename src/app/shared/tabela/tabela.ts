import { Component, computed, HostBinding, inject, input, output, PipeTransform, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { Paginador } from '../paginador/paginador';
import { NgxMaskDirective } from 'ngx-mask';
import { RegexDirective } from '../../diretivas/regex.directive';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

/** Definição de uma coluna da tabela genérica. */
export interface ColunaTabela {
  /** Chave do campo no objeto de dados (também usada como matColumnDef). */
  campo: string;
  opcoes?: string[] | null | undefined;
  /** Texto exibido no cabeçalho da coluna. */
  header: string;
  editavel: boolean;
  /** Largura da coluna (ex: '200px', '20%'). Opcional. */
  width?: string;
  mascara?: string | null;
  pipe?: PipeTransform | null | undefined;
  pattern?: RegExp | null | undefined;
}

export interface ItemTabela {
  icone: string;
  nome: string;
  function: (item?: any) => void;
}

@Component({
  selector: 'app-tabela',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconButton,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    Paginador,
    NgxMaskDirective,
    RegexDirective,
    MatOption,
    MatSelect,
  ],
  templateUrl: './tabela.html',
  styleUrl: './tabela.css',
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TabelaComponent<T extends Record<string, any>> {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
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

  /**
   * Quando true, desativa o fatiamento local e usa `dados()` integralmente.
   * O paginador passa a exibir `totalElementos` como o total de registros.
   * Use quando a paginação é feita pelo servidor.
   */
  readonly paginacaoExterna = input<boolean>(false);

  /** Total real de registros no servidor. Obrigatório quando `paginacaoExterna=true`. */
  readonly totalElementos = input<number>(0);

  readonly exibirVisualizacao = input<boolean>(false);

  readonly icones = input<ItemTabela[]>([]);

  /** Exibe o botão de edição na coluna de ações. Padrão: false. */
  readonly exibirEdicao = input<boolean>(false);

  /** Exibe o botão de exclusão na coluna de ações. Padrão: false. */
  readonly exibirExclusao = input<boolean>(false);

  /**
   * Campo usado como chave única de cada row para identificar qual está em edição.
   * Padrão: 'id'.
   */
  readonly campoId = input<string>('id');
  readonly rotaVisualizacao = input<string>('');
  readonly rotaEdicao = input<string>('');

  /** Emite o objeto com os dados alterados ao confirmar a edição. */
  readonly salvar = output<T>();

  /** Emite a row ao clicar em excluir. */
  readonly excluir = output<T>();

  /** Emite a row ao clicar em excluir. */
  readonly editar = output<T>();

  /** Emite o PageEvent sempre que a página ou tamanho é alterado pelo usuário. */
  readonly paginaAlterada = output<PageEvent>();

  // ── paginação ─────────────────────────────────────────────────────────────

  readonly _pageIndex = signal<number>(0);
  readonly _pageSize = signal<number | null>(null);

  private readonly _tamanhoPaginaEfetivo = computed<number>(
    () => this._pageSize() ?? this.itensPorPagina(),
  );

  readonly dadosPagina = computed<T[]>(() => {
    if (this.paginacaoExterna()) {
      return this.dados();
    }
    const inicio = this._pageIndex() * this._tamanhoPaginaEfetivo();
    return this.dados().slice(inicio, inicio + this._tamanhoPaginaEfetivo());
  });

  readonly _lengthEfetivo = computed<number>(() =>
    this.paginacaoExterna() ? this.totalElementos() : this.dados().length,
  );

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
    () => this.exibirEdicao() || this.exibirExclusao() || this.exibirVisualizacao(),
  );

  // ── CSS variables ─────────────────────────────────────────────────────────

  @HostBinding('style.--tabela-header-bg')
  get _hostHeaderBg(): string | null {
    return this.corHeader();
  }

  @HostBinding('style.--tabela-header-color')
  get _hostHeaderColor(): string | null {
    return this.corTextoHeader();
  }

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
    if (this.rotaEdicao()) {
      this.router.navigate([row[this.campoId()], this.rotaEdicao()], {
        relativeTo: this.activatedRoute,
      });
    } else {
      this._idEditando.set(row[this.campoId()]);
      this._rascunho.set({ ...row });
    }
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
    this.paginaAlterada.emit(event);
  }

  protected exibirPipe(label: string, pipe: PipeTransform | null | undefined) {
    if (pipe) {
      return pipe.transform(label);
    }

    return label;
  }

  iniciarVisualizacao(row: T): void {
    this.router.navigate([row[this.campoId()], this.rotaVisualizacao()], {
      relativeTo: this.activatedRoute,
    });
  }
}
