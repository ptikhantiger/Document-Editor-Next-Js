import { describe, expect, it } from "vitest";
import { relativeTime } from "./format";

describe("relativeTime", () => {
  it("reports minutes ago for recent timestamps", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(relativeTime(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("reports hours ago for older timestamps", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(relativeTime(twoHoursAgo)).toBe("2 hours ago");
  });

  it("falls back to 'just now' for the current instant", () => {
    expect(relativeTime(new Date())).toBe("just now");
  });
});
