import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { ClientesComponent } from './pages/clientes/clientes';
import { ProdutosComponent } from './pages/produtos/produtos';
import { PedidosComponent } from './pages/pedidos/pedidos';
import { CadastroPedidoComponent } from './pages/pedidos/cadastro-pedido/cadastro-pedido';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';
import { VisualizacaoPedidoComponent } from './pages/pedidos/visualizacao-pedido/visualizacao-pedido';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'produtos', component: ProdutosComponent, canActivate: [authGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },
  { path: 'pedidos/novo', component: CadastroPedidoComponent, canActivate: [authGuard] },
  {
    path: 'pedidos/:id/visualizar',
    component: VisualizacaoPedidoComponent,
    canActivate: [authGuard],
  },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: ConfiguracoesComponent, canActivate: [authGuard] },
];
