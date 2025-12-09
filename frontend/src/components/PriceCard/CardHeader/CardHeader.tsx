import React from "react";
import "./CardHeader.css";

interface CardHeaderProps {
  symbol: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ symbol }) => {
  return (
    <div className="card-header">
      <h2 className="symbol">{symbol}</h2>
    </div>
  );
};

export default CardHeader;

