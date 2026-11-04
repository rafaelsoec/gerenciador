import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

/** Rotas públicas que não precisam de token. */
const ROTAS_PUBLICAS = [`${environment.apiUrl}/auth/login`, `${environment.apiUrl}/auth/usuario`];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const ehRotaPublica = ROTAS_PUBLICAS.some((url) => req.url === url);
  const authService = inject(AuthService);

  if (ehRotaPublica) {
    return tratarRequisicao(authService, req, next);
  }

  const token = authService.getToken();
  if (!token) {
    return tratarRequisicao(authService, req, next);
  }

  const reqAutenticada = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return tratarRequisicao(authService, reqAutenticada, next);
};

function tratarRequisicao(
  authService: AuthService,
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }

      return throwError(() => error);
    }),
  );
}
