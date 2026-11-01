import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly mostrarSenha = signal(false);

  readonly form = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.erro.set('');

    const { login, senha } = this.form.getRawValue();

    this.auth.login({ login, senha }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(
          err?.error?.mensagem ?? 'Login ou senha inválidos. Tente novamente.',
        );
      },
    });
  }

  toggleSenha(): void {
    this.mostrarSenha.update((v) => !v);
  }
}
