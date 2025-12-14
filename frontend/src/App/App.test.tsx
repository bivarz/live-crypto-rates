import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import Dashboard from "../components/Dashboard/Dashboard";

jest.mock("../components/Dashboard/Dashboard", () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

describe("App", () => {
  it("should render Dashboard component", () => {
    render(<App />);
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });

  it("should have App class", () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector(".App");
    expect(appDiv).toBeInTheDocument();
  });
});

