export interface CryptoPrice {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  timestamp: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WebSocketMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  c: string; // Last price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
}

export type TradingPair = 'ETHUSDC' | 'USDTBTC';
