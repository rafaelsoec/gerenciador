import { Component, inject, signal, OnInit, computed } from '@angular/core';
import {
  FormBuilder,
  UntypedFormGroup,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { TemaService } from '../../services/tema.service';
import { ScrollComponent } from '../../components/scroll/scroll.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ScrollComponent,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {

  readonly auth = inject(AuthService);
  readonly tema = inject(TemaService);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly sucesso = signal('');
  readonly erro = signal('');
  readonly usuario = signal('');

  public exibirConfirmacaoSenha = false;
  public exibirNovaSenha = false;
  public exibirSenha = false;

  form!: UntypedFormGroup;

  readonly inicial = computed(() => {
    const usuario = this.auth.usuarioAtual();
    const nome = usuario?.nome ?? usuario?.login ?? '';
    return nome.charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group(
      {
        senhaAtual:       [''],
        novaSenha:        [''],
        confirmacaoSenha: [''],
      },
      { validators: [this.validarSenhas()] }
    );
  }

  /**
   * Valida:
   * 1. Se informou a senha atual, exige nova senha.
   * 2. Se informou nova senha, exige senha atual.
   * 3. Exige confirmação da nova senha.
   * 4. Verifica se as duas senhas coincidem.
   */
  private validarSenhas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const senhaAtual       = control.get('senhaAtual')?.value?.trim() as string;
      const novaSenha        = control.get('novaSenha')?.value?.trim() as string;
      const confirmacaoSenha = control.get('confirmacaoSenha')?.value?.trim() as string;

      // Todos vazios → sem validação
      if (!senhaAtual && !novaSenha && !confirmacaoSenha) return null;

      const erros: ValidationErrors = {};

      if (!senhaAtual)                                erros['senhaAtualObrigatoria']  = true;
      if (!novaSenha)                                 erros['novaSenhaObrigatoria']   = true;
      if (novaSenha && novaSenha.length < 4)          erros['novaSenhaMinlength']     = true;
      if (!confirmacaoSenha)                          erros['confirmacaoObrigatoria'] = true;
      if (novaSenha && confirmacaoSenha &&
          novaSenha !== confirmacaoSenha)             erros['senhasDiferentes']       = true;

      return Object.keys(erros).length ? erros : null;
    };
  }

  habilitaSalvar(): boolean {
    return this.form.invalid || this.carregando();
  }

  onSalvar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.carregando.set(true);
    this.erro.set('');
    this.sucesso.set('');
    const usuario = this.auth.usuarioAtual();

    const payload: {
      usuarioId?: number;
      nome?: string;
      senhaAtual?: string;
      novaSenha?: string;
    } = {
      nome: raw.nome,
      usuarioId: usuario?.id,
    };

    if (raw.novaSenha) {
      payload.senhaAtual = raw.senhaAtual;
      payload.novaSenha = raw.novaSenha;
    }

    this.auth.alterarPerfil(payload).subscribe({
      next: () => {

        this.carregando.set(false);

        this.sucesso.set('Perfil atualizado com sucesso!');

        this.form.patchValue({
          senhaAtual: '',
          novaSenha: '',
          confirmacaoSenha: ''
        });

        this.form.markAsPristine();
      },

      error: (err) => {

        this.carregando.set(false);

        this.erro.set(
          err?.error?.mensagem ?? 'Erro ao salvar. Tente novamente.'
        );
      },
    });
  }

  onCancelar(): void {
    this.router.navigate(['/inicio']);
  }
}