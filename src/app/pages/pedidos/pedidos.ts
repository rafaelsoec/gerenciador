import { Component, inject, OnInit, signal } from '@angular/core';
import { PedidoDTO } from '../../dtos/pedido/PedidoDTO';
import { PedidoService } from '../../services/pedido.service';
import { ColunaTabela, TabelaComponent } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { MatDialog } from '@angular/material/dialog';
import { AlertaService } from '../../services/alerta.service';
import { PageEvent } from '@angular/material/paginator';
import { CadastroPedidoComponent } from './cadastro-pedido/cadastro-pedido';
import { FormaPagamentoPipe } from '../../pipes/forma-pagamento-pipe';
import { FormaPagamentoEnum } from '../../enums/FormaPagamentoEnum';
import { StatusPedidoEnum } from '../../enums/StatusPedidoEnum';
import { StatusPedidoPipe } from '../../pipes/status-pedido-pipe';
import { Constantes } from '../../constantes/Constantes';
import { MoedaPipe } from '../../pipes/moeda-pipe';

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
    {
      campo: 'status',
      header: 'Status',
      editavel: true,
      pipe: new StatusPedidoPipe(),
      opcoes: Object.values(StatusPedidoEnum),
      width: '10%',
    },
    {
      campo: 'formaPagamento',
      header: 'Forma de Pagamento',
      pipe: new FormaPagamentoPipe(),
      opcoes: Object.values(FormaPagamentoEnum),
      editavel: true,
      width: '15%',
    },
    {
      campo: 'valorTotal',
      header: 'Valor Total',
      editavel: true,
      mascara: Constantes.MASCARA_MOEDA,
      width: '10%',
    },
    {
      campo: 'desconto',
      header: 'Desconto',
      editavel: true,
      mascara: Constantes.MASCARA_MOEDA,
      width: '8%',
    },
    {
      campo: 'frete',
      header: 'Frete',
      editavel: true,
      mascara: Constantes.MASCARA_MOEDA,
      width: '8%',
    },
    {
      campo: 'dataEntrega',
      header: 'Data de Entrega',
      mascara: '00/00/0000',
      editavel: true,
      width: '12%',
    },
    { campo: 'criadoEm', header: 'Criado Em', editavel: false, width: '12%' },
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
    this.dialog
      .open<CadastroPedidoComponent, void, PedidoDTO>(CadastroPedidoComponent, {
        width: '80vw',
        maxWidth: '80vw',
        height: '90vh',
        maxHeight: '90vh',
      })
      .afterClosed()
      .subscribe((novo) => {
        if (novo) {
          this.pedidos.update((lista) => [...lista, novo]);
        }
      });
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
