import { useMemo } from "react";
import { formatDateTimeUTC } from "../../../utils/formatters";

export const useTimestamp = (timestamp?: number): string => {
  return useMemo(() => {
    if (!timestamp) return "N/A";
    return formatDateTimeUTC(timestamp);
  }, [timestamp]);
};

