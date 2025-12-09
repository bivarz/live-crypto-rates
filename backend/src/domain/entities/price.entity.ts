export class Price {
  constructor(
    public readonly symbol: string,
    public readonly price: number,
    public readonly timestamp: number,
  ) {}

  static create(symbol: string, price: number, timestamp: number): Price {
    return new Price(symbol, price, timestamp);
  }
}
