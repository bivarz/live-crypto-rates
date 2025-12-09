import React, { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatPrice } from "../../../utils/formatters";
import "./PriceChart.css";

interface PriceData {
  price: number;
  timestamp: number;
}

interface PriceChartProps {
  data: PriceData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const sortedData = [...data]
      .map((point) => {
        const ts = point.timestamp < 10000000000 ? point.timestamp * 1000 : point.timestamp;
        return {
          time: ts,
          price: point.price,
          timestamp: ts,
        };
      })
      .filter((point) => point.timestamp >= oneHourAgo)
      .sort((a, b) => a.time - b.time);

    return sortedData;
  }, [data]);

  const isPriceUp = useMemo(() => {
    if (chartData.length < 2) return null;
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    return lastPrice > firstPrice;
  }, [chartData]);

  if (chartData.length === 0) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].value as number;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`Price: ${formatPrice(price)}`}</p>
          <p className="tooltip-time">{formatTime(payload[0].payload.timestamp)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="price-chart">
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            hide
          />
          <YAxis
            domain={["auto", "auto"]}
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPriceUp ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

