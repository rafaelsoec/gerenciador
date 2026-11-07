import { Component } from '@angular/core';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';
import { OpcaoCampo } from '../../shared/form-cadastro/form-cadastro';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
  imports: [HeaderPaginaComponent, MatIcon, RouterLink],
})
export class RelatoriosComponent {
  readonly cartoes: OpcaoCampo[] = [
    {
      label: 'NFS',
      value: 'NFS',
    },
    {
      label: 'NFSe',
      value: 'NFSe',
    },
    {
      label: 'NFS3',
      value: 'NFS3',
    },
  ];
}
