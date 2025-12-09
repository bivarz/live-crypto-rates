import type { CryptoPrice, WebSocketMessage, TradingPair } from '../types/crypto';
import { mockCryptoService } from './mockCryptoService';

export class CryptoWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<(data: CryptoPrice) => void>> = new Map();
  private subscribedPairs: Set<TradingPair> = new Set();
  private isConnecting = false;
  private useMockData = false;
  private mockUnsubscribers: Map<TradingPair, () => void> = new Map();
  private connectionAttempts = 0;
  private readonly MAX_CONNECTION_ATTEMPTS = 3;

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    // Don't connect if there are no subscribed pairs
    if (this.subscribedPairs.size === 0) {
      return;
    }

    this.isConnecting = true;

    // Using Binance WebSocket for real-time crypto data
    const streams = Array.from(this.subscribedPairs)
      .map(pair => `${pair.toLowerCase()}@ticker`)
      .join('/');
    
    const url = `wss://stream.binance.com/stream?streams=${streams}`;

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
        this.connectionAttempts++;
        
        // After MAX_CONNECTION_ATTEMPTS, switch to mock data
        if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS && !this.useMockData) {
          console.log(`Switching to mock data mode after ${this.connectionAttempts} failed attempts`);
          this.useMockData = true;
          this.startMockDataForAllPairs();
        }
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

  private startMockDataForAllPairs(): void {
    console.log('Starting mock data for all subscribed pairs');
    this.subscribedPairs.forEach(pair => {
      if (!this.mockUnsubscribers.has(pair)) {
        const unsubscribe = mockCryptoService.subscribe(pair, (data) => {
          const listeners = this.listeners.get(pair);
          if (listeners) {
            listeners.forEach(callback => callback(data));
          }
        });
        this.mockUnsubscribers.set(pair, unsubscribe);
      }
    });
  }

  private scheduleReconnect(): void {
    // Don't reconnect if using mock data
    if (this.useMockData) {
      return;
    }
    
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

    // Add to subscribed pairs
    const wasEmpty = this.subscribedPairs.size === 0;
    this.subscribedPairs.add(pair);

    // If using mock data, subscribe to mock service
    if (this.useMockData) {
      if (!this.mockUnsubscribers.has(pair)) {
        const unsubscribe = mockCryptoService.subscribe(pair, (data) => {
          const listeners = this.listeners.get(pair);
          if (listeners) {
            listeners.forEach(cb => cb(data));
          }
        });
        this.mockUnsubscribers.set(pair, unsubscribe);
      }
    } else if (wasEmpty || this.ws?.readyState !== WebSocket.OPEN) {
      // Try to connect to real WebSocket
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
          
          // Unsubscribe from mock service if using it
          const mockUnsub = this.mockUnsubscribers.get(pair);
          if (mockUnsub) {
            mockUnsub();
            this.mockUnsubscribers.delete(pair);
          }
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
    if (this.useMockData) {
      return mockCryptoService.isConnected();
    }
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const cryptoWebSocketService = new CryptoWebSocketService();
