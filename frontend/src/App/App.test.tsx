import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("../components/Dashboard/Dashboard", () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

describe("App", () => {
  it("should render the App component", () => {
    const { container } = render(<App />);
    expect(container.querySelector(".App")).toBeInTheDocument();
  });

  it("should render Dashboard component", () => {
    render(<App />);
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });

  it("should have correct structure", () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector(".App");
    expect(appDiv).toBeInTheDocument();
    expect(appDiv?.querySelector('[data-testid="dashboard"]')).toBeInTheDocument();
  });
});

