import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appRegex]',
    standalone: true
})
export class RegexDirective {

    @Input() appRegex!: RegExp | null | undefined;

    constructor(private ngControl: NgControl) { }

    @HostListener('keyup', ['$event'])
    onInput(event: KeyboardEvent): void {
        const input = event.target as HTMLInputElement;
        if (!this.appRegex) return;

        const valorOriginal = input.value;

        // Remove caracteres que não atendem ao regex
        const valorFiltrado = Array.from(valorOriginal)
            .filter(caractere => this.appRegex?.test(caractere))
            .join('');

        if (valorOriginal !== valorFiltrado) {
            input.value = valorFiltrado;

            this.ngControl.control?.setValue(valorFiltrado);
        }
    }
}