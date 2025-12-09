import { useState, useEffect, useMemo } from "react";
import { formatDateTimeUTC } from "../../../utils/formatters";

export const useTimestamp = (timestamp?: number): string => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!timestamp) return "N/A";
    const lastUpdate = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const elapsedMs = currentTime - lastUpdate;
    const displayTimestamp = lastUpdate + elapsedMs;
    return formatDateTimeUTC(displayTimestamp);
  }, [timestamp, currentTime]);
};
