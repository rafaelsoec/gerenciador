import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { NotaFiscalDTO } from '../../dtos/nota-fiscal/NotaFiscalDTO';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { AlertaService } from '../../services/alerta.service';
import { ColunaTabela, ItemTabela, TabelaComponent } from '../../shared/tabela/tabela';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { StatusNotaFiscalEnum, StatusNotaFiscalLabel } from '../../enums/StatusNotaFiscalEnum';
import { TipoNotaFiscalLabel } from '../../enums/TipoNotaFiscalEnum';
import { NaturezaOperacaoEnum } from '../../enums/NaturezaOperacaoEnum';
import { NaturezaOperacaoPipePipe } from '../../pipes/natureza-pipe';
import { HttpResponse } from '@angular/common/http';
import { VisualizadorDocumentoComponent, InputVisualizadorDocumento } from '../../components/visualizador-documento/visualizador-documento.component';
import { MatDialog } from '@angular/material/dialog';

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
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly notas = signal<NotaFiscalDTO[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  readonly icones: ItemTabela[] = [
    {
      nome: 'Imprimir Danfe simplificada',
      icone: new URL('icons/danfe_simplificado.svg', document.baseURI).href,
      isSvg: true,
      function: (row) => {
        this.imprimir(row.id, "DANFE_SIMPLIFICADO");
      },
    },
    {
      nome: 'Imprimir NFE',
      icone: new URL('icons/nfe.svg', document.baseURI).href,
      isSvg: true,
      function: (row) => {
        this.imprimir(row.id, "NFE");
      },
    },
    {
      nome: 'Imprimir NFSE',
      icone: new URL('icons/nfse.svg', document.baseURI).href,
      isSvg: true,
      function: (row) => {
        this.imprimir(row.id, "NFSE");
      },
    },
    {
      nome: 'Editar',
      icone: 'edit',
      isSvg: false,
      function: (row) => {
        this.router.navigate(['notas-fiscais', 'nova', 'pedido', row.pedidoId], {
          queryParams: { rota: 'notas-fiscais' },
        });
      },
    },
  ];

  readonly colunas: ColunaTabela[] = [
    { campo: 'numero', header: 'Numero', editavel: false, width: '8%' },
    { campo: 'serie', header: 'Serie', editavel: false, width: '6%' },
    { campo: 'tipoLabel', header: 'Tipo', editavel: false, width: '10%' },
    { campo: 'statusLabel', header: 'Status', editavel: false, width: '10%' },
    {
      campo: 'naturezaOperacao',
      header: 'Natureza',
      pipe: new NaturezaOperacaoPipePipe(),
      opcoes: Object.values(NaturezaOperacaoEnum),
      editavel: false,
      width: '18%',
    },
    { campo: 'destinatarioNome', header: 'Destinatario', editavel: false, width: '22%' },
    { campo: 'valorTotal', header: 'Valor Total', editavel: false, width: '10%' },
    { campo: 'dataEmissao', header: 'Emissao', editavel: false, width: '10%' },
  ];

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());
  }

  private _buscar(page: number, size: number): void {
    this.notaFiscalService.listar({ page, size, sort: 'id,desc' }).subscribe({
      next: (pagina) => {
        const itens = pagina.conteudo.map((n) => ({
          ...n,
          naturezaOperacao: n.naturezaOperacao,
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



  imprimir(idNota: number, tipo: string): void {
    this.notaFiscalService.gerarPdf(idNota, tipo).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const pdf = response.body!;
        if (!response.body) {
          console.error('PDF não retornado pelo servidor');
          return;
        }

        const documento = new Blob([response.body], { type: 'application/pdf' });
        const contentDisposition = response.headers.get('Content-Disposition');

        const nomeArquivo =
          contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] ?? `nf-${idNota}.pdf`;

        this.dialog.open<VisualizadorDocumentoComponent, InputVisualizadorDocumento, void>(
          VisualizadorDocumentoComponent,
          {
            autoFocus: false,
            width: '80vw',
            maxWidth: '80vw',
            height: '90vh',
            maxHeight: '90vh',
            data: {
              documento: documento,
              nomeDocumento: nomeArquivo,
            }
          }
        );
      },
      error: (erro) => {
        this.alertaService.erro(erro);
      },
    });
  }
}
