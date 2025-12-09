import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PriceReceivedEvent } from '../../domain/events/price-received.event';
import { PriceAggregationService } from '../../domain/services/price-aggregation.service';

@Injectable()
export class PriceReceivedHandler {
  constructor(
    private readonly priceAggregationService: PriceAggregationService,
  ) {}

  @OnEvent('price.received')
  handle(event: PriceReceivedEvent): void {
    this.priceAggregationService.handlePriceReceived(event);
  }
}
