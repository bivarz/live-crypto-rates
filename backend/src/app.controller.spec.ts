import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Crypto Rates API'),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the result from AppService.getHello', () => {
      const result = controller.getHello();
      expect(result).toBe('Crypto Rates API');
      expect(service.getHello).toHaveBeenCalled();
    });

    it('should call AppService.getHello exactly once', () => {
      controller.getHello();
      expect(service.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
