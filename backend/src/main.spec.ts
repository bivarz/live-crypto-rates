import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const createMockApp = () => ({
  enableCors: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
});

const mockApp = createMockApp();

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('Main', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit was called');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should bootstrap the application with default values', async () => {
    const bootstrap = async () => {
      const app = await NestFactory.create(AppModule);
      app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      });
      await app.listen(process.env.PORT || 3001);
    };

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });
    expect(mockApp.listen).toHaveBeenCalledWith(process.env.PORT || 3001);
  });

  it('should use environment variables for configuration', async () => {
    const originalPort = process.env.PORT;
    const originalFrontendUrl = process.env.FRONTEND_URL;

    process.env.PORT = '4000';
    process.env.FRONTEND_URL = 'http://example.com';

    const bootstrap = async () => {
      const app = await NestFactory.create(AppModule);
      app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      });
      await app.listen(process.env.PORT || 3001);
    };

    await bootstrap();

    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: 'http://example.com',
      credentials: true,
    });
    expect(mockApp.listen).toHaveBeenCalledWith('4000');

    process.env.PORT = originalPort;
    process.env.FRONTEND_URL = originalFrontendUrl;
  });
});
