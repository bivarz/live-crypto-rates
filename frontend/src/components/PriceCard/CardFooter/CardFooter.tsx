import React from "react";
import { formatPrice, getCurrencyFromSymbol } from "../../../utils/formatters";
import "./CardFooter.css";

interface CardFooterProps {
  lastUpdate: string;
  hourlyAverage?: number;
  symbol?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({
  lastUpdate,
  hourlyAverage,
  symbol
}) => {
  const currencySymbol = symbol ? getCurrencyFromSymbol(symbol) : null;
  const averageText = hourlyAverage !== undefined && currencySymbol
    ? `1h AVG ${formatPrice(hourlyAverage)} ${currencySymbol}`
    : null;

  return (
    <div className="card-footer">
      <div className="footer-row">
        <span className="footer-label">Last update:</span>
        <span className="footer-value">{lastUpdate}</span>
      </div>
      {averageText && (
        <div className="footer-row">
          <span className="footer-value footer-avg">{averageText}</span>
        </div>
      )}
    </div>
  );
};

export default CardFooter;

