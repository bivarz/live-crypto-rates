import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HourlyAverageEntity } from './hourly-average.entity';
import { HourlyAverage } from '../../domain/entities/hourly-average.entity';

@Injectable()
export class HourlyAverageRepository {
  constructor(
    @InjectRepository(HourlyAverageEntity)
    private readonly repository: Repository<HourlyAverageEntity>,
  ) {}

  async save(hourlyAverage: HourlyAverage): Promise<void> {
    const existing = await this.repository.findOne({
      where: {
        symbol: hourlyAverage.symbol,
        hour: hourlyAverage.hour,
      },
    });

    if (existing) {
      existing.average = hourlyAverage.average;
      existing.count = hourlyAverage.count;
      await this.repository.save(existing);
    } else {
      const entity = this.repository.create({
        symbol: hourlyAverage.symbol,
        average: hourlyAverage.average,
        hour: hourlyAverage.hour,
        count: hourlyAverage.count,
      });
      await this.repository.save(entity);
    }
  }

  async findBySymbol(symbol: string): Promise<HourlyAverageEntity[]> {
    return this.repository.find({
      where: { symbol },
      order: { hour: 'DESC' },
      take: 24,
    });
  }

  async findLatestBySymbol(
    symbol: string,
  ): Promise<HourlyAverageEntity | null> {
    return this.repository.findOne({
      where: { symbol },
      order: { hour: 'DESC' },
    });
  }

  async findAllLatest(): Promise<Map<string, HourlyAverageEntity>> {
    const symbols = ['BINANCE:ETHUSDC', 'BINANCE:ETHUSDT', 'BINANCE:ETHBTC'];
    const latest = new Map<string, HourlyAverageEntity>();

    for (const symbol of symbols) {
      const entity = await this.findLatestBySymbol(symbol);
      if (entity) {
        latest.set(symbol, entity);
      }
    }

    return latest;
  }
}
