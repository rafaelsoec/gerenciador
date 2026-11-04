import { Component, inject, OnInit, signal } from '@angular/core';
import { PedidoDTO } from '../../dtos/pedido/PedidoDTO';
import { PedidoService } from '../../services/pedido.service';
import { ColunaTabela, TabelaComponent } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import {
  CampoFormulario,
  converterRegistro,
  FormCadastroComponent,
  FormCadastroDialogData,
  OpcaoCampo,
  Registro,
} from '../../shared/form-cadastro/form-cadastro';
import { MatDialog } from '@angular/material/dialog';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AlertaService } from '../../services/alerta.service';
import { PageEvent } from '@angular/material/paginator';
import { StatusPedidoEnum } from '../../enums/StatusPedidoEnum';
import { FormaPagamentoEnum } from '../../enums/FormaPagamentoEnum';
import { FormaPagamentoPipe } from '../../pipes/forma-pagamento-pipe';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
  imports: [TabelaComponent, HeaderPaginaComponent],
})
export class PedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly alertaService = inject(AlertaService);
  private readonly dialog = inject(MatDialog);

  readonly pedidos = signal<PedidoDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly colunas: ColunaTabela[] = [
    { campo: 'clienteNome', header: 'Cliente', editavel: false, width: '25%' },
    { campo: 'status', header: 'Status', editavel: false, width: '10%' },
    { campo: 'formaPagamento', header: 'Forma de Pagamento', editavel: false, width: '15%' },
    { campo: 'valorTotal', header: 'Valor Total', editavel: false, width: '10%' },
    { campo: 'desconto', header: 'Desconto', editavel: false, width: '8%' },
    { campo: 'frete', header: 'Frete', editavel: false, width: '8%' },
    { campo: 'dataEntrega', header: 'Data de Entrega', editavel: false, width: '12%' },
    { campo: 'criadoEm', header: 'Criado Em', editavel: false, width: '12%' },
  ];

  readonly camposPedido: CampoFormulario[] = [
    {
      nome: 'cliente',
      label: 'Cliente',
      tipo: 'autoselect',
      obrigatorio: true,
      col: 6,
    },
    {
      nome: 'produto',
      label: 'Produto',
      tipo: 'autoselect',
      obrigatorio: true,
      col: 6,
    },
    {
      nome: 'valor',
      label: 'Valor (R$)',
      mascara:
        '000.000.000,00||00.000.000,00||0.000.000,00||000.000,00||00.000,00||0.000,00||000,00||00,00||0,00',
      tipo: 'text',
      obrigatorio: true,
      col: 6,
    },
    {
      nome: 'formaPagamento',
      label: 'Forma de Pagamento',
      tipo: 'select',
      multiplo: false,
      obrigatorio: true,
      col: 6,
      pipe: new FormaPagamentoPipe(),
      opcoes: Object.values(FormaPagamentoEnum).map((v) => ({ label: v, value: v })),
    },
    {
      nome: 'desconto',
      label: 'Desconto (R$)',
      mascara:
        '000.000.000,00||00.000.000,00||0.000.000,00||000.000,00||00.000,00||0.000,00||000,00||00,00||0,00',
      tipo: 'text',
      obrigatorio: false,
      col: 4,
    },
    {
      nome: 'frete',
      label: 'Frete (R$)',
      mascara:
        '000.000.000,00||00.000.000,00||0.000.000,00||000.000,00||00.000,00||0.000,00||000,00||00,00||0,00',
      tipo: 'text',
      obrigatorio: false,
      col: 4,
    },
    { nome: 'dataEntrega', label: 'Data de Entrega', tipo: 'data', obrigatorio: true, col: 4 },
    { nome: 'observacao', label: 'Observação', tipo: 'textarea', obrigatorio: false, col: 12 },
  ];

  produtos: OpcaoCampo[] = [
    { value: 1, label: 'Notebook' },
    { value: 2, label: 'Mouse' },
    { value: 3, label: 'Teclado' },
  ];

  produtosSelecionados: OpcaoCampo[] = [];

  buscarProdutos(termo: string): void {
    console.log('Buscar:', termo);
    // Chame seu service aqui, por exemplo:
    // this.produtoService.buscar(termo).subscribe(...);
  }

  carregarMaisProdutos(): void {
    console.log('Carregar próxima página');
    // Chame seu service de paginação aqui
  }

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.pedidoService.listar({ page, size, sort: 'id,asc' }).subscribe((pagina) => {
      this.pedidos.set(pagina.conteudo);
      this.totalElementos.set(pagina.totalElementos);
      this.paginaAtual.set(pagina.paginaAtual);
      this.tamanhoPagina.set(pagina.tamanhoPagina);
    });
  }

  onPaginaAlterada(event: PageEvent): void {
    this._buscar(event.pageIndex, event.pageSize);
  }

  onNovo(): void {
    this.dialog.open<FormCadastroComponent, FormCadastroDialogData, Registro>(
      FormCadastroComponent,
      {
        width: '80vw',
        maxWidth: '80vw',
        data: {
          titulo: 'Novo Pedido',
          campos: this.camposPedido,
          onSalvar: this.onCadastrar.bind(this),
          onCancelar: this.onCancelar.bind(this),
        },
      },
    );
  }

  onCancelar(): void {
    console.log('Cancelar cadastro de pedido');
  }

  onCadastrar(pedido: Registro): Observable<PedidoDTO> {
    const pedidoConvertido: PedidoDTO = converterRegistro(pedido, PedidoDTO);
    return this.pedidoService.criar(pedidoConvertido).pipe(
      tap((novo) => {
        this.pedidos.update((lista) => [...lista, novo]);
        this.alertaService.sucesso('Pedido cadastrado com sucesso.');
      }),
      catchError((erro) => {
        this.alertaService.erro(erro.error);
        return throwError(() => erro);
      }),
    );
  }

  onSalvar(pedido: PedidoDTO): void {
    this.pedidoService.atualizar(pedido.id, pedido).subscribe(
      () => {
        this.pedidos.update((lista) => lista.map((p) => (p.id === pedido.id ? pedido : p)));
        this.alertaService.sucesso('Pedido atualizado com sucesso.');
      },
      (erro) => {
        this.alertaService.erro(erro.error);
      },
    );
  }

  onExcluir(pedido: PedidoDTO): void {
    this.pedidoService.remover(pedido.id).subscribe(
      () => {
        this.alertaService.sucesso('Pedido excluído com sucesso.');
        this.pedidos.update((lista) => lista.filter((p) => p.id !== pedido.id));
      },
      (erro) => {
        this.alertaService.erro(erro.error);
      },
    );
  }
}
