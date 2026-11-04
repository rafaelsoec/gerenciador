import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

function parseBrNumber(value: string): number | string {
  const normalized = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return value;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : value;
}

/** Percorre o objeto e converte apenas campos marcados ou valores em string com vírgula decimal */
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
  const isJson =
    req.body !== null && req.headers.get('Content-Type')?.includes('application/json') !== false;

  if (!isJson || ['GET', 'DELETE', 'HEAD'].includes(req.method)) {
    return next(req);
  }

  const transformedBody = transformBody(req.body);

  const modifiedRequest = req.clone({
    body: transformedBody,
  });

  return next(modifiedRequest);
};
