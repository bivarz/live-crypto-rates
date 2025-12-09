import { Test, TestingModule } from '@nestjs/testing';
import { CryptoGateway } from './crypto.gateway';
import { PriceAggregationService } from '../../domain/services/price-aggregation.service';
import { PriceReceivedEvent } from '../../domain/events/price-received.event';
import { HourlyAverageCalculatedEvent } from '../../domain/events/hourly-average-calculated.event';
import { Price } from '../../domain/entities/price.entity';
import { HourlyAverage } from '../../domain/entities/hourly-average.entity';
import { Server, Socket } from 'socket.io';

describe('CryptoGateway', () => {
  let gateway: CryptoGateway;
  let priceAggregationService: PriceAggregationService;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    };

    mockSocket = {
      id: 'test-client-id',
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoGateway,
        {
          provide: PriceAggregationService,
          useValue: {
            getAllLatestPrices: jest.fn(),
            getAllHourlyAverages: jest.fn(),
            getPriceHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<CryptoGateway>(CryptoGateway);
    priceAggregationService = module.get<PriceAggregationService>(
      PriceAggregationService,
    );
    gateway.server = mockServer as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should log client connection and send initial data', () => {
      jest
        .spyOn(priceAggregationService, 'getAllLatestPrices')
        .mockReturnValue(new Map());
      jest
        .spyOn(priceAggregationService, 'getAllHourlyAverages')
        .mockReturnValue(new Map());
      jest
        .spyOn(priceAggregationService, 'getPriceHistory')
        .mockReturnValue([]);

      const loggerSpy = jest.spyOn(gateway['logger'], 'log');

      gateway.handleConnection(mockSocket as Socket);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Client connected: ${mockSocket.id}`,
      );
      expect(mockSocket.emit).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const loggerSpy = jest.spyOn(gateway['logger'], 'log');

      gateway.handleDisconnect(mockSocket as Socket);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Client disconnected: ${mockSocket.id}`,
      );
    });
  });

  describe('handleGetLatestPrices', () => {
    it('should send initial data when client requests latest prices', () => {
      jest
        .spyOn(priceAggregationService, 'getAllLatestPrices')
        .mockReturnValue(new Map());
      jest
        .spyOn(priceAggregationService, 'getAllHourlyAverages')
        .mockReturnValue(new Map());
      jest
        .spyOn(priceAggregationService, 'getPriceHistory')
        .mockReturnValue([]);

      gateway.handleGetLatestPrices(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalled();
    });
  });

  describe('handlePriceReceived', () => {
    it('should broadcast priceUpdate to all clients', () => {
      const price = Price.create('BINANCE:ETHUSDC', 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      gateway.handlePriceReceived(event);

      expect(mockServer.emit).toHaveBeenCalledWith('priceUpdate', {
        symbol: price.symbol,
        price: price.price,
        timestamp: price.timestamp,
      });
    });

    it('should handle multiple price updates', () => {
      const prices = [
        Price.create('BINANCE:ETHUSDC', 2500, Date.now()),
        Price.create('BINANCE:ETHUSDT', 3000, Date.now()),
      ];

      prices.forEach((price) => {
        const event = new PriceReceivedEvent(price);
        gateway.handlePriceReceived(event);
      });

      expect(mockServer.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleHourlyAverageCalculated', () => {
    it('should broadcast hourlyAverageUpdate to all clients', () => {
      const hourlyAverage = HourlyAverage.create(
        'BINANCE:ETHUSDC',
        2500.5,
        '2024-01-01T10:00:00.000Z',
        100,
      );
      const event = new HourlyAverageCalculatedEvent(hourlyAverage);

      gateway.handleHourlyAverageCalculated(event);

      expect(mockServer.emit).toHaveBeenCalledWith('hourlyAverageUpdate', {
        symbol: hourlyAverage.symbol,
        average: hourlyAverage.average,
        hour: hourlyAverage.hour,
        count: hourlyAverage.count,
      });
    });
  });

  describe('sendInitialData', () => {
    it('should send latest prices, hourly averages, and price history to client', () => {
      const latestPrices = new Map<string, Price>();
      latestPrices.set(
        'BINANCE:ETHUSDC',
        Price.create('BINANCE:ETHUSDC', 2500, Date.now()),
      );

      const hourlyAverages = new Map<string, HourlyAverage>();
      hourlyAverages.set(
        'BINANCE:ETHUSDC',
        HourlyAverage.create(
          'BINANCE:ETHUSDC',
          2500.5,
          '2024-01-01T10:00:00.000Z',
          100,
        ),
      );

      const priceHistory = [
        Price.create('BINANCE:ETHUSDC', 2500, Date.now()),
      ];

      jest
        .spyOn(priceAggregationService, 'getAllLatestPrices')
        .mockReturnValue(latestPrices);
      jest
        .spyOn(priceAggregationService, 'getAllHourlyAverages')
        .mockReturnValue(hourlyAverages);
      jest
        .spyOn(priceAggregationService, 'getPriceHistory')
        .mockReturnValue(priceHistory);

      gateway['sendInitialData'](mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'latestPrices',
        expect.any(Object),
      );
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'hourlyAverages',
        expect.any(Object),
      );
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'priceHistory',
        expect.any(Object),
      );
    });

    it('should format price history correctly', () => {
      const latestPrices = new Map<string, Price>();
      const price = Price.create('BINANCE:ETHUSDC', 2500, Date.now());
      latestPrices.set('BINANCE:ETHUSDC', price);

      const hourlyAverages = new Map<string, HourlyAverage>();
      const priceHistory = [price];

      jest
        .spyOn(priceAggregationService, 'getAllLatestPrices')
        .mockReturnValue(latestPrices);
      jest
        .spyOn(priceAggregationService, 'getAllHourlyAverages')
        .mockReturnValue(hourlyAverages);
      jest
        .spyOn(priceAggregationService, 'getPriceHistory')
        .mockReturnValue(priceHistory);

      gateway['sendInitialData'](mockSocket as Socket);

      const priceHistoryCall = (mockSocket.emit as jest.Mock).mock.calls.find(
        (call) => call[0] === 'priceHistory',
      );
      expect(priceHistoryCall).toBeDefined();
      expect(priceHistoryCall[1]['BINANCE:ETHUSDC']).toHaveLength(1);
      expect(priceHistoryCall[1]['BINANCE:ETHUSDC'][0]).toEqual({
        symbol: price.symbol,
        price: price.price,
        timestamp: price.timestamp,
      });
    });

    it('should handle empty data gracefully', () => {
      jest
        .spyOn(priceAggregationService, 'getAllLatestPrices')
        .mockReturnValue(new Map());
      jest
        .spyOn(priceAggregationService, 'getAllHourlyAverages')
        .mockReturnValue(new Map());
      jest
        .spyOn(priceAggregationService, 'getPriceHistory')
        .mockReturnValue([]);

      gateway['sendInitialData'](mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('latestPrices', {});
      expect(mockSocket.emit).toHaveBeenCalledWith('hourlyAverages', {});
      expect(mockSocket.emit).toHaveBeenCalledWith('priceHistory', {});
    });
  });
});

