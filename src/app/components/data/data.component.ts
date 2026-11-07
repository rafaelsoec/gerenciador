import { Component, forwardRef, Injectable, input, signal } from '@angular/core';

import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatDatepickerModule } from '@angular/material/datepicker';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { DataType, DateUtils } from '../../utils/DateUtils';

@Injectable()
export class BrDateAdapter extends NativeDateAdapter {
  override parse(value: string | null): Date | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    const partes = value.split('/');

    if (partes.length !== 3) {
      return null;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    if (!dia || !mes || !ano) {
      return null;
    }

    return new Date(ano, mes - 1, dia);
  }

  override format(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');

    return `${dia}/${mes}/${date.getFullYear()}`;
  }
}

export const BR_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './data.component.html',
  styleUrl: './data.component.css',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
    { provide: DateAdapter, useClass: BrDateAdapter },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoDataComponent),
      multi: true,
    },
  ],
})
export class CampoDataComponent implements ControlValueAccessor {
  label = input('Data');
  hint = input('');
  required = input(false);
  disabled = input(false);

  data = signal<Date | null>(null);
  disabledCva = signal(false);

  get isDisabled(): boolean {
    return this.disabled() || this.disabledCva();
  }

  private onChange: (value: DataType) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: DataType): void {
    this.data.set(DateUtils.converterParaDate(value));
  }

  alterarData(value: Date | null): void {
    this.data.set(value);

    this.onChange(value ? DateUtils.formatar(value, 'DD/MM/YYYY') : null);

    this.onTouched();
  }

  registerOnChange(fn: (value: DataType) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledCva.set(disabled);
  }
}
