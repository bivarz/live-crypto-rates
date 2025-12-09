import { renderHook } from "@testing-library/react";
import { usePriceTrend } from "./usePriceTrend";

describe("usePriceTrend", () => {
  it("should return null when priceHistory is undefined", () => {
    const { result } = renderHook(() => usePriceTrend(undefined));
    expect(result.current).toBe(null);
  });

  it("should return null when priceHistory is empty", () => {
    const { result } = renderHook(() => usePriceTrend([]));
    expect(result.current).toBe(null);
  });

  it("should return null when priceHistory has only one entry", () => {
    const priceHistory = [{ price: 3400, timestamp: 1700000000000 }];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe(null);
  });

  it("should return 'up' when price increased", () => {
    const priceHistory = [
      { price: 3400, timestamp: 1700000000000 },
      { price: 3500, timestamp: 1700000001000 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe("up");
  });

  it("should return 'down' when price decreased", () => {
    const priceHistory = [
      { price: 3500, timestamp: 1700000000000 },
      { price: 3400, timestamp: 1700000001000 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe("down");
  });

  it("should return null when price remained the same", () => {
    const priceHistory = [
      { price: 3400, timestamp: 1700000000000 },
      { price: 3400, timestamp: 1700000001000 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe(null);
  });

  it("should handle unsorted price history", () => {
    const priceHistory = [
      { price: 3500, timestamp: 1700000001000 },
      { price: 3400, timestamp: 1700000000000 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe("up");
  });

  it("should handle timestamp in seconds and convert to milliseconds", () => {
    const priceHistory = [
      { price: 3400, timestamp: 1700000000 },
      { price: 3500, timestamp: 1700000001 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe("up");
  });

  it("should handle multiple price points correctly", () => {
    const priceHistory = [
      { price: 3400, timestamp: 1700000000000 },
      { price: 3450, timestamp: 1700000001000 },
      { price: 3500, timestamp: 1700000002000 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe("up");
  });

  it("should handle price decrease with multiple points", () => {
    const priceHistory = [
      { price: 3500, timestamp: 1700000000000 },
      { price: 3450, timestamp: 1700000001000 },
      { price: 3400, timestamp: 1700000002000 },
    ];
    const { result } = renderHook(() => usePriceTrend(priceHistory));
    expect(result.current).toBe("down");
  });
});

