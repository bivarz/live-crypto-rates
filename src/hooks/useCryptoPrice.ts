import { useState, useEffect } from 'react';
import { cryptoWebSocketService } from '../services/cryptoWebSocket';
import type { CryptoPrice, TradingPair } from '../types/crypto';

export function useCryptoPrice(pair: TradingPair) {
  const [price, setPrice] = useState<CryptoPrice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = cryptoWebSocketService.subscribe(pair, (data) => {
      setPrice(data);
      // Update connection status when we receive data
      setIsConnected(cryptoWebSocketService.isConnected());
    });

    // Check connection status after subscription
    setTimeout(() => {
      setIsConnected(cryptoWebSocketService.isConnected());
    }, 100);

    return () => {
      unsubscribe();
    };
  }, [pair]);

  return { price, isConnected };
}
