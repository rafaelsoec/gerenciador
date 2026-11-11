import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { RequisicaoEmailDTO } from '../../dtos/RequisicaoEmailDTO';
import { DateUtils } from '../../utils/DateUtils';
import { EmailService } from '../../services/email.service';
import { AlertaService } from '../../services/alerta.service';

export interface InputVisualizadorDocumento {
  documento: Blob;
  nomeDocumento: string;
  email: string;
  copias?: string[];
}

@Component({
  selector: 'app-visualizador-documento',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule],
  templateUrl: './visualizador-documento.component.html',
  styleUrl: './visualizador-documento.component.css',
})
export class VisualizadorDocumentoComponent implements OnChanges, OnDestroy, OnInit {
  readonly data = inject<InputVisualizadorDocumento>(MAT_DIALOG_DATA);

  readonly dialogRef = inject(MatDialogRef<VisualizadorDocumentoComponent>);

  @Input() arquivo: Blob | null = null;
  @Input() nomeArquivo = 'documento.pdf';
  @Input() email = '';
  @Input() copias = [];

  private readonly sanitizer = inject(DomSanitizer);
  private readonly emailService = inject(EmailService);
  private readonly alertaService = inject(AlertaService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  url: string | null = null;
  urlSegura: SafeResourceUrl | null = null;

  @ViewChild('iframePdf')
  iframePdf!: ElementRef<HTMLIFrameElement>;

  zoom = 100;

  ngOnInit(): void {
    this.arquivo = this.data.documento;
    this.nomeArquivo = this.data.nomeDocumento ?? 'documento.pdf';
    this.email = this.data.email ?? '';

    this.atualizarDocumento();
  }

  ngOnChanges(): void {
    this.atualizarDocumento();
  }

  ngOnDestroy(): void {
    this.limpar();
  }

  enviarEmail(): void {
    this.confirmDialogService
      .confirmar('Enviar Nota Fiscal', `Enviar nota fiscal para ${this.email}?`)
      .subscribe((confirmado) => {
        if (confirmado) {
          const requisicao: RequisicaoEmailDTO = {
            destinatarios: [this.email],
            copias: this.copias,
            copiasOcultas: [],
            assunto: 'Envio de Nota Fiscal',
            titulo: 'Nota Fiscal - ' + DateUtils.formatar(new Date()),
            mensagem: '<h2>Olá!</h2>',
            html: true,
            anexos: [
              {
                nome: this.nomeArquivo,
                contentType: 'application/pdf',
                conteudo: [this.arquivo],
              },
            ],
          };
          this.emailService.enviar(requisicao).subscribe({
            next: (value) => {
              this.alertaService.sucesso('Email enviado!');
            },
            error: (erro) => {
              this.alertaService.erro('Erro ao enviar email!');
            },
          });
        }
      });
  }

  atualizarVisualizacao(ajuste?: string): void {
    if (!this.url) return;

    const zoom = ajuste ?? this.zoom;

    this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.url}#toolbar=0&navpanes=0&zoom=${zoom}`,
    );
  }

  alterarZoom(valor: number): void {
    this.zoom = Math.max(50, Math.min(valor, 300));

    const documento = this.iframePdf.nativeElement.contentDocument;
    const paginas = documento?.querySelectorAll<HTMLElement>('.page');

    paginas?.forEach((pagina) => {
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
      type: 'application/pdf',
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
