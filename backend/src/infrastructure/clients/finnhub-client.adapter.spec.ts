import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { FinnhubClientAdapter } from './finnhub-client.adapter';

// Mock WebSocket
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1, // OPEN
    };
  });
});

describe('FinnhubClientAdapter', () => {
  let adapter: FinnhubClientAdapter;
  let eventEmitter: EventEmitter2;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      FINNHUB_API_KEY: 'test-api-key',
    };

    eventEmitter = {
      emit: jest.fn(),
    } as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if FINNHUB_API_KEY is not set', () => {
      delete process.env.FINNHUB_API_KEY;

      expect(() => {
        new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      }).toThrow('FINNHUB_API_KEY environment variable is required');
    });

    it('should initialize successfully with valid API key', () => {
      process.env.FINNHUB_API_KEY = 'test-key';

      expect(() => {
        new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      }).not.toThrow();
    });
  });

  describe('onModuleInit', () => {
    it('should call connect when module initializes', () => {
      const connectSpy = jest.spyOn(
        FinnhubClientAdapter.prototype as any,
        'connect',
      );
      connectSpy.mockImplementation(() => {});

      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call disconnect when module is destroyed', () => {
      const disconnectSpy = jest.spyOn(
        FinnhubClientAdapter.prototype as any,
        'disconnect',
      );
      disconnectSpy.mockImplementation(() => {});

      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('lifecycle management', () => {
    it('should properly initialize and cleanup', () => {
      const connectSpy = jest.spyOn(
        FinnhubClientAdapter.prototype as any,
        'connect',
      );
      connectSpy.mockImplementation(() => {});

      const disconnectSpy = jest.spyOn(
        FinnhubClientAdapter.prototype as any,
        'disconnect',
      );
      disconnectSpy.mockImplementation(() => {});

      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleInit();
      adapter.onModuleDestroy();

      expect(connectSpy).toHaveBeenCalled();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
