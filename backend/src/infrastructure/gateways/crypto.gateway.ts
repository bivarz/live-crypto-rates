import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { PriceAggregationService } from '../../domain/services/price-aggregation.service';
import { PriceReceivedEvent } from '../../domain/events/price-received.event';
import { HourlyAverageCalculatedEvent } from '../../domain/events/hourly-average-calculated.event';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket'],
})
@Injectable()
export class CryptoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CryptoGateway.name);

  constructor(
    private readonly priceAggregationService: PriceAggregationService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.sendInitialData(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getLatestPrices')
  handleGetLatestPrices(client: Socket) {
    this.sendInitialData(client);
  }

  @OnEvent('price.received')
  handlePriceReceived(event: PriceReceivedEvent) {
    const { price } = event;
    this.server.emit('priceUpdate', {
      symbol: price.symbol,
      price: price.price,
      timestamp: price.timestamp,
    });
  }

  @OnEvent('hourly-average.calculated')
  handleHourlyAverageCalculated(event: HourlyAverageCalculatedEvent) {
    const { hourlyAverage } = event;
    this.server.emit('hourlyAverageUpdate', {
      symbol: hourlyAverage.symbol,
      average: hourlyAverage.average,
      hour: hourlyAverage.hour,
      count: hourlyAverage.count,
    });
  }

  private sendInitialData(client: Socket) {
    const latestPrices = this.priceAggregationService.getAllLatestPrices();
    const hourlyAverages = this.priceAggregationService.getAllHourlyAverages();
    const priceHistory: Record<string, any[]> = {};

    const latestPricesObj: Record<string, any> = {};
    latestPrices.forEach((price, symbol) => {
      latestPricesObj[symbol] = {
        symbol: price.symbol,
        price: price.price,
        timestamp: price.timestamp,
      };
      const history = this.priceAggregationService.getPriceHistory(symbol);
      priceHistory[symbol] = history.map((p) => ({
        symbol: p.symbol,
        price: p.price,
        timestamp: p.timestamp,
      }));
    });

    const hourlyAveragesObj: Record<string, any> = {};
    hourlyAverages.forEach((avg, symbol) => {
      hourlyAveragesObj[symbol] = {
        symbol: avg.symbol,
        average: avg.average,
        hour: avg.hour,
        count: avg.count,
      };
    });

    client.emit('latestPrices', latestPricesObj);
    client.emit('hourlyAverages', hourlyAveragesObj);
    client.emit('priceHistory', priceHistory);
  }
}
