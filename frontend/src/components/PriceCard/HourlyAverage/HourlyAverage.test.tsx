import React from "react";
import { render, screen } from "@testing-library/react";
import HourlyAverage from "./HourlyAverage";
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

describe("HourlyAverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render average label", () => {
    render(<HourlyAverage average={3399.8} count={1043} />);
    expect(screen.getByText("Hourly Average")).toBeInTheDocument();
  });

  it("should format and display average", () => {
    render(<HourlyAverage average={3399.8} count={1043} />);
    expect(formatPrice).toHaveBeenCalledWith(3399.8);
  });

  it("should display data points count when count is provided", () => {
    render(<HourlyAverage average={3399.8} count={1043} />);
    expect(screen.getByText("Based on 1043 data points")).toBeInTheDocument();
  });

  it("should not display data points count when count is undefined", () => {
    render(<HourlyAverage average={3399.8} />);
    expect(
      screen.queryByText(/Based on \d+ data points/)
    ).not.toBeInTheDocument();
  });

  it("should handle undefined average", () => {
    render(<HourlyAverage average={undefined} count={1043} />);
    expect(formatPrice).toHaveBeenCalledWith(undefined);
  });

  it("should display formatted average value", () => {
    (formatPrice as jest.Mock).mockReturnValue("3,399.80");
    render(<HourlyAverage average={3399.8} count={1043} />);
    expect(screen.getByText("3,399.80")).toBeInTheDocument();
  });

  it("should handle zero count", () => {
    render(<HourlyAverage average={3399.8} count={0} />);
    expect(screen.getByText("Based on 0 data points")).toBeInTheDocument();
  });

  it("should handle large count values", () => {
    render(<HourlyAverage average={3399.8} count={10000} />);
    expect(screen.getByText("Based on 10000 data points")).toBeInTheDocument();
  });
});

