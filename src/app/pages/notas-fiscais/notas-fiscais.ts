import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { NotaFiscalDTO } from '../../dtos/nota-fiscal/NotaFiscalDTO';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { AlertaService } from '../../services/alerta.service';
import { TabelaComponent, ColunaTabela } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { StatusNotaFiscalEnum, StatusNotaFiscalLabel } from '../../enums/StatusNotaFiscalEnum';
import { TipoNotaFiscalLabel } from '../../enums/TipoNotaFiscalEnum';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [CommonModule, TabelaComponent, HeaderPaginaComponent],
  templateUrl: './notas-fiscais.html',
  styleUrl: './notas-fiscais.css',
})
export class NotasFiscaisComponent implements OnInit {
  private readonly notaFiscalService = inject(NotaFiscalService);
  private readonly alertaService = inject(AlertaService);
  private readonly router = inject(Router);

  readonly notas = signal<NotaFiscalDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly colunas: ColunaTabela[] = [
    { campo: 'numero',             header: 'Numero',        editavel: false, width: '8%' },
    { campo: 'serie',              header: 'Serie',         editavel: false, width: '6%' },
    { campo: 'tipoLabel',          header: 'Tipo',          editavel: false, width: '10%' },
    { campo: 'statusLabel',        header: 'Status',        editavel: false, width: '10%' },
    { campo: 'naturezaLabel',      header: 'Natureza',      editavel: false, width: '18%' },
    { campo: 'destinatarioNome',   header: 'Destinatario',  editavel: false, width: '22%' },
    { campo: 'valorTotal',         header: 'Valor Total',   editavel: false, width: '10%' },
    { campo: 'dataEmissao',        header: 'Emissao',       editavel: false, width: '10%' },
  ];

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.notaFiscalService.listar({ page, size, sort: 'id,desc' }).subscribe({
      next: (pagina) => {
        const itens = pagina.conteudo.map((n) => ({
          ...n,
          tipoLabel: TipoNotaFiscalLabel[n.tipo] ?? n.tipo,
          statusLabel: StatusNotaFiscalLabel[n.status as StatusNotaFiscalEnum] ?? n.status,
        })) as any[];
        this.notas.set(itens);
        this.totalElementos.set(pagina.totalElementos);
        this.paginaAtual.set(pagina.paginaAtual);
        this.tamanhoPagina.set(pagina.tamanhoPagina);
      },
      error: (erro) => this.alertaService.erro(erro.error),
    });
  }

  onPaginaAlterada(event: PageEvent): void {
    this._buscar(event.pageIndex, event.pageSize);
  }

  onNovo(): void {
    this.router.navigate(['/notas-fiscais/nova']);
  }

  onExcluir(nota: NotaFiscalDTO): void {
    if (!nota.id) return;
    this.notaFiscalService.remover(nota.id).subscribe({
      next: () => {
        this.alertaService.sucesso('Nota fiscal removida com sucesso.');
        this.notas.update((lista) => lista.filter((n) => n.id !== nota.id));
        this.totalElementos.update((t) => t - 1);
      },
      error: (erro) => this.alertaService.erro(erro.error),
    });
  }
}
