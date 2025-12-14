import { renderHook } from "@testing-library/react";
import { useTimestamp } from "./useTimestamp";
import { formatDateTimeUTC } from "../../../utils/formatters";

jest.mock("../../../utils/formatters", () => ({
  formatDateTimeUTC: jest.fn((ts) => {
    if (!ts) return "N/A";
    const timestamp = ts < 10000000000 ? ts * 1000 : ts;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "N/A";

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
  });

  it("should return 'N/A' when timestamp is undefined", () => {
    const { result } = renderHook(() => useTimestamp(undefined));
    expect(result.current).toBe("N/A");
    expect(formatDateTimeUTC).not.toHaveBeenCalled();
  });

  it("should format timestamp correctly", () => {
    (formatDateTimeUTC as jest.Mock).mockReturnValue("2024-01-01 12:00:00 UTC");
    const timestamp = 1704110400000;
    const { result } = renderHook(() => useTimestamp(timestamp));
    expect(formatDateTimeUTC).toHaveBeenCalledWith(timestamp);
    expect(result.current).toBe("2024-01-01 12:00:00 UTC");
    expect(typeof result.current).toBe("string");
    expect(result.current).toContain("UTC");
  });

  it("should convert timestamp from seconds to milliseconds", () => {
    const timestamp = 1704110400;
    const { result } = renderHook(() => useTimestamp(timestamp));
    expect(formatDateTimeUTC).toHaveBeenCalledWith(timestamp);
    expect(result.current).not.toBe("N/A");
  });

  it("should return the same value when timestamp doesn't change", () => {
    (formatDateTimeUTC as jest.Mock).mockReturnValue("2024-01-01 12:00:00 UTC");
    const timestamp = 1704110400000;
    const { result, rerender } = renderHook(
      ({ ts }) => useTimestamp(ts),
      { initialProps: { ts: timestamp } }
    );

    const firstResult = result.current;
    jest.clearAllMocks();

    rerender({ ts: timestamp });

    expect(result.current).toBe(firstResult);
  });

  it("should update when timestamp changes", () => {
    const timestamp1 = 1704110400000;
    const timestamp2 = 1704110500000;
    const { rerender } = renderHook(
      ({ ts }) => useTimestamp(ts),
      { initialProps: { ts: timestamp1 } }
    );

    expect(formatDateTimeUTC).toHaveBeenCalledWith(timestamp1);

    rerender({ ts: timestamp2 });

    expect(formatDateTimeUTC).toHaveBeenCalledWith(timestamp2);
    expect(formatDateTimeUTC).toHaveBeenCalledTimes(2);
  });

  it("should handle timestamp in milliseconds", () => {
    const timestamp = 1704110400000;
    const { result } = renderHook(() => useTimestamp(timestamp));
    expect(result.current).not.toBe("N/A");
    expect(formatDateTimeUTC).toHaveBeenCalledWith(timestamp);
  });
});

