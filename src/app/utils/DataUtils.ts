import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

export class DataUtil {
  static formatar(
    timestamp: number | string | Date | null | undefined,
    formato: string = 'DD/MM/YYYY',
  ): string {
    if (timestamp === null || timestamp === undefined || timestamp === '') {
      return '';
    }

    const data = moment(timestamp);

    return data.isValid() ? data.format(formato) : '';
  }
}
