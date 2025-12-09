import {
  formatPrice,
  formatTime,
  getCurrentTime,
  formatDateTimeUTC,
  getCurrencyFromSymbol,
} from "./formatters";

describe("formatters", () => {
  describe("formatPrice", () => {
    it("should return 'N/A' for undefined", () => {
      expect(formatPrice(undefined)).toBe("N/A");
    });

    it("should return 'N/A' for null", () => {
      expect(formatPrice(null as any)).toBe("N/A");
    });

    it("should format prices less than 0.01 with 8 decimal places", () => {
      expect(formatPrice(0.001)).toBe("0.00100000");
      expect(formatPrice(0.0001)).toBe("0.00010000");
    });

    it("should format prices less than 1 with 4 decimal places", () => {
      expect(formatPrice(0.5)).toBe("0.5000");
      expect(formatPrice(0.99)).toBe("0.9900");
    });

    it("should format prices >= 1 with 2 decimal places", () => {
      expect(formatPrice(1)).toBe("1.00");
      expect(formatPrice(100)).toBe("100.00");
      expect(formatPrice(2500.5)).toBe("2,500.50");
      expect(formatPrice(1000000)).toBe("1,000,000.00");
    });

    it("should handle large numbers with commas", () => {
      expect(formatPrice(1234567.89)).toBe("1,234,567.89");
    });
  });

  describe("formatTime", () => {
    it("should return 'N/A' for undefined", () => {
      expect(formatTime(undefined)).toBe("N/A");
    });

    it("should return 'N/A' for 0", () => {
      expect(formatTime(0)).toBe("N/A");
    });

    it("should convert seconds timestamp to milliseconds", () => {
      const seconds = 1700000000;
      const result = formatTime(seconds);
      expect(result).not.toBe("N/A");
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);
    });

    it("should handle millisecond timestamp", () => {
      const milliseconds = 1700000000000;
      const result = formatTime(milliseconds);
      expect(result).not.toBe("N/A");
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);
    });

    it("should return 'N/A' for invalid timestamp", () => {
      expect(formatTime(NaN as any)).toBe("N/A");
    });
  });

  describe("getCurrentTime", () => {
    it("should return a formatted time string", () => {
      const result = getCurrentTime();
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);
    });

    it("should return a string", () => {
      const result = getCurrentTime();
      expect(typeof result).toBe("string");
    });
  });

  describe("formatDateTimeUTC", () => {
    it("should return 'N/A' for undefined", () => {
      expect(formatDateTimeUTC(undefined)).toBe("N/A");
    });

    it("should return 'N/A' for 0", () => {
      expect(formatDateTimeUTC(0)).toBe("N/A");
    });

    it("should format seconds timestamp to UTC datetime", () => {
      const seconds = 1700000000; // 2023-11-15 12:26:40 UTC
      const result = formatDateTimeUTC(seconds);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/);
    });

    it("should format milliseconds timestamp to UTC datetime", () => {
      const milliseconds = 1700000000000;
      const result = formatDateTimeUTC(milliseconds);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/);
    });

    it("should return 'N/A' for invalid timestamp", () => {
      expect(formatDateTimeUTC(NaN as any)).toBe("N/A");
    });

    it("should format date correctly", () => {
      const timestamp = 1700000000000;
      const result = formatDateTimeUTC(timestamp);
      expect(result).toContain("UTC");
      expect(result.split(" ")).toHaveLength(3);
    });
  });

  describe("getCurrencyFromSymbol", () => {
    it("should return 'USDC' for symbols containing USDC", () => {
      expect(getCurrencyFromSymbol("BINANCE:ETHUSDC")).toBe("USDC");
      expect(getCurrencyFromSymbol("ETHUSDC")).toBe("USDC");
    });

    it("should return 'USDT' for symbols containing USDT", () => {
      expect(getCurrencyFromSymbol("BINANCE:ETHUSDT")).toBe("USDT");
      expect(getCurrencyFromSymbol("ETHUSDT")).toBe("USDT");
    });

    it("should return 'BTC' for symbols containing BTC", () => {
      expect(getCurrencyFromSymbol("BINANCE:ETHBTC")).toBe("BTC");
      expect(getCurrencyFromSymbol("ETHBTC")).toBe("BTC");
    });

    it("should return empty string for unknown symbols", () => {
      expect(getCurrencyFromSymbol("UNKNOWN")).toBe("");
      expect(getCurrencyFromSymbol("")).toBe("");
    });
  });
});

