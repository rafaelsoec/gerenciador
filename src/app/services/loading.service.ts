import { inject, Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, distinctUntilChanged, observeOn } from 'rxjs';
import { LoadingComponent } from '../components/loading/loading.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requisicoesAtivas = 0;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly dialog = inject(MatDialog);
  public matDialogRef: MatDialogRef<LoadingComponent, void> | undefined;

  readonly loading$ = this.loadingSubject.pipe(observeOn(asyncScheduler), distinctUntilChanged());

  show(): void {
    this.requisicoesAtivas++;

    if (this.requisicoesAtivas === 1) {
      this.loadingSubject.next(true);
      this.matDialogRef = this.dialog.open<LoadingComponent, void, void>(LoadingComponent);
    }
  }

  hide(): void {
    this.requisicoesAtivas = Math.max(0, this.requisicoesAtivas - 1);

    if (this.requisicoesAtivas === 0) {
      this.loadingSubject.next(false);
      if (this.matDialogRef) {
        this.matDialogRef.close();
      }
    }
  }

  reset(): void {
    this.requisicoesAtivas = 0;
    this.loadingSubject.next(false);
    if (this.matDialogRef) {
      this.matDialogRef.close();
    }
  }
}
