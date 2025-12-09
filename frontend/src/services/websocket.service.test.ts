import { websocketService, PriceSnapshot, HourlyAverage, PriceUpdate } from "./websocket.service";
import { io } from "socket.io-client";

jest.mock("socket.io-client");

describe("WebSocketService", () => {
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      connected: false,
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    websocketService.disconnect();
  });

  describe("connect", () => {
    it("should create socket connection", () => {
      websocketService.connect();
      expect(io).toHaveBeenCalled();
    });

    it("should not create new connection if already connected", () => {
      mockSocket.connected = true;
      (websocketService as any).socket = mockSocket;

      websocketService.connect();
      expect(io).not.toHaveBeenCalled();
    });

    it("should set up connect event handler", () => {
      websocketService.connect();
      expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
    });

    it("should set up disconnect event handler", () => {
      websocketService.connect();
      expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
    });

    it("should emit getLatestPrices on connect", () => {
      websocketService.connect();
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "connect"
      )?.[1];
      
      if (connectHandler) {
        connectHandler();
        expect(mockSocket.emit).toHaveBeenCalledWith("getLatestPrices");
      }
    });
  });

  describe("disconnect", () => {
    it("should disconnect socket if exists", () => {
      (websocketService as any).socket = mockSocket;
      websocketService.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it("should set socket to null after disconnect", () => {
      (websocketService as any).socket = mockSocket;
      websocketService.disconnect();
      expect((websocketService as any).socket).toBeNull();
    });

    it("should handle disconnect when socket is null", () => {
      (websocketService as any).socket = null;
      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });

  describe("onLatestPrices", () => {
    it("should register callback for latestPrices event", () => {
      (websocketService as any).socket = mockSocket;
      const callback = jest.fn();
      websocketService.onLatestPrices(callback);
      expect(mockSocket.on).toHaveBeenCalledWith("latestPrices", callback);
    });

    it("should not throw when socket is null", () => {
      (websocketService as any).socket = null;
      const callback = jest.fn();
      expect(() => websocketService.onLatestPrices(callback)).not.toThrow();
    });
  });

  describe("onPriceUpdate", () => {
    it("should register callback for priceUpdate event", () => {
      (websocketService as any).socket = mockSocket;
      const callback = jest.fn();
      websocketService.onPriceUpdate(callback);
      expect(mockSocket.on).toHaveBeenCalledWith("priceUpdate", callback);
    });
  });

  describe("onHourlyAverages", () => {
    it("should register callback for hourlyAverages event", () => {
      (websocketService as any).socket = mockSocket;
      const callback = jest.fn();
      websocketService.onHourlyAverages(callback);
      expect(mockSocket.on).toHaveBeenCalledWith("hourlyAverages", callback);
    });
  });

  describe("onHourlyAverageUpdate", () => {
    it("should register callback for hourlyAverageUpdate event", () => {
      (websocketService as any).socket = mockSocket;
      const callback = jest.fn();
      websocketService.onHourlyAverageUpdate(callback);
      expect(mockSocket.on).toHaveBeenCalledWith("hourlyAverageUpdate", callback);
    });
  });

  describe("off", () => {
    it("should remove event listener with callback", () => {
      (websocketService as any).socket = mockSocket;
      const callback = jest.fn();
      websocketService.off("testEvent", callback);
      expect(mockSocket.off).toHaveBeenCalledWith("testEvent", callback);
    });

    it("should remove all listeners for event when no callback provided", () => {
      (websocketService as any).socket = mockSocket;
      websocketService.off("testEvent");
      expect(mockSocket.off).toHaveBeenCalledWith("testEvent");
    });
  });

  describe("isConnected", () => {
    it("should return true when socket is connected", () => {
      mockSocket.connected = true;
      (websocketService as any).socket = mockSocket;
      expect(websocketService.isConnected()).toBe(true);
    });

    it("should return false when socket is not connected", () => {
      mockSocket.connected = false;
      (websocketService as any).socket = mockSocket;
      expect(websocketService.isConnected()).toBe(false);
    });

    it("should return false when socket is null", () => {
      (websocketService as any).socket = null;
      expect(websocketService.isConnected()).toBe(false);
    });
  });

  describe("backend URL configuration", () => {
    it("should use REACT_APP_BACKEND_URL if set", () => {
      const originalEnv = process.env.REACT_APP_BACKEND_URL;
      process.env.REACT_APP_BACKEND_URL = "http://custom-backend:3001";
      
      // Create new instance to test constructor
      const service = new (require("./websocket.service").WebSocketService)();
      expect((service as any).backendUrl).toBe("http://custom-backend:3001");
      
      process.env.REACT_APP_BACKEND_URL = originalEnv;
    });
  });
});

