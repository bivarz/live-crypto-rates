import { SYMBOL_MAP, CRYPTO_SYMBOLS } from "./crypto";

describe("crypto constants", () => {
  describe("SYMBOL_MAP", () => {
    it("should contain all expected symbol mappings", () => {
      expect(SYMBOL_MAP["BINANCE:ETHUSDC"]).toBe("ETH/USDC");
      expect(SYMBOL_MAP["BINANCE:ETHUSDT"]).toBe("ETH/USDT");
      expect(SYMBOL_MAP["BINANCE:ETHBTC"]).toBe("ETH/BTC");
    });

    it("should have correct number of mappings", () => {
      expect(Object.keys(SYMBOL_MAP)).toHaveLength(3);
    });

    it("should have all values as display strings", () => {
      Object.values(SYMBOL_MAP).forEach((value) => {
        expect(typeof value).toBe("string");
        expect(value).toContain("/");
      });
    });
  });

  describe("CRYPTO_SYMBOLS", () => {
    it("should contain all symbol keys", () => {
      expect(CRYPTO_SYMBOLS).toContain("BINANCE:ETHUSDC");
      expect(CRYPTO_SYMBOLS).toContain("BINANCE:ETHUSDT");
      expect(CRYPTO_SYMBOLS).toContain("BINANCE:ETHBTC");
    });

    it("should have correct length", () => {
      expect(CRYPTO_SYMBOLS).toHaveLength(3);
    });

    it("should match SYMBOL_MAP keys", () => {
      expect(CRYPTO_SYMBOLS).toEqual(Object.keys(SYMBOL_MAP));
    });

    it("should be an array", () => {
      expect(Array.isArray(CRYPTO_SYMBOLS)).toBe(true);
    });
  });
});

