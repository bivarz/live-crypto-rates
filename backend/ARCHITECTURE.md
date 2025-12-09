# Event-Driven + Hexagonal Architecture

This document describes the refactored backend architecture following **Event-Driven Architecture** and **Hexagonal Architecture** principles.

## Folder Structure

```
backend/src/
├── domain/                    # Domain Layer (Core Business Logic)
│   ├── entities/              # Domain entities
│   │   ├── price.entity.ts
│   │   └── hourly-average.entity.ts
│   ├── events/                # Domain events
│   │   ├── price-received.event.ts
│   │   └── hourly-average-calculated.event.ts
│   └── services/              # Domain services
│       └── price-aggregation.service.ts
├── application/               # Application Layer (Use Cases)
│   └── handlers/              # Event Handlers
│       └── price-received.handler.ts
├── infrastructure/           # Infrastructure Layer (Adapters)
│   ├── clients/              # External clients
│   │   └── finnhub-client.adapter.ts
│   └── gateways/             # WebSocket Gateways
│       └── crypto.gateway.ts
└── app.module.ts             # Main NestJS module
```

## Data Flow

The flow follows the Event-Driven + Hexagonal pattern:

```
FinnhubClient → event → Domain → event → Gateway → client
```

### 1. FinnhubClient (Infrastructure Layer)

- **File**: `infrastructure/clients/finnhub-client.adapter.ts`
- **Responsibility**: Connects to Finnhub WebSocket and receives price data
- **Event Emitted**: `price.received` (PriceReceivedEvent)

### 2. Domain Layer

- **PriceReceivedHandler** (Application Layer) listens to `price.received` event
- **PriceAggregationService** (Domain Layer) processes the price:
  - Stores in history
  - Calculates hourly average
  - Emits `hourly-average.calculated` event (HourlyAverageCalculatedEvent)

### 3. Gateway (Infrastructure Layer)

- **CryptoGateway** listens to events:
  - `price.received` → sends `priceUpdate` to clients
  - `hourly-average.calculated` → sends `hourlyAverageUpdate` to clients

## Main Components

### Domain Layer

#### Entities

- **Price**: Represents a cryptocurrency price with symbol, price and timestamp
- **HourlyAverage**: Represents the calculated hourly average

#### Events

- **PriceReceivedEvent**: Triggered when a new price is received from Finnhub
- **HourlyAverageCalculatedEvent**: Triggered when a new hourly average is calculated

#### Services

- **PriceAggregationService**:
  - Manages price history
  - Calculates hourly averages
  - Emits domain events

### Application Layer

#### Handlers

- **PriceReceivedHandler**: Processes `price.received` events and delegates to domain service

### Infrastructure Layer

#### Clients

- **FinnhubClientAdapter**:
  - Adapter for Finnhub WebSocket
  - Converts API messages to domain events
  - Manages automatic reconnection

#### Gateways

- **CryptoGateway**:
  - WebSocket Gateway for frontend communication
  - Listens to domain events and broadcasts to clients
  - Sends initial data when client connects

## Event Bus

The system uses `@nestjs/event-emitter` as the event bus:

- **Emission**: `eventEmitter.emit(eventName, event)`
- **Listening**: `@OnEvent(eventName)` decorator

## Architecture Benefits

1. **Separation of Concerns**: Each layer has a clear responsibility
2. **Decoupling**: Components communicate via events, not direct dependencies
3. **Testability**: Easy to test each layer in isolation
4. **Maintainability**: Changes in one layer don't affect others
5. **Scalability**: Easy to add new handlers and adapters

## Complete Price Flow

1. **Finnhub WebSocket** receives trade → `finnhub-client.adapter.ts`
2. Creates `Price` entity → emits `price.received` event
3. **PriceReceivedHandler** captures event → calls `PriceAggregationService`
4. **PriceAggregationService**:
   - Stores price in history
   - Calculates hourly average
   - Emits `hourly-average.calculated` event
5. **CryptoGateway** listens to both events:
   - `price.received` → broadcasts `priceUpdate`
   - `hourly-average.calculated` → broadcasts `hourlyAverageUpdate`
6. **Frontend** receives updates via WebSocket

## Configuration

The `EventEmitterModule` is configured in `app.module.ts`:

```typescript
imports: [
  EventEmitterModule.forRoot(),
  // ...
];
```

## Next Steps

- Add unit tests for each layer
- Implement data persistence (database)
- Add metrics and monitoring
- Implement rate limiting
- Add input data validation
