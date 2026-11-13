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

import { EmpresaDTO } from '../../../dtos/empresa/EmpresaDTO';
import { EmpresaService } from '../../../services/empresa.service';
import { AlertaService } from '../../../services/alerta.service';
import { RegimeTributarioEnum, RegimeTributarioLabel } from '../../../enums/RegimeTributarioEnum';
import { AmbienteFiscalEnum, AmbienteFiscalLabel } from '../../../enums/AmbienteFiscalEnum';
import { ScrollComponent } from '../../../components/scroll/scroll.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { Constantes } from '../../../constantes/Constantes';

interface CadastroEmpresaForm {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  chaveAcesso: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  codigoMunicipioIbge: string;
  regimeTributario: RegimeTributarioEnum | '';
  ambienteFiscal: AmbienteFiscalEnum | '';
  codigoCnae: string;
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
  ],
  templateUrl: './cadastro-empresa.html',
  styleUrl: './cadastro-empresa.css',
})
export class CadastroEmpresaComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly alertaService = inject(AlertaService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  id: number | undefined;

  readonly regimesTributarios = Object.values(RegimeTributarioEnum).map((v) => ({
    value: v,
    label: RegimeTributarioLabel[v],
  }));

  readonly ambientesFiscais = Object.values(AmbienteFiscalEnum).map((v) => ({
    value: v,
    label: AmbienteFiscalLabel[v],
  }));

  readonly ufs = Constantes.UFS;

  form: CadastroEmpresaForm = this._formVazio();

  readonly salvando = signal(false);

  get invalido(): boolean {
    return !this.form.razaoSocial?.trim() || !this.form.cnpj?.trim();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : undefined;

    if (this.id) {
      this.empresaService.buscarPorId(this.id).subscribe({
        next: (empresa) => {
          this.form = {
            razaoSocial: empresa.razaoSocial ?? '',
            nomeFantasia: empresa.nomeFantasia ?? '',
            chaveAcesso: empresa.chaveAcesso ?? '',
            cnpj: empresa.cnpj ?? '',
            inscricaoEstadual: empresa.inscricaoEstadual ?? '',
            inscricaoMunicipal: empresa.inscricaoMunicipal ?? '',
            email: empresa.email ?? '',
            telefone: empresa.telefone ?? '',
            cep: empresa.cep ?? '',
            logradouro: empresa.logradouro ?? '',
            numero: empresa.numero ?? '',
            complemento: empresa.complemento ?? '',
            bairro: empresa.bairro ?? '',
            municipio: empresa.municipio ?? '',
            uf: empresa.uf ?? '',
            codigoMunicipioIbge: empresa.codigoMunicipioIbge ?? '',
            regimeTributario: (empresa.regimeTributario as RegimeTributarioEnum) ?? '',
            ambienteFiscal: (empresa.ambienteFiscal as AmbienteFiscalEnum) ?? '',
            codigoCnae: empresa.codigoCnae ?? '',
          };
          this.cdr.detectChanges();
        },
        error: (erro) => {
          this.alertaService.erro(erro.error);
          this.router.navigate(['/empresas']);
        },
      });
    }
  }

  onSalvar(): void {
    if (this.invalido) return;

    this.salvando.set(true);

    const payload: Partial<EmpresaDTO> = {
      razaoSocial: this.form.razaoSocial,
      chaveAcesso: this.form.chaveAcesso,
      nomeFantasia: this.form.nomeFantasia || undefined,
      cnpj: this.form.cnpj.replace(/\D/g, ''),
      inscricaoEstadual: this.form.inscricaoEstadual || undefined,
      inscricaoMunicipal: this.form.inscricaoMunicipal || undefined,
      email: this.form.email || undefined,
      telefone: this.form.telefone || undefined,
      cep: this.form.cep.replace(/\D/g, '') || undefined,
      logradouro: this.form.logradouro || undefined,
      numero: this.form.numero || undefined,
      complemento: this.form.complemento || undefined,
      bairro: this.form.bairro || undefined,
      municipio: this.form.municipio || undefined,
      uf: this.form.uf || undefined,
      codigoMunicipioIbge: this.form.codigoMunicipioIbge || undefined,
      regimeTributario: (this.form.regimeTributario as RegimeTributarioEnum) || undefined,
      ambienteFiscal: (this.form.ambienteFiscal as AmbienteFiscalEnum) || undefined,
      codigoCnae: this.form.codigoCnae || undefined,
    };

    const operacao$ = this.id
      ? this.empresaService.atualizar(this.id, payload)
      : this.empresaService.criar(payload as Omit<EmpresaDTO, 'id'>);

    operacao$
      .pipe(
        tap(() => {
          const msg = this.id
            ? 'Empresa atualizada com sucesso.'
            : 'Empresa cadastrada com sucesso.';
          this.alertaService.sucesso(msg);
          this.router.navigate(['/empresas']);
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
    this.router.navigate(['/empresas']);
  }

  get titulo(): string {
    return this.id ? 'Editar Empresa' : 'Nova Empresa';
  }

  get subtitulo(): string {
    return this.id
      ? 'Atualize os dados da empresa'
      : 'Preencha os dados para cadastrar uma nova empresa';
  }

  private _formVazio(): CadastroEmpresaForm {
    return {
      razaoSocial: '',
      nomeFantasia: '',
      chaveAcesso: '',
      cnpj: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      email: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      municipio: '',
      uf: '',
      codigoMunicipioIbge: '',
      regimeTributario: '',
      ambienteFiscal: '',
      codigoCnae: '',
    };
  }
}
