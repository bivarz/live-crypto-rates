import React from "react";
import { formatPrice } from "../../../utils/formatters";
import { PriceTrend } from "../hooks/usePriceTrend";
import "./PriceDisplay.css";

interface PriceDisplayProps {
  price?: number;
  trend: PriceTrend;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, trend }) => {
  return (
    <div className="price-display">
      <label className="price-label">Current Price</label>
      <div
        className={`price-value ${
          trend === "up"
            ? "price-up"
            : trend === "down"
            ? "price-down"
            : ""
        }`}
      >
        {formatPrice(price)}
      </div>
    </div>
  );
};

export default PriceDisplay;

