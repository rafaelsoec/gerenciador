import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProdutoDTO } from '../dtos/produto/ProdutoDTO';
import { SituacaoEnum } from '../enums/SituacaoEnum';

/** Simula latência de rede nas respostas mock (ms). */
const MOCK_DELAY = 300;

/**
 * ProdutoService
 *
 * Todos os métodos retornam Observable, imitando uma chamada HTTP real.
 * Os dados vivem em `_produtos` (array privado em memória).
 * Basta trocar o corpo de cada método por chamadas HttpClient para conectar
 * uma API real sem alterar os componentes consumidores.
 */
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  /** Base de dados em memória. */
  private _produtos: ProdutoDTO[] = [
    {
      id: 1,
      nome: 'Teclado Mecânico',
      descricao: 'Teclado mecânico com switches azuis',
      preco: 349.90,
      estoque: 15,
      situacao: SituacaoEnum.ATIVO,
    },
    {
      id: 2,
      nome: 'Mouse Gamer',
      descricao: 'Mouse com 6 botões programáveis e RGB',
      preco: 189.90,
      estoque: 30,
      situacao: SituacaoEnum.ATIVO,
    },
    {
      id: 3,
      nome: 'Monitor 24"',
      descricao: 'Monitor Full HD IPS 144Hz',
      preco: 1299.00,
      estoque: 8,
      situacao: SituacaoEnum.ATIVO,
    },
    {
      id: 4,
      nome: 'Headset USB',
      descricao: 'Headset estéreo com cancelamento de ruído',
      preco: 259.90,
      estoque: 0,
      situacao: SituacaoEnum.INATIVO,
    },
  ];

  /** Próximo ID disponível (simulação de auto-increment). */
  private _nextId = 5;

  // ── Read ──────────────────────────────────────────────────────────────────

  /** Retorna todos os produtos. */
  listar(): Observable<ProdutoDTO[]> {
    return of([...this._produtos]).pipe(delay(MOCK_DELAY));
  }

  /** Retorna um produto pelo id. Emite erro 404 se não encontrado. */
  buscarPorId(id: number): Observable<ProdutoDTO> {
    const produto = this._produtos.find((p) => p.id === id);
    if (!produto) {
      return throwError(() => ({ status: 404, message: `Produto ${id} não encontrado.` }));
    }
    return of({ ...produto }).pipe(delay(MOCK_DELAY));
  }

  // ── Create ────────────────────────────────────────────────────────────────

  /** Cria um novo produto e retorna o registro com o id gerado. */
  criar(dados: Omit<ProdutoDTO, 'id'>): Observable<ProdutoDTO> {
    const novo: ProdutoDTO = { id: this._nextId++, ...dados };
    this._produtos = [...this._produtos, novo];
    return of({ ...novo }).pipe(delay(MOCK_DELAY));
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * Atualiza um produto existente.
   * Aceita atualização parcial (Partial), mas exige o id.
   * Emite erro 404 se o produto não existir.
   */
  atualizar(id: number, dados: Partial<Omit<ProdutoDTO, 'id'>>): Observable<ProdutoDTO> {
    const index = this._produtos.findIndex((p) => p.id === id);
    if (index === -1) {
      return throwError(() => ({ status: 404, message: `Produto ${id} não encontrado.` }));
    }
    // Atualização imutável
    const atualizado: ProdutoDTO = { ...this._produtos[index], ...dados };
    this._produtos = [
      ...this._produtos.slice(0, index),
      atualizado,
      ...this._produtos.slice(index + 1),
    ];
    return of({ ...atualizado }).pipe(delay(MOCK_DELAY));
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /** Remove um produto pelo id. Emite erro 404 se não encontrado. */
  remover(id: number): Observable<void> {
    const existe = this._produtos.some((p) => p.id === id);
    if (!existe) {
      return throwError(() => ({ status: 404, message: `Produto ${id} não encontrado.` }));
    }
    this._produtos = this._produtos.filter((p) => p.id !== id);
    return of(undefined).pipe(delay(MOCK_DELAY));
  }
}
