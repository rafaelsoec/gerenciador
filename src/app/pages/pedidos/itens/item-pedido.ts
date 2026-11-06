import {
  Component,
  computed,
  inject,
  model,
  OnInit,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SelectAutocompleteComponent } from '../../../shared/auto-select/auto-select';
import { ProdutoService } from '../../../services/produto.service';
import { OpcaoCampo } from '../../../shared/form-cadastro/form-cadastro';
import { NumberUtils } from '../../../utils/NumberUtils';

export interface ItemPedido {
  produtoId: number | null;
  quantidade: number | null;
}

interface ItemTabela {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  editando: boolean;
  quantidadeEdicao: number;
}

@Component({
  selector: 'app-itens-pedido',
  standalone: true,
  styleUrl: './item-pedido.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    SelectAutocompleteComponent,
  ],
  templateUrl: './item-pedido.html',
})
export class ItensPedidoComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);

  readonly itens = model<ItemPedido[]>([]);
  readonly produtos = signal<OpcaoCampo[]>([]);

  /** Mapa de produtoId → preço unitário */
  private precoPorProduto = new Map<number, number>();
  /** Mapa de produtoId → nome */
  private nomePorProduto = new Map<number, string>();

  /** Estado da tabela */
  readonly itensDaTabela = signal<ItemTabela[]>([]);

  /** Campos do formulário de entrada */
  entrada: { produtoId: any; quantidade: number | null } = {
    produtoId: null,
    quantidade: null,
  };

  @Output() selectionChange = new EventEmitter<ItemPedido[] | null>();
  @Output() totalAlterado = new EventEmitter<number>();

  /** Produtos ainda não adicionados à tabela */
  readonly produtosDisponiveis = computed(() => {
    const idsNaTabela = new Set(this.itensDaTabela().map((i) => i.produtoId));
    return this.produtos().filter((p) => !idsNaTabela.has(Number(p.value)));
  });

  ngOnInit(): void {
    this.buscarProdutos();
  }

  adicionarItem(): void {
    const produtoRaw = this.entrada.produtoId;
    const quantidade = this.entrada.quantidade;

    const produtoId =
      produtoRaw && typeof produtoRaw === 'object'
        ? Number(produtoRaw['value'])
        : Number(produtoRaw);

    if (!produtoId || !quantidade || quantidade < 1) {
      return;
    }

    const nome = this.nomePorProduto.get(produtoId) ?? '';

    this.itensDaTabela.update((lista) => [
      ...lista,
      {
        produtoId,
        produtoNome: nome,
        quantidade,
        editando: false,
        quantidadeEdicao: quantidade,
      },
    ]);

    // Limpa o formulário de entrada
    this.entrada = { produtoId: null, quantidade: null };

    this.emitir();
  }

  removerItem(item: ItemTabela): void {
    this.itensDaTabela.update((lista) =>
      lista.filter((i) => i.produtoId !== item.produtoId)
    );
    this.emitir();
  }

  iniciarEdicao(item: ItemTabela): void {
    item.quantidadeEdicao = item.quantidade;
    item.editando = true;
  }

  confirmarEdicao(item: ItemTabela): void {
    if (!item.quantidadeEdicao || item.quantidadeEdicao < 1) return;
    item.quantidade = item.quantidadeEdicao;
    item.editando = false;
    this.emitir();
  }

  cancelarEdicao(item: ItemTabela): void {
    item.quantidadeEdicao = item.quantidade;
    item.editando = false;
  }

  private emitir(): void {
    const itensValidos = this.itensDaTabela().map((i) => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade,
    }));

    this.itens.set(itensValidos);
    this.selectionChange.emit(itensValidos);

    const total = itensValidos.reduce((soma, item) => {
      const preco = NumberUtils.toNumber(this.precoPorProduto.get(item.produtoId!) ?? 0);
      return soma + preco * (item.quantidade ?? 0);
    }, 0);

    this.totalAlterado.emit(total);
  }

  private buscarProdutos(): void {
    this.produtoService
      .listar({ page: 0, size: 200, sort: 'id,asc' })
      .subscribe((pagina) => {
        this.precoPorProduto.clear();
        this.nomePorProduto.clear();
        pagina.conteudo.forEach((produto) => {
          this.precoPorProduto.set(produto.id, produto.preco);
          this.nomePorProduto.set(produto.id, produto.nome);
        });
        this.produtos.set(
          pagina.conteudo.map((produto) => ({
            value: produto.id,
            label: produto.nome,
          }))
        );
      });
  }
}
