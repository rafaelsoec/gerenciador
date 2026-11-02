import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDTO } from '../dtos/pedido/PedidoDTO';
import { RespostaPaginada } from '../dtos/RespostaPaginada';
import { PaginacaoParams } from './produto.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pedidos`;

  // ── Read ──────────────────────────────────────────────────────────────────

  /** GET /pedidos  →  lista paginada */
  listar(params: PaginacaoParams = {}): Observable<RespostaPaginada<PedidoDTO>> {
    const { page = 0, size = 20, sort = 'id,asc' } = params;
    const httpParams = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<RespostaPaginada<PedidoDTO>>(this.url, { params: httpParams });
  }

  /** GET /pedidos/:id */
  buscarPorId(id: number): Observable<PedidoDTO> {
    return this.http.get<PedidoDTO>(`${this.url}/${id}`);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  /** POST /pedidos  →  201 Created */
  criar(dados: Omit<PedidoDTO, 'id'>): Observable<PedidoDTO> {
    return this.http.post<PedidoDTO>(this.url, dados);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /** PUT /pedidos/:id */
  atualizar(id: number, dados: Partial<Omit<PedidoDTO, 'id'>>): Observable<PedidoDTO> {
    return this.http.put<PedidoDTO>(`${this.url}/${id}`, dados);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /** DELETE /pedidos/:id  →  204 No Content */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
