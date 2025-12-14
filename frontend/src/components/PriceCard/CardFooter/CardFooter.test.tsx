import React from "react";
import { render, screen } from "@testing-library/react";
import CardFooter from "./CardFooter";
import { formatPrice, getCurrencyFromSymbol } from "../../../utils/formatters";

jest.mock("../../../utils/formatters", () => ({
  formatPrice: jest.fn((value) => {
    if (value === undefined || value === null) return "N/A";
    if (value < 0.01) {
      return value.toFixed(8);
    }
    if (value < 1) {
      return value.toFixed(4);
    }
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }),
  getCurrencyFromSymbol: jest.fn((symbol) => {
    if (symbol?.includes("USDC")) return "USDC";
    if (symbol?.includes("USDT")) return "USDT";
    if (symbol?.includes("BTC")) return "BTC";
    return "";
  }),
}));

describe("CardFooter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render last update label", () => {
    render(<CardFooter lastUpdate="2024-01-01 12:00:00 UTC" />);
    expect(screen.getByText("Last update:")).toBeInTheDocument();
  });

  it("should render last update value", () => {
    const lastUpdate = "2024-01-01 12:00:00 UTC";
    render(<CardFooter lastUpdate={lastUpdate} />);
    expect(screen.getByText(lastUpdate)).toBeInTheDocument();
  });

  it("should display formatted timestamp", () => {
    const timestamp = "2024-12-09 03:27:45 UTC";
    render(<CardFooter lastUpdate={timestamp} />);
    expect(screen.getByText(timestamp)).toBeInTheDocument();
  });

  it("should have correct structure", () => {
    const { container } = render(
      <CardFooter lastUpdate="2024-01-01 12:00:00 UTC" />
    );
    const footer = container.querySelector(".card-footer");
    expect(footer).toBeInTheDocument();

    const row = container.querySelector(".footer-row");
    expect(row).toBeInTheDocument();

    const label = container.querySelector(".footer-label");
    expect(label).toHaveTextContent("Last update:");

    const value = container.querySelector(".footer-value");
    expect(value).toHaveTextContent("2024-01-01 12:00:00 UTC");
  });

  it("should handle different timestamp formats", () => {
    const timestamps = [
      "2024-01-01 12:00:00 UTC",
      "2024-12-09 03:27:45 UTC",
      "N/A",
    ];

    timestamps.forEach((timestamp) => {
      const { unmount } = render(<CardFooter lastUpdate={timestamp} />);
      expect(screen.getByText(timestamp)).toBeInTheDocument();
      unmount();
    });
  });

  it("should display hourly average when provided", () => {
    (formatPrice as jest.Mock).mockReturnValue("3,399.80");
    (getCurrencyFromSymbol as jest.Mock).mockReturnValue("USDC");
    render(
      <CardFooter
        lastUpdate="2024-01-01 12:00:00 UTC"
        hourlyAverage={3399.8}
        symbol="ETH/USDC"
      />
    );
    expect(getCurrencyFromSymbol).toHaveBeenCalledWith("ETH/USDC");
    expect(screen.getByText("1h AVG 3,399.80 USDC")).toBeInTheDocument();
  });

  it("should not display hourly average when not provided", () => {
    render(<CardFooter lastUpdate="2024-01-01 12:00:00 UTC" />);
    expect(screen.queryByText(/1h AVG/)).not.toBeInTheDocument();
  });

  it("should not display hourly average when symbol is missing", () => {
    render(
      <CardFooter
        lastUpdate="2024-01-01 12:00:00 UTC"
        hourlyAverage={3399.8}
      />
    );
    expect(screen.queryByText(/1h AVG/)).not.toBeInTheDocument();
  });

  it("should not display hourly average when average is undefined", () => {
    render(
      <CardFooter
        lastUpdate="2024-01-01 12:00:00 UTC"
        symbol="ETH/USDC"
      />
    );
    expect(screen.queryByText(/1h AVG/)).not.toBeInTheDocument();
  });

  it("should format hourly average correctly", () => {
    (formatPrice as jest.Mock).mockReturnValue("3,399.80");
    (getCurrencyFromSymbol as jest.Mock).mockReturnValue("USDC");
    render(
      <CardFooter
        lastUpdate="2024-01-01 12:00:00 UTC"
        hourlyAverage={3399.8}
        symbol="ETH/USDC"
      />
    );
    expect(formatPrice).toHaveBeenCalledWith(3399.8);
    expect(getCurrencyFromSymbol).toHaveBeenCalledWith("ETH/USDC");
    expect(screen.getByText("1h AVG 3,399.80 USDC")).toBeInTheDocument();
  });
});

