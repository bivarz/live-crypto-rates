import { useMemo } from "react";

interface PriceHistoryEntry {
  price: number;
  timestamp: number;
}

export type PriceTrend = "up" | "down" | null;

export const usePriceTrend = (
  priceHistory?: PriceHistoryEntry[]
): PriceTrend => {
  return useMemo(() => {
    if (!priceHistory || priceHistory.length < 2) return null;

    const sortedHistory = [...priceHistory]
      .map((point) => ({
        timestamp:
          point.timestamp < 10000000000
            ? point.timestamp * 1000
            : point.timestamp,
        price: point.price,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const firstPrice = sortedHistory[0].price;
    const lastPrice = sortedHistory[sortedHistory.length - 1].price;

    if (lastPrice > firstPrice) return "up";
    if (lastPrice < firstPrice) return "down";
    return null;
  }, [priceHistory]);
};
