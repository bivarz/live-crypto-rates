import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCryptoPrice } from '../hooks/useCryptoPrice';
import type { TradingPair } from '../types/crypto';
import './PriceChart.css';

interface PriceChartProps {
  pair: TradingPair;
  displayName: string;
}

interface ChartData {
  time: string;
  price: number;
  timestamp: number;
}

const MAX_DATA_POINTS = 50;

export function PriceChart({ pair, displayName }: PriceChartProps) {
  const { price } = useCryptoPrice(pair);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const dataRef = useRef<ChartData[]>([]);

  useEffect(() => {
    if (price) {
      const newDataPoint: ChartData = {
        time: new Date(price.timestamp).toLocaleTimeString(),
        price: price.price,
        timestamp: price.timestamp,
      };

      // Update ref to avoid stale closure
      dataRef.current = [...dataRef.current, newDataPoint];
      
      // Keep only last MAX_DATA_POINTS
      if (dataRef.current.length > MAX_DATA_POINTS) {
        dataRef.current = dataRef.current.slice(-MAX_DATA_POINTS);
      }

      setChartData([...dataRef.current]);
    }
  }, [price]);

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="price-chart">
      <h3>{displayName} - Price History</h3>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
              formatter={(value: number) => [`$${value.toFixed(value >= 1 ? 2 : 6)}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Collecting price data...</p>
        </div>
      )}
    </div>
  );
}
