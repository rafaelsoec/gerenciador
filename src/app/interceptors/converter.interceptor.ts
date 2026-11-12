import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

function parseBrNumber(value: string): number | string {
  const normalized = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return value;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : value;
}

function transformBody(body: unknown): unknown {
  if (body === null || body === undefined) {
    return body;
  }

  if (typeof body === 'string') {
    const brDecimal = /^-?\d{1,3}(\.\d{3})*,\d+$|^-?\d+,\d+$/;
    return brDecimal.test(body) ? parseBrNumber(body) : body;
  }

  if (Array.isArray(body)) {
    return body.map(transformBody);
  }

  if (typeof body === 'object') {
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [
        key,
        transformBody(value),
      ]),
    );
  }

  return body;
}

export const converterInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {

  // Não modificar requisições multipart/form-data
  if (req.body instanceof FormData) {
    const modifiedRequest = req.clone({
      headers: req.headers.delete('Content-Type')
    });

    return next(modifiedRequest);
  }

  if (['GET', 'DELETE', 'HEAD'].includes(req.method)) {
    return next(req);
  }

  const isJson = req.body !== null &&
    (req.headers.get('Content-Type')?.includes('application/json') ?? true);

  if (!isJson) {
    return next(req);
  }

  const transformedBody = transformBody(req.body);

  return next(req.clone({
    body: transformedBody
  }));
};
