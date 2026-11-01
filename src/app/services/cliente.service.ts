import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteDTO } from '../dtos/cliente/ClienteDTO';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  // ── Read ──────────────────────────────────────────────────────────────────

  /** GET /clientes */
  listar(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(this.url);
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
