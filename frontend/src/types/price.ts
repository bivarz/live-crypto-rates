export interface PriceCardProps {
  symbol: string;
  price?: number;
  timestamp?: number;
  hourlyAverage?: number;
  hourlyCount?: number;
  priceHistory?: Array<{ price: number; timestamp: number }>;
}

