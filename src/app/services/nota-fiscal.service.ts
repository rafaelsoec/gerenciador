import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, from, mergeMap, Observable, throwError } from 'rxjs';
import { NotaFiscalDTO } from '../dtos/nota-fiscal/NotaFiscalDTO';
import { RespostaPaginada } from '../dtos/RespostaPaginada';
import { PaginacaoParams } from './produto.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotaFiscalService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notas-fiscais`;

  listar(params: PaginacaoParams = {}): Observable<RespostaPaginada<NotaFiscalDTO>> {
    const { page = 0, size = 20, sort = 'id,desc' } = params;
    const httpParams = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    return this.http.get<RespostaPaginada<NotaFiscalDTO>>(this.url, { params: httpParams });
  }

  buscarPorId(id: number): Observable<NotaFiscalDTO> {
    return this.http.get<NotaFiscalDTO>(`${this.url}/${id}`);
  }

  gerarPdf(id: number | undefined, tipo: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.url}/${id}/emitir/${tipo}`, {
      responseType: 'blob',
      observe: 'response',
    }).pipe(
      catchError((erro: HttpErrorResponse) => {

        if (erro.error instanceof Blob) {
          return from(erro.error.text()).pipe(
            mergeMap(texto => {
              let detalhe: any = texto;

              try {
                detalhe = JSON.parse(texto);
              } catch {
                // Resposta não é JSON: mantém o texto original.
              }

              return throwError(() => new HttpErrorResponse({
                error: detalhe,
                status: erro.status,
                statusText: erro.statusText,
                headers: erro.headers,
                url: erro.url ?? ''
              }));
            })
          );
        }

        return throwError(() => erro);
      })
    );
  }

  emitir(dados: Omit<NotaFiscalDTO, 'id'>): Observable<NotaFiscalDTO> {
    return this.http.post<NotaFiscalDTO>(this.url, dados);
  }

  cancelar(id: number, justificativa: string): Observable<NotaFiscalDTO> {
    return this.http.post<NotaFiscalDTO>(`${this.url}/${id}/cancelar`, { justificativa });
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
