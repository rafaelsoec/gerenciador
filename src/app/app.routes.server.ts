import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    // Rotas protegidas dependem de localStorage — renderizar apenas no cliente
    path: '**',
    renderMode: RenderMode.Client,
  },
];
