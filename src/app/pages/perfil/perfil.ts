import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, UntypedFormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly sucesso = signal('');
  readonly erro = signal('');
  readonly mostrarSenhaAtual = signal(false);
  readonly mostrarNovaSenha = signal(false);
  readonly mostrarConfirmacaoSenha = signal(false);
  readonly alterarSenha = signal(false);

  form!: UntypedFormGroup;

  readonly inicial = computed(() => {
    const usuario = this.auth.usuarioAtual();
    const nome = usuario?.nome ?? usuario?.login ?? '';
    return nome.charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    const usuario = this.auth.usuarioAtual();
    this.form = this.fb.nonNullable.group({
      nome: [usuario?.nome ?? '', [Validators.required, Validators.minLength(2)]],
      senhaAtual: [''],
      novaSenha: ['', [Validators.minLength(4)]],
      confirmacaoSenha: [''],
    });
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const nome: string = raw['nome'];
    const senhaAtual: string = raw['senhaAtual'];
    const novaSenha: string = raw['novaSenha'];
    const confirmacaoSenha: string = raw['confirmacaoSenha'];

    if (novaSenha && !senhaAtual) {
      this.erro.set('Informe a senha atual para definir uma nova senha.');
      return;
    }

    if (novaSenha && novaSenha !== confirmacaoSenha) {
      this.erro.set('A nova senha e a confirmacao nao coincidem.');
      return;
    }

    this.carregando.set(true);
    this.erro.set('');
    this.sucesso.set('');

    const payload: { nome?: string; senhaAtual?: string; novaSenha?: string } = { nome };
    if (novaSenha) {
      payload.senhaAtual = senhaAtual;
      payload.novaSenha = novaSenha;
    }

    this.auth.alterarPerfil(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set('Perfil atualizado com sucesso!');
        this.form.patchValue({ senhaAtual: '', novaSenha: '', confirmacaoSenha: '' });
        this.alterarSenha.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Erro ao salvar. Tente novamente.');
      },
    });
  }

  onCancelar(): void {
    this.router.navigate(['/inicio']);
  }
}