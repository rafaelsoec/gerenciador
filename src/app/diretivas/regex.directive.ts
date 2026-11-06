import { Directive, HostListener, Input, PipeTransform } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRegex]',
  standalone: true,
})
export class RegexDirective {
  @Input() appRegex?: RegExp | null;

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!this.appRegex) return;

    let valor = input.value;
    if (this.appRegex instanceof RegExp) {
      const regex = this.appRegex;

      valor = Array.from(valor)
        .filter((caractere) => regex.test(caractere))
        .join('');
    }

    input.value = valor;

    this.ngControl.control?.setValue(valor);
  }
}
