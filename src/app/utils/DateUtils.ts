import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

export type DataType = number | string | Date | null | undefined;

export class DateUtils {
  static converterParaDate(timestamp: DataType): Date | null {
    if (timestamp === null || timestamp === undefined || timestamp === '') {
      return null;
    }

    const data =
      typeof timestamp === 'string'
        ? moment(
            timestamp,
            ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601],
            true,
          )
        : moment(timestamp);

    return data.isValid() ? data.toDate() : null;
  }

  static formatar(timestamp: DataType, formato: string = 'DD/MM/YYYY'): string {
    if (timestamp === null || timestamp === undefined || timestamp === '') {
      return '';
    }

    const data =
      typeof timestamp === 'string'
        ? moment(timestamp, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601], true)
        : moment(timestamp);

    return data.isValid() ? data.format(formato) : '';
  }

  static comparar(
    data1: DataType,
    data2: DataType,
    unidade: moment.unitOfTime.StartOf = 'day',
  ): number | null {
    if (!data1 || !data2) {
      return null;
    }

    const converter = (valor: DataType) =>
      typeof valor === 'string'
        ? moment(valor, ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601], true)
        : moment(valor);

    const primeira = converter(data1);
    const segunda = converter(data2);

    if (!primeira.isValid() || !segunda.isValid()) {
      return null;
    }

    if (primeira.isSame(segunda, unidade)) {
      return 0;
    }

    return primeira.isBefore(segunda, unidade) ? -1 : 1;
  }

  static maior(data1: DataType, data2: DataType): boolean {
    return this.comparar(data1, data2) === 1;
  }

  static maiorOuIgual(data1: DataType, data2: DataType): boolean {
    const resultado = this.comparar(data1, data2);
    return resultado !== null && resultado >= 0;
  }

  static menor(data1: DataType, data2: DataType): boolean {
    return this.comparar(data1, data2) === -1;
  }

  static menorOuIgual(data1: DataType, data2: DataType): boolean {
    const resultado = this.comparar(data1, data2);
    return resultado !== null && resultado <= 0;
  }

  static igual(data1: DataType, data2: DataType): boolean {
    return this.comparar(data1, data2) === 0;
  }
}
