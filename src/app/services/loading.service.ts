import { Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, distinctUntilChanged, observeOn } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requisicoesAtivas = 0;

  private loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.pipe(observeOn(asyncScheduler), distinctUntilChanged());

  show(): void {
    this.requisicoesAtivas++;

    if (this.requisicoesAtivas === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    this.requisicoesAtivas = Math.max(0, this.requisicoesAtivas - 1);

    if (this.requisicoesAtivas === 0) {
      this.loadingSubject.next(false);
    }
  }

  reset(): void {
    this.requisicoesAtivas = 0;
    this.loadingSubject.next(false);
  }
}
