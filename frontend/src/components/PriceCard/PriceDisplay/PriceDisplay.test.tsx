import React from "react";
import { render, screen } from "@testing-library/react";
import PriceDisplay from "./PriceDisplay";
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

describe("PriceDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render price label", () => {
    render(<PriceDisplay price={3400.5} trend={null} />);
    expect(screen.getByText("Current Price")).toBeInTheDocument();
  });

  it("should format and display price", () => {
    render(<PriceDisplay price={3400.5} trend={null} />);
    expect(formatPrice).toHaveBeenCalledWith(3400.5);
  });

  it("should apply price-up class when trend is 'up'", () => {
    const { container } = render(
      <PriceDisplay price={3400.5} trend="up" />
    );
    const priceValue = container.querySelector(".price-value");
    expect(priceValue).toHaveClass("price-up");
  });

  it("should apply price-down class when trend is 'down'", () => {
    const { container } = render(
      <PriceDisplay price={3400.5} trend="down" />
    );
    const priceValue = container.querySelector(".price-value");
    expect(priceValue).toHaveClass("price-down");
  });

  it("should not apply trend class when trend is null", () => {
    const { container } = render(
      <PriceDisplay price={3400.5} trend={null} />
    );
    const priceValue = container.querySelector(".price-value");
    expect(priceValue).not.toHaveClass("price-up");
    expect(priceValue).not.toHaveClass("price-down");
  });

  it("should handle undefined price", () => {
    render(<PriceDisplay price={undefined} trend={null} />);
    expect(formatPrice).toHaveBeenCalledWith(undefined);
  });

  it("should display formatted price value", () => {
    (formatPrice as jest.Mock).mockReturnValue("3,400.50");
    render(<PriceDisplay price={3400.5} trend={null} />);
    expect(screen.getByText("3,400.50")).toBeInTheDocument();
  });
});

