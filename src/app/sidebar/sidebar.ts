import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, Usuario } from '../services/auth.service';
import { PerfilComponent } from '../pages/perfil/perfil';

export interface MenuItem {
  id: string;
  label: string;
  ariaLabel: string;
  route: string;
  svg: SafeHtml;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);
  readonly auth = inject(AuthService);

  readonly isExpanded = signal(false);
  readonly isMobile = signal(false);
  readonly menuUsuarioAberto = signal(false);

  private svg(inner: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
    );
  }

  readonly menuGroups: MenuGroup[] = [
    {
      label: 'Principal',
      items: [
        {
          id: 'inicio',
          label: 'Início',
          ariaLabel: 'Início',
          route: '/inicio',
          svg: this.svg(`<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>`),
        },
        {
          id: 'clientes',
          label: 'Clientes',
          ariaLabel: 'Clientes',
          route: '/clientes',
          svg: this.svg(`<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.8"/><path d="M17 14a5.5 5.5 0 0 1 4.5 5.5"/>`),
        },
        {
          id: 'produtos',
          label: 'Produtos',
          ariaLabel: 'Produtos',
          route: '/produtos',
          svg: this.svg(`<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>`),
        },
      ],
    },
    {
      label: 'Gestão',
      items: [
        {
          id: 'relatorios',
          label: 'Relatórios',
          ariaLabel: 'Relatórios',
          route: '/relatorios',
          svg: this.svg(`<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5"/><path d="M8 13h8"/><path d="M8 17h8"/>`),
        },
        {
          id: 'configuracoes',
          label: 'Configurações',
          ariaLabel: 'Configurações',
          route: '/configuracoes',
          svg: this.svg(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>`),
        },
      ],
    },
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(max-width: 767px)');
      this.isMobile.set(mql.matches);
      mql.addEventListener('change', (e) => this.isMobile.set(e.matches));
    }
  }

  onMouseEnter(): void {
    if (!this.isMobile()) {
      this.isExpanded.set(true);
    }
  }

  onMouseLeave(): void {
    if (!this.isMobile()) {
      this.isExpanded.set(false);
      this.menuUsuarioAberto.set(false);
    }
  }

  fecharMenuUsuario(): void {
    this.menuUsuarioAberto.set(false);
    if (!this.isMobile()) {
      this.isExpanded.set(false);
    }
  }

  toggleMobile(): void {
    this.isExpanded.update((v) => !v);
  }

  toggleMenuUsuario(event: Event): void {
    event.stopPropagation();
    const abrindo = !this.menuUsuarioAberto();
    this.menuUsuarioAberto.set(abrindo);
    if (abrindo) {
      this.isExpanded.set(true);
    }
  }

  abrirPerfil(): void {
    this.menuUsuarioAberto.set(false);
    const usuario = this.auth.usuarioAtual();
    if (!usuario) return;
    this.dialog.open(PerfilComponent, {
      width: '480px',
      data: { usuario },
    });
  }

  logout(): void {
    this.menuUsuarioAberto.set(false);
    this.auth.logout();
  }

  inicialNome(): string {
    const authName = this.auth.usuarioAtual() ?? new Usuario(0, '', '');
    const nome = authName?.nome ?? authName?.login;
    return nome.charAt(0).toUpperCase();
  }
}
