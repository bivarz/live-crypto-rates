import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PriceAggregationService } from '../domain/services/price-aggregation.service';
import { PriceReceivedHandler } from '../application/handlers/price-received.handler';
import { CryptoGateway } from '../infrastructure/gateways/crypto.gateway';
import { PriceReceivedEvent } from '../domain/events/price-received.event';
import { HourlyAverageCalculatedEvent } from '../domain/events/hourly-average-calculated.event';
import { Price } from '../domain/entities/price.entity';

import { Server, Socket } from 'socket.io';

/**
 * Complete Flow Integration Tests
 *
 * These tests validate the complete system flow:
 * Event → Handler → Service → Event → Gateway → Client
 *
 * Real components are used, only WebSocket and Socket.IO are mocked
 */
describe('Price Flow Integration Tests', () => {
  let module: TestingModule;
  let eventEmitter: EventEmitter2;
  let priceAggregationService: PriceAggregationService;
  let priceReceivedHandler: PriceReceivedHandler;
  let cryptoGateway: CryptoGateway;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;
  let priceUpdateListener: jest.Mock;
  let hourlyAverageUpdateListener: jest.Mock;
  let latestPricesListener: jest.Mock;
  let hourlyAveragesListener: jest.Mock;
  let priceHistoryListener: jest.Mock;

  beforeEach(async () => {
    // Mock Socket.IO Server
    mockServer = {
      emit: jest.fn(),
    };

    // Mock Socket.IO Client
    priceUpdateListener = jest.fn();
    hourlyAverageUpdateListener = jest.fn();
    latestPricesListener = jest.fn();
    hourlyAveragesListener = jest.fn();
    priceHistoryListener = jest.fn();

    mockSocket = {
      id: 'test-client-1',
      emit: jest.fn((event: string, data: any): boolean => {
        if (event === 'priceUpdate') {
          priceUpdateListener(data);
        } else if (event === 'hourlyAverageUpdate') {
          hourlyAverageUpdateListener(data);
        } else if (event === 'latestPrices') {
          latestPricesListener(data);
        } else if (event === 'hourlyAverages') {
          hourlyAveragesListener(data);
        } else if (event === 'priceHistory') {
          priceHistoryListener(data);
        }
        return true;
      }),
    };

    // Create test module with all real components
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        EventEmitterModule.forRoot(),
      ],
      providers: [PriceAggregationService, PriceReceivedHandler, CryptoGateway],
    }).compile();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    priceAggregationService = module.get<PriceAggregationService>(
      PriceAggregationService,
    );
    priceReceivedHandler =
      module.get<PriceReceivedHandler>(PriceReceivedHandler);
    cryptoGateway = module.get<CryptoGateway>(CryptoGateway);

    // Configure mock server in gateway
    cryptoGateway.server = mockServer as Server;
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  describe('Complete Flow: Price Received → Processing → Broadcast', () => {
    it('should process received price and send update to client', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const priceValue = 2500.5;
      const timestamp = Date.now();
      const price = Price.create(symbol, priceValue, timestamp);
      const event = new PriceReceivedEvent(price);

      // Simulate connected client
      cryptoGateway.handleConnection(mockSocket as Socket);

      // Process event through handler (tests business logic)
      priceReceivedHandler.handle(event);

      // Notify gateway directly (simulates EventEmitter notifying gateway)
      cryptoGateway.handlePriceReceived(event);

      // Verify that price was stored
      const storedPrice = priceAggregationService.getLatestPrice(symbol);
      expect(storedPrice).toBeDefined();
      expect(storedPrice?.price).toBe(priceValue);
      expect(storedPrice?.symbol).toBe(symbol);

      // Verify that broadcast was sent to all clients
      expect(mockServer.emit).toHaveBeenCalledWith('priceUpdate', {
        symbol,
        price: priceValue,
        timestamp,
      });
    });

    it('should calculate hourly average and send update to client', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();
      const prices = [2500, 2600, 2700];
      const expectedAverage = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Simulate connected client
      cryptoGateway.handleConnection(mockSocket as Socket);

      // Send multiple prices through handler
      let lastHourlyAverageEvent: HourlyAverageCalculatedEvent | null = null;
      const hourlyAverageListener = jest.fn(
        (event: HourlyAverageCalculatedEvent) => {
          lastHourlyAverageEvent = event;
        },
      );
      eventEmitter.on('hourly-average.calculated', hourlyAverageListener);

      for (let index = 0; index < prices.length; index++) {
        const priceEntity = Price.create(
          symbol,
          prices[index],
          now - (prices.length - index) * 60000, // Last minutes
        );
        const event = new PriceReceivedEvent(priceEntity);
        priceReceivedHandler.handle(event);
      }

      // Wait for EventEmitter async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify that average was calculated
      const average = priceAggregationService.getHourlyAverage(symbol);
      expect(average).toBeDefined();
      expect(average?.average).toBeCloseTo(expectedAverage, 2);
      expect(average?.count).toBe(prices.length);

      // Notify gateway about calculated average (simulates EventEmitter)
      if (lastHourlyAverageEvent) {
        cryptoGateway.handleHourlyAverageCalculated(lastHourlyAverageEvent);
      } else if (average) {
        // If event was not captured, create manually
        const hourlyAvgEvent = new HourlyAverageCalculatedEvent(average);
        cryptoGateway.handleHourlyAverageCalculated(hourlyAvgEvent);
      }

      // Verify that average broadcast was sent
      const hourlyAverageCalls = (
        mockServer.emit as jest.Mock
      ).mock.calls.filter((call) => call[0] === 'hourlyAverageUpdate');
      expect(hourlyAverageCalls.length).toBeGreaterThan(0);

      const lastCall = hourlyAverageCalls[hourlyAverageCalls.length - 1];
      expect(lastCall[1]).toMatchObject({
        symbol,
        average: expect.closeTo(expectedAverage, 2),
        count: prices.length,
      });

      eventEmitter.removeAllListeners('hourly-average.calculated');
    });

    it('should process multiple symbols simultaneously', async () => {
      const symbols = ['BINANCE:ETHUSDC', 'BINANCE:ETHUSDT', 'BINANCE:ETHBTC'];
      const prices = [2500, 3000, 0.05];

      // Simulate connected client
      cryptoGateway.handleConnection(mockSocket as Socket);

      // Send prices for all symbols through handler and notify gateway
      for (let index = 0; index < symbols.length; index++) {
        const price = Price.create(symbols[index], prices[index], Date.now());
        const event = new PriceReceivedEvent(price);
        priceReceivedHandler.handle(event);
        cryptoGateway.handlePriceReceived(event);
      }

      // Verify that all prices were stored
      symbols.forEach((symbol, index) => {
        const storedPrice = priceAggregationService.getLatestPrice(symbol);
        expect(storedPrice).toBeDefined();
        expect(storedPrice?.price).toBe(prices[index]);
      });

      // Verify that broadcasts were sent to all
      const priceUpdateCalls = (mockServer.emit as jest.Mock).mock.calls.filter(
        (call) => call[0] === 'priceUpdate',
      );
      expect(priceUpdateCalls.length).toBeGreaterThanOrEqual(symbols.length);
    });

    it('should send initial data when client connects', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());

      // Send price before client connects through handler
      const event = new PriceReceivedEvent(price);
      priceReceivedHandler.handle(event);
      await new Promise((resolve) => setImmediate(resolve));

      // Client connects
      cryptoGateway.handleConnection(mockSocket as Socket);

      // Verify that initial data was sent
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'latestPrices',
        expect.objectContaining({
          [symbol]: expect.objectContaining({
            symbol,
            price: 2500,
          }),
        }),
      );

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'hourlyAverages',
        expect.any(Object),
      );

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'priceHistory',
        expect.objectContaining({
          [symbol]: expect.any(Array),
        }),
      );
    });
  });

  describe('Flow: Handler → Service → Event Emission', () => {
    it('should process event through handler correctly', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      // Process event through handler
      priceReceivedHandler.handle(event);
      await new Promise((resolve) => setImmediate(resolve));

      // Verify that handler processed and service stored
      const storedPrice = priceAggregationService.getLatestPrice(symbol);
      expect(storedPrice).toBeDefined();
      expect(storedPrice?.price).toBe(2500);
    });

    it('should emit hourly average event after calculation', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      // Listener for calculated average event
      const hourlyAverageListener = jest.fn();
      eventEmitter.on('hourly-average.calculated', hourlyAverageListener);

      // Process event through handler
      priceReceivedHandler.handle(event);
      await new Promise((resolve) => setImmediate(resolve));

      // Verify that average event was emitted
      expect(hourlyAverageListener).toHaveBeenCalled();
      expect(hourlyAverageListener).toHaveBeenCalledWith(
        expect.any(HourlyAverageCalculatedEvent),
      );

      const emittedEvent = hourlyAverageListener.mock
        .calls[0][0] as HourlyAverageCalculatedEvent;
      expect(emittedEvent.hourlyAverage.symbol).toBe(symbol);
      expect(emittedEvent.hourlyAverage.average).toBe(2500);

      eventEmitter.removeAllListeners('hourly-average.calculated');
    });
  });

  describe('Flow: Gateway → Client Broadcasting', () => {
    it('should broadcast price update to all clients', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      // Simulate multiple connected clients
      const client1 = {
        id: 'client-1',
        emit: jest.fn().mockReturnValue(true),
      } as any;
      const client2 = {
        id: 'client-2',
        emit: jest.fn().mockReturnValue(true),
      } as any;

      cryptoGateway.handleConnection(client1);
      cryptoGateway.handleConnection(client2);

      // Notify gateway directly (simulates EventEmitter notifying gateway)
      cryptoGateway.handlePriceReceived(event);

      // Verify that broadcast was sent (via server.emit)
      expect(mockServer.emit).toHaveBeenCalledWith('priceUpdate', {
        symbol,
        price: 2500,
        timestamp: price.timestamp,
      });
    });

    it('should broadcast hourly average update to all clients', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      // Process price through handler
      priceReceivedHandler.handle(event);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Get calculated average and notify gateway
      const average = priceAggregationService.getHourlyAverage(symbol);
      expect(average).toBeDefined();

      if (average) {
        const hourlyAvgEvent = new HourlyAverageCalculatedEvent(average);
        cryptoGateway.handleHourlyAverageCalculated(hourlyAvgEvent);
      }

      // Verify that average broadcast was sent
      const hourlyAverageCalls = (
        mockServer.emit as jest.Mock
      ).mock.calls.filter((call) => call[0] === 'hourlyAverageUpdate');

      expect(hourlyAverageCalls.length).toBeGreaterThan(0);
      const lastCall = hourlyAverageCalls[hourlyAverageCalls.length - 1];
      expect(lastCall[1]).toMatchObject({
        symbol,
        average: expect.any(Number),
        count: expect.any(Number),
      });
    });
  });

  describe('Flow: Multiple Rapid Prices', () => {
    it('should process multiple prices received rapidly', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const prices = Array.from({ length: 10 }, (_, i) =>
        Price.create(symbol, 2500 + i, Date.now() + i),
      );

      // Simulate connected client
      cryptoGateway.handleConnection(mockSocket as Socket);

      // Send all prices rapidly through handler and notify gateway
      for (const price of prices) {
        const event = new PriceReceivedEvent(price);
        priceReceivedHandler.handle(event);
        cryptoGateway.handlePriceReceived(event);
      }

      // Verify that all prices were processed
      const history = priceAggregationService.getPriceHistory(symbol);
      expect(history.length).toBe(prices.length);

      // Verify that the last price is the most recent
      const latestPrice = priceAggregationService.getLatestPrice(symbol);
      expect(latestPrice?.price).toBe(2500 + 9);

      // Verify that multiple broadcasts were sent
      const priceUpdateCalls = (mockServer.emit as jest.Mock).mock.calls.filter(
        (call) => call[0] === 'priceUpdate',
      );
      expect(priceUpdateCalls.length).toBeGreaterThanOrEqual(prices.length);
    });

    it('should maintain history limited to maxHistorySize', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const maxSize = 10000;
      const extraPrices = 100;

      // Send more prices than the limit through handler
      for (let i = 0; i < maxSize + extraPrices; i++) {
        const price = Price.create(symbol, 2500 + i, Date.now() + i);
        const event = new PriceReceivedEvent(price);
        priceReceivedHandler.handle(event);
      }
      await new Promise((resolve) => setImmediate(resolve));

      const history = priceAggregationService.getPriceHistory(symbol);
      expect(history.length).toBeLessThanOrEqual(maxSize);

      // Verify that oldest prices were removed
      // The first price in history should be one of the last sent
      if (history.length > 0) {
        expect(history[0].price).toBeGreaterThanOrEqual(2500 + extraPrices);
      }
    });
  });

  describe('Flow: Hourly Average Calculation', () => {
    it('should calculate average only with prices from the last hour', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();

      // Old price (2 hours ago)
      const oldPrice = Price.create(symbol, 2000, now - 2 * 60 * 60 * 1000);
      priceReceivedHandler.handle(new PriceReceivedEvent(oldPrice));

      // Recent prices (last hour)
      const recentPrices = [2500, 2600, 2700];
      for (let index = 0; index < recentPrices.length; index++) {
        const priceEntity = Price.create(
          symbol,
          recentPrices[index],
          now - (recentPrices.length - index) * 10 * 60 * 1000, // Last 30 minutes
        );
        priceReceivedHandler.handle(new PriceReceivedEvent(priceEntity));
      }
      await new Promise((resolve) => setImmediate(resolve));

      const average = priceAggregationService.getHourlyAverage(symbol);
      expect(average).toBeDefined();
      expect(average?.count).toBe(recentPrices.length);
      expect(average?.average).toBeCloseTo(
        recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length,
        2,
      );
    });

    it('should update existing average for the same hour', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const now = Date.now();

      // First set of prices
      const firstPrices = [2500, 2600];
      for (let index = 0; index < firstPrices.length; index++) {
        const priceEntity = Price.create(
          symbol,
          firstPrices[index],
          now - (firstPrices.length - index) * 10 * 60 * 1000,
        );
        priceReceivedHandler.handle(new PriceReceivedEvent(priceEntity));
      }
      await new Promise((resolve) => setImmediate(resolve));

      const firstAverage = priceAggregationService.getHourlyAverage(symbol);
      expect(firstAverage).toBeDefined();

      // Add more prices in the same hour
      const additionalPrices = [2700, 2800];
      for (let index = 0; index < additionalPrices.length; index++) {
        const priceEntity = Price.create(
          symbol,
          additionalPrices[index],
          now - (additionalPrices.length - index) * 5 * 60 * 1000,
        );
        priceReceivedHandler.handle(new PriceReceivedEvent(priceEntity));
      }
      await new Promise((resolve) => setImmediate(resolve));

      const updatedAverage = priceAggregationService.getHourlyAverage(symbol);
      expect(updatedAverage).toBeDefined();
      expect(updatedAverage?.count).toBe(
        firstPrices.length + additionalPrices.length,
      );

      const expectedAverage =
        [...firstPrices, ...additionalPrices].reduce((a, b) => a + b, 0) /
        (firstPrices.length + additionalPrices.length);
      expect(updatedAverage?.average).toBeCloseTo(expectedAverage, 2);
    });
  });

  describe('Flow: Client Requests Data', () => {
    it('should send updated data when client requests via getLatestPrices', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const price = Price.create(symbol, 2500, Date.now());

      // Send price through handler
      priceReceivedHandler.handle(new PriceReceivedEvent(price));
      await new Promise((resolve) => setImmediate(resolve));

      // Client requests updated data
      cryptoGateway.handleGetLatestPrices(mockSocket as Socket);

      // Verify that data was sent
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'latestPrices',
        expect.objectContaining({
          [symbol]: expect.objectContaining({
            symbol,
            price: 2500,
          }),
        }),
      );
    });
  });

  describe('Flow: Symbol Isolation', () => {
    it('should maintain isolated data for different symbols', async () => {
      const symbol1 = 'BINANCE:ETHUSDC';
      const symbol2 = 'BINANCE:ETHUSDT';
      const price1 = Price.create(symbol1, 2500, Date.now());
      const price2 = Price.create(symbol2, 3000, Date.now());

      // Send prices for different symbols through handler
      priceReceivedHandler.handle(new PriceReceivedEvent(price1));
      priceReceivedHandler.handle(new PriceReceivedEvent(price2));
      await new Promise((resolve) => setImmediate(resolve));

      // Verify isolation
      const storedPrice1 = priceAggregationService.getLatestPrice(symbol1);
      const storedPrice2 = priceAggregationService.getLatestPrice(symbol2);

      expect(storedPrice1?.price).toBe(2500);
      expect(storedPrice2?.price).toBe(3000);
      expect(storedPrice1?.symbol).toBe(symbol1);
      expect(storedPrice2?.symbol).toBe(symbol2);

      // Verify that histories are independent
      const history1 = priceAggregationService.getPriceHistory(symbol1);
      const history2 = priceAggregationService.getPriceHistory(symbol2);

      expect(history1.length).toBe(1);
      expect(history2.length).toBe(1);
      expect(history1[0].symbol).toBe(symbol1);
      expect(history2[0].symbol).toBe(symbol2);
    });
  });

  describe('Flow: Processing Order', () => {
    it('should process events in the correct order', async () => {
      const symbol = 'BINANCE:ETHUSDC';
      const prices = [2500, 2600, 2700];
      const timestamps = prices.map((_, i) => Date.now() + i);

      // Send prices in order through handler
      for (let index = 0; index < prices.length; index++) {
        const priceEntity = Price.create(
          symbol,
          prices[index],
          timestamps[index],
        );
        priceReceivedHandler.handle(new PriceReceivedEvent(priceEntity));
      }
      await new Promise((resolve) => setImmediate(resolve));

      const history = priceAggregationService.getPriceHistory(symbol);
      expect(history.length).toBe(prices.length);

      // Verify that order was maintained
      for (let i = 0; i < history.length; i++) {
        expect(history[i].price).toBe(prices[i]);
        expect(history[i].timestamp).toBe(timestamps[i]);
      }
    });
  });
});
