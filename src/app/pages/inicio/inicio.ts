import { DatePipe, PercentPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardDTO } from '../../dtos/dashboard/DashboardDTO';
import { DashboardService } from '../../services/dashboard.service';
import { AlertaService } from '../../services/alerta.service';
import { FormsModule } from '@angular/forms';
import { MoedaPipe } from '../../shared/pipes/moeda-pipe';
import { GraficoConfig } from '../../dtos/GraficoModel';
import { GraficoComponent } from '../../components/grafico/grafico.component';
import { ProgressoCircularComponent } from '../../components/progresso-circular/progresso-circular.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    FormsModule,
    MoedaPipe,
    GraficoComponent,
    ProgressoCircularComponent,
    PercentPipe
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly alertaService = inject(AlertaService);
  public dados = new DashboardDTO();

  periodo: string = 'SEMANA';

  graficoFaturamento!: GraficoConfig;

  ngOnInit() {
    this.alterarPeriodo(this.periodo);
    this.atualizarGraficos();
  }

  atualizarGraficos(): void {
    // this.graficoFaturamento = {
    //   titulo: 'Desempenho de vendas',
    //   subtitulo: 'Acompanhe faturamento e pedidos ao longo do período',
    //   tipo: 'area',
    //   categorias: this.dados.vendas.map((v) => DataUtils.formatar(v.data)),
    //   dados: this.dados.vendas.map((v) => v.valor),
    //   nomeSerie: 'Faturamento',
    //   moeda: true,
    //   altura: 320,
    // };
    this.graficoFaturamento = {
      titulo: 'Desempenho de vendas',
      subtitulo: 'Acompanhe faturamento e pedidos ao longo do período',
      tipo: 'area',
      categorias: [
        '01/11',
        '03/11',
        '05/11',
        '07/11',
        '09/11',
        '11/11',
        '13/11',
        '15/11',
        '17/11',
        '19/11',
        '21/11',
        '23/11',
      ],
      dados: [
        1250.5, 2100.0, 1850.75, 3200.0, 2750.9, 4100.0, 3600.5, 5200.0, 4850.0, 6100.75, 5700.0,
        7500.0,
      ],
      nomeSerie: 'Faturamento',
      moeda: true,
      altura: 320,
    };
  }

  alterarPeriodo(periodo: string): void {
    this.periodo = periodo;
    this.buscarDashboard();
  }

  buscarDashboard(): void {
    this.dashboardService.listar(this.periodo).subscribe({
      next: (response: DashboardDTO) => {
        this.dados = response;
      },
      error: (error: any) => {
        this.alertaService.erro(error.error);
      },
    });
  }
}
