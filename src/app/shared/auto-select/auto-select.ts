import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PipeTransform,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { OpcaoCampo } from '../form-cadastro/form-cadastro';

export type SelectMode = 'single' | 'multiple';

@Component({
  selector: 'app-select-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
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
export class SelectAutocompleteComponent
  implements ControlValueAccessor, OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) label = '';
  @Input() placeholder = '';
  @Input() mode: SelectMode = 'single';
  @Input() options: OpcaoCampo[] | undefined = [];
  @Input() disabled = false;
  @Input() obrigatorio: boolean | undefined = false;
  @Input() pipe: PipeTransform | null | undefined;

  @Output() selectionChange = new EventEmitter<OpcaoCampo | OpcaoCampo[] | null>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl<string>('');

  filteredOptions: OpcaoCampo[] = [];

  selectedOptions: OpcaoCampo[] = [];
  selectedSingle: OpcaoCampo | null = null;

  isFocused = false;

  private _destroy$ = new Subject<void>();

  private _onChange: (value: unknown) => void = () => {};
  private _onTouched: () => void = () => {};

  // Guarda o valor recebido enquanto as opções não chegam.
  private valorPendente: unknown = null;

  get isMultiple(): boolean {
    return this.mode === 'multiple';
  }

  ngOnInit(): void {
    this.filteredOptions = this.options ?? [];

    this.searchControl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe((term) => this._filter(term ?? ''));

    this.aplicarValor(this.valorPendente);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = this.options ?? [];

      // Atualiza a seleção quando os clientes chegam do servidor.
      this.aplicarValor(this.valorPendente);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _filter(term: unknown): void {
    const texto = String(term ?? '').toLowerCase();

    this.filteredOptions = (this.options ?? []).filter((option) =>
      String(option.label ?? '')
        .toLowerCase()
        .includes(texto),
    );
  }

  // ---------------------------------------------------------
  // ControlValueAccessor
  // ---------------------------------------------------------

  writeValue(value: unknown): void {
    this.valorPendente = value;
    this.aplicarValor(value);
  }

  private aplicarValor(value: unknown): void {
    if (this.isMultiple) {
      this.selectedOptions = Array.isArray(value) ? (value as OpcaoCampo[]) : [];

      return;
    }

    if (value === null || value === undefined || value === '') {
      this.selectedSingle = null;
      this.searchControl.setValue('', { emitEvent: false });
      return;
    }

    const valor = typeof value === 'object' ? (value as OpcaoCampo).value : value;

    const opcao = (this.options ?? []).find((option) => String(option.value) === String(valor));

    this.selectedSingle = opcao ?? (typeof value === 'object' ? (value as OpcaoCampo) : null);

    this.searchControl.setValue(this.selectedSingle?.label ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled) {
      this.searchControl.disable({ emitEvent: false });
    } else {
      this.searchControl.enable({ emitEvent: false });
    }
  }

  // ---------------------------------------------------------
  // Seleção
  // ---------------------------------------------------------

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const option: OpcaoCampo = event.option.value;

    if (this.isMultiple) {
      if (!this.selectedOptions.some((item) => item.value === option.value)) {
        this.selectedOptions = [...this.selectedOptions, option];
      }

      this._onChange(this.selectedOptions);
      this.selectionChange.emit(this.selectedOptions);
    } else {
      this.selectedSingle = option;
      this.valorPendente = option.value;

      // Single trabalha com ID, não com objeto.
      this._onChange(option.value);

      this.selectionChange.emit(option);
    }

    setTimeout(() => {
      const label = this.isMultiple ? '' : (this.selectedSingle?.label ?? '');

      this.searchControl.setValue(label, { emitEvent: false });

      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.value = label;
      }

      this.isFocused = false;
      this._filter('');
    });

    this._onTouched();
  }

  removeChip(option: OpcaoCampo): void {
    this.selectedOptions = this.selectedOptions.filter((item) => item.value !== option.value);

    this._onChange(this.selectedOptions);
    this.selectionChange.emit(this.selectedOptions);
  }

  clearSingle(): void {
    this.selectedSingle = null;
    this.valorPendente = null;

    this.searchControl.setValue('', { emitEvent: false });

    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }

    this._filter('');

    this._onChange(null);
    this.selectionChange.emit(null);
    this._onTouched();
  }

  onFocus(): void {
    this.isFocused = true;

    this.searchControl.setValue('', { emitEvent: false });

    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }

    this._filter('');
  }

  onBlur(): void {
    this.isFocused = false;

    if (!this.isMultiple) {
      const label = this.selectedSingle?.label ?? '';

      this.searchControl.setValue(label, { emitEvent: false });

      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.value = label;
      }
    }

    this._onTouched();
  }

  displayOption(option: OpcaoCampo | string | null): string {
    if (!option) return '';

    return typeof option === 'string' ? option : option.label;
  }

  protected exibirPipe(label: string, pipe: PipeTransform | null | undefined) {
    return pipe ? pipe.transform(label) : label;
  }
}
