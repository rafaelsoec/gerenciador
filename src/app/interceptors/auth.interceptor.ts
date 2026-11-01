import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/** Rotas públicas que não precisam de token. */
const ROTAS_PUBLICAS = [
  `${environment.apiUrl}/auth/login`,
  `${environment.apiUrl}/auth/usuario`,
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const ehRotaPublica = ROTAS_PUBLICAS.some((url) => req.url === url);

  if (ehRotaPublica) {
    return next(req);
  }

  const token = inject(AuthService).getToken();

  if (!token) {
    return next(req);
  }

  const reqAutenticada = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(reqAutenticada);
};
