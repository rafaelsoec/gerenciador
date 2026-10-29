import { Component, inject, signal, OnInit } from '@angular/core';
import { ClienteDTO } from '../../dtos/cliente/ClienteDTO';
import { ClienteService } from '../../services/cliente.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  imports: [TabelaComponent],
})
export class ClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);

  readonly clientes = signal<ClienteDTO[]>([]);

  readonly colunas: ColunaTabela[] = [
    { campo: 'nome', header: 'Nome', editavel: true },
    { campo: 'tipo', header: 'Tipo', editavel: false },
    { campo: 'identificador', header: 'Identificador', editavel: false },
    { campo: 'email', header: 'E-mail', editavel: true },
    { campo: 'situacao', header: 'Situação', editavel: false },
  ];

  ngOnInit(): void {
    this.clienteService.listar().subscribe((lista) => {
      this.clientes.set(lista);
      debugger
    });
  }

  onSalvar(cliente: ClienteDTO): void {
    this.clientes.update((lista) =>
      lista.map((c) => (c.id === cliente.id ? cliente : c))
    );
  }

  onExcluir(cliente: ClienteDTO): void {
    console.log('Excluir:', cliente);
  }
}
