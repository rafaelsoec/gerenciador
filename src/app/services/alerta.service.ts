import { inject, Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly titulo = '';

  constructor() {}

  sucesso(mensagem: string): void {
    this.snackBar.open(mensagem, this.titulo, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alerta-sucesso'],
    });
  }

  erro(erro: any): void {
    let mensagem: string = 'Houve um erro inesperado. Tente novamente.';

    if (erro) {
      const erroElement = erro['mensagem'];
      if (erroElement && typeof erroElement == 'string') {
        mensagem = erroElement;
      } else if (typeof erro == 'string') {
        mensagem = erro;
      }
    }

    this.snackBar.open(mensagem, this.titulo, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alerta-erro'],
    });
  }

  aviso(mensagem: string): void {
    this.snackBar.open(mensagem, this.titulo, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alerta-aviso'],
    });
  }
}
