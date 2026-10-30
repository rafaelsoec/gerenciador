import { Component, inject, signal, OnInit } from '@angular/core';
import { ClienteDTO } from '../../dtos/cliente/ClienteDTO';
import { ClienteService } from '../../services/cliente.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { CampoFormulario, FormCadastroComponent, FormCadastroDialogData, Registro, converterRegistro } from '../../shared/form-cadastro/form-cadastro';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  imports: [TabelaComponent, HeaderPaginaComponent],
})
export class ClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly dialog = inject(MatDialog);

  readonly clientes = signal<ClienteDTO[]>([]);

  readonly colunas: ColunaTabela[] = [
    { campo: 'nome', header: 'Nome', editavel: true },
    { campo: 'tipo', header: 'Tipo', editavel: false },
    { campo: 'identificador', header: 'Identificador', editavel: false },
    { campo: 'email', header: 'E-mail', editavel: true },
    { campo: 'situacao', header: 'Situação', editavel: false },
  ];

  readonly camposCliente: CampoFormulario[] = [
    { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, col: 12 },
    { nome: 'cpf', label: 'Cpf/Cnpj', tipo: 'text', obrigatorio: true, mascara: '000.000.000-00||00.000.000/0000-00', col: 4 },
    { nome: 'telefone', label: 'Telefone', obrigatorio: true, tipo: 'text', mascara: '(00) 00000-0000', col: 4 },
    { nome: 'email', label: 'E-mail', obrigatorio: true, tipo: 'text', mascara: 'A*@A*.A*', col: 4 },
    {
      nome: 'status', label: 'Status', tipo: 'select',
      opcoes: [{ label: 'Ativo', value: 'A' }, { label: 'Inativo', value: 'I' }], col: 4
    },
  ];

  ngOnInit(): void {
    this.clienteService.listar().subscribe((lista) => {
      this.clientes.set(lista);
    });
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

    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.onCadastrar(resultado);
      } else {
        this.onCancelar();
      }
    });
  }

  onCancelar(): void {
    debugger
    console.log('Cadastrar novo cliente');
  }

  onCadastrar(cliente: Registro): void {
    debugger
    console.log('Cadastrar novo cliente');
    let clienteConvertido: ClienteDTO = converterRegistro(cliente, ClienteDTO);
    // this.clienteService.atualizar(cliente.id, cliente)
    //   .subscribe(() => {
    //     this.clientes.update((lista) =>
    //       lista.map((c) => (c.id === cliente.id ? cliente : c))
    //     );
    //   });
  }

  onSalvar(cliente: ClienteDTO): void {
    this.clienteService.atualizar(cliente.id, cliente)
      .subscribe(() => {
        this.clientes.update((lista) =>
          lista.map((c) => (c.id === cliente.id ? cliente : c))
        );
      });
  }

  onExcluir(cliente: ClienteDTO): void {
    this.clienteService.remover(cliente.id)
      .subscribe(() => {
        this.clientes.update((lista) =>
          lista.filter((cli) => cli.id !== cliente.id)
        );
      });
  }

}
