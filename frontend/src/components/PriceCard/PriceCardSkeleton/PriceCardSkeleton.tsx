import React from "react";
import "./PriceCardSkeleton.css";

const PriceCardSkeleton: React.FC = () => {
  return (
    <div className="price-card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
      </div>

      <div className="skeleton-body">
        <div className="skeleton-price-row">
          <div className="skeleton-price">
            <div className="skeleton-line skeleton-line-large"></div>
            <div className="skeleton-line skeleton-line-small"></div>
          </div>
          <div className="skeleton-average">
            <div className="skeleton-line skeleton-line-medium"></div>
            <div className="skeleton-line skeleton-line-small"></div>
          </div>
        </div>

        <div className="skeleton-chart">
          <div className="skeleton-chart-bars">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-chart-bar"
                style={{
                  height: `${Math.random() * 40 + 30}%`,
                  animationDelay: `${index * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-line-small"></div>
      </div>
    </div>
  );
};

export default PriceCardSkeleton;
