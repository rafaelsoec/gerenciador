import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RequisicaoEmailDTO } from '../dtos/RequisicaoEmailDTO';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/emails`;

  enviar(requisicao: RequisicaoEmailDTO): Observable<any> {
    const formData = new FormData();
    const { anexos, ...dados } = requisicao;

    formData.append('request', JSON.stringify(dados));
    requisicao.anexos?.forEach((arquivo) => {
      if (arquivo.conteudo) {
        formData.append('anexos', arquivo.conteudo);
      }
    });

    return this.http.post<RequisicaoEmailDTO>(this.url + `/enviar`, formData);
  }
}
