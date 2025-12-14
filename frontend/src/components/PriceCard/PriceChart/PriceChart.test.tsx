import React from "react";
import { render, screen } from "@testing-library/react";
import PriceChart from "./PriceChart";
import { formatPrice } from "../../../utils/formatters";

jest.mock("../../../utils/formatters", () => ({
  formatPrice: jest.fn((value) => {
    if (value === undefined || value === null) return "N/A";
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }),
}));

jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    Line: ({ stroke }: { stroke?: string }) => <div data-testid="line" data-stroke={stroke} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: ({ content, active, payload }: any) => {
      if (content && active && payload) {
        return React.cloneElement(content, { active, payload });
      }
      return <div data-testid="tooltip" />;
    },
  };
});

describe("PriceChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return null when data is empty", () => {
    const { container } = render(<PriceChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null when data is undefined", () => {
    const { container } = render(<PriceChart data={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render chart when data has entries", () => {
    const now = Date.now();
    const data = [
      { price: 3400, timestamp: now - 3000000 },
      { price: 3500, timestamp: now - 2000000 },
      { price: 3600, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should filter data to last hour only", () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const data = [
      { price: 3400, timestamp: oneHourAgo - 1000000 },
      { price: 3500, timestamp: now - 3000000 },
      { price: 3600, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should sort data by timestamp", () => {
    const now = Date.now();
    const data = [
      { price: 3600, timestamp: now - 1000000 },
      { price: 3400, timestamp: now - 3000000 },
      { price: 3500, timestamp: now - 2000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should convert timestamp from seconds to milliseconds", () => {
    const now = Math.floor(Date.now() / 1000);
    const data = [
      { price: 3400, timestamp: now - 3000 },
      { price: 3500, timestamp: now - 2000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle timestamp already in milliseconds", () => {
    const now = Date.now();
    const data = [
      { price: 3400, timestamp: now - 3000000 },
      { price: 3500, timestamp: now - 2000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should determine price trend correctly for upward trend", () => {
    const now = Date.now();
    const data = [
      { price: 3400, timestamp: now - 3000000 },
      { price: 3500, timestamp: now - 2000000 },
      { price: 3600, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should determine price trend correctly for downward trend", () => {
    const now = Date.now();
    const data = [
      { price: 3600, timestamp: now - 3000000 },
      { price: 3500, timestamp: now - 2000000 },
      { price: 3400, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle single data point", () => {
    const now = Date.now();
    const data = [{ price: 3400, timestamp: now - 1000000 }];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle data with same prices", () => {
    const now = Date.now();
    const data = [
      { price: 3400, timestamp: now - 3000000 },
      { price: 3400, timestamp: now - 2000000 },
      { price: 3400, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should use green color for upward trend", () => {
    const now = Date.now();
    const data = [
      { price: 3400, timestamp: now - 3000000 },
      { price: 3600, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    const line = screen.getByTestId("line");
    expect(line).toHaveAttribute("data-stroke", "#10b981");
  });

  it("should use red color for downward trend", () => {
    const now = Date.now();
    const data = [
      { price: 3600, timestamp: now - 3000000 },
      { price: 3400, timestamp: now - 1000000 },
    ];

    render(<PriceChart data={data} />);

    const line = screen.getByTestId("line");
    expect(line).toHaveAttribute("data-stroke", "#ef4444");
  });

  it("should render CustomTooltip when active", () => {
    const now = Date.now();
    const data = [
      { price: 3400, timestamp: now - 3000000 },
      { price: 3500, timestamp: now - 1000000 },
    ];

    (formatPrice as jest.Mock).mockReturnValue("3,400.00");

    render(<PriceChart data={data} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});

