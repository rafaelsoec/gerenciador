import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardDTO, VendaDTO } from '../../dtos/dashboard/DashboardDTO';
import { DashboardService } from '../../services/dashboard.service';
import { AlertaService } from '../../services/alerta.service';
import { FormsModule } from '@angular/forms';
import { MoedaPipe } from '../../pipes/moeda-pipe';
import { GraficoConfig } from '../../dtos/GraficoModel';
import { GraficoComponent } from '../../components/grafico/grafico.component';
import { ProgressoCircularComponent } from '../../components/progresso-circular/progresso-circular.component';
import { DateUtils } from '../../utils/DateUtils';
import { NumberUtils } from '../../utils/NumberUtils';
import { DataPipe } from '../../pipes/data-pipe';
import { ScrollComponent } from '../../components/scroll/scroll.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MoedaPipe,
    GraficoComponent,
    ProgressoCircularComponent,
    DataPipe,
    ScrollComponent,
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly alertaService = inject(AlertaService);
  public dados = new DashboardDTO();
  public dataHoje = new Date();

  periodo: string = 'SEMANA';

  graficoFaturamento!: GraficoConfig;

  ngOnInit() {
    this.alterarPeriodo(this.periodo);
  }

  atualizarGraficos(vendas: VendaDTO[]): void {
    this.graficoFaturamento = {
      titulo: 'Desempenho de vendas',
      subtitulo: 'Acompanhe faturamento e pedidos ao longo do período',
      tipo: 'area',
      categorias: vendas
        .sort((a, b) => DateUtils.comparar(a.data, b.data) ?? 0)
        .map((v) => DateUtils.formatar(v.data)),
      dados: vendas.map((v) => NumberUtils.toNumber(v.valor)),
      nomeSerie: 'Faturamento',
      moeda: true,
      altura: 320,
    };
  }

  alterarPeriodo(periodo: string): void {
    // if (this.periodo !== periodo) {
    this.periodo = periodo;
    this.buscarDashboard();
    //}
  }

  buscarDashboard(): void {
    this.dashboardService.listar(this.periodo).subscribe({
      next: (response: DashboardDTO) => {
        this.dados = response;
        this.atualizarGraficos(response.vendas);
      },
      error: (error: any) => {
        this.alertaService.erro(error.error);
      },
    });
  }
}
