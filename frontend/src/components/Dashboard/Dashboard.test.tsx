import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useCryptoPrices } from "../../hooks/useCryptoPrices";
import { CRYPTO_SYMBOLS, SYMBOL_MAP } from "../../constants/crypto";

jest.mock("../../hooks/useCryptoPrices");
jest.mock("../PriceCard/PriceCard", () => {
  return function MockPriceCard(props: any) {
    return (
      <div data-testid={`price-card-${props.symbol}`}>
        <div data-testid="card-symbol">{props.symbol}</div>
        <div data-testid="card-price">{props.price}</div>
        <div data-testid="card-timestamp">{props.timestamp}</div>
        <div data-testid="card-average">{props.hourlyAverage}</div>
        <div data-testid="card-count">{props.hourlyCount}</div>
      </div>
    );
  };
});

const mockUseCryptoPrices = useCryptoPrices as jest.MockedFunction<
  typeof useCryptoPrices
>;

describe("Dashboard", () => {
  const mockPrices = {
    "BINANCE:ETHUSDC": {
      symbol: "BINANCE:ETHUSDC",
      price: 3400.5,
      timestamp: 1700000000000,
    },
    "BINANCE:ETHUSDT": {
      symbol: "BINANCE:ETHUSDT",
      price: 3401.2,
      timestamp: 1700000001000,
    },
    "BINANCE:ETHBTC": {
      symbol: "BINANCE:ETHBTC",
      price: 0.065432,
      timestamp: 1700000002000,
    },
  };

  const mockHourlyAverages = {
    "BINANCE:ETHUSDC": {
      symbol: "BINANCE:ETHUSDC",
      average: 3399.8,
      hour: "2024-01-01T00:00:00.000Z",
      count: 1043,
    },
    "BINANCE:ETHUSDT": {
      symbol: "BINANCE:ETHUSDT",
      average: 3400.1,
      hour: "2024-01-01T00:00:00.000Z",
      count: 1050,
    },
    "BINANCE:ETHBTC": {
      symbol: "BINANCE:ETHBTC",
      average: 0.0654,
      hour: "2024-01-01T00:00:00.000Z",
      count: 980,
    },
  };

  const mockPriceHistory = {
    "BINANCE:ETHUSDC": [
      { price: 3400.0, timestamp: 1700000000000 },
      { price: 3400.5, timestamp: 1700000001000 },
    ],
    "BINANCE:ETHUSDT": [
      { price: 3401.0, timestamp: 1700000000000 },
      { price: 3401.2, timestamp: 1700000001000 },
    ],
    "BINANCE:ETHBTC": [
      { price: 0.0654, timestamp: 1700000000000 },
      { price: 0.065432, timestamp: 1700000001000 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render dashboard title", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: {},
      hourlyAverages: {},
      priceHistory: {},
      isConnected: false,
    });

    render(<Dashboard />);
    expect(
      screen.getByText("Real-Time Cryptocurrency Dashboard")
    ).toBeInTheDocument();
  });

  it("should display connected status when connected", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: {},
      hourlyAverages: {},
      priceHistory: {},
      isConnected: true,
    });

    render(<Dashboard />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
    const statusElement = screen.getByText("Connected").closest("div");
    expect(statusElement).toHaveClass("connected");
  });

  it("should display disconnected status when not connected", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: {},
      hourlyAverages: {},
      priceHistory: {},
      isConnected: false,
    });

    render(<Dashboard />);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
    const statusElement = screen.getByText("Disconnected").closest("div");
    expect(statusElement).toHaveClass("disconnected");
  });

  it("should render all price cards for each crypto symbol", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: mockPrices,
      hourlyAverages: mockHourlyAverages,
      priceHistory: mockPriceHistory,
      isConnected: true,
    });

    render(<Dashboard />);

    CRYPTO_SYMBOLS.forEach((symbol) => {
      const displayName = SYMBOL_MAP[symbol];
      expect(screen.getByTestId(`price-card-${displayName}`)).toBeInTheDocument();
    });
  });

  it("should pass correct props to PriceCard components", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: mockPrices,
      hourlyAverages: mockHourlyAverages,
      priceHistory: mockPriceHistory,
      isConnected: true,
    });

    render(<Dashboard />);

    const ethUsdcCard = screen.getByTestId("price-card-ETH/USDC");
    expect(ethUsdcCard).toBeInTheDocument();
    
    const symbols = screen.getAllByTestId("card-symbol");
    expect(symbols[0]).toHaveTextContent("ETH/USDC");
    
    const prices = screen.getAllByTestId("card-price");
    expect(prices[0]).toHaveTextContent("3400.5");
  });

  it("should handle missing price data gracefully", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: {
        "BINANCE:ETHUSDC": mockPrices["BINANCE:ETHUSDC"],
      },
      hourlyAverages: {
        "BINANCE:ETHUSDC": mockHourlyAverages["BINANCE:ETHUSDC"],
      },
      priceHistory: {
        "BINANCE:ETHUSDC": mockPriceHistory["BINANCE:ETHUSDC"],
      },
      isConnected: true,
    });

    render(<Dashboard />);

    expect(screen.getByTestId("price-card-ETH/USDC")).toBeInTheDocument();
    expect(screen.getByTestId("price-card-ETH/USDT")).toBeInTheDocument();
    expect(screen.getByTestId("price-card-ETH/BTC")).toBeInTheDocument();
  });

  it("should handle empty data state", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: {},
      hourlyAverages: {},
      priceHistory: {},
      isConnected: false,
    });

    render(<Dashboard />);

    CRYPTO_SYMBOLS.forEach((symbol) => {
      const displayName = SYMBOL_MAP[symbol];
      expect(screen.getByTestId(`price-card-${displayName}`)).toBeInTheDocument();
    });
  });

  it("should render correct number of price cards", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: mockPrices,
      hourlyAverages: mockHourlyAverages,
      priceHistory: mockPriceHistory,
      isConnected: true,
    });

    render(<Dashboard />);

    const priceCards = screen.getAllByTestId(/price-card-/);
    expect(priceCards).toHaveLength(CRYPTO_SYMBOLS.length);
  });

  it("should update when hook returns new data", () => {
    mockUseCryptoPrices.mockReturnValue({
      prices: {},
      hourlyAverages: {},
      priceHistory: {},
      isConnected: false,
    });

    const { rerender } = render(<Dashboard />);

    expect(screen.getByText("Disconnected")).toBeInTheDocument();

    mockUseCryptoPrices.mockReturnValue({
      prices: mockPrices,
      hourlyAverages: mockHourlyAverages,
      priceHistory: mockPriceHistory,
      isConnected: true,
    });

    rerender(<Dashboard />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByTestId("price-card-ETH/USDC")).toBeInTheDocument();
  });
});

