import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaDTO } from '../dtos/empresa/EmpresaDTO';
import { RespostaPaginada } from '../dtos/RespostaPaginada';
import { PaginacaoParams } from './produto.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/empresas`;

  /** GET /empresas  ?  lista paginada */
  listar(params: PaginacaoParams = {}): Observable<RespostaPaginada<EmpresaDTO>> {
    const { page = 0, size = 20, sort = 'id,asc' } = params;
    const httpParams = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<RespostaPaginada<EmpresaDTO>>(this.url, { params: httpParams });
  }

  /** GET /empresas/:id */
  buscarPorId(id: number): Observable<EmpresaDTO> {
    return this.http.get<EmpresaDTO>(`${this.url}/${id}`);
  }

  /** POST /empresas  ?  201 Created */
  criar(dados: Omit<EmpresaDTO, 'id'>): Observable<EmpresaDTO> {
    return this.http.post<EmpresaDTO>(this.url, dados);
  }

  /** PUT /empresas/:id */
  atualizar(id: number, dados: Partial<Omit<EmpresaDTO, 'id'>>): Observable<EmpresaDTO> {
    return this.http.put<EmpresaDTO>(`${this.url}/${id}`, dados);
  }

  /** DELETE /empresas/:id  ?  204 No Content */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
