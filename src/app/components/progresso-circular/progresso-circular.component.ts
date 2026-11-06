import { Component, Input } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { NumberUtils } from '../../utils/NumberUtils';

@Component({
  selector: 'app-progresso-circular',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './progresso-circular.component.html',
})
export class ProgressoCircularComponent {
  @Input() titulo = '';
  @Input() percentual = 0;
  @Input() cor = '#0d6efd';

  get series(): ApexNonAxisChartSeries {
    return [Math.min(100, Math.max(0, NumberUtils.toNumber(this.percentual)))];
  }

  get chart(): ApexChart {
    return {
      type: 'radialBar',
      height: 220,
      sparkline: { enabled: true },
    };
  }

  get plotOptions(): ApexPlotOptions {
    return {
      radialBar: {
        hollow: {
          size: '68%',
        },
        track: {
          background: '#e9ecef',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: '28px',
            fontWeight: 600,
            formatter: (value) => `${Math.round(value)}%`,
          },
        },
      },
    };
  }

  get stroke(): ApexStroke {
    return {
      lineCap: 'round',
    };
  }

  get colors(): string[] {
    return [this.cor];
  }
}
