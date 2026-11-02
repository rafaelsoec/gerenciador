import { Component, inject, signal, OnInit } from '@angular/core';
import { ProdutoDTO } from '../../dtos/produto/ProdutoDTO';
import { ProdutoService } from '../../services/produto.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { CampoFormulario, FormCadastroComponent, FormCadastroDialogData, Registro, converterRegistro } from '../../shared/form-cadastro/form-cadastro';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AlertaService } from '../../services/alerta.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-produtos',
  standalone: true,
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
  imports: [TabelaComponent, HeaderPaginaComponent],
})
export class ProdutosComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly alertaService = inject(AlertaService);
  private readonly dialog = inject(MatDialog);

  readonly produtos = signal<ProdutoDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly colunas: ColunaTabela[] = [
    { campo: 'nome', header: 'Nome', editavel: true, width: '30%' },
    { campo: 'descricao', header: 'Descrição', editavel: true, width: '35%' },
    { campo: 'preco', header: 'Preço (R$)', editavel: true, width: '10%' },
    { campo: 'estoque', header: 'Estoque', editavel: true, width: '10%' },
    { campo: 'situacao', header: 'Situação', editavel: false, width: '5%' },
  ];

  readonly camposProduto: CampoFormulario[] = [
    { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, col: 12 },
    { nome: 'descricao', label: 'Descrição', tipo: 'text', obrigatorio: false, col: 12 },
    { nome: 'preco', label: 'Preço (R$)', tipo: 'text', obrigatorio: true, col: 6 },
    { nome: 'estoque', label: 'Estoque', tipo: 'text', obrigatorio: true, col: 6 },
  ];

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.produtoService.listar({ page, size, sort: 'id,asc' }).subscribe((pagina) => {
      this.produtos.set(pagina.conteudo);
      this.totalElementos.set(pagina.totalElementos);
      this.paginaAtual.set(pagina.paginaAtual);
      this.tamanhoPagina.set(pagina.tamanhoPagina);
    });
  }

  onPaginaAlterada(event: PageEvent): void {
    this._buscar(event.pageIndex, event.pageSize);
  }

  onNovo(): void {
    this.dialog.open<FormCadastroComponent, FormCadastroDialogData, Registro>(FormCadastroComponent, {
      width: '80vw',
      maxWidth: '80vw',
      data: {
        titulo: 'Novo Produto',
        campos: this.camposProduto,
        onSalvar: this.onCadastrar.bind(this),
        onCancelar: this.onCancelar.bind(this),
      },
    });
  }

  onCancelar(): void {
    console.log('Cancelar cadastro de produto');
  }

  onCadastrar(produto: Registro): Observable<ProdutoDTO> {
    const produtoConvertido = converterRegistro(produto, class {
      id = 0; nome = ''; descricao = ''; preco = 0; estoque = 0;
    }) as unknown as Omit<ProdutoDTO, 'id'> & { id: number };
    return this.produtoService.criar(produtoConvertido).pipe(
      tap((novo) => {
        this.produtos.update(lista => [...lista, novo]);
        this.alertaService.sucesso('Produto cadastrado com sucesso.');
      }),
      catchError(erro => {
        this.alertaService.erro(erro.error);
        return throwError(() => erro);
      })
    );
  }

  onSalvar(produto: ProdutoDTO): void {
    this.produtoService.atualizar(produto.id, produto)
      .subscribe(() => {
        this.produtos.update(lista =>
          lista.map(p => p.id === produto.id ? produto : p)
        );
        this.alertaService.sucesso('Produto atualizado com sucesso.');
      }, (erro) => {
        this.alertaService.erro(erro.error);
      });
  }

  onExcluir(produto: ProdutoDTO): void {
    this.produtoService.excluir(produto.id)
      .subscribe(() => {
        this.alertaService.sucesso('Produto excluído com sucesso.');
        this.produtos.update(lista =>
          lista.filter(p => p.id !== produto.id)
        );
      }, (erro) => {
        this.alertaService.erro(erro.error);
      });
  }
}
