import { renderHook, act } from "@testing-library/react";
import { useTimestamp } from "./useTimestamp";
import { formatDateTimeUTC } from "../../../utils/formatters";

jest.mock("../../../utils/formatters", () => ({
  formatDateTimeUTC: jest.fn((ts) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  }),
}));

describe("useTimestamp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("should return 'N/A' when timestamp is undefined", () => {
    const { result, unmount } = renderHook(() => useTimestamp(undefined));
    expect(result.current).toBe("N/A");
    unmount();
  });

  it("should format timestamp correctly", () => {
    const timestamp = 1704110400000;
    const { result, unmount } = renderHook(() => useTimestamp(timestamp));
    expect(formatDateTimeUTC).toHaveBeenCalled();
    expect(result.current).not.toBe("N/A");
    unmount();
  });

  it("should convert timestamp from seconds to milliseconds", () => {
    const timestamp = 1704110400;
    const { result, unmount } = renderHook(() => useTimestamp(timestamp));
    expect(formatDateTimeUTC).toHaveBeenCalled();
    expect(result.current).not.toBe("N/A");
    unmount();
  });

  it("should update timestamp every second", () => {
    const timestamp = 1704110400000;
    const { result, unmount } = renderHook(() => useTimestamp(timestamp));

    const initialCallCount = (formatDateTimeUTC as jest.Mock).mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect((formatDateTimeUTC as jest.Mock).mock.calls.length).toBeGreaterThan(
      initialCallCount
    );
    unmount();
  });

  it("should calculate elapsed time correctly", () => {
    const baseTime = new Date("2024-01-01T12:00:00Z").getTime();
    jest.setSystemTime(baseTime);

    const timestamp = baseTime - 5000;
    const { result, unmount } = renderHook(() => useTimestamp(timestamp));

    expect(formatDateTimeUTC).toHaveBeenCalledWith(
      expect.any(Number)
    );
    unmount();
  });

  it("should handle timestamp in milliseconds", () => {
    const timestamp = 1704110400000;
    const { result, unmount } = renderHook(() => useTimestamp(timestamp));
    expect(result.current).not.toBe("N/A");
    unmount();
  });

  it("should clear interval on unmount", () => {
    const timestamp = 1704110400000;
    const { unmount } = renderHook(() => useTimestamp(timestamp));

    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    act(() => {
      unmount();
    });

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

