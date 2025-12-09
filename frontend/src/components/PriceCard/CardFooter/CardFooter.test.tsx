import React from "react";
import { render, screen } from "@testing-library/react";
import CardFooter from "./CardFooter";

describe("CardFooter", () => {
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
});

