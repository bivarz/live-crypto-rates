import type { CryptoPrice, TradingPair } from '../types/crypto';

export class MockCryptoService {
  private listeners: Map<string, Set<(data: CryptoPrice) => void>> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  
  // Base prices for each pair
  private basePrices: Record<TradingPair, number> = {
    'ETHUSDT': 2250.00,
    'BTCUSDT': 43500.00,
  };

  private currentPrices: Record<string, CryptoPrice> = {};

  public subscribe(pair: TradingPair, callback: (data: CryptoPrice) => void): () => void {
    if (!this.listeners.has(pair)) {
      this.listeners.set(pair, new Set());
      this.startMockData(pair);
    }

    this.listeners.get(pair)!.add(callback);

    // Send initial data immediately
    if (this.currentPrices[pair]) {
      callback(this.currentPrices[pair]);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(pair);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.stopMockData(pair);
          this.listeners.delete(pair);
        }
      }
    };
  }

  private startMockData(pair: TradingPair): void {
    // Initialize with base price
    const basePrice = this.basePrices[pair];
    const openPrice = basePrice;
    
    this.currentPrices[pair] = {
      symbol: pair,
      price: basePrice,
      priceChange: 0,
      priceChangePercent: 0,
      timestamp: Date.now(),
    };

    // Update price every 2 seconds
    const interval = setInterval(() => {
      const lastPrice = this.currentPrices[pair]?.price || basePrice;
      
      // Generate realistic price movement (±0.5%)
      const changePercent = (Math.random() - 0.5) * 1;
      const newPrice = lastPrice * (1 + changePercent / 100);
      
      // Calculate 24h change (simulated)
      const priceChange = newPrice - openPrice;
      const priceChangePercent = (priceChange / openPrice) * 100;

      const cryptoPrice: CryptoPrice = {
        symbol: pair,
        price: newPrice,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent,
        timestamp: Date.now(),
      };

      this.currentPrices[pair] = cryptoPrice;

      const listeners = this.listeners.get(pair);
      if (listeners) {
        listeners.forEach(callback => callback(cryptoPrice));
      }
    }, 2000);

    this.intervals.set(pair, interval);
  }

  private stopMockData(pair: TradingPair): void {
    const interval = this.intervals.get(pair);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(pair);
    }
  }

  public isConnected(): boolean {
    return true; // Mock service is always "connected"
  }
}

// Singleton instance
export const mockCryptoService = new MockCryptoService();
