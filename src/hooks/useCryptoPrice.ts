import { useState, useEffect } from 'react';
import { cryptoWebSocketService } from '../services/cryptoWebSocket';
import type { CryptoPrice, TradingPair } from '../types/crypto';

export function useCryptoPrice(pair: TradingPair) {
  const [price, setPrice] = useState<CryptoPrice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(cryptoWebSocketService.isConnected());
    };

    updateConnectionStatus();
    const intervalId = setInterval(updateConnectionStatus, 1000);

    const unsubscribe = cryptoWebSocketService.subscribe(pair, (data) => {
      setPrice(data);
    });

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [pair]);

  return { price, isConnected };
}
