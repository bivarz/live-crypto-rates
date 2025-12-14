import { renderHook, act } from "@testing-library/react";
import { useCryptoPrices } from "./useCryptoPrices";
import { websocketService } from "../services/websocket.service";
import { PriceSnapshot, HourlyAverage, PriceUpdate } from "../services/websocket.service";

jest.mock("../services/websocket.service", () => ({
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    onLatestPrices: jest.fn(),
    onPriceUpdate: jest.fn(),
    onHourlyAverages: jest.fn(),
    onHourlyAverageUpdate: jest.fn(),
    off: jest.fn(),
    socket: null,
  },
}));

describe("useCryptoPrices", () => {
  let latestPricesCallback: (prices: Record<string, PriceSnapshot>) => void;
  let priceUpdateCallback: (update: PriceUpdate) => void;
  let hourlyAveragesCallback: (averages: Record<string, HourlyAverage>) => void;
  let hourlyAverageUpdateCallback: (average: HourlyAverage) => void;
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockSocket = {
      connected: false,
      on: jest.fn(),
      off: jest.fn(),
    };

    (websocketService as any).socket = mockSocket;

    (websocketService.onLatestPrices as jest.Mock).mockImplementation(
      (callback) => {
        latestPricesCallback = callback;
      }
    );
    (websocketService.onPriceUpdate as jest.Mock).mockImplementation(
      (callback) => {
        priceUpdateCallback = callback;
      }
    );
    (websocketService.onHourlyAverages as jest.Mock).mockImplementation(
      (callback) => {
        hourlyAveragesCallback = callback;
      }
    );
    (websocketService.onHourlyAverageUpdate as jest.Mock).mockImplementation(
      (callback) => {
        hourlyAverageUpdateCallback = callback;
      }
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useCryptoPrices());

    expect(result.current.prices).toEqual({});
    expect(result.current.hourlyAverages).toEqual({});
    expect(result.current.priceHistory).toEqual({});
    expect(result.current.isConnected).toBe(false);
  });

  it("should connect websocket service on mount", () => {
    renderHook(() => useCryptoPrices());

    expect(websocketService.connect).toHaveBeenCalled();
  });

  it("should register event handlers", () => {
    renderHook(() => useCryptoPrices());

    expect(websocketService.onLatestPrices).toHaveBeenCalled();
    expect(websocketService.onPriceUpdate).toHaveBeenCalled();
    expect(websocketService.onHourlyAverages).toHaveBeenCalled();
    expect(websocketService.onHourlyAverageUpdate).toHaveBeenCalled();
  });

  it("should handle latestPrices event", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const mockPrices: Record<string, PriceSnapshot> = {
      "BINANCE:ETHUSDC": {
        symbol: "BINANCE:ETHUSDC",
        price: 3400.5,
        timestamp: 1704110400000,
      },
    };

    act(() => {
      latestPricesCallback(mockPrices);
    });

    expect(result.current.prices).toEqual(mockPrices);
    expect(result.current.priceHistory["BINANCE:ETHUSDC"]).toEqual([
      { price: 3400.5, timestamp: 1704110400000 },
    ]);
  });

  it("should convert timestamp from seconds to milliseconds in latestPrices", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const mockPrices: Record<string, PriceSnapshot> = {
      "BINANCE:ETHUSDC": {
        symbol: "BINANCE:ETHUSDC",
        price: 3400.5,
        timestamp: 1704110400,
      },
    };

    act(() => {
      latestPricesCallback(mockPrices);
    });

    expect(result.current.priceHistory["BINANCE:ETHUSDC"]).toEqual([
      { price: 3400.5, timestamp: 1704110400000 },
    ]);
  });

  it("should handle priceUpdate event", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const update: PriceUpdate = {
      symbol: "BINANCE:ETHUSDC",
      price: 3401.0,
      timestamp: 1704110500000,
    };

    act(() => {
      priceUpdateCallback(update);
    });

    expect(result.current.prices["BINANCE:ETHUSDC"]).toEqual({
      symbol: "BINANCE:ETHUSDC",
      price: 3401.0,
      timestamp: 1704110500000,
    });

    expect(result.current.priceHistory["BINANCE:ETHUSDC"]).toEqual([
      { price: 3401.0, timestamp: 1704110500000 },
    ]);
  });

  it("should append to price history on priceUpdate", () => {
    const { result } = renderHook(() => useCryptoPrices());

    act(() => {
      priceUpdateCallback({
        symbol: "BINANCE:ETHUSDC",
        price: 3400.0,
        timestamp: Date.now() - 10000,
      });
    });

    act(() => {
      priceUpdateCallback({
        symbol: "BINANCE:ETHUSDC",
        price: 3401.0,
        timestamp: Date.now(),
      });
    });

    expect(result.current.priceHistory["BINANCE:ETHUSDC"].length).toBe(2);
  });

  it("should filter old price history entries (older than 1 hour)", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;

    act(() => {
      priceUpdateCallback({
        symbol: "BINANCE:ETHUSDC",
        price: 3400.0,
        timestamp: twoHoursAgo,
      });
    });

    act(() => {
      priceUpdateCallback({
        symbol: "BINANCE:ETHUSDC",
        price: 3401.0,
        timestamp: now,
      });
    });

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    const history = result.current.priceHistory["BINANCE:ETHUSDC"];
    expect(history.length).toBe(1);
    expect(history[0].price).toBe(3401.0);
  });

  it("should handle hourlyAverages event", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const mockAverages: Record<string, HourlyAverage> = {
      "BINANCE:ETHUSDC": {
        symbol: "BINANCE:ETHUSDC",
        average: 3399.8,
        hour: "2024-01-01-12",
        count: 1043,
      },
    };

    act(() => {
      hourlyAveragesCallback(mockAverages);
    });

    expect(result.current.hourlyAverages).toEqual(mockAverages);
  });

  it("should handle hourlyAverageUpdate event", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const average: HourlyAverage = {
      symbol: "BINANCE:ETHUSDC",
      average: 3400.0,
      hour: "2024-01-01-13",
      count: 1100,
    };

    act(() => {
      hourlyAverageUpdateCallback(average);
    });

    expect(result.current.hourlyAverages["BINANCE:ETHUSDC"]).toEqual(average);
  });

  it("should update isConnected when socket connects", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === "connect"
    )?.[1];

    act(() => {
      connectHandler();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("should update isConnected when socket disconnects", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === "disconnect"
    )?.[1];

    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === "connect"
    )?.[1];

    act(() => {
      connectHandler();
    });

    expect(result.current.isConnected).toBe(true);

    act(() => {
      disconnectHandler();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it("should clean up on unmount", () => {
    const { unmount } = renderHook(() => useCryptoPrices());

    unmount();

    expect(websocketService.off).toHaveBeenCalledTimes(4);
    expect(websocketService.disconnect).toHaveBeenCalled();
  });

  it("should clear cleanup interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useCryptoPrices());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

