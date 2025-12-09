import { Price } from './price.entity';

describe('Price Entity', () => {
  describe('create', () => {
    it('should create a Price entity with correct values', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = 2500.5;
      const timestamp = Date.now();

      const priceEntity = Price.create(symbol, price, timestamp);

      expect(priceEntity).toBeInstanceOf(Price);
      expect(priceEntity.symbol).toBe(symbol);
      expect(priceEntity.price).toBe(price);
      expect(priceEntity.timestamp).toBe(timestamp);
    });

    it('should create Price with readonly properties', () => {
      const priceEntity = Price.create('BINANCE:ETHUSDT', 3000, 1234567890);

      expect(priceEntity.symbol).toBe('BINANCE:ETHUSDT');
      expect(priceEntity.price).toBe(3000);
      expect(priceEntity.timestamp).toBe(1234567890);
    });

    it('should handle zero price value', () => {
      const priceEntity = Price.create('BINANCE:ETHBTC', 0, Date.now());

      expect(priceEntity.price).toBe(0);
    });

    it('should handle negative price value', () => {
      const priceEntity = Price.create('BINANCE:ETHUSDC', -100, Date.now());

      expect(priceEntity.price).toBe(-100);
    });

    it('should handle very large price values', () => {
      const largePrice = Number.MAX_SAFE_INTEGER;
      const priceEntity = Price.create('BINANCE:ETHUSDC', largePrice, Date.now());

      expect(priceEntity.price).toBe(largePrice);
    });
  });

  describe('constructor', () => {
    it('should create Price directly via constructor', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = 2500.5;
      const timestamp = Date.now();

      const priceEntity = new Price(symbol, price, timestamp);

      expect(priceEntity.symbol).toBe(symbol);
      expect(priceEntity.price).toBe(price);
      expect(priceEntity.timestamp).toBe(timestamp);
    });
  });
});

