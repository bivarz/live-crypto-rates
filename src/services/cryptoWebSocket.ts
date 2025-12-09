import type { CryptoPrice, WebSocketMessage, TradingPair } from '../types/crypto';

export class CryptoWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<(data: CryptoPrice) => void>> = new Map();
  private subscribedPairs: Set<TradingPair> = new Set();
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    // Using Binance WebSocket for real-time crypto data
    const streams = Array.from(this.subscribedPairs)
      .map(pair => `${pair.toLowerCase()}@ticker`)
      .join('/');
    
    const url = streams 
      ? `wss://stream.binance.com:9443/stream?streams=${streams}`
      : 'wss://stream.binance.com:9443/ws';

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle stream data format
          if (message.data) {
            this.handleMessage(message.data);
          } else {
            // Handle direct ticker data
            this.handleMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private handleMessage(data: WebSocketMessage): void {
    if (data.e !== '24hrTicker') {
      return;
    }

    const symbol = data.s as TradingPair;
    const cryptoPrice: CryptoPrice = {
      symbol: symbol,
      price: parseFloat(data.c),
      priceChange: parseFloat(data.p),
      priceChangePercent: parseFloat(data.P),
      timestamp: data.E,
    };

    const listeners = this.listeners.get(symbol);
    if (listeners) {
      listeners.forEach(callback => callback(cryptoPrice));
    }
  }

  public subscribe(pair: TradingPair, callback: (data: CryptoPrice) => void): () => void {
    if (!this.listeners.has(pair)) {
      this.listeners.set(pair, new Set());
    }

    this.listeners.get(pair)!.add(callback);

    // Add to subscribed pairs and reconnect if needed
    const wasEmpty = this.subscribedPairs.size === 0;
    this.subscribedPairs.add(pair);

    if (wasEmpty || this.ws?.readyState !== WebSocket.OPEN) {
      this.disconnect();
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(pair);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(pair);
          this.subscribedPairs.delete(pair);
        }
      }
    };
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const cryptoWebSocketService = new CryptoWebSocketService();
