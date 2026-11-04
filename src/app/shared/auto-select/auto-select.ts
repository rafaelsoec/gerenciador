import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { OpcaoCampo } from '../form-cadastro/form-cadastro';

export type SelectMode = 'single' | 'multiple';

@Component({
  selector: 'app-select-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
  ],
  templateUrl: './auto-select.html',
  styleUrl: './auto-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAutocompleteComponent),
      multi: true,
    },
  ],
})
export class SelectAutocompleteComponent implements ControlValueAccessor {
  @Input({ required: true }) label = '';
  @Input() placeholder = '';
  @Input() mode: SelectMode = 'single';
  @Input() options: OpcaoCampo[] | undefined = [];
  @Input() disabled = false;
  @Input() required = false;

  @Output() search = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  control = new FormControl<string | OpcaoCampo | Array<string | OpcaoCampo> | null>(null);

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  get isMultiple(): boolean {
    return this.mode === 'multiple';
  }

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  onSelectionChange(value: unknown): void {
    this.onChange(value);
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.search.emit(term);
  }

  onSelectScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 10;

    if (nearBottom) {
      this.loadMore.emit();
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  displayOption(value: OpcaoCampo | string | null): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const option = this.options?.find((item) => item.value === value);
      return option?.label ?? value;
    }

    return value.label;
  }
}
