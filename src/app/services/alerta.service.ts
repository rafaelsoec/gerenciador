import { Injectable, inject } from '@angular/core';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly titulo = '';

  constructor() { }

  sucesso(mensagem: string): void {
    this.snackBar.open(mensagem, this.titulo, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alerta-sucesso']
    });
  }

  erro(erro: any): void {
    this.snackBar.open(erro["mensagem"] ?? erro, this.titulo, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alerta-erro']
    });
  }

  aviso(mensagem: string): void {
    this.snackBar.open(mensagem, this.titulo, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alerta-aviso']
    });
  }

}
