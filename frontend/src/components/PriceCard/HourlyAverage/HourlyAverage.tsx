import React from "react";
import { formatPrice } from "../../../utils/formatters";
import "./HourlyAverage.css";

interface HourlyAverageProps {
  average?: number;
  count?: number;
}

const HourlyAverage: React.FC<HourlyAverageProps> = ({ average, count }) => {
  return (
    <div className="hourly-average">
      <label className="average-label">Hourly Average</label>
      <div className="average-value">{formatPrice(average)}</div>
      {count !== undefined && (
        <div className="average-count">
          Based on {count} data points
        </div>
      )}
    </div>
  );
};

export default HourlyAverage;

