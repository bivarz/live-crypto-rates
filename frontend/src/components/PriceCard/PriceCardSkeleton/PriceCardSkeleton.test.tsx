import React from "react";
import { render, screen } from "@testing-library/react";
import PriceCardSkeleton from "./PriceCardSkeleton";

describe("PriceCardSkeleton", () => {
  it("should render the skeleton component", () => {
    const { container } = render(<PriceCardSkeleton />);
    const skeleton = container.querySelector(".price-card-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("should render skeleton header with title", () => {
    const { container } = render(<PriceCardSkeleton />);
    const header = container.querySelector(".skeleton-header");
    const title = container.querySelector(".skeleton-title");

    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it("should render skeleton body with price row", () => {
    const { container } = render(<PriceCardSkeleton />);
    const body = container.querySelector(".skeleton-body");
    const priceRow = container.querySelector(".skeleton-price-row");

    expect(body).toBeInTheDocument();
    expect(priceRow).toBeInTheDocument();
  });

  it("should render skeleton price section with large and small lines", () => {
    const { container } = render(<PriceCardSkeleton />);
    const priceSection = container.querySelector(".skeleton-price");
    const largeLine = priceSection?.querySelector(".skeleton-line-large");
    const smallLine = priceSection?.querySelector(".skeleton-line-small");

    expect(priceSection).toBeInTheDocument();
    expect(largeLine).toBeInTheDocument();
    expect(smallLine).toBeInTheDocument();
  });

  it("should render skeleton average section with medium and small lines", () => {
    const { container } = render(<PriceCardSkeleton />);
    const averageSection = container.querySelector(".skeleton-average");
    const mediumLine = averageSection?.querySelector(".skeleton-line-medium");
    const smallLine = averageSection?.querySelector(".skeleton-line-small");

    expect(averageSection).toBeInTheDocument();
    expect(mediumLine).toBeInTheDocument();
    expect(smallLine).toBeInTheDocument();
  });

  it("should render skeleton chart with bars", () => {
    const { container } = render(<PriceCardSkeleton />);
    const chart = container.querySelector(".skeleton-chart");
    const chartBars = container.querySelector(".skeleton-chart-bars");

    expect(chart).toBeInTheDocument();
    expect(chartBars).toBeInTheDocument();
  });

  it("should render exactly 10 chart bars", () => {
    const { container } = render(<PriceCardSkeleton />);
    const chartBars = container.querySelectorAll(".skeleton-chart-bar");

    expect(chartBars).toHaveLength(10);
  });

  it("should render chart bars with correct structure", () => {
    const { container } = render(<PriceCardSkeleton />);
    const chartBars = container.querySelectorAll(".skeleton-chart-bar");

    chartBars.forEach((bar) => {
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveClass("skeleton-chart-bar");
    });
  });

  it("should render chart bars with inline styles for height and animation delay", () => {
    const { container } = render(<PriceCardSkeleton />);
    const chartBars = container.querySelectorAll(".skeleton-chart-bar");

    chartBars.forEach((bar, index) => {
      const element = bar as HTMLElement;
      expect(element.style.height).toMatch(/\d+%/);
      expect(element.style.animationDelay).toBe(`${index * 0.1}s`);
    });
  });

  it("should render skeleton footer with small line", () => {
    const { container } = render(<PriceCardSkeleton />);
    const footer = container.querySelector(".skeleton-footer");
    const smallLine = footer?.querySelector(".skeleton-line-small");

    expect(footer).toBeInTheDocument();
    expect(smallLine).toBeInTheDocument();
  });

  it("should have correct CSS classes structure", () => {
    const { container } = render(<PriceCardSkeleton />);

    expect(container.querySelector(".price-card-skeleton")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-header")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-body")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-footer")).toBeInTheDocument();
  });

  it("should render all skeleton line variants", () => {
    const { container } = render(<PriceCardSkeleton />);

    expect(container.querySelector(".skeleton-line-large")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-line-medium")).toBeInTheDocument();
    expect(container.querySelectorAll(".skeleton-line-small").length).toBeGreaterThan(0);
  });

  it("should have correct number of skeleton lines", () => {
    const { container } = render(<PriceCardSkeleton />);
    const allLines = container.querySelectorAll(".skeleton-line");

    expect(allLines.length).toBe(5);
  });

  it("should render chart bars with heights between 30% and 70%", () => {
    const { container } = render(<PriceCardSkeleton />);
    const chartBars = container.querySelectorAll(".skeleton-chart-bar");

    chartBars.forEach((bar) => {
      const element = bar as HTMLElement;
      const height = parseFloat(element.style.height);
      expect(height).toBeGreaterThanOrEqual(30);
      expect(height).toBeLessThanOrEqual(70);
    });
  });

  it("should have sequential animation delays for chart bars", () => {
    const { container } = render(<PriceCardSkeleton />);
    const chartBars = container.querySelectorAll(".skeleton-chart-bar");

    chartBars.forEach((bar, index) => {
      const element = bar as HTMLElement;
      expect(element.style.animationDelay).toBe(`${index * 0.1}s`);
    });
  });

  it("should be a functional component without props", () => {
    const { container } = render(<PriceCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should match the structure of PriceCard component", () => {
    const { container } = render(<PriceCardSkeleton />);

    expect(container.querySelector(".skeleton-header")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-body")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-footer")).toBeInTheDocument();
  });
});

