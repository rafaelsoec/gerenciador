import { Component } from '@angular/core';
import { HeaderPaginaComponent } from '../../shared/header-pagina/header-pagina';

@Component({
  selector: 'app-produtos',
  standalone: true,
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
  imports: [HeaderPaginaComponent],
})
export class ProdutosComponent {

  onNovo(): void {
    console.log('Cadastrar novo cliente');
  }
}
