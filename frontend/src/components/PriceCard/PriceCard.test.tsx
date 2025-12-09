import React from "react";
import { render, screen } from "@testing-library/react";
import PriceCard from "./PriceCard";
import { usePriceTrend } from "./hooks/usePriceTrend";
import { useTimestamp } from "./hooks/useTimestamp";

jest.mock("./hooks/usePriceTrend");
jest.mock("./hooks/useTimestamp");
jest.mock("./CardHeader/CardHeader", () => {
  return function MockCardHeader({ symbol }: { symbol: string }) {
    return <div data-testid="card-header">{symbol}</div>;
  };
});
jest.mock("./PriceDisplay/PriceDisplay", () => {
  return function MockPriceDisplay({
    price,
    trend,
  }: {
    price?: number;
    trend: string | null;
  }) {
    return (
      <div data-testid="price-display">
        <span data-testid="display-price">{price}</span>
        <span data-testid="display-trend">{trend}</span>
      </div>
    );
  };
});
jest.mock("./HourlyAverage/HourlyAverage", () => {
  return function MockHourlyAverage({
    average,
    count,
  }: {
    average?: number;
    count?: number;
  }) {
    return (
      <div data-testid="hourly-average">
        <span data-testid="avg-value">{average}</span>
        <span data-testid="avg-count">{count}</span>
      </div>
    );
  };
});
jest.mock("./PriceChart/PriceChart", () => {
  return function MockPriceChart({ data }: { data: Array<any> }) {
    return <div data-testid="price-chart">{data.length} points</div>;
  };
});
jest.mock("./CardFooter/CardFooter", () => {
  return function MockCardFooter({ lastUpdate }: { lastUpdate: string }) {
    return <div data-testid="card-footer">{lastUpdate}</div>;
  };
});

const mockUsePriceTrend = usePriceTrend as jest.MockedFunction<
  typeof usePriceTrend
>;
const mockUseTimestamp = useTimestamp as jest.MockedFunction<
  typeof useTimestamp
>;

describe("PriceCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePriceTrend.mockReturnValue(null);
    mockUseTimestamp.mockReturnValue("2024-01-01 12:00:00 UTC");
  });

  it("should render all child components", () => {
    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
        hourlyCount={1043}
        priceHistory={[]}
      />
    );

    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("price-display")).toBeInTheDocument();
    expect(screen.getByTestId("hourly-average")).toBeInTheDocument();
    expect(screen.getByTestId("card-footer")).toBeInTheDocument();
  });

  it("should pass correct props to child components", () => {
    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
        hourlyCount={1043}
        priceHistory={[]}
      />
    );

    expect(screen.getByTestId("card-header")).toHaveTextContent("ETH/USDC");
    expect(screen.getByTestId("display-price")).toHaveTextContent("3400.5");
    expect(screen.getByTestId("avg-value")).toHaveTextContent("3399.8");
    expect(screen.getByTestId("avg-count")).toHaveTextContent("1043");
  });

  it("should call usePriceTrend with priceHistory", () => {
    const priceHistory = [
      { price: 3400, timestamp: 1700000000000 },
      { price: 3500, timestamp: 1700000001000 },
    ];

    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
        priceHistory={priceHistory}
      />
    );

    expect(mockUsePriceTrend).toHaveBeenCalledWith(priceHistory);
  });

  it("should call useTimestamp with timestamp", () => {
    const timestamp = 1700000000000;

    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={timestamp}
        hourlyAverage={3399.8}
      />
    );

    expect(mockUseTimestamp).toHaveBeenCalledWith(timestamp);
  });

  it("should render PriceChart when priceHistory has data", () => {
    const priceHistory = [
      { price: 3400, timestamp: 1700000000000 },
      { price: 3500, timestamp: 1700000001000 },
    ];

    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
        priceHistory={priceHistory}
      />
    );

    expect(screen.getByTestId("price-chart")).toBeInTheDocument();
    expect(screen.getByTestId("price-chart")).toHaveTextContent("2 points");
  });

  it("should not render PriceChart when priceHistory is empty", () => {
    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
        priceHistory={[]}
      />
    );

    expect(screen.queryByTestId("price-chart")).not.toBeInTheDocument();
  });

  it("should not render PriceChart when priceHistory is undefined", () => {
    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
      />
    );

    expect(screen.queryByTestId("price-chart")).not.toBeInTheDocument();
  });

  it("should pass priceTrend to PriceDisplay", () => {
    mockUsePriceTrend.mockReturnValue("up");

    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
        priceHistory={[
          { price: 3400, timestamp: 1700000000000 },
          { price: 3500, timestamp: 1700000001000 },
        ]}
      />
    );

    expect(screen.getByTestId("display-trend")).toHaveTextContent("up");
  });

  it("should pass lastUpdate to CardFooter", () => {
    const lastUpdate = "2024-01-01 12:00:00 UTC";
    mockUseTimestamp.mockReturnValue(lastUpdate);

    render(
      <PriceCard
        symbol="ETH/USDC"
        price={3400.5}
        timestamp={1700000000000}
        hourlyAverage={3399.8}
      />
    );

    expect(screen.getByTestId("card-footer")).toHaveTextContent(lastUpdate);
  });

  it("should handle optional props", () => {
    render(
      <PriceCard
        symbol="ETH/USDC"
        price={undefined}
        timestamp={undefined}
        hourlyAverage={undefined}
        hourlyCount={undefined}
      />
    );

    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("price-display")).toBeInTheDocument();
    expect(screen.getByTestId("hourly-average")).toBeInTheDocument();
  });
});

