import { Component, inject, model, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SelectAutocompleteComponent } from '../../../shared/auto-select/auto-select';
import { ProdutoService } from '../../../services/produto.service';
import { OpcaoCampo } from '../../../shared/form-cadastro/form-cadastro';

export interface ItemPedido {
  produtoId: number | null;
  quantidade: number | null;
}

export function quantidadeMinima(minimo: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = Number(control.value);

    if (control.value === null || control.value === '' || isNaN(valor)) {
      return null;
    }

    return valor < minimo ? { quantidadeMinima: { minimo, atual: valor } } : null;
  };
}

export function criarItemPedido(item?: Partial<ItemPedido>) {
  return {
    produtoId: [item?.produtoId ?? null, Validators.required],
    quantidade: [
      item?.quantidade ?? null,
      [Validators.required, Validators.min(1), quantidadeMinima(1)],
    ],
  };
}

@Component({
  selector: 'app-itens-pedido',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    SelectAutocompleteComponent,
    FormsModule,
  ],
  templateUrl: './item-pedido.html',
})
export class ItensPedidoComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);

  readonly itens = model<ItemPedido[]>([]);
  readonly produtos = signal<OpcaoCampo[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(20);

  form!: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      itens: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this._buscar(0, this.tamanhoPagina());

    if (this.itens().length === 0) {
      this.adicionarItem();
    } else {
      this.itens().forEach((item) => this.adicionarItem(item));
    }
  }

  private _buscar(page: number, size: number): void {
    this.produtoService.listar({ page, size, sort: 'id,asc' }).subscribe((pagina) => {
      this.produtos.set(
        pagina.conteudo.map((produto) => ({ value: produto.id, label: produto.nome })),
      );

      this.totalElementos.set(pagina.totalElementos);
      this.paginaAtual.set(pagina.paginaAtual);
      this.tamanhoPagina.set(pagina.tamanhoPagina);
    });
  }

  get itensArray(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  adicionarItem(item?: Partial<ItemPedido>): void {
    if (!item && !this.podeAdicionarNovoItem()) {
      this.marcarUltimoItemComoTocado();
      return;
    }

    this.itensArray.push(this.formBuilder.group(criarItemPedido(item)));

    this.emitirValor();
  }

  podeAdicionarNovoItem(): boolean {
    const ultimoItem = this.itensArray.at(this.itensArray.length - 1);

    if (!ultimoItem) {
      return true;
    }

    return ultimoItem.valid;
  }

  private marcarUltimoItemComoTocado(): void {
    const ultimoItem = this.itensArray.at(this.itensArray.length - 1);

    ultimoItem?.markAllAsTouched();
  }

  removerItem(index: number): void {
    this.itensArray.removeAt(index);

    if (this.itensArray.length === 0) {
      this.adicionarItem();
      return;
    }

    this.emitirValor();
  }

  emitirValor(): void {
    this.itens.set(this.form.getRawValue().itens as ItemPedido[]);
  }

  obterErroQuantidade(index: number): string {
    const item = this.itensArray.at(index);
    const quantidade = item?.get('quantidade');

    if (!quantidade || !quantidade.errors) {
      return '';
    }

    if (quantidade.hasError('required')) {
      return 'Informe a quantidade.';
    }

    if (quantidade.hasError('min') || quantidade.hasError('quantidadeMinima')) {
      return 'A quantidade deve ser no mínimo 1.';
    }

    return '';
  }
}
