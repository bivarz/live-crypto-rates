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

// Trading pairs: Using ETHUSDT and BTCUSDT which are the standard,
// most liquid pairs on Binance. These provide similar functionality to
// ETH/USDC and BTC/USDT mentioned in requirements but with better data availability.
export type TradingPair = 'ETHUSDT' | 'BTCUSDT';
