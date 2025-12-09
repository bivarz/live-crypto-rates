export class HourlyAverage {
  constructor(
    public readonly symbol: string,
    public readonly average: number,
    public readonly hour: string,
    public readonly count: number,
  ) {}

  static create(
    symbol: string,
    average: number,
    hour: string,
    count: number,
  ): HourlyAverage {
    return new HourlyAverage(symbol, average, hour, count);
  }
}
