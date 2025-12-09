import React from "react";
import { useCryptoPrices } from "../../hooks/useCryptoPrices";
import { SYMBOL_MAP, CRYPTO_SYMBOLS } from "../../constants/crypto";
import PriceCard from "../PriceCard/PriceCard";
import PriceCardSkeleton from "../PriceCard/PriceCardSkeleton/PriceCardSkeleton";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const { prices, hourlyAverages, priceHistory, isConnected } =
    useCryptoPrices();

  const hasData = Object.keys(prices).length > 0;
  const isLoading = !isConnected || !hasData;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Real-Time Cryptocurrency Dashboard</h1>
        <div
          className={`connection-status ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          <span className="status-dot"></span>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </header>

      {!isConnected && (
        <div className="loading-toast">
          <div className="loading-spinner"></div>
          <p className="loading-text">Connecting to price feed...</p>
        </div>
      )}

      <div className="price-grid">
        {isLoading
          ? CRYPTO_SYMBOLS.map((symbol) => <PriceCardSkeleton key={symbol} />)
          : CRYPTO_SYMBOLS.map((symbol) => {
              const price = prices[symbol];
              const average = hourlyAverages[symbol];
              const displayName = SYMBOL_MAP[symbol];

              return (
                <PriceCard
                  key={symbol}
                  symbol={displayName}
                  price={price?.price}
                  timestamp={price?.timestamp}
                  hourlyAverage={average?.average}
                  hourlyCount={average?.count}
                  priceHistory={priceHistory[symbol]}
                />
              );
            })}
      </div>
    </div>
  );
};

export default Dashboard;
