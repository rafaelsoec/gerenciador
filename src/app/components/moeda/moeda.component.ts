import { ChangeDetectorRef, Component, forwardRef, inject, input, signal } from '@angular/core';

import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NumberUtils } from '../../utils/NumberUtils';

@Component({
  selector: 'app-moeda',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, NgxMaskDirective],
  templateUrl: './moeda.component.html',
  styleUrl: './moeda.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoMoedaComponent),
      multi: true,
    },
  ],
})
export class CampoMoedaComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  label = input('Valor');
  placeholder = input('0, 00');
  required = input(false);
  disabled = input(false);

  valorExibido = signal('');

  private disabledCva = signal(false);

  static MASCARA_MOEDA =
    '000.000.000,00||00.000.000,00||0.000.000,00||000.000,00||00.000,00||0.000,00||000,00||00,00||0,00';

  readonly mascara = CampoMoedaComponent.MASCARA_MOEDA;
  get isDisabled(): boolean {
    return this.disabled() || this.disabledCva();
  }

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: number | string | null): void {
    if (value === null || value === undefined || value === '') {
      this.valorExibido.set('');
      return;
    }

    this.valorExibido.set(NumberUtils.format(value));
    this.cdr.detectChanges();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledCva.set(disabled);
  }

  alterarValor(value: string): void {
    value = value.replace(/^0+(?=\d)/, '');
    this.valorExibido.set(value);

    const valorNumerico = NumberUtils.toNumber(value);
    this.onChange(valorNumerico);
    this.onTouched();
  }
}
