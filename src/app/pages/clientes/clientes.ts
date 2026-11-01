import { Component, inject, signal, OnInit } from '@angular/core';
import { ClienteDTO } from '../../dtos/cliente/ClienteDTO';
import { ClienteService } from '../../services/cliente.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { CampoFormulario, FormCadastroComponent, FormCadastroDialogData, Registro, converterRegistro } from '../../shared/form-cadastro/form-cadastro';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AlertaService } from '../../services/alerta.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  imports: [TabelaComponent, HeaderPaginaComponent],
})
export class ClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly alertaService = inject(AlertaService);
  private readonly dialog = inject(MatDialog);

  readonly clientes = signal<ClienteDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly colunas: ColunaTabela[] = [
    { campo: 'nome', header: 'Nome', editavel: true, width: '35%', pattern: /^[a-zA-Z ]+$/ },
    { campo: 'tipo', header: 'Tipo', editavel: false, width: '3%' },
    { campo: 'identificador', header: 'Identificador', editavel: false, width: '10%', mascara: '000.000.000-00||00.000.000/0000-00' },
    { campo: 'email', header: 'E-mail', editavel: true, width: '25%', mascara: 'A*@A*.A*' },
    { campo: 'telefone', header: 'Telefone', editavel: true, width: '15%', mascara: '(00) 00000-0000' },
    { campo: 'situacao', header: 'Situação', editavel: false, width: '5%' },
  ];

  readonly camposCliente: CampoFormulario[] = [
    { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, pattern: /^[a-zA-Z ]+$/, col: 12 },
    { nome: 'identificador', label: 'Cpf/Cnpj', tipo: 'text', obrigatorio: true, mascara: '000.000.000-00||00.000.000/0000-00', col: 8 },
    { nome: 'telefone', label: 'Telefone', obrigatorio: false, tipo: 'text', mascara: '(00) 00000-0000', col: 4 },
    { nome: 'email', label: 'E-mail', obrigatorio: false, tipo: 'text', mascara: 'A*@A*.A*', col: 12 },
    // {
    //   nome: 'status', label: 'Status', tipo: 'select',
    //   opcoes: [{ label: 'Ativo', value: 'A' }, { label: 'Inativo', value: 'I' }], col: 4
    // },
  ];

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.clienteService.listar({ page, size, sort: 'id,asc' }).subscribe((pagina) => {
      this.clientes.set(pagina.conteudo);
      this.totalElementos.set(pagina.totalElementos);
      this.paginaAtual.set(pagina.paginaAtual);
      this.tamanhoPagina.set(pagina.tamanhoPagina);
    });
  }

  onPaginaAlterada(event: PageEvent): void {
    this._buscar(event.pageIndex, event.pageSize);
  }

  onNovo(): void {
    const ref = this.dialog.open<FormCadastroComponent, FormCadastroDialogData, Registro>(FormCadastroComponent, {
      width: '80vw',
      maxWidth: '80vw',
      data: {
        titulo: 'Novo Cliente',
        campos: this.camposCliente,
        onSalvar: this.onCadastrar.bind(this),
        onCancelar: this.onCancelar.bind(this),
      },
    });
  }

  onCancelar(): void {
    console.log('Cadastrar novo cliente');
  }

  onCadastrar(cliente: Registro): Observable<ClienteDTO> {
    let clienteConvertido: ClienteDTO = converterRegistro(cliente, ClienteDTO);
    clienteConvertido.identificador = clienteConvertido.identificador.replace(/\D/g, '');
    return this.clienteService.criar(clienteConvertido).pipe(
      tap(() => {
        this.clientes.update(lista => [...lista, clienteConvertido]);
        this.alertaService.sucesso("Cliente cadastrado com sucesso.");
      }),
      catchError(erro => {
        this.alertaService.erro(erro.error);
        return throwError(() => erro);
      })
    );
  }

  onSalvar(cliente: ClienteDTO): void {
    cliente.identificador = cliente.identificador.replace(/\D/g, '');
    this.clienteService.atualizar(cliente.id, cliente)
      .subscribe(() => {
        this.clientes.update(lista =>
          lista.map(c => c.id === cliente.id ? cliente : c)
        );
        this.alertaService.sucesso("Cliente atualizado com sucesso.");
      }, (erro) => {
        this.alertaService.erro(erro.error);
      });
  }

  onExcluir(cliente: ClienteDTO): void {
    this.clienteService.remover(cliente.id)
      .subscribe(() => {
        this.alertaService.sucesso("Cliente excluído com sucesso.");
        this.clientes.update((lista) =>
          lista.filter((cli) => cli.id !== cliente.id)
        );
      }, (erro) => {
        this.alertaService.erro(erro.error);
      });
  }

}
