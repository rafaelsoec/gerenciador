import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMaskDirective } from 'ngx-mask';
import { catchError, tap, throwError } from 'rxjs';
import { AlertaService } from '../../../services/alerta.service';
import { ScrollComponent } from '../../../components/scroll/scroll.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ModalidadeFreteEnum, modalidadeFreteLabel } from '../../../enums/ModalidadeFreteEnum';
import { TransportadoraService } from '../../../services/transportadora.service';
import { Constantes } from '../../../constantes/Constantes';
import { TransportadoraDTO } from '../../../dtos/TransportadoraDTO';
import { ModalidadeFretePipe } from '../../../pipes/modalidade-frete-pipe';

interface CadastroTransportadoraForm {
  id: number | null;
  nome: string;
  modalidadeFrete: ModalidadeFreteEnum;
  telefone: string;
  inscricaoEstadual: string;
  identificador: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
}

@Component({
  selector: 'app-cadastro-transportadora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    NgxMaskDirective,
    ScrollComponent,
    FooterComponent,
    ModalidadeFretePipe,
  ],
  templateUrl: './cadastro-transportadora.html',
  styleUrl: './cadastro-transportadora.css',
})
export class CadastroTransportadoraComponent implements OnInit {
  private readonly transportadoraService = inject(TransportadoraService);
  private readonly alertaService = inject(AlertaService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  protected readonly modalidadeFreteLabel = Object.keys(ModalidadeFreteEnum);

  id: number | undefined;

  readonly ufs = Constantes.UFS;

  form: CadastroTransportadoraForm = this._formVazio();

  readonly salvando = signal(false);

  get invalido(): boolean {
    return !this.form.nome?.trim() || !this.form.identificador?.trim() || !this.form.telefone?.trim();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : undefined;

    if (this.id) {
      this.transportadoraService.buscarPorId(this.id).subscribe({
        next: (transp) => {
          this.form = {
            id: transp.id,
            nome: transp.nome,
            modalidadeFrete: transp.modalidadeFrete,
            telefone: transp.telefone,
            inscricaoEstadual: transp.inscricaoEstadual,
            identificador: transp.identificador,
            cep: transp.cep,
            logradouro: transp.logradouro,
            numero: transp.numero,
            complemento: transp.complemento,
            bairro: transp.bairro,
            municipio: transp.municipio,
            uf: transp.uf,
          };
          this.cdr.detectChanges();
        },
        error: (erro) => {
          this.alertaService.erro(erro.error);
          this.router.navigate(['/transportadoras']);
        },
      });
    }
  }

  onSalvar(): void {
    if (this.invalido) return;

    this.salvando.set(true);

    const payload: Partial<TransportadoraDTO> = {
      id: this.form.id,
      nome: this.form.nome,
      modalidadeFrete: this.form.modalidadeFrete,
      telefone: this.form.telefone,
      inscricaoEstadual: this.form.inscricaoEstadual,
      identificador: this.form.identificador,
      cep: this.form.cep,
      logradouro: this.form.logradouro,
      numero: this.form.numero,
      complemento: this.form.complemento,
      bairro: this.form.bairro,
      municipio: this.form.municipio,
      uf: this.form.uf,
    };

    const operacao$ = this.id
      ? this.transportadoraService.atualizar(this.id, payload)
      : this.transportadoraService.criar(payload as Omit<TransportadoraDTO, 'id'>);

    operacao$
      .pipe(
        tap(() => {
          const msg = this.id
            ? 'Transportadora atualizada com sucesso.'
            : 'Transportadora cadastrada com sucesso.';
          this.alertaService.sucesso(msg);
          this.router.navigate(['/transportadoras']);
        }),
        catchError((erro) => {
          this.salvando.set(false);
          this.alertaService.erro(erro.error);
          return throwError(() => erro);
        }),
      )
      .subscribe();
  }

  onCancelar(): void {
    this.router.navigate(['/transportadoras']);
  }

  get titulo(): string {
    return this.id ? 'Editar Transportadora' : 'Nova Transportadora';
  }

  get subtitulo(): string {
    return this.id
      ? 'Atualize os dados da transportadora'
      : 'Preencha os dados para cadastrar uma nova transportadora';
  }

  private _formVazio(): CadastroTransportadoraForm {
    return {
      id: null,
      nome: '',
      modalidadeFrete: ModalidadeFreteEnum.SEM_FRETE,
      telefone: '',
      inscricaoEstadual: '',
      identificador: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      municipio: '',
      uf: '',
    };
  }
}
