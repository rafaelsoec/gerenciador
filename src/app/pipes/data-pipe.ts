import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils } from '../utils/DateUtils';

@Pipe({
  name: 'data',
  standalone: true,
})
export class DataPipe implements PipeTransform {
  transform(valor: number | string | Date | null | undefined, formato: string = 'DD/MM/YYYY'): string {
    if (!valor) {
      return '';
    }

    return DateUtils.formatar(valor, formato);
  }
}
