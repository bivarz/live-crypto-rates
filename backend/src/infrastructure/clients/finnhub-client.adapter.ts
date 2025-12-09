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
        if (message.type === 'error') {
          this.logger.error('Finnhub API error:', message.msg);
          return;
        }
        if (message.type === 'trade' && message.data) {
          message.data.forEach((trade: any) => {
            const price = Price.create(trade.s, trade.p, trade.t);
            // Emit domain event
            this.eventEmitter.emit(
              'price.received',
              new PriceReceivedEvent(price),
            );
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
      this.logger.warn(
        `Finnhub WebSocket closed. Code: ${code}, Reason: ${reason || 'Unknown'}`,
      );
      if (code === 1006 || code === 1008) {
        this.logger.error(
          'Connection closed unexpectedly. Check your API key and network connection.',
        );
      }
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    this.reconnectInterval = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  private disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
