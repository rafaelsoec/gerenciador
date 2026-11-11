import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirmacao/confirmacao.component';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  confirmar(titulo: string, mensagem: string): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: { titulo, mensagem },
        autoFocus: false,
      })
      .afterClosed()
      .pipe(map((resultado) => resultado === true));
  }
}
