import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { AlertaService } from '../../services/alerta.service';
import { ColunaTabela, TabelaComponent } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { TransportadoraDTO } from '../../dtos/TransportadoraDTO';
import { TransportadoraService } from '../../services/transportadora.service';
import { ModalidadeFreteEnum, modalidadeFreteLabel } from '../../enums/ModalidadeFreteEnum';
import { ModalidadeFretePipe } from '../../pipes/modalidade-frete-pipe';

@Component({
  selector: 'app-transportadoras',
  standalone: true,
  templateUrl: './transportadora.html',
  styleUrl: './transportadora.css',
  imports: [CommonModule, TabelaComponent, HeaderPaginaComponent],
})
export class TransportadoraComponent implements OnInit {
  private readonly transportadoraService = inject(TransportadoraService);
  private readonly alertaService = inject(AlertaService);
  private readonly router = inject(Router);

  readonly transportadoras = signal<TransportadoraDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly colunas: ColunaTabela[] = [
    { campo: 'nome', header: 'Nome', editavel: true, width: '40%' },
    { campo: 'identificador', header: 'Cpf/Cnpj', editavel: false, width: '25%' },
    {
      campo: 'modalidadeFrete',
      pipe: new ModalidadeFretePipe(),
      header: 'Modalidade de Frete',
      editavel: true,
      width: '10%',
    },
    { campo: 'municipio', header: 'Municipio', editavel: true, width: '20%' },
    { campo: 'uf', header: 'UF', editavel: true, width: '5%' },
  ];

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.transportadoraService.listar({ page, size, sort: 'id,asc' }).subscribe((pagina) => {
      this.transportadoras.set(pagina.conteudo);
      this.totalElementos.set(pagina.totalElementos);
      this.paginaAtual.set(pagina.paginaAtual);
      this.tamanhoPagina.set(pagina.tamanhoPagina);
    });
  }

  onPaginaAlterada(event: PageEvent): void {
    this._buscar(event.pageIndex, event.pageSize);
  }

  onNovo(): void {
    this.router.navigate(['/transportadoras/nova']);
  }

  onEditar(transportadora: TransportadoraDTO): void {
    this.router.navigate(['/transportadoras', transportadora.id, 'editar']);
  }

  onExcluir(transportadora: TransportadoraDTO): void {
    this.transportadoraService.remover(transportadora.id ?? 0).subscribe({
      next: () => {
        this.alertaService.sucesso('Transportadora excluida com sucesso.');
        this.transportadoras.update((lista) => lista.filter((e) => e.id !== transportadora.id));
        this.totalElementos.update((t) => t - 1);
      },
      error: (erro) => {
        this.alertaService.erro(erro.error);
      },
    });
  }
}
