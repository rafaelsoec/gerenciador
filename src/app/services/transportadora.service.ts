import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespostaPaginada } from '../dtos/RespostaPaginada';
import { PaginacaoParams } from './produto.service';
import { environment } from '../../environments/environment';
import { TransportadoraDTO } from '../dtos/TransportadoraDTO';

@Injectable({ providedIn: 'root' })
export class TransportadoraService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/transportadoras`;

  /** GET /transportadoras  ?  lista paginada */
  listar(params: PaginacaoParams = {}): Observable<RespostaPaginada<TransportadoraDTO>> {
    const { page = 0, size = 20, sort = 'id,asc' } = params;
    const httpParams = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    return this.http.get<RespostaPaginada<TransportadoraDTO>>(this.url, { params: httpParams });
  }

  /** GET /transportadoras/:id */
  buscarPorId(id: number): Observable<TransportadoraDTO> {
    return this.http.get<TransportadoraDTO>(`${this.url}/${id}`);
  }

  /** POST /transportadoras  ?  201 Created */
  criar(dados: Omit<TransportadoraDTO, 'id'>): Observable<TransportadoraDTO> {
    return this.http.post<TransportadoraDTO>(this.url, dados);
  }

  /** PUT /transportadoras/:id */
  atualizar(
    id: number,
    dados: Partial<Omit<TransportadoraDTO, 'id'>>,
  ): Observable<TransportadoraDTO> {
    return this.http.put<TransportadoraDTO>(`${this.url}/${id}`, dados);
  }

  /** DELETE /transportadoras/:id  ?  204 No Content */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
