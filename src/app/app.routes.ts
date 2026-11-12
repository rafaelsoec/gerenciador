import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { ClientesComponent } from './pages/clientes/clientes';
import { ProdutosComponent } from './pages/produtos/produtos';
import { PedidosComponent } from './pages/pedidos/pedidos';
import { CadastroPedidoComponent } from './pages/pedidos/cadastro-pedido/cadastro-pedido';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes';
import { LoginComponent } from './pages/login/login';
import { PerfilComponent } from './pages/perfil/perfil';
import { authGuard } from './guards/auth.guard';
import { VisualizacaoPedidoComponent } from './pages/pedidos/visualizacao-pedido/visualizacao-pedido';
import { EmpresasComponent } from './pages/empresas/empresas';
import { CadastroEmpresaComponent } from './pages/empresas/cadastro-empresa/cadastro-empresa';
import { NotasFiscaisComponent } from './pages/notas-fiscais/notas-fiscais';
import { EmissaoNFComponent } from './pages/notas-fiscais/emissao-nf/emissao-nf';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'produtos', component: ProdutosComponent, canActivate: [authGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },
  {
    path: 'pedidos/:id/editar',
    component: CadastroPedidoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'pedidos/:id/visualizar',
    component: VisualizacaoPedidoComponent,
    canActivate: [authGuard],
  },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'relatorios/NFS', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'relatorios/NFSe', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: ConfiguracoesComponent, canActivate: [authGuard] },
  { path: 'empresas', component: EmpresasComponent, canActivate: [authGuard] },
  { path: 'empresas/nova', component: CadastroEmpresaComponent, canActivate: [authGuard] },
  { path: 'empresas/:id/editar', component: CadastroEmpresaComponent, canActivate: [authGuard] },
  { path: 'notas-fiscais', component: NotasFiscaisComponent, canActivate: [authGuard] },
  {
    path: 'notas-fiscais/nova/pedido/:pedidoId',
    component: EmissaoNFComponent,
    canActivate: [authGuard],
  },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'inicio' },
];
