import { Injectable } from '@nestjs/common';
import { Price } from '../entities/price.entity';
import { HourlyAverage } from '../entities/hourly-average.entity';
import { PriceReceivedEvent } from '../events/price-received.event';
import { HourlyAverageCalculatedEvent } from '../events/hourly-average-calculated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PriceAggregationService {
  private priceHistory: Map<string, Price[]> = new Map();
  private hourlyAverages: Map<string, HourlyAverage[]> = new Map();
  private readonly maxHistorySize = 10000;
  private readonly symbols = [
    'BINANCE:ETHUSDC',
    'BINANCE:ETHUSDT',
    'BINANCE:ETHBTC',
  ];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.symbols.forEach((symbol) => {
      this.priceHistory.set(symbol, []);
      this.hourlyAverages.set(symbol, []);
    });
  }

  handlePriceReceived(event: PriceReceivedEvent): void {
    const { price } = event;
    const history = this.priceHistory.get(price.symbol) || [];

    history.push(price);

    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    this.priceHistory.set(price.symbol, history);
    this.calculateHourlyAverage(price.symbol);
  }

  getLatestPrice(symbol: string): Price | null {
    const history = this.priceHistory.get(symbol) || [];
    return history.length > 0 ? history[history.length - 1] : null;
  }

  getAllLatestPrices(): Map<string, Price> {
    const latest = new Map<string, Price>();
    this.symbols.forEach((symbol) => {
      const price = this.getLatestPrice(symbol);
      if (price) {
        latest.set(symbol, price);
      }
    });
    return latest;
  }

  getHourlyAverage(symbol: string): HourlyAverage | null {
    const averages = this.hourlyAverages.get(symbol) || [];
    return averages.length > 0 ? averages[averages.length - 1] : null;
  }

  getAllHourlyAverages(): Map<string, HourlyAverage> {
    const averages = new Map<string, HourlyAverage>();
    this.symbols.forEach((symbol) => {
      const avg = this.getHourlyAverage(symbol);
      if (avg) {
        averages.set(symbol, avg);
      }
    });
    return averages;
  }

  getPriceHistory(symbol: string): Price[] {
    return this.priceHistory.get(symbol) || [];
  }

  private calculateHourlyAverage(symbol: string): void {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length === 0) return;

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentPrices = history.filter((p) => p.timestamp >= oneHourAgo);

    if (recentPrices.length === 0) return;

    const sum = recentPrices.reduce((acc, p) => acc + p.price, 0);
    const average = sum / recentPrices.length;

    const hourStart = new Date(oneHourAgo);
    hourStart.setMinutes(0, 0, 0);
    const hourKey = hourStart.toISOString();

    const averages = this.hourlyAverages.get(symbol) || [];
    const existingIndex = averages.findIndex((a) => a.hour === hourKey);

    const hourlyAvg = HourlyAverage.create(
      symbol,
      average,
      hourKey,
      recentPrices.length,
    );

    if (existingIndex >= 0) {
      averages[existingIndex] = hourlyAvg;
    } else {
      averages.push(hourlyAvg);
      if (averages.length > 24) {
        averages.shift();
      }
    }

    this.hourlyAverages.set(symbol, averages);

    // Emit domain event
    this.eventEmitter.emit(
      'hourly-average.calculated',
      new HourlyAverageCalculatedEvent(hourlyAvg),
    );
  }
}
