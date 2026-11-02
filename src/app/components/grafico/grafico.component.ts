import { Component, Input, OnChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { GraficoConfig } from '../../dtos/GraficoModel';

@Component({
  selector: 'app-grafico',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './grafico.component.html',
  styleUrl: './grafico.component.css',
})
export class GraficoComponent implements OnChanges {
  @Input({ required: true }) config!: GraficoConfig;

  chart!: ApexChart;

  series!: ApexAxisChartSeries | ApexNonAxisChartSeries;

  xaxis!: ApexXAxis;

  stroke!: ApexStroke;

  fill!: ApexFill;

  dataLabels!: ApexDataLabels;

  tooltip!: ApexTooltip;

  yaxis!: ApexYAxis;

  legend!: ApexLegend;

  ngOnChanges(): void {
    if (!this.config) return;

    this.configurarGrafico();
  }

  private configurarGrafico(): void {
    const tipo = this.config.tipo;

    this.chart = {
      type: tipo,
      height: this.config.altura ?? 320,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
    };

    // Gráficos de rosca
    if (tipo === 'donut') {
      this.series = [...this.config.dados];

      this.legend = {
        position: 'bottom',
      };

      this.dataLabels = {
        enabled: true,
      };
    } else {
      // Gráficos de área, linha e barras
      this.series = [
        {
          name: this.config.nomeSerie ?? 'Valores',
          data: [...this.config.dados],
        },
      ];

      this.xaxis = {
        categories: [...this.config.categorias],
      };

      this.stroke = {
        curve: 'smooth',
        width: tipo === 'bar' ? 0 : 3,
      };

      this.fill = {
        type: tipo === 'area' ? 'gradient' : 'solid',
        gradient: {
          opacityFrom: 0.35,
          opacityTo: 0.02,
        },
      };

      this.dataLabels = {
        enabled: false,
      };

      this.yaxis = {
        labels: {
          formatter: (value: number) => this.formatarValor(value),
        },
      };
    }

    this.tooltip = {
      y: {
        formatter: (value: number) => this.formatarValor(value),
      },
    };
  }

  private formatarValor(valor: number): string {
    if (this.config.moeda) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    }

    return valor.toLocaleString('pt-BR');
  }
}
