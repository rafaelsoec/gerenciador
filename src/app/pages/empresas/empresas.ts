import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { EmpresaDTO } from '../../dtos/empresa/EmpresaDTO';
import { EmpresaService } from '../../services/empresa.service';
import { AlertaService } from '../../services/alerta.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';

@Component({
  selector: 'app-empresas',
  standalone: true,
  templateUrl: './empresas.html',
  styleUrl: './empresas.css',
  imports: [CommonModule, TabelaComponent, HeaderPaginaComponent],
})
export class EmpresasComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly alertaService = inject(AlertaService);
  private readonly router = inject(Router);

  readonly empresas = signal<EmpresaDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly colunas: ColunaTabela[] = [
    { campo: 'razaoSocial', header: 'Razao Social', editavel: false, width: '30%' },
    { campo: 'nomeFantasia', header: 'Nome Fantasia', editavel: false, width: '20%' },
    { campo: 'cnpj', header: 'CNPJ', editavel: false, width: '15%' },
    { campo: 'municipio', header: 'Municipio', editavel: false, width: '20%' },
    { campo: 'uf', header: 'UF', editavel: false, width: '5%' },
  ];

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.empresaService.listar({ page, size, sort: 'id,asc' }).subscribe((pagina) => {
      this.empresas.set(pagina.conteudo);
      this.totalElementos.set(pagina.totalElementos);
      this.paginaAtual.set(pagina.paginaAtual);
      this.tamanhoPagina.set(pagina.tamanhoPagina);
    });
  }

  onPaginaAlterada(event: PageEvent): void {
    this._buscar(event.pageIndex, event.pageSize);
  }

  onNovo(): void {
    this.router.navigate(['/empresas/nova']);
  }

  onEditar(empresa: EmpresaDTO): void {
    this.router.navigate(['/empresas', empresa.id, 'editar']);
  }

  onExcluir(empresa: EmpresaDTO): void {
    this.empresaService.remover(empresa.id).subscribe({
      next: () => {
        this.alertaService.sucesso('Empresa excluida com sucesso.');
        this.empresas.update((lista) => lista.filter((e) => e.id !== empresa.id));
        this.totalElementos.update((t) => t - 1);
      },
      error: (erro) => {
        this.alertaService.erro(erro.error);
      },
    });
  }
}
