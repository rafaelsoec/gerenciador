import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  signal
} from '@angular/core';
import { OpcaoCampo } from '../../shared/form-cadastro/form-cadastro';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClienteService } from '../../services/cliente.service';
import { SelectAutocompleteComponent } from '../../shared/auto-select/auto-select';

export interface InputVisualizadorDocumento {
  documento: Blob;
  nomeDocumento: string;
}

@Component({
  selector: 'app-visualizador-documento',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    SelectAutocompleteComponent,
  ],
  templateUrl: './visualizador-documento.component.html',
  styleUrl: './visualizador-documento.component.css'
})
export class VisualizadorDocumentoComponent
  implements OnChanges, OnDestroy, OnInit {

  readonly data = inject<InputVisualizadorDocumento>(MAT_DIALOG_DATA);

  readonly dialogRef = inject(MatDialogRef<VisualizadorDocumentoComponent>);

  @Input() arquivo: Blob | null = null;
  @Input() nomeArquivo = 'documento.pdf';

  private readonly sanitizer = inject(DomSanitizer);
  private readonly clienteService = inject(ClienteService);
  

  url: string | null = null;
  urlSegura: SafeResourceUrl | null = null;

  @ViewChild('iframePdf')
  iframePdf!: ElementRef<HTMLIFrameElement>;
  
  readonly clientes = signal<OpcaoCampo[]>([]);
  readonly clienteIdSignal = signal<any>(null);

  zoom = 100;

  ngOnInit(): void {
    this.arquivo = this.data.documento;
    this.nomeArquivo = this.data.nomeDocumento ?? 'documento.pdf';
    this.clienteService.listar({ size: 200 }).subscribe((pagina) => {
      this.clientes.set(
        pagina.conteudo.map((c) => ({ value: c.id, label: c.nome, selected: false })),
      );
    });

    this.atualizarDocumento();
  }

  ngOnChanges(): void {
    this.atualizarDocumento();
  }

  ngOnDestroy(): void {
    this.limpar();
  }

  ajustarLargura(): void {
    this.zoom = 100;
    this.atualizarVisualizacao('page-width');
  }

  enviarEmail(): void {
  }

  ajustarPagina(): void {
    this.zoom = 100;
    this.atualizarVisualizacao('page-fit');
  }

  atualizarVisualizacao(ajuste?: string): void {
    if (!this.url) return;

    const zoom = ajuste ?? this.zoom;

    this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.url}#toolbar=0&navpanes=0&zoom=${zoom}`
    );
  }

  alterarZoom(valor: number): void {
    this.zoom = Math.max(50, Math.min(valor, 300));

    const documento = this.iframePdf.nativeElement.contentDocument;
    const paginas = documento?.querySelectorAll<HTMLElement>('.page');

    paginas?.forEach(pagina => {
      pagina.style.transform = `scale(${this.zoom / 100})`;
      pagina.style.transformOrigin = 'top center';
    });
  }

  aumentarZoom(): void {
    this.zoom = Math.min(this.zoom + 10, 200);
    this.alterarZoom(this.zoom + 10);
  }

  diminuirZoom(): void {
    this.zoom = Math.max(this.zoom - 10, 50);
    this.alterarZoom(this.zoom - 10);
  }


  baixar(): void {
    if (!this.url) return;

    const link = document.createElement('a');
    link.href = this.url;
    link.download = this.nomeArquivo;
    link.click();
  }

  fechar(): void {
    this.dialogRef.close();
  }

  imprimir(): void {
    if (!this.url) return;

    const janela = window.open(this.url, '_blank');

    janela?.addEventListener('load', () => janela.print());
  }

  private atualizarDocumento(): void {
    this.limpar();

    if (!this.arquivo || this.arquivo.size === 0) return;

    const pdf = new Blob([this.arquivo], {
      type: 'application/pdf'
    });

    this.url = URL.createObjectURL(pdf);

    this.atualizarVisualizacao();
  }

  private limpar(): void {
    if (this.url) {
      URL.revokeObjectURL(this.url);
    }

    this.url = null;
    this.urlSegura = null;
    this.zoom = 100;
  }
}