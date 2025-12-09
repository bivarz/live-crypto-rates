import React from "react";
import { PriceCardProps } from "../../types/price";
import { usePriceTrend } from "./hooks/usePriceTrend";
import { useTimestamp } from "./hooks/useTimestamp";
import CardHeader from "./CardHeader/CardHeader";
import PriceDisplay from "./PriceDisplay/PriceDisplay";
import HourlyAverage from "./HourlyAverage/HourlyAverage";
import PriceChart from "./PriceChart/PriceChart";
import CardFooter from "./CardFooter/CardFooter";
import "./PriceCard.css";

const PriceCard: React.FC<PriceCardProps> = ({
  symbol,
  price,
  timestamp,
  hourlyAverage,
  hourlyCount,
  priceHistory,
}) => {
  const priceTrend = usePriceTrend(priceHistory);
  const lastUpdate = useTimestamp(timestamp);

  return (
    <div className="price-card">
      <CardHeader symbol={symbol} />

      <div className="price-card-body">
        <div className="price-row">
          <PriceDisplay price={price} trend={priceTrend} />
          <HourlyAverage average={hourlyAverage} count={hourlyCount} />
        </div>

        {priceHistory && priceHistory.length > 0 && (
          <PriceChart data={priceHistory} />
        )}
      </div>

      <CardFooter lastUpdate={lastUpdate} />
    </div>
  );
};

export default PriceCard;
