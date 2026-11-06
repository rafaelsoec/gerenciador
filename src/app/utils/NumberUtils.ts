export class NumberUtils {
  static toNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    const normalized = value.trim().replace(/\./g, '').replace(',', '.');

    const result = Number(normalized);

    return Number.isFinite(result) ? result : 0;
  }

  static format(value: string | number | null | undefined): string {
    return this.toNumber(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
