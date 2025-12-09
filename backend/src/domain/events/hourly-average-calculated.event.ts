import { HourlyAverage } from '../entities/hourly-average.entity';

export class HourlyAverageCalculatedEvent {
  constructor(public readonly hourlyAverage: HourlyAverage) {}
}
