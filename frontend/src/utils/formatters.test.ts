import {
  formatPrice,
  formatTime,
  formatTimeOnly,
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

    it("should format very small numbers with 8 decimals", () => {
      expect(formatPrice(0.001)).toBe("0.00100000");
      expect(formatPrice(0.0001)).toBe("0.00010000");
    });

    it("should format small numbers (less than 1) with 4 decimals", () => {
      expect(formatPrice(0.1)).toBe("0.1000");
      expect(formatPrice(0.99)).toBe("0.9900");
    });

    it("should format regular numbers with 2 decimals", () => {
      expect(formatPrice(100)).toBe("100.00");
      expect(formatPrice(1234.56)).toBe("1,234.56");
      expect(formatPrice(3399.8)).toBe("3,399.80");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toBe("0.00");
    });

    it("should format large numbers with commas", () => {
      expect(formatPrice(1000000)).toBe("1,000,000.00");
    });
  });

  describe("formatTime", () => {
    it("should return 'N/A' for undefined", () => {
      expect(formatTime(undefined)).toBe("N/A");
    });

    it("should return 'N/A' for null", () => {
      expect(formatTime(null as any)).toBe("N/A");
    });

    it("should format timestamp in milliseconds", () => {
      const timestamp = new Date("2024-01-01T12:30:45Z").getTime();
      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
    });

    it("should convert timestamp from seconds to milliseconds", () => {
      const timestampSeconds = Math.floor(
        new Date("2024-01-01T12:30:45Z").getTime() / 1000
      );
      const result = formatTime(timestampSeconds);
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
    });

    it("should return 'N/A' for invalid timestamp", () => {
      expect(formatTime(NaN)).toBe("N/A");
    });
  });

  describe("formatTimeOnly", () => {
    it("should return 'N/A' for undefined", () => {
      expect(formatTimeOnly(undefined)).toBe("N/A");
    });

    it("should format timestamp as HH:MM:SS", () => {
      const timestamp = new Date("2024-01-01T12:30:45Z").getTime();
      const result = formatTimeOnly(timestamp);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("should convert timestamp from seconds to milliseconds", () => {
      const timestampSeconds = Math.floor(
        new Date("2024-01-01T12:30:45Z").getTime() / 1000
      );
      const result = formatTimeOnly(timestampSeconds);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("should return 'N/A' for invalid timestamp", () => {
      expect(formatTimeOnly(NaN)).toBe("N/A");
    });
  });

  describe("getCurrentTime", () => {
    it("should return a formatted time string", () => {
      const result = getCurrentTime();
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
    });
  });

  describe("formatDateTimeUTC", () => {
    it("should return 'N/A' for undefined", () => {
      expect(formatDateTimeUTC(undefined)).toBe("N/A");
    });

    it("should format timestamp in UTC format", () => {
      const timestamp = new Date("2024-01-15T12:30:45Z").getTime();
      const result = formatDateTimeUTC(timestamp);
      expect(result).toBe("2024-01-15 12:30:45 UTC");
    });

    it("should convert timestamp from seconds to milliseconds", () => {
      const timestampSeconds = Math.floor(
        new Date("2024-01-15T12:30:45Z").getTime() / 1000
      );
      const result = formatDateTimeUTC(timestampSeconds);
      expect(result).toBe("2024-01-15 12:30:45 UTC");
    });

    it("should pad single digit month and day", () => {
      const timestamp = new Date("2024-01-05T09:05:03Z").getTime();
      const result = formatDateTimeUTC(timestamp);
      expect(result).toBe("2024-01-05 09:05:03 UTC");
    });

    it("should return 'N/A' for invalid timestamp", () => {
      expect(formatDateTimeUTC(NaN)).toBe("N/A");
    });
  });

  describe("getCurrencyFromSymbol", () => {
    it("should extract USDC from symbol", () => {
      expect(getCurrencyFromSymbol("ETH/USDC")).toBe("USDC");
      expect(getCurrencyFromSymbol("BINANCE:ETHUSDC")).toBe("USDC");
      expect(getCurrencyFromSymbol("USDC")).toBe("USDC");
    });

    it("should extract USDT from symbol", () => {
      expect(getCurrencyFromSymbol("ETH/USDT")).toBe("USDT");
      expect(getCurrencyFromSymbol("BINANCE:ETHUSDT")).toBe("USDT");
      expect(getCurrencyFromSymbol("USDT")).toBe("USDT");
    });

    it("should extract BTC from symbol", () => {
      expect(getCurrencyFromSymbol("ETH/BTC")).toBe("BTC");
      expect(getCurrencyFromSymbol("BINANCE:ETHBTC")).toBe("BTC");
      expect(getCurrencyFromSymbol("BTC")).toBe("BTC");
    });

    it("should return empty string for unknown symbol", () => {
      expect(getCurrencyFromSymbol("ETH/DOGE")).toBe("");
      expect(getCurrencyFromSymbol("UNKNOWN")).toBe("");
    });

    it("should return first matching currency", () => {
      expect(getCurrencyFromSymbol("BTCUSDC")).toBe("USDC");
    });
  });
});

