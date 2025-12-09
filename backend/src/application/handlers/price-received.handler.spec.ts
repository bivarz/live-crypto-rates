import { Test, TestingModule } from '@nestjs/testing';
import { PriceReceivedHandler } from './price-received.handler';
import { PriceAggregationService } from '../../domain/services/price-aggregation.service';
import { PriceReceivedEvent } from '../../domain/events/price-received.event';
import { Price } from '../../domain/entities/price.entity';

describe('PriceReceivedHandler', () => {
  let handler: PriceReceivedHandler;
  let priceAggregationService: PriceAggregationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceReceivedHandler,
        {
          provide: PriceAggregationService,
          useValue: {
            handlePriceReceived: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<PriceReceivedHandler>(PriceReceivedHandler);
    priceAggregationService = module.get<PriceAggregationService>(
      PriceAggregationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should call priceAggregationService.handlePriceReceived when event is received', () => {
      const price = Price.create('BINANCE:ETHUSDC', 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      handler.handle(event);

      expect(priceAggregationService.handlePriceReceived).toHaveBeenCalledTimes(1);
      expect(priceAggregationService.handlePriceReceived).toHaveBeenCalledWith(event);
    });

    it('should handle multiple events correctly', () => {
      const prices = [
        Price.create('BINANCE:ETHUSDC', 2500, Date.now()),
        Price.create('BINANCE:ETHUSDT', 3000, Date.now()),
        Price.create('BINANCE:ETHBTC', 0.05, Date.now()),
      ];

      prices.forEach((price) => {
        const event = new PriceReceivedEvent(price);
        handler.handle(event);
      });

      expect(priceAggregationService.handlePriceReceived).toHaveBeenCalledTimes(3);
    });

    it('should pass the correct event to the service', () => {
      const price = Price.create('BINANCE:ETHUSDC', 2500, Date.now());
      const event = new PriceReceivedEvent(price);

      handler.handle(event);

      expect(priceAggregationService.handlePriceReceived).toHaveBeenCalledWith(event);
    });
  });
});

