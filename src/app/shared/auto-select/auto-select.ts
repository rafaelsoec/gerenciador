import { Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, PipeTransform, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
export class SelectAutocompleteComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input({ required: true }) label = '';
  @Input() placeholder = '';
  @Input() mode: SelectMode = 'single';
  @Input() options: OpcaoCampo[] | undefined = [];
  @Input() disabled = false;
  @Input() obrigatorio : boolean | undefined= false;
  @Input() pipe: PipeTransform | null | undefined;

  /** Emite a seleção atual sempre que ela muda (add ou remove). */
  @Output() selectionChange = new EventEmitter<OpcaoCampo | OpcaoCampo[] | null>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl<string>('');

  filteredOptions: OpcaoCampo[] = [];

  /** Opções selecionadas no modo multiple */
  selectedOptions: OpcaoCampo[] = [];

  /** Valor único selecionado no modo single */
  selectedSingle: OpcaoCampo | null = null;

  /** Controla se o input single está com foco (para ocultar o overlay de texto) */
  isFocused = false;

  private _destroy$ = new Subject<void>();
  private _onChange: (value: unknown) => void = () => {};
  private _onTouched: () => void = () => {};

  get isMultiple(): boolean {
    return this.mode === 'multiple';
  }

  ngOnInit(): void {
    this.filteredOptions = this.options ?? [];

    this.searchControl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe((term) => this._filter(term ?? ''));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _filter(term: string): void {
    if (typeof term === 'string') {
      const lower = (term ?? '').toLowerCase()
      this.filteredOptions = (this.options ?? []).filter((o) =>
        o.label.toLowerCase().includes(lower),
      );
    }

  }

  // ── ControlValueAccessor ─────────────────────────────────────────────────

  writeValue(value: unknown): void {
    if (this.isMultiple) {
      this.selectedOptions = Array.isArray(value) ? (value as OpcaoCampo[]) : [];
    } else {
      this.selectedSingle = (value as OpcaoCampo) ?? null;
      // exibe o label no campo (comportamento mat-select)
      this.searchControl.setValue(this.selectedSingle?.label ?? '', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled
      ? this.searchControl.disable({ emitEvent: false })
      : this.searchControl.enable({ emitEvent: false });
  }

  // ── Seleção ──────────────────────────────────────────────────────────────

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const option: OpcaoCampo = event.option.value;

    if (this.isMultiple) {
      if (!this.selectedOptions.some((o) => o.value === option.value)) {
        this.selectedOptions = [...this.selectedOptions, option];
      }
      this._onChange(this.selectedOptions);
      this.selectionChange.emit(this.selectedOptions);
    } else {
      this.selectedSingle = option;
      this._onChange(option);
      this.selectionChange.emit(option);
    }

    // setTimeout garante que o Material terminou de escrever no DOM antes de atualizar
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
    this.selectedOptions = this.selectedOptions.filter((o) => o.value !== option.value);
    this._onChange(this.selectedOptions);
    this.selectionChange.emit(this.selectedOptions);
  }

  clearSingle(): void {
    this.selectedSingle = null;
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
    // ao focar, limpa o input para digitar nova busca
    this.searchControl.setValue('', { emitEvent: false });
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
    this._filter('');
  }

  onBlur(): void {
    this.isFocused = false;
    // restaura o label no input ao perder o foco sem selecionar nada
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
    if (pipe) {
      return pipe.transform(label);
    }

    return label;
  }
}
