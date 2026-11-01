import { Component, inject, signal, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, Usuario } from '../../services/auth.service';

export interface PerfilDialogData {
  usuario: Usuario;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PerfilComponent>);

  readonly carregando = signal(false);
  readonly sucesso = signal('');
  readonly erro = signal('');
  readonly mostrarSenhaAtual = signal(false);
  readonly mostrarNovaSenha = signal(false);

  form!: UntypedFormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: PerfilDialogData) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      nome: [this.data.usuario.nome, [Validators.required, Validators.minLength(2)]],
      senhaAtual: [''],
      novaSenha: ['', [Validators.minLength(4)]],
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

    // Valida: se novaSenha preenchida, senhaAtual é obrigatória
    if (novaSenha && !senhaAtual) {
      this.erro.set('Informe a senha atual para definir uma nova senha.');
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
        this.form.patchValue({ senhaAtual: '', novaSenha: '' });
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Erro ao salvar. Tente novamente.');
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
