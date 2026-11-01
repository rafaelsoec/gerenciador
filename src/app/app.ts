import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarComponent } from './sidebar/sidebar';
import { TemaService } from './services/tema.service';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  constructor() {
    inject(TemaService).inicializar();
  }

  readonly mostrarSidebar = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => !e.urlAfterRedirects.startsWith('/login')),
    ),
    { initialValue: !this.router.url.startsWith('/login') },
  );
}
