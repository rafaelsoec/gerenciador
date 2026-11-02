import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DashboardDTO } from '../dtos/dashboard/DashboardDTO';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/infos`;

  listar(tipoPeriodo: string): Observable<DashboardDTO> {
    const params = new HttpParams().set('tipoPeriodo', tipoPeriodo);
    return this.http.get<DashboardDTO>(this.url, { params });
  }
}
