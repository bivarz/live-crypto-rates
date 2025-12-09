import { HourlyAverage } from './hourly-average.entity';

describe('HourlyAverage Entity', () => {
  describe('create', () => {
    it('should create an HourlyAverage entity with correct values', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const average = 2500.5;
      const hour = '2024-01-01T10:00:00.000Z';
      const count = 100;

      const hourlyAvg = HourlyAverage.create(symbol, average, hour, count);

      expect(hourlyAvg).toBeInstanceOf(HourlyAverage);
      expect(hourlyAvg.symbol).toBe(symbol);
      expect(hourlyAvg.average).toBe(average);
      expect(hourlyAvg.hour).toBe(hour);
      expect(hourlyAvg.count).toBe(count);
    });

    it('should create HourlyAverage with readonly properties', () => {
      const hourlyAvg = HourlyAverage.create(
        'BINANCE:ETHUSDT',
        3000.75,
        '2024-01-01T11:00:00.000Z',
        50,
      );

      expect(hourlyAvg.symbol).toBe('BINANCE:ETHUSDT');
      expect(hourlyAvg.average).toBe(3000.75);
      expect(hourlyAvg.hour).toBe('2024-01-01T11:00:00.000Z');
      expect(hourlyAvg.count).toBe(50);
    });

    it('should handle zero average value', () => {
      const hourlyAvg = HourlyAverage.create(
        'BINANCE:ETHBTC',
        0,
        '2024-01-01T12:00:00.000Z',
        0,
      );

      expect(hourlyAvg.average).toBe(0);
      expect(hourlyAvg.count).toBe(0);
    });

    it('should handle zero count', () => {
      const hourlyAvg = HourlyAverage.create(
        'BINANCE:ETHUSDC',
        2500,
        '2024-01-01T13:00:00.000Z',
        0,
      );

      expect(hourlyAvg.count).toBe(0);
    });

    it('should handle large count values', () => {
      const largeCount = 1000000;
      const hourlyAvg = HourlyAverage.create(
        'BINANCE:ETHUSDC',
        2500,
        '2024-01-01T14:00:00.000Z',
        largeCount,
      );

      expect(hourlyAvg.count).toBe(largeCount);
    });
  });

  describe('constructor', () => {
    it('should create HourlyAverage directly via constructor', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const average = 2500.5;
      const hour = '2024-01-01T10:00:00.000Z';
      const count = 100;

      const hourlyAvg = new HourlyAverage(symbol, average, hour, count);

      expect(hourlyAvg.symbol).toBe(symbol);
      expect(hourlyAvg.average).toBe(average);
      expect(hourlyAvg.hour).toBe(hour);
      expect(hourlyAvg.count).toBe(count);
    });
  });
});

