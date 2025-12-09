import { HourlyAverageCalculatedEvent } from './hourly-average-calculated.event';
import { HourlyAverage } from '../entities/hourly-average.entity';

describe('HourlyAverageCalculatedEvent', () => {
  it('should create an HourlyAverageCalculatedEvent with an HourlyAverage entity', () => {
    const hourlyAverage = HourlyAverage.create(
      'BINANCE:ETHUSDC',
      2500.5,
      '2024-01-01T10:00:00.000Z',
      100,
    );
    const event = new HourlyAverageCalculatedEvent(hourlyAverage);

    expect(event).toBeInstanceOf(HourlyAverageCalculatedEvent);
    expect(event.hourlyAverage).toBe(hourlyAverage);
    expect(event.hourlyAverage.symbol).toBe('BINANCE:ETHUSDC');
    expect(event.hourlyAverage.average).toBe(2500.5);
    expect(event.hourlyAverage.count).toBe(100);
  });

  it('should have readonly hourlyAverage property', () => {
    const hourlyAverage = HourlyAverage.create(
      'BINANCE:ETHUSDT',
      3000,
      '2024-01-01T11:00:00.000Z',
      50,
    );
    const event = new HourlyAverageCalculatedEvent(hourlyAverage);

    expect(event.hourlyAverage).toBeDefined();
    expect(event.hourlyAverage).toBe(hourlyAverage);
  });

  it('should handle different hourly average values', () => {
    const averages = [
      HourlyAverage.create('BINANCE:ETHUSDC', 2500, '2024-01-01T10:00:00.000Z', 100),
      HourlyAverage.create('BINANCE:ETHUSDT', 3000, '2024-01-01T11:00:00.000Z', 50),
      HourlyAverage.create('BINANCE:ETHBTC', 0.05, '2024-01-01T12:00:00.000Z', 200),
    ];

    averages.forEach((avg) => {
      const event = new HourlyAverageCalculatedEvent(avg);
      expect(event.hourlyAverage).toBe(avg);
    });
  });
});

