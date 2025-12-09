import { Price } from '../entities/price.entity';

export class PriceReceivedEvent {
  constructor(public readonly price: Price) {}
}
