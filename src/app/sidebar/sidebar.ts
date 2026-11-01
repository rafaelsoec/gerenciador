import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, Usuario } from '../services/auth.service';
import { PerfilComponent } from '../pages/perfil/perfil';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  ariaLabel: string;
  route: string;
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
  readonly auth = inject(AuthService);

  readonly isExpanded = signal(false);
  readonly isMobile = signal(false);
  readonly menuUsuarioAberto = signal(false);

  readonly menuItems: MenuItem[] = [
    {
      id: 'inicio',
      label: 'Início',
      ariaLabel: 'Início',
      route: '/inicio',
      icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      ariaLabel: 'Clientes',
      route: '/clientes',
      icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2 1.97 3.45V19h7v-2.5c0-2.33-4.67-3.5-8-3.5z'
    },
    {
      id: 'produtos',
      label: 'Produtos',
      ariaLabel: 'Produtos',
      route: '/produtos',
      icon: 'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5zm10 15H4V9h16v11z',
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      ariaLabel: 'Relatórios',
      route: '/relatorios',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
    },
    // {
    //   id: 'configuracoes',
    //   label: 'Configurações',
    //   ariaLabel: 'Configurações',
    //   route: '/configuracoes',
    //   icon: 'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    // },
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

  toggleMobile(): void {
    this.isExpanded.update((v) => !v);
  }

  toggleMenuUsuario(event: Event): void {
    event.stopPropagation();
    this.menuUsuarioAberto.update((v) => !v);
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
    const authName = this.auth.usuarioAtual() ?? new Usuario(0, "", "");
    const nome = authName?.nome ?? authName?.login;
    return nome.charAt(0).toUpperCase();
  }
}
