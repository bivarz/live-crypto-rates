import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinnhubClientAdapter } from './finnhub-client.adapter';
import { PriceReceivedEvent } from '../../domain/events/price-received.event';

let mockWsInstance: any;
let mockWebSocketFn: jest.Mock;

jest.mock('ws', () => {
  const mockFn = jest.fn().mockImplementation(() => {
    const instance = {
      on: jest.fn((event, handler) => {
        if (!instance.handlers) {
          instance.handlers = {};
        }
        instance.handlers[event] = handler;
        return instance;
      }),
      send: jest.fn(),
      close: jest.fn(),
      removeAllListeners: jest.fn(),
      readyState: 1,
      handlers: {},
    };
    if (typeof mockWsInstance === 'undefined') {
      mockWsInstance = instance;
    } else {
      mockWsInstance = instance;
    }
    return instance;
  });
  (global as any).__mockWebSocketFn = mockFn;
  return {
    __esModule: true,
    default: mockFn,
  };
});

jest.useFakeTimers();

describe('FinnhubClientAdapter', () => {
  let adapter: FinnhubClientAdapter;
  let eventEmitter: EventEmitter2;
  const originalEnv = process.env;
  let emitSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      FINNHUB_API_KEY: 'test-api-key',
    };

    emitSpy = jest.fn();
    eventEmitter = {
      emit: emitSpy,
    } as any;

    jest.clearAllMocks();
    mockWsInstance = null;
    mockWebSocketFn = (global as any).__mockWebSocketFn;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllTimers();
    if (adapter) {
      adapter.onModuleDestroy();
    }
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
        adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
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
      connectSpy.mockRestore();
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
      disconnectSpy.mockRestore();
    });
  });

  describe('WebSocket connection', () => {
    beforeEach(() => {
      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
    });

    it('should create WebSocket connection with correct URL', () => {
      adapter.onModuleInit();

      expect(mockWebSocketFn).toHaveBeenCalledWith(
        'wss://ws.finnhub.io?token=test-api-key',
      );
    });

    it('should subscribe to all symbols when connection opens', () => {
      adapter.onModuleInit();

      const openHandler = mockWsInstance.handlers.open;
      expect(openHandler).toBeDefined();
      openHandler();

      expect(mockWsInstance.send).toHaveBeenCalledTimes(3);
      expect(mockWsInstance.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:ETHUSDC' }),
      );
      expect(mockWsInstance.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:ETHUSDT' }),
      );
      expect(mockWsInstance.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:ETHBTC' }),
      );
    });

    it('should handle ping messages and respond with pong', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      expect(messageHandler).toBeDefined();

      const pingMessage = { type: 'ping' };
      messageHandler({ toString: () => JSON.stringify(pingMessage) });

      expect(mockWsInstance.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'pong' }),
      );
    });

    it('should handle error messages', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const errorMessage = { type: 'error', msg: 'Invalid subscription' };
      messageHandler({ toString: () => JSON.stringify(errorMessage) });

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit PriceReceivedEvent for trade messages', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const tradeMessage = {
        type: 'trade',
        data: [
          {
            s: 'BINANCE:ETHUSDC',
            p: 3000.5,
            t: Math.floor(Date.now() / 1000),
          },
        ],
      };

      messageHandler({ toString: () => JSON.stringify(tradeMessage) });

      expect(emitSpy).toHaveBeenCalledWith(
        'price.received',
        expect.any(PriceReceivedEvent),
      );
    });

    it('should emit PriceReceivedEvent for quote messages', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const quoteMessage = {
        type: 'quote',
        data: [
          {
            s: 'BINANCE:ETHUSDT',
            ap: 3010.25,
            t: Math.floor(Date.now() / 1000),
          },
        ],
      };

      messageHandler({ toString: () => JSON.stringify(quoteMessage) });

      expect(emitSpy).toHaveBeenCalledWith(
        'price.received',
        expect.any(PriceReceivedEvent),
      );
    });

    it('should emit PriceReceivedEvent for update messages', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const updateMessage = {
        type: 'update',
        data: [
          {
            s: 'BINANCE:ETHBTC',
            bp: 0.065,
            t: Math.floor(Date.now() / 1000),
          },
        ],
      };

      messageHandler({ toString: () => JSON.stringify(updateMessage) });

      expect(emitSpy).toHaveBeenCalledWith(
        'price.received',
        expect.any(PriceReceivedEvent),
      );
    });

    it('should skip invalid price data', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const invalidMessage = {
        type: 'trade',
        data: [
          {
            s: 'BINANCE:ETHUSDC',
            p: null,
            t: Math.floor(Date.now() / 1000),
          },
        ],
      };

      messageHandler({ toString: () => JSON.stringify(invalidMessage) });

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should skip messages with missing symbol', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const invalidMessage = {
        type: 'trade',
        data: [
          {
            p: 3000.5,
            t: Math.floor(Date.now() / 1000),
          },
        ],
      };

      messageHandler({ toString: () => JSON.stringify(invalidMessage) });

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple data items in one message', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      const multiDataMessage = {
        type: 'trade',
        data: [
          {
            s: 'BINANCE:ETHUSDC',
            p: 3000.5,
            t: Math.floor(Date.now() / 1000),
          },
          {
            s: 'BINANCE:ETHUSDT',
            p: 3010.25,
            t: Math.floor(Date.now() / 1000),
          },
        ],
      };

      messageHandler({ toString: () => JSON.stringify(multiDataMessage) });

      expect(emitSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle parsing errors gracefully', () => {
      adapter.onModuleInit();

      const messageHandler = mockWsInstance.handlers.message;
      messageHandler({ toString: () => 'invalid json' });

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('WebSocket error handling', () => {
    beforeEach(() => {
      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleInit();
    });

    it('should handle WebSocket errors', () => {
      const errorHandler = mockWsInstance.handlers.error;
      expect(errorHandler).toBeDefined();

      const error = new Error('Connection failed');
      errorHandler(error);
    });

    it('should handle authentication errors (401)', () => {
      const errorHandler = mockWsInstance.handlers.error;
      const error = new Error('401 Unauthorized');
      errorHandler(error);
    });
  });

  describe('WebSocket close handling', () => {
    beforeEach(() => {
      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleInit();
    });

    it('should handle normal closure (1000)', () => {
      const closeHandler = mockWsInstance.handlers.close;
      expect(closeHandler).toBeDefined();

      closeHandler(1000, Buffer.from('Normal closure'));

      jest.advanceTimersByTime(6000);
      expect(mockWebSocketFn).toHaveBeenCalledTimes(1);
    });

    it('should schedule reconnect for policy violation (1008)', () => {
      const closeHandler = mockWsInstance.handlers.close;
      closeHandler(1008, Buffer.from('Policy violation'));

      jest.advanceTimersByTime(6000);

      expect(mockWebSocketFn).toHaveBeenCalledTimes(2);
    });

    it('should schedule reconnect for abnormal closure (1006)', () => {
      const closeHandler = mockWsInstance.handlers.close;
      closeHandler(1006);

      jest.advanceTimersByTime(6000);

      expect(mockWebSocketFn).toHaveBeenCalledTimes(2);
    });

    it('should schedule reconnect for protocol error (1002)', () => {
      const closeHandler = mockWsInstance.handlers.close;
      closeHandler(1002, Buffer.from('Protocol error'));

      jest.advanceTimersByTime(6000);

      expect(mockWebSocketFn).toHaveBeenCalledTimes(2);
    });

    it('should schedule reconnect for other error codes', () => {
      const closeHandler = mockWsInstance.handlers.close;
      closeHandler(1011, Buffer.from('Internal error'));

      jest.advanceTimersByTime(6000);

      expect(mockWebSocketFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('disconnect', () => {
    it('should close WebSocket when disconnecting', () => {
      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleInit();

      const wsInstance = mockWsInstance;
      expect(wsInstance).toBeDefined();

      adapter.onModuleDestroy();

      expect(wsInstance.close).toHaveBeenCalled();
      expect(wsInstance.removeAllListeners).toHaveBeenCalled();
    });

    it('should clear reconnect interval when disconnecting', () => {
      adapter = new FinnhubClientAdapter(eventEmitter as EventEmitter2);
      adapter.onModuleInit();

      const initialCallCount = mockWebSocketFn.mock.calls.length;

      const closeHandler = mockWsInstance.handlers.close;
      closeHandler(1006);

      adapter.onModuleDestroy();

      jest.advanceTimersByTime(6000);
      expect(mockWebSocketFn.mock.calls.length).toBe(initialCallCount);
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

      connectSpy.mockRestore();
      disconnectSpy.mockRestore();
    });
  });
});
