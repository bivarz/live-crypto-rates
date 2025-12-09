import React from "react";
import "./CardFooter.css";

interface CardFooterProps {
  lastUpdate: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ lastUpdate }) => {
  return (
    <div className="card-footer">
      <div className="footer-row">
        <span className="footer-label">Last update:</span>
        <span className="footer-value">{lastUpdate}</span>
      </div>
    </div>
  );
};

export default CardFooter;

