import { websocketService } from "./websocket.service";
import { io } from "socket.io-client";

jest.mock("socket.io-client");

describe("WebSocketService", () => {
  let mockSocket: any;
  const mockIo = io as jest.MockedFunction<typeof io>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      connected: false,
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
    mockIo.mockReturnValue(mockSocket as any);

    (websocketService as any).socket = null;
    const originalHostname = window.location.hostname;
    if (originalHostname === "localhost" || originalHostname === "127.0.0.1") {
      Object.defineProperty(websocketService, "backendUrl", {
        value: "http://localhost:3001",
        writable: true,
        configurable: true,
      });
    } else {
      Object.defineProperty(websocketService, "backendUrl", {
        value: window.location.origin,
        writable: true,
        configurable: true,
      });
    }
  });

  describe("connect", () => {
    it("should connect using environment URL when REACT_APP_BACKEND_URL is set", () => {
      (websocketService as any).socket = null;
      Object.defineProperty(websocketService, "backendUrl", {
        value: "http://custom-backend:3001",
        writable: true,
        configurable: true,
      });

      websocketService.connect();

      expect(mockIo).toHaveBeenCalledWith("http://custom-backend:3001", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    });

    it("should connect to localhost when hostname is localhost", () => {
      const originalHostname = window.location.hostname;
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });

      delete (process.env as any).REACT_APP_BACKEND_URL;
      websocketService.connect();

      expect(mockIo).toHaveBeenCalledWith("http://localhost:3001", expect.any(Object));

      Object.defineProperty(window, "location", {
        value: { hostname: originalHostname },
        writable: true,
      });
    });

    it("should not reconnect if already connected", () => {
      websocketService.connect();
      (websocketService as any).socket.connected = true;
      mockIo.mockClear();

      websocketService.connect();

      expect(mockIo).not.toHaveBeenCalled();
    });

    it("should set up event listeners on connect", () => {
      websocketService.connect();

      expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
    });

    it("should emit getLatestPrices when connected", () => {
      websocketService.connect();

      const connectCallback = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "connect"
      )?.[1];

      expect(connectCallback).toBeDefined();
      connectCallback();
      expect(mockSocket.emit).toHaveBeenCalledWith("getLatestPrices");
    });
  });

  describe("disconnect", () => {
    it("should disconnect socket if it exists", () => {
      websocketService.connect();
      websocketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect((websocketService as any).socket).toBeNull();
    });

    it("should handle disconnect when socket is null", () => {
      (websocketService as any).socket = null;
      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });

  describe("onLatestPrices", () => {
    it("should register callback for latestPrices event", () => {
      websocketService.connect();
      const callback = jest.fn();

      websocketService.onLatestPrices(callback);

      expect(mockSocket.on).toHaveBeenCalledWith("latestPrices", callback);
    });

    it("should not register callback if socket is null", () => {
      (websocketService as any).socket = null;
      const callback = jest.fn();

      websocketService.onLatestPrices(callback);

      expect(mockSocket.on).not.toHaveBeenCalled();
    });
  });

  describe("onPriceUpdate", () => {
    it("should register callback for priceUpdate event", () => {
      websocketService.connect();
      const callback = jest.fn();

      websocketService.onPriceUpdate(callback);

      expect(mockSocket.on).toHaveBeenCalledWith("priceUpdate", callback);
    });
  });

  describe("onHourlyAverages", () => {
    it("should register callback for hourlyAverages event", () => {
      websocketService.connect();
      const callback = jest.fn();

      websocketService.onHourlyAverages(callback);

      expect(mockSocket.on).toHaveBeenCalledWith("hourlyAverages", callback);
    });
  });

  describe("onHourlyAverageUpdate", () => {
    it("should register callback for hourlyAverageUpdate event", () => {
      websocketService.connect();
      const callback = jest.fn();

      websocketService.onHourlyAverageUpdate(callback);

      expect(mockSocket.on).toHaveBeenCalledWith("hourlyAverageUpdate", callback);
    });
  });

  describe("off", () => {
    it("should unregister callback with callback parameter", () => {
      websocketService.connect();
      const callback = jest.fn();

      websocketService.off("latestPrices", callback);

      expect(mockSocket.off).toHaveBeenCalledWith("latestPrices", callback);
    });

    it("should unregister all callbacks for event without callback parameter", () => {
      websocketService.connect();

      websocketService.off("latestPrices");

      expect(mockSocket.off).toHaveBeenCalledWith("latestPrices");
    });
  });

  describe("isConnected", () => {
    it("should return true when socket is connected", () => {
      websocketService.connect();
      mockSocket.connected = true;

      expect(websocketService.isConnected()).toBe(true);
    });

    it("should return false when socket is not connected", () => {
      websocketService.connect();
      mockSocket.connected = false;

      expect(websocketService.isConnected()).toBe(false);
    });

    it("should return false when socket is null", () => {
      (websocketService as any).socket = null;

      expect(websocketService.isConnected()).toBe(false);
    });
  });
});

