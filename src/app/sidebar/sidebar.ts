import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService, Usuario } from '../services/auth.service';
import { TemaService } from '../services/tema.service';

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
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  readonly auth = inject(AuthService);
  readonly tema = inject(TemaService);

  readonly isExpanded = signal(false);
  readonly isMobile = signal(false);
  readonly menuUsuarioAberto = signal(false);

  private svg(inner: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`,
    );
  }

  readonly menuGroups: MenuGroup[] = [
    {
      label: 'Principal',
      items: [
        {
          id: 'inicio',
          label: 'Inicio',
          ariaLabel: 'Inicio',
          route: '/inicio',
          svg: this.svg(
            `<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>`,
          ),
        },
        {
          id: 'clientes',
          label: 'Clientes',
          ariaLabel: 'Clientes',
          route: '/clientes',
          svg: this.svg(
            `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.8"/><path d="M17 14a5.5 5.5 0 0 1 4.5 5.5"/>`,
          ),
        },
        {
          id: 'produtos',
          label: 'Produtos',
          ariaLabel: 'Produtos',
          route: '/produtos',
          svg: this.svg(
            `<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>`,
          ),
        },
        {
          id: 'pedidos',
          label: 'Pedidos',
          ariaLabel: 'Pedidos',
          route: '/pedidos',
          svg: this.svg(
            `<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h4"/>`,
          ),
        },
        {
          id: 'notas-fiscais',
          label: 'Notas Fiscais',
          ariaLabel: 'Notas Fiscais',
          route: '/notas-fiscais',
          svg: this.svg(
            `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
          ),
        },
      ],
    },
    {
      label: 'Gestao',
      items: [
        {
          id: 'empresas',
          label: 'Minhas Empresas',
          ariaLabel: 'Empresas',
          route: '/empresas',
          svg: this.svg(
            `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>`,
          ),
        },
        {
          id: 'transportadoras',
          label: 'Transportadoras',
          ariaLabel: 'Transportadoras',
          route: '/transportadoras',
          svg: this.svg(
            `
              <path d="M3 6h11v12H3z"/>
              <path d="M14 10h4l3 4v4h-7z"/>
              <circle cx="7.5" cy="18" r="2"/>
              <circle cx="17.5" cy="18" r="2"/>
              <path d="M14 14h7"/>
            `,
          ),
        },
        // {
        //   id: 'relatorios',
        //   label: 'Relatórios',
        //   ariaLabel: 'Relatorios',
        //   route: '/relatorios',
        //   svg: this.svg(`<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5"/><path d="M8 13h8"/><path d="M8 17h8"/>`),
        // },
        {
          id: 'configuracoes',
          label: 'Configurações',
          ariaLabel: 'Configuracoes',
          route: '/configuracoes',
          svg: this.svg(
            `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>`,
          ),
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
    if (!this.isMobile()) {
      this.isExpanded.set(false);
    }
    this.router.navigate(['/perfil']);
  }

  navegarEmpresas(): void {
    this.menuUsuarioAberto.set(false);
    if (!this.isMobile()) {
      this.isExpanded.set(false);
    }
    this.router.navigate(['/empresas']);
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
