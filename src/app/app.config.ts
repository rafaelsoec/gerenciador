import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

function paginadorIntlPtBr(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel     = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel    = 'Primeira página';
  intl.lastPageLabel     = 'Última página';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0) return 'Nenhum item';
    const totalPages = Math.ceil(length / pageSize);
    return `Página ${page + 1} de ${totalPages} (${length} itens)`;
  };
  return intl;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideNgxMask(),
    { provide: MatPaginatorIntl, useFactory: paginadorIntlPtBr },
  ],
};
