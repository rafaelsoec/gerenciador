import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoDTO } from '../dtos/produto/ProdutoDTO';
import { RespostaPaginada } from '../dtos/RespostaPaginada';
import { environment } from '../../environments/environment';

export interface PaginacaoParams {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/produtos`;

  // ── Read ──────────────────────────────────────────────────────────────────

  /** GET /produtos  →  lista paginada */
  listar(params: PaginacaoParams = {}): Observable<RespostaPaginada<ProdutoDTO>> {
    const { page = 0, size = 20, sort = 'id,asc' } = params;
    const httpParams = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<RespostaPaginada<ProdutoDTO>>(this.url, { params: httpParams });
  }

  /** GET /produtos/:id */
  buscarPorId(id: number): Observable<ProdutoDTO> {
    return this.http.get<ProdutoDTO>(`${this.url}/${id}`);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  /** POST /produtos  →  201 Created */
  criar(dados: Omit<ProdutoDTO, 'id'>): Observable<ProdutoDTO> {
    return this.http.post<ProdutoDTO>(this.url, dados);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /** PUT /produtos/:id */
  atualizar(id: number, dados: Partial<Omit<ProdutoDTO, 'id'>>): Observable<ProdutoDTO> {
    return this.http.put<ProdutoDTO>(`${this.url}/${id}`, dados);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /** DELETE /produtos/:id  →  204 No Content */
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
