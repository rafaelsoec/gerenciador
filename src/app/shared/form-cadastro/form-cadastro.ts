import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMaskDirective, NgxMaskService } from 'ngx-mask';
import { Observable } from 'rxjs';
import { RegexDirective } from '../../diretivas/regex.directive';

/** Tipos de campo suportados pelo formulário genérico. */
export type TipoCampo = 'text' | 'number' | 'select' | 'checkbox' | 'radio';

/** Opção para campos do tipo select ou radio. */
export interface OpcaoCampo {
  label: string;
  value: unknown;
}

/**
 * Definição de um campo do formulário genérico.
 *
 * @example
 * {
 *   nome: 'nomeCliente',
 *   label: 'Nome',
 *   tipo: 'text',
 *   obrigatorio: true,
 *   mascara: null,
 *   opcoes: [],
 * }
 */
export interface CampoFormulario {
  /** Nome da propriedade no objeto retornado pelo evento `salvar`. */
  nome: string;
  /** Rótulo exibido ao usuário. */
  label: string;
  /** Tipo do controle de entrada. */
  tipo: TipoCampo;
  /**
   * Largura da coluna em unidades Bootstrap (1–12).
   * Ex.: 12 → linha inteira; 6 → metade; 4 → um terço.
   * Padrão: 12.
   */
  col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Máscara de entrada (ex.: '(00) 00000-0000', '00/00/0000'). Opcional. */
  mascara?: string | null;
  pattern?: RegExp | null | undefined;
  /** Placeholder exibido no campo. Opcional. */
  placeholder?: string;
  /** Torna o campo obrigatório. Padrão: false. */
  obrigatorio?: boolean;
  /** Lista de opções para campos select/radio. */
  opcoes?: OpcaoCampo[];
  /** Valor inicial do campo. Opcional. */
  valorInicial?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Registro = Record<string, any>;

export function converterRegistro<T extends object>(registro: Registro, construtor: new () => T): T {
  return Object.assign(new construtor(), registro);
}

/** Dados passados ao componente via MatDialog. */
export interface FormCadastroDialogData {
  campos: CampoFormulario[];
  titulo?: string;
  onSalvar?: (dados: Registro) => Observable<unknown>;
  onCancelar?: () => void;
}

@Component({
  selector: 'app-form-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatDialogModule,
    NgxMaskDirective,
    RegexDirective,
  ],
  templateUrl: './form-cadastro.html',
  styleUrl: './form-cadastro.css',
})
export class FormCadastroComponent implements OnInit {
  // ── injeções opcionais para uso via MatDialog ──────────────────────────────
  private readonly _dialogRef = inject(MatDialogRef<FormCadastroComponent>, { optional: true });
  private readonly _dialogData = inject<FormCadastroDialogData>(MAT_DIALOG_DATA, { optional: true });

  // ── inputs (uso direto no template) ───────────────────────────────────────

  /** Lista de campos que compõem o formulário. */
  readonly campos = input<CampoFormulario[]>([]);

  /** Título exibido no topo do formulário. Opcional. */
  readonly titulo = input<string>('');

  /** Emite o objeto com os dados preenchidos ao clicar em Salvar (uso no template). */
  readonly salvar = output<Registro>();

  /** Emite ao clicar em Cancelar (uso no template). */
  readonly cancelar = output<void>();

  // ── estado interno ─────────────────────────────────────────────────────────

  /** Estado interno do formulário (two-way via ngModel). */
  readonly _form = signal<Registro>({});

  /**
   * Rastreia se cada campo com máscara está completamente preenchido.
   * Chave = campo.nome, valor = true quando o valor tem o mesmo comprimento
   * que a máscara aplicada pelo ngx-mask.
   */
  readonly _mascarasCompletas = signal<Record<string, boolean>>({});

  private readonly _maskService = inject(NgxMaskService);

  /**
   * Campos efetivos: prioriza data do dialog (quando aberto via MatDialog),
   * caindo para o input() quando usado diretamente no template.
   */
  get _campos(): CampoFormulario[] {
    return this._dialogData?.campos ?? this.campos();
  }

  /** Título efetivo: prioriza data do dialog. */
  get _titulo(): string {
    return this._dialogData?.titulo ?? this.titulo();
  }

  /**
   * Computed que indica se o formulário está inválido:
   * - campo obrigatório vazio, OU
   * - campo com máscara não completamente preenchida.
   */
  readonly _invalido = computed<boolean>(() => {
    const form = this._form();
    const completas = this._mascarasCompletas();
    return this._campos.some((c) => {
      const val = form[c.nome];
      const vazio = val === null || val === undefined || val === '';

      // campo obrigatório vazio
      if (c.obrigatorio) {
        if (c.tipo === 'checkbox') return !val;
        if (vazio) return true;
      }

      // campo com máscara não completamente preenchida (obrigatório ou não)
      // if (c.mascara && !vazio && !completas[c.nome]) return true;

      return false;
    });
  });

  ngOnInit(): void {
    const inicial: Registro = {};
    const completas: Record<string, boolean> = {};
    for (const campo of this._campos) {
      inicial[campo.nome] =
        campo.valorInicial !== undefined
          ? campo.valorInicial
          : campo.tipo === 'checkbox'
            ? false
            : '';
      if (campo.mascara) completas[campo.nome] = false;
    }
    this._form.set(inicial);
    this._mascarasCompletas.set(completas);
  }

  /**
   * Atualiza o valor e recalcula se a máscara está completa comparando
   * o comprimento do valor digitado com o da máscara aplicada.
   * Suporta máscaras alternativas com `||`.
   */
  onValorAlterado(nome: string, valor: unknown, campo: CampoFormulario): void {
    this.atualizar(nome, valor);
    if (!campo.mascara) return;

    const str = typeof valor === 'string' ? valor : '';
    const completa = str === '' ? false : this._mascaraCompleta(str, campo.mascara);
    this._mascarasCompletas.set({ ...this._mascarasCompletas(), [nome]: completa });
  }

  /**
   * Verifica se o valor preenchido satisfaz pelo menos uma das variantes
   * da máscara (suporte a `||`). Compara o comprimento do valor com o
   * comprimento da máscara aplicada pelo ngx-mask.
   */
  private _mascaraCompleta(valor: string, mascara: string): boolean {
    const variantes = mascara.split('||');
    return variantes.some((variante) => {
      const aplicado = this._maskService.applyMask(valor, variante.trim());
      return aplicado.length === valor.length;
    });
  }

  /** Retorna a classe Bootstrap col para o campo. */
  colClass(campo: CampoFormulario): string {
    const col = campo.col ?? 12;
    return `col-12 col-sm-${col}`;
  }

  /** Atualiza um campo do formulário. */
  atualizar(nome: string, valor: unknown): void {
    this._form.set({ ...this._form(), [nome]: valor });
  }

  onSalvar(): void {
    if (this._invalido()) return;
    const dados = { ...this._form() };
    if (this._dialogRef) {
      this._dialogData?.onSalvar?.(dados).subscribe({
        next: (resultado) => {
          this._dialogRef?.close(resultado);
        },
        error: (erro) => {
          console.error('Erro ao salvar:', erro);
        }
      });
    } else {
      // modo template: emite o output normalmente
      this.salvar.emit(dados);
    }
  }

  onCancelar(): void {
    if (this._dialogRef) {
      this._dialogData?.onCancelar?.();
      this._dialogRef.close(null);
    } else {
      this.cancelar.emit();
    }
  }
}
