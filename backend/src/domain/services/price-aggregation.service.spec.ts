import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PriceAggregationService } from './price-aggregation.service';
import { PriceReceivedEvent } from '../events/price-received.event';
import { Price } from '../entities/price.entity';
import { HourlyAverage } from '../entities/hourly-average.entity';

describe('PriceAggregationService', () => {
  let service: PriceAggregationService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceAggregationService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PriceAggregationService>(PriceAggregationService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePriceReceived', () => {
    it('should store price in history', () => {
      const price = Price.create('BINANCE:ETHUSDC', 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      service.handlePriceReceived(event);

      const history = service.getPriceHistory('BINANCE:ETHUSDC');
      expect(history).toHaveLength(1);
      expect(history[0]).toBe(price);
    });

    it('should limit history size to maxHistorySize', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const maxSize = 10000;

      // Add more than maxSize prices
      for (let i = 0; i < maxSize + 100; i++) {
        const price = Price.create(symbol, 2500 + i, Date.now() + i);
        const event = new PriceReceivedEvent(price);
        service.handlePriceReceived(event);
      }

      const history = service.getPriceHistory(symbol);
      expect(history.length).toBeLessThanOrEqual(maxSize);
    });

    it('should calculate hourly average after receiving price', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();
      const price = Price.create(symbol, 2500, now);
      const event = new PriceReceivedEvent(price);

      service.handlePriceReceived(event);

      const average = service.getHourlyAverage(symbol);
      expect(average).toBeDefined();
      expect(average?.symbol).toBe(symbol);
      expect(average?.average).toBe(2500);
    });

    it('should emit hourly-average.calculated event', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      service.handlePriceReceived(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'hourly-average.calculated',
        expect.any(Object),
      );
    });
  });

  describe('getLatestPrice', () => {
    it('should return null for symbol with no history', () => {
      const price = service.getLatestPrice('BINANCE:ETHUSDC');
      expect(price).toBeNull();
    });

    it('should return the most recent price', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const prices = [
        Price.create(symbol, 2500, Date.now() - 2000),
        Price.create(symbol, 2600, Date.now() - 1000),
        Price.create(symbol, 2700, Date.now()),
      ];

      prices.forEach((price) => {
        service.handlePriceReceived(new PriceReceivedEvent(price));
      });

      const latest = service.getLatestPrice(symbol);
      expect(latest).toBeDefined();
      expect(latest?.price).toBe(2700);
    });
  });

  describe('getAllLatestPrices', () => {
    it('should return empty map when no prices exist', () => {
      const prices = service.getAllLatestPrices();
      expect(prices.size).toBe(0);
    });

    it('should return latest prices for all symbols', () => {
      const symbols = ['BINANCE:ETHUSDC', 'BINANCE:ETHUSDT', 'BINANCE:ETHBTC'];
      const prices = [2500, 3000, 0.05];

      symbols.forEach((symbol, index) => {
        const price = Price.create(symbol, prices[index], Date.now());
        service.handlePriceReceived(new PriceReceivedEvent(price));
      });

      const allPrices = service.getAllLatestPrices();
      expect(allPrices.size).toBe(3);
      symbols.forEach((symbol, index) => {
        expect(allPrices.get(symbol)?.price).toBe(prices[index]);
      });
    });
  });

  describe('getHourlyAverage', () => {
    it('should return null for symbol with no averages', () => {
      const average = service.getHourlyAverage('BINANCE:ETHUSDC');
      expect(average).toBeNull();
    });

    it('should return the most recent hourly average', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();

      // Add prices within the same hour
      for (let i = 0; i < 10; i++) {
        const price = Price.create(symbol, 2500 + i, now - (10 - i) * 60000);
        service.handlePriceReceived(new PriceReceivedEvent(price));
      }

      const average = service.getHourlyAverage(symbol);
      expect(average).toBeDefined();
      expect(average?.symbol).toBe(symbol);
      expect(average?.count).toBeGreaterThan(0);
    });
  });

  describe('getAllHourlyAverages', () => {
    it('should return empty map when no averages exist', () => {
      const averages = service.getAllHourlyAverages();
      expect(averages.size).toBe(0);
    });

    it('should return averages for all symbols with data', () => {
      const symbols = ['BINANCE:ETHUSDC', 'BINANCE:ETHUSDT', 'BINANCE:ETHBTC'];
      const prices = [2500, 3000, 0.05];

      symbols.forEach((symbol, index) => {
        const price = Price.create(symbol, prices[index], Date.now());
        service.handlePriceReceived(new PriceReceivedEvent(price));
      });

      const allAverages = service.getAllHourlyAverages();
      expect(allAverages.size).toBe(3);
      symbols.forEach((symbol) => {
        expect(allAverages.get(symbol)).toBeDefined();
      });
    });
  });

  describe('getPriceHistory', () => {
    it('should return empty array for symbol with no history', () => {
      const history = service.getPriceHistory('BINANCE:ETHUSDC');
      expect(history).toEqual([]);
    });

    it('should return all prices for a symbol', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const count = 10;

      for (let i = 0; i < count; i++) {
        const price = Price.create(symbol, 2500 + i, Date.now() + i);
        service.handlePriceReceived(new PriceReceivedEvent(price));
      }

      const history = service.getPriceHistory(symbol);
      expect(history).toHaveLength(count);
    });

    it('should return prices in chronological order', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const baseTime = Date.now();

      for (let i = 0; i < 5; i++) {
        const price = Price.create(symbol, 2500, baseTime + i * 1000);
        service.handlePriceReceived(new PriceReceivedEvent(price));
      }

      const history = service.getPriceHistory(symbol);
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i - 1].timestamp);
      }
    });
  });

  describe('hourly average calculation', () => {
    it('should calculate average correctly for multiple prices', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();
      const prices = [2500, 2600, 2700, 2800, 2900];
      const expectedAverage = prices.reduce((a, b) => a + b, 0) / prices.length;

      prices.forEach((price) => {
        const priceEntity = Price.create(symbol, price, now - 1000);
        service.handlePriceReceived(new PriceReceivedEvent(priceEntity));
      });

      const average = service.getHourlyAverage(symbol);
      expect(average).toBeDefined();
      expect(average?.average).toBeCloseTo(expectedAverage, 2);
      expect(average?.count).toBe(prices.length);
    });

    it('should only include prices from the last hour', () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();

      // Add old price (more than 1 hour ago)
      const oldPrice = Price.create(symbol, 2000, now - 2 * 60 * 60 * 1000);
      service.handlePriceReceived(new PriceReceivedEvent(oldPrice));

      // Add recent prices
      const recentPrices = [2500, 2600, 2700];
      recentPrices.forEach((price) => {
        const priceEntity = Price.create(symbol, price, now - 1000);
        service.handlePriceReceived(new PriceReceivedEvent(priceEntity));
      });

      const average = service.getHourlyAverage(symbol);
      expect(average).toBeDefined();
      expect(average?.count).toBe(recentPrices.length);
      expect(average?.average).toBeCloseTo(
        recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length,
        2,
      );
    });
  });
});

