import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ClienteDTO } from '../dtos/cliente/ClienteDTO';
import { CLIENTES_MOCK } from '../mocks/ClienteMock';

/** Simula latência de rede nas respostas mock (ms). */
const MOCK_DELAY = 300;

/**
 * ClienteService
 *
 * Todos os métodos retornam Observable, imitando uma chamada HTTP real.
 * Os dados vivem em `_clientes` (array privado em memória).
 * Basta trocar o corpo de cada método por chamadas HttpClient para conectar
 * uma API real sem alterar os componentes consumidores.
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  /** Base de dados em memória. */
  private _clientes: ClienteDTO[] = CLIENTES_MOCK;

  /** Próximo ID disponível (simulação de auto-increment). */
  private _nextId = 5;

  // ── Read ──────────────────────────────────────────────────────────────────

  /** Retorna todos os clientes. */
  listar(): Observable<ClienteDTO[]> {
    return of([...this._clientes]).pipe(delay(MOCK_DELAY));
  }

  /** Retorna um cliente pelo id. Emite erro 404 se não encontrado. */
  buscarPorId(id: number): Observable<ClienteDTO> {
    const cliente = this._clientes.find((c) => c.id === id);
    if (!cliente) {
      return throwError(() => ({ status: 404, message: `Cliente ${id} não encontrado.` }));
    }
    return of({ ...cliente }).pipe(delay(MOCK_DELAY));
  }

  // ── Create ────────────────────────────────────────────────────────────────

  /** Cria um novo cliente e retorna o registro com o id gerado. */
  criar(dados: Omit<ClienteDTO, 'id'>): Observable<ClienteDTO> {
    const novo: ClienteDTO = { id: this._nextId++, ...dados };
    this._clientes = [...this._clientes, novo];
    return of({ ...novo }).pipe(delay(MOCK_DELAY));
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * Atualiza um cliente existente.
   * Aceita atualização parcial (Partial), mas exige o id.
   * Emite erro 404 se o cliente não existir.
   */
  atualizar(id: number, dados: Partial<Omit<ClienteDTO, 'id'>>): Observable<ClienteDTO> {
    const index = this._clientes.findIndex((c) => c.id === id);
    if (index === -1) {
      return throwError(() => ({ status: 404, message: `Cliente ${id} não encontrado.` }));
    }
    // Atualização imutável
    const atualizado: ClienteDTO = { ...this._clientes[index], ...dados };
    this._clientes = [
      ...this._clientes.slice(0, index),
      atualizado,
      ...this._clientes.slice(index + 1),
    ];
    return of({ ...atualizado }).pipe(delay(MOCK_DELAY));
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /** Remove um cliente pelo id. Emite erro 404 se não encontrado. */
  remover(id: number): Observable<void> {
    const existe = this._clientes.some((c) => c.id === id);
    if (!existe) {
      return throwError(() => ({ status: 404, message: `Cliente ${id} não encontrado.` }));
    }
    this._clientes = this._clientes.filter((c) => c.id !== id);
    return of(undefined).pipe(delay(MOCK_DELAY));
  }
}
