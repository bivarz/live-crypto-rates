import { useCryptoPrice } from '../hooks/useCryptoPrice';
import type { TradingPair } from '../types/crypto';
import './PriceCard.css';

interface PriceCardProps {
  pair: TradingPair;
  displayName: string;
}

export function PriceCard({ pair, displayName }: PriceCardProps) {
  const { price, isConnected } = useCryptoPrice(pair);

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (value >= 1) {
      return value.toFixed(4);
    } else {
      return value.toFixed(8);
    }
  };

  const formatPercent = (value: number) => {
    return value.toFixed(2);
  };

  const isPositive = price && price.priceChangePercent >= 0;

  return (
    <div className="price-card">
      <div className="price-card-header">
        <h2>{displayName}</h2>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Live' : '● Disconnected'}
        </div>
      </div>
      
      {price ? (
        <div className="price-card-content">
          <div className="current-price">
            ${formatPrice(price.price)}
          </div>
          
          <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            <span className="change-amount">
              {isPositive ? '+' : ''}{formatPrice(price.priceChange)}
            </span>
            <span className="change-percent">
              ({isPositive ? '+' : ''}{formatPercent(price.priceChangePercent)}%)
            </span>
          </div>
          
          <div className="last-update">
            Last update: {new Date(price.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="price-card-loading">
          <div className="spinner"></div>
          <p>Loading price data...</p>
        </div>
      )}
    </div>
  );
}
