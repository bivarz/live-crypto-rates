import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as WebSocketModule from 'ws';
import { Price } from '../../domain/entities/price.entity';
import { PriceReceivedEvent } from '../../domain/events/price-received.event';

const WebSocket = (WebSocketModule as any).default || WebSocketModule;

@Injectable()
export class FinnhubClientAdapter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FinnhubClientAdapter.name);
  private ws: WebSocketModule | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private readonly apiKey: string;
  private readonly symbols = [
    'BINANCE:ETHUSDC',
    'BINANCE:ETHUSDT',
    'BINANCE:ETHBTC',
  ];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
    if (!this.apiKey) {
      this.logger.error(
        'FINNHUB_API_KEY is required. Please set it in your .env file.',
      );
      throw new Error('FINNHUB_API_KEY environment variable is required');
    }
    this.logger.log('Finnhub API key configured successfully');
  }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    const wsUrl = `wss://ws.finnhub.io?token=${this.apiKey}`;
    this.logger.log(`Connecting to Finnhub WebSocket with API key...`);

    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      this.logger.log('Connected to Finnhub WebSocket successfully');
      this.logger.log(`Subscribing to symbols: ${this.symbols.join(', ')}`);
      this.symbols.forEach((symbol) => {
        this.ws?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    this.ws.on('message', (data: WebSocketModule.Data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'ping') {
          this.logger.debug('Received ping from Finnhub, sending pong');
          this.ws?.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (message.type === 'error') {
          this.logger.error('Finnhub API error:', message.msg);
          return;
        }

        if (
          (message.type === 'trade' ||
            message.type === 'quote' ||
            message.type === 'update') &&
          message.data &&
          Array.isArray(message.data)
        ) {
          this.logger.debug(`RAW message type: ${message.type}`);

          message.data.forEach((item: any) => {
            const symbol = item.s;
            const price = item.p || item.ap || item.bp;
            const timestamp = item.t || Date.now();

            this.logger.debug(`symbol extracted: ${symbol}`);
            this.logger.debug(`price extracted: ${price}`);

            if (
              symbol &&
              price !== undefined &&
              price !== null &&
              !isNaN(price)
            ) {
              const priceEntity = Price.create(symbol, price, timestamp);
              this.eventEmitter.emit(
                'price.received',
                new PriceReceivedEvent(priceEntity),
              );
            } else {
              this.logger.debug(
                `Skipping item - missing symbol or invalid price: symbol=${symbol}, price=${price}`,
              );
            }
          });
        }
      } catch (error) {
        this.logger.error('Error parsing WebSocket message:', error);
      }
    });

    this.ws.on('error', (error) => {
      this.logger.error('Finnhub WebSocket error:', error);
      if (error.message && error.message.includes('401')) {
        this.logger.error(
          'Authentication failed. Please check your FINNHUB_API_KEY.',
        );
      }
    });

    this.ws.on('close', (code, reason) => {
      const reasonStr = reason ? reason.toString() : 'Unknown';
      this.logger.warn(
        `Finnhub WebSocket closed. Code: ${code}, Reason: ${reasonStr}`,
      );

      if (code === 1000) {
        this.logger.log('Connection closed normally');
        return;
      }

      if (code === 1008) {
        this.logger.error(
          'Connection closed due to policy violation. Check your API key and subscription limits.',
        );
      } else if (code === 1006) {
        this.logger.error(
          'Connection closed unexpectedly (abnormal closure). This may indicate network issues or API key problems.',
        );
      } else if (code === 1002) {
        this.logger.error(
          'Connection closed due to protocol error. Check your WebSocket implementation.',
        );
      }

      if (code !== 1000) {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws = null;
    }

    this.logger.log('Scheduling reconnection in 5 seconds...');
    this.reconnectInterval = setTimeout(() => {
      this.logger.log('Attempting to reconnect to Finnhub WebSocket...');
      this.connect();
    }, 5000);
  }

  private disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }
}
