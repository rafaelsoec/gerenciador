import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'tema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  /** true = dark mode ativo. */
  readonly darkMode = signal<boolean>(this._lerPreferencia());

  /** Chamado uma vez no bootstrap para aplicar o tema salvo. */
  inicializar(): void {
    this._aplicar(this.darkMode());
  }

  alternar(): void {
    const novo = !this.darkMode();
    this.darkMode.set(novo);
    this._aplicar(novo);
    this._salvar(novo);
  }

  definir(dark: boolean): void {
    this.darkMode.set(dark);
    this._aplicar(dark);
    this._salvar(dark);
  }

  private _aplicar(dark: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('dark', dark);
  }

  private _salvar(dark: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
  }

  private _lerPreferencia(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo !== null) return salvo === '1';
    // Fallback: preferência do sistema operacional
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
