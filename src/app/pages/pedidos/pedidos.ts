import { Component, inject, signal, OnInit } from '@angular/core';
import { PedidoDTO } from '../../dtos/pedido/PedidoDTO';
import { PedidoService } from '../../services/pedido.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { CampoFormulario, FormCadastroComponent, FormCadastroDialogData, Registro, converterRegistro } from '../../shared/form-cadastro/form-cadastro';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AlertaService } from '../../services/alerta.service';
import { PageEvent } from '@angular/material/paginator';
import { StatusPedidoEnum } from '../../enums/StatusPedidoEnum';
import { FormaPagamentoEnum } from '../../enums/FormaPagamentoEnum';

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
      nome: 'status', label: 'Status', tipo: 'select', obrigatorio: true, col: 6,
      opcoes: Object.values(StatusPedidoEnum).map(v => ({ label: v, value: v })),
    },
    {
      nome: 'formaPagamento', label: 'Forma de Pagamento', tipo: 'select', obrigatorio: true, col: 6,
      opcoes: Object.values(FormaPagamentoEnum).map(v => ({ label: v, value: v })),
    },
    { nome: 'desconto', label: 'Desconto (R$)', tipo: 'text', obrigatorio: false, col: 4 },
    { nome: 'frete', label: 'Frete (R$)', tipo: 'text', obrigatorio: false, col: 4 },
    { nome: 'dataEntrega', label: 'Data de Entrega', tipo: 'text', obrigatorio: false, col: 4 },
    { nome: 'observacao', label: 'Observação', tipo: 'text', obrigatorio: false, col: 12 },
  ];

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
    this.dialog.open<FormCadastroComponent, FormCadastroDialogData, Registro>(FormCadastroComponent, {
      width: '80vw',
      maxWidth: '80vw',
      data: {
        titulo: 'Novo Pedido',
        campos: this.camposPedido,
        onSalvar: this.onCadastrar.bind(this),
        onCancelar: this.onCancelar.bind(this),
      },
    });
  }

  onCancelar(): void {
    console.log('Cancelar cadastro de pedido');
  }

  onCadastrar(pedido: Registro): Observable<PedidoDTO> {
    const pedidoConvertido: PedidoDTO = converterRegistro(pedido, PedidoDTO);
    return this.pedidoService.criar(pedidoConvertido).pipe(
      tap((novo) => {
        this.pedidos.update(lista => [...lista, novo]);
        this.alertaService.sucesso('Pedido cadastrado com sucesso.');
      }),
      catchError(erro => {
        this.alertaService.erro(erro.error);
        return throwError(() => erro);
      })
    );
  }

  onSalvar(pedido: PedidoDTO): void {
    this.pedidoService.atualizar(pedido.id, pedido)
      .subscribe(() => {
        this.pedidos.update(lista =>
          lista.map(p => p.id === pedido.id ? pedido : p)
        );
        this.alertaService.sucesso('Pedido atualizado com sucesso.');
      }, (erro) => {
        this.alertaService.erro(erro.error);
      });
  }

  onExcluir(pedido: PedidoDTO): void {
    this.pedidoService.remover(pedido.id)
      .subscribe(() => {
        this.alertaService.sucesso('Pedido excluído com sucesso.');
        this.pedidos.update(lista =>
          lista.filter(p => p.id !== pedido.id)
        );
      }, (erro) => {
        this.alertaService.erro(erro.error);
      });
  }
}
