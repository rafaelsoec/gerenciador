import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteDTO } from '../dtos/cliente/ClienteDTO';
import { RespostaPaginada } from '../dtos/RespostaPaginada';
import { PaginacaoParams } from './produto.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  // ── Read ──────────────────────────────────────────────────────────────────

  /** GET /clientes  →  lista paginada */
  listar(params: PaginacaoParams = {}): Observable<RespostaPaginada<ClienteDTO>> {
    const { page = 0, size = 20, sort = 'id,asc' } = params;
    const httpParams = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<RespostaPaginada<ClienteDTO>>(this.url, { params: httpParams });
  }

  /** GET /clientes/:id */
  buscarPorId(id: number): Observable<ClienteDTO> {
    return this.http.get<ClienteDTO>(`${this.url}/${id}`);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  /** POST /clientes  →  201 Created */
  criar(dados: Omit<ClienteDTO, 'id'>): Observable<ClienteDTO> {
    return this.http.post<ClienteDTO>(this.url, dados);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /** PUT /clientes/:id */
  atualizar(id: number, dados: Partial<Omit<ClienteDTO, 'id'>>): Observable<ClienteDTO> {
    return this.http.put<ClienteDTO>(`${this.url}/${id}`, dados);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /** DELETE /clientes/:id  →  204 No Content */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
