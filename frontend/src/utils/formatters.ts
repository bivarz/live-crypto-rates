export const formatPrice = (value?: number): string => {
  if (value === undefined || value === null) return "N/A";
  if (value === 0) {
    return "0.00";
  }
  if (value < 0.01) {
    return value.toFixed(8);
  }
  if (value < 1) {
    return value.toFixed(4);
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatTime = (ts?: number): string => {
  if (!ts) return "N/A";
  const timestamp = ts < 10000000000 ? ts * 1000 : ts;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const formatTimeOnly = (ts?: number): string => {
  if (!ts) return "N/A";
  const timestamp = ts < 10000000000 ? ts * 1000 : ts;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "N/A";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const formatDateTimeUTC = (ts?: number): string => {
  if (!ts) return "N/A";
  const timestamp = ts < 10000000000 ? ts * 1000 : ts;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "N/A";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
};

export const getCurrencyFromSymbol = (symbol: string): string => {
  if (symbol.includes("USDC")) return "USDC";
  if (symbol.includes("USDT")) return "USDT";
  if (symbol.includes("BTC")) return "BTC";
  return "";
};
