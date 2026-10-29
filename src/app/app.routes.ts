import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { ClientesComponent } from './pages/clientes/clientes';
import { ProdutosComponent } from './pages/produtos/produtos';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes';

export const routes: Routes = [
  { path: '',              redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio',        component: InicioComponent },
  { path: 'clientes',      component: ClientesComponent },
  { path: 'produtos',      component: ProdutosComponent },
  { path: 'relatorios',    component: RelatoriosComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent },
];
