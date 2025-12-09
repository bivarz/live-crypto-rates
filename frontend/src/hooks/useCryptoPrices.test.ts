import { renderHook, waitFor } from "@testing-library/react";
import { useCryptoPrices } from "./useCryptoPrices";
import { websocketService } from "../services/websocket.service";

jest.mock("../services/websocket.service");

describe("useCryptoPrices", () => {
  let mockSocket: any;
  let latestPricesCallback: any;
  let priceUpdateCallback: any;
  let hourlyAveragesCallback: any;
  let hourlyAverageUpdateCallback: any;
  let connectCallback: any;
  let disconnectCallback: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockSocket = {
      connected: false,
      on: jest.fn((event: string, callback: any) => {
        if (event === "latestPrices") latestPricesCallback = callback;
        if (event === "priceUpdate") priceUpdateCallback = callback;
        if (event === "hourlyAverages") hourlyAveragesCallback = callback;
        if (event === "hourlyAverageUpdate")
          hourlyAverageUpdateCallback = callback;
        if (event === "connect") connectCallback = callback;
        if (event === "disconnect") disconnectCallback = callback;
      }),
      off: jest.fn(),
      emit: jest.fn(),
    };

    (websocketService as any).socket = mockSocket;
    (websocketService.connect as jest.Mock) = jest.fn();
    (websocketService.disconnect as jest.Mock) = jest.fn();
    (websocketService.onLatestPrices as jest.Mock) = jest.fn((callback) => {
      latestPricesCallback = callback;
      mockSocket.on("latestPrices", callback);
    });
    (websocketService.onPriceUpdate as jest.Mock) = jest.fn((callback) => {
      priceUpdateCallback = callback;
      mockSocket.on("priceUpdate", callback);
    });
    (websocketService.onHourlyAverages as jest.Mock) = jest.fn((callback) => {
      hourlyAveragesCallback = callback;
      mockSocket.on("hourlyAverages", callback);
    });
    (websocketService.onHourlyAverageUpdate as jest.Mock) = jest.fn(
      (callback) => {
        hourlyAverageUpdateCallback = callback;
        mockSocket.on("hourlyAverageUpdate", callback);
      }
    );
    (websocketService.off as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useCryptoPrices());

    expect(result.current.prices).toEqual({});
    expect(result.current.hourlyAverages).toEqual({});
    expect(result.current.priceHistory).toEqual({});
    expect(result.current.isConnected).toBe(false);
  });

  it("should call websocketService.connect on mount", () => {
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

  it("should update prices when latestPrices event is received", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const latestPrices = {
      "BINANCE:ETHUSDC": {
        symbol: "BINANCE:ETHUSDC",
        price: 2500,
        timestamp: 1700000000,
      },
    };

    if (latestPricesCallback) {
      latestPricesCallback(latestPrices);
    }

    expect(result.current.prices).toEqual(latestPrices);
  });

  it("should update priceHistory when latestPrices event is received", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const latestPrices = {
      "BINANCE:ETHUSDC": {
        symbol: "BINANCE:ETHUSDC",
        price: 2500,
        timestamp: 1700000000,
      },
    };

    if (latestPricesCallback) {
      latestPricesCallback(latestPrices);
    }

    expect(result.current.priceHistory["BINANCE:ETHUSDC"]).toBeDefined();
    expect(
      result.current.priceHistory["BINANCE:ETHUSDC"][0].price
    ).toBe(2500);
  });

  it("should update prices when priceUpdate event is received", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const update = {
      symbol: "BINANCE:ETHUSDC",
      price: 2600,
      timestamp: 1700000001,
    };

    if (priceUpdateCallback) {
      priceUpdateCallback(update);
    }

    expect(result.current.prices["BINANCE:ETHUSDC"]).toEqual({
      symbol: "BINANCE:ETHUSDC",
      price: 2600,
      timestamp: 1700000001,
    });
  });

  it("should update priceHistory when priceUpdate event is received", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const update = {
      symbol: "BINANCE:ETHUSDC",
      price: 2600,
      timestamp: Date.now() / 1000,
    };

    if (priceUpdateCallback) {
      priceUpdateCallback(update);
    }

    const history = result.current.priceHistory["BINANCE:ETHUSDC"];
    expect(history).toBeDefined();
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1].price).toBe(2600);
  });

  it("should update hourlyAverages when hourlyAverages event is received", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const averages = {
      "BINANCE:ETHUSDC": {
        symbol: "BINANCE:ETHUSDC",
        average: 2500.5,
        hour: "2024-01-01T10:00:00.000Z",
        count: 100,
      },
    };

    if (hourlyAveragesCallback) {
      hourlyAveragesCallback(averages);
    }

    expect(result.current.hourlyAverages).toEqual(averages);
  });

  it("should update hourlyAverages when hourlyAverageUpdate event is received", () => {
    const { result } = renderHook(() => useCryptoPrices());

    const average = {
      symbol: "BINANCE:ETHUSDC",
      average: 2500.5,
      hour: "2024-01-01T10:00:00.000Z",
      count: 100,
    };

    if (hourlyAverageUpdateCallback) {
      hourlyAverageUpdateCallback(average);
    }

    expect(result.current.hourlyAverages["BINANCE:ETHUSDC"]).toEqual(average);
  });

  it("should set isConnected to true when socket connects", () => {
    const { result } = renderHook(() => useCryptoPrices());

    mockSocket.connected = true;
    if (connectCallback) {
      connectCallback();
    }

    expect(result.current.isConnected).toBe(true);
  });

  it("should set isConnected to false when socket disconnects", () => {
    const { result } = renderHook(() => useCryptoPrices());

    mockSocket.connected = true;
    if (connectCallback) {
      connectCallback();
    }

    mockSocket.connected = false;
    if (disconnectCallback) {
      disconnectCallback();
    }

    expect(result.current.isConnected).toBe(false);
  });

  it("should clean up on unmount", () => {
    const { unmount } = renderHook(() => useCryptoPrices());

    unmount();

    expect(websocketService.off).toHaveBeenCalled();
    expect(websocketService.disconnect).toHaveBeenCalled();
  });

  it("should filter old prices from history", () => {
    const { result } = renderHook(() => useCryptoPrices());

    // Add old price (more than 1 hour ago)
    const oldUpdate = {
      symbol: "BINANCE:ETHUSDC",
      price: 2000,
      timestamp: (Date.now() - 2 * 60 * 60 * 1000) / 1000,
    };

    if (priceUpdateCallback) {
      priceUpdateCallback(oldUpdate);
    }

    // Advance time and trigger cleanup
    jest.advanceTimersByTime(60000);

    // Add recent price
    const recentUpdate = {
      symbol: "BINANCE:ETHUSDC",
      price: 2500,
      timestamp: Date.now() / 1000,
    };

    if (priceUpdateCallback) {
      priceUpdateCallback(recentUpdate);
    }

    const history = result.current.priceHistory["BINANCE:ETHUSDC"];
    expect(history).toBeDefined();
    // Should only contain recent prices
    history.forEach((entry) => {
      const entryTime = entry.timestamp < 10000000000 ? entry.timestamp * 1000 : entry.timestamp;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      expect(entryTime).toBeGreaterThanOrEqual(oneHourAgo);
    });
  });
});

