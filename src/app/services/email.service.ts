import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RequisicaoEmailDTO } from '../dtos/RequisicaoEmailDTO';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/emails`;

  enviar(dados: RequisicaoEmailDTO): Observable<any> {
    return this.http.post<RequisicaoEmailDTO>(this.url, dados);
  }
}
