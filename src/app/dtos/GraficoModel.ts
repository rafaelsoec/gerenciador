export type TipoGrafico = 'area' | 'line' | 'bar' | 'donut';

export interface GraficoConfig {
  titulo: string;
  subtitulo?: string;
  tipo: TipoGrafico;
  categorias: string[];
  dados: number[];
  nomeSerie?: string;
  altura?: number;
  moeda?: boolean;
}
