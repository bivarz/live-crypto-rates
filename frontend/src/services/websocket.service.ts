import { io, Socket } from "socket.io-client";

export interface PriceSnapshot {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface HourlyAverage {
  symbol: string;
  average: number;
  hour: string;
  count: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private readonly backendUrl: string;

  constructor() {
    const envUrl = process.env.REACT_APP_BACKEND_URL;
    if (envUrl) {
      this.backendUrl = envUrl;
    } else if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      this.backendUrl = "http://localhost:3001";
    } else {
      this.backendUrl = window.location.origin;
    }
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.backendUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Connected to backend");
      this.socket?.emit("getLatestPrices");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from backend");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onLatestPrices(callback: (prices: Record<string, PriceSnapshot>) => void) {
    this.socket?.on("latestPrices", callback);
  }

  onPriceUpdate(callback: (update: PriceUpdate) => void) {
    this.socket?.on("priceUpdate", callback);
  }

  onHourlyAverages(
    callback: (averages: Record<string, HourlyAverage>) => void
  ) {
    this.socket?.on("hourlyAverages", callback);
  }

  onHourlyAverageUpdate(callback: (average: HourlyAverage) => void) {
    this.socket?.on("hourlyAverageUpdate", callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
