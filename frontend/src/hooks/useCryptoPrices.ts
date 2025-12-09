import { useEffect, useState } from "react";
import {
  websocketService,
  PriceSnapshot,
  HourlyAverage,
  PriceUpdate,
} from "../services/websocket.service";

interface PriceHistoryEntry {
  price: number;
  timestamp: number;
}

interface UseCryptoPricesReturn {
  prices: Record<string, PriceSnapshot>;
  hourlyAverages: Record<string, HourlyAverage>;
  priceHistory: Record<string, PriceHistoryEntry[]>;
  isConnected: boolean;
}

export const useCryptoPrices = (): UseCryptoPricesReturn => {
  const [prices, setPrices] = useState<Record<string, PriceSnapshot>>({});
  const [hourlyAverages, setHourlyAverages] = useState<
    Record<string, HourlyAverage>
  >({});
  const [priceHistory, setPriceHistory] = useState<
    Record<string, PriceHistoryEntry[]>
  >({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    websocketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleLatestPrices = (latestPrices: Record<string, PriceSnapshot>) => {
      setPrices(latestPrices);
      
      setPriceHistory((prev) => {
        const newHistory = { ...prev };
        Object.entries(latestPrices).forEach(([symbol, snapshot]) => {
          const timestamp = snapshot.timestamp < 10000000000 
            ? snapshot.timestamp * 1000 
            : snapshot.timestamp;
          newHistory[symbol] = [{ price: snapshot.price, timestamp }];
        });
        return newHistory;
      });
    };

    const handlePriceUpdate = (update: PriceUpdate) => {
      const timestamp = update.timestamp < 10000000000 ? update.timestamp * 1000 : update.timestamp;
      
      setPrices((prev) => ({
        ...prev,
        [update.symbol]: {
          symbol: update.symbol,
          price: update.price,
          timestamp: update.timestamp,
        },
      }));

      setPriceHistory((prev) => {
        const history = prev[update.symbol] || [];
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        
        const filteredHistory = history.filter((entry) => {
          const entryTs = entry.timestamp < 10000000000 ? entry.timestamp * 1000 : entry.timestamp;
          return entryTs >= oneHourAgo;
        });

        return {
          ...prev,
          [update.symbol]: [...filteredHistory, { price: update.price, timestamp }],
        };
      });
    };

    const handleHourlyAverages = (
      averages: Record<string, HourlyAverage>
    ) => {
      setHourlyAverages(averages);
    };

    const handleHourlyAverageUpdate = (average: HourlyAverage) => {
      setHourlyAverages((prev) => ({
        ...prev,
        [average.symbol]: average,
      }));
    };

    websocketService.onLatestPrices(handleLatestPrices);
    websocketService.onPriceUpdate(handlePriceUpdate);
    websocketService.onHourlyAverages(handleHourlyAverages);
    websocketService.onHourlyAverageUpdate(handleHourlyAverageUpdate);

    const socket = (websocketService as any).socket;
    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      setIsConnected(socket.connected);
    }

    const cleanupInterval = setInterval(() => {
      setPriceHistory((prev) => {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const cleaned: Record<string, PriceHistoryEntry[]> = {};

        Object.entries(prev).forEach(([symbol, history]) => {
          cleaned[symbol] = history.filter((entry) => {
            const entryTs = entry.timestamp < 10000000000 ? entry.timestamp * 1000 : entry.timestamp;
            return entryTs >= oneHourAgo;
          });
        });

        return cleaned;
      });
    }, 60000);

    return () => {
      clearInterval(cleanupInterval);
      websocketService.off("latestPrices", handleLatestPrices);
      websocketService.off("priceUpdate", handlePriceUpdate);
      websocketService.off("hourlyAverages", handleHourlyAverages);
      websocketService.off("hourlyAverageUpdate", handleHourlyAverageUpdate);
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      }
      websocketService.disconnect();
    };
  }, []);

  return {
    prices,
    hourlyAverages,
    priceHistory,
    isConnected,
  };
};

