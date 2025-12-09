import { PriceReceivedEvent } from './price-received.event';
import { Price } from '../entities/price.entity';

describe('PriceReceivedEvent', () => {
  it('should create a PriceReceivedEvent with a Price entity', () => {
    const price = Price.create('BINANCE:ETHUSDC', 2500.5, Date.now());
    const event = new PriceReceivedEvent(price);

    expect(event).toBeInstanceOf(PriceReceivedEvent);
    expect(event.price).toBe(price);
    expect(event.price.symbol).toBe('BINANCE:ETHUSDC');
    expect(event.price.price).toBe(2500.5);
  });

  it('should have readonly price property', () => {
    const price = Price.create('BINANCE:ETHUSDT', 3000, Date.now());
    const event = new PriceReceivedEvent(price);

    expect(event.price).toBeDefined();
    expect(event.price).toBe(price);
  });

  it('should handle different price values', () => {
    const prices = [
      Price.create('BINANCE:ETHUSDC', 2500, Date.now()),
      Price.create('BINANCE:ETHUSDT', 3000, Date.now()),
      Price.create('BINANCE:ETHBTC', 0.05, Date.now()),
    ];

    prices.forEach((price) => {
      const event = new PriceReceivedEvent(price);
      expect(event.price).toBe(price);
    });
  });
});

