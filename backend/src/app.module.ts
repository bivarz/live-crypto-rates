import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoGateway } from './infrastructure/gateways/crypto.gateway';
import { FinnhubClientAdapter } from './infrastructure/clients/finnhub-client.adapter';
import { PriceAggregationService } from './domain/services/price-aggregation.service';
import { PriceReceivedHandler } from './application/handlers/price-received.handler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CryptoGateway,
    FinnhubClientAdapter,
    PriceAggregationService,
    PriceReceivedHandler,
  ],
})
export class AppModule {}
