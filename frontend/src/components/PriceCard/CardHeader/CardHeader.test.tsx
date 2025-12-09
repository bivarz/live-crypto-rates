import React from "react";
import { render, screen } from "@testing-library/react";
import CardHeader from "./CardHeader";

describe("CardHeader", () => {
  it("should render symbol", () => {
    render(<CardHeader symbol="ETH/USDC" />);
    expect(screen.getByText("ETH/USDC")).toBeInTheDocument();
  });

  it("should render symbol as h2 element", () => {
    const { container } = render(<CardHeader symbol="ETH/USDC" />);
    const heading = container.querySelector("h2.symbol");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("ETH/USDC");
  });

  it("should render different symbols correctly", () => {
    const { rerender } = render(<CardHeader symbol="ETH/USDC" />);
    expect(screen.getByText("ETH/USDC")).toBeInTheDocument();

    rerender(<CardHeader symbol="ETH/USDT" />);
    expect(screen.getByText("ETH/USDT")).toBeInTheDocument();

    rerender(<CardHeader symbol="ETH/BTC" />);
    expect(screen.getByText("ETH/BTC")).toBeInTheDocument();
  });

  it("should have correct structure", () => {
    const { container } = render(<CardHeader symbol="ETH/USDC" />);
    const header = container.querySelector(".card-header");
    expect(header).toBeInTheDocument();
    expect(header?.querySelector("h2.symbol")).toBeInTheDocument();
  });
});

