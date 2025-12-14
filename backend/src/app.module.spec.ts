import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoGateway } from './infrastructure/gateways/crypto.gateway';
import { FinnhubClientAdapter } from './infrastructure/clients/finnhub-client.adapter';
import { PriceAggregationService } from './domain/services/price-aggregation.service';
import { PriceReceivedHandler } from './application/handlers/price-received.handler';

jest.mock('./app.controller');
jest.mock('./app.service');
jest.mock('./infrastructure/gateways/crypto.gateway');
jest.mock('./infrastructure/clients/finnhub-client.adapter');
jest.mock('./domain/services/price-aggregation.service');
jest.mock('./application/handlers/price-received.handler');

describe('AppModule', () => {
  let module: TestingModule;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      FINNHUB_API_KEY: 'test-api-key',
    };
  });

  afterEach(async () => {
    process.env = originalEnv;
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should compile the module', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FinnhubClientAdapter)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    expect(module).toBeDefined();
  });

  it('should have AppController as a controller', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FinnhubClientAdapter)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });

  it('should have AppService as a provider', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FinnhubClientAdapter)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
  });

  it('should have CryptoGateway as a provider', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FinnhubClientAdapter)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    const gateway = module.get<CryptoGateway>(CryptoGateway);
    expect(gateway).toBeDefined();
  });

  it('should have PriceAggregationService as a provider', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FinnhubClientAdapter)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    const service = module.get<PriceAggregationService>(
      PriceAggregationService,
    );
    expect(service).toBeDefined();
  });

  it('should have PriceReceivedHandler as a provider', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FinnhubClientAdapter)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    const handler = module.get<PriceReceivedHandler>(PriceReceivedHandler);
    expect(handler).toBeDefined();
  });
});
