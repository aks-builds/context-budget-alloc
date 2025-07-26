import { describe, expect, it } from "vitest";
import { Zone } from "../src/zone.js";

describe("Zone", () => {
  it("computes cap tokens from targetPercent", () => {
    const zone = new Zone({ name: "history", targetPercent: 0.4 });
    expect(zone.capTokens(1000)).toBe(400);
  });

  it("rejects a missing targetPercent", () => {
    expect(() => new Zone({ name: "bad" })).toThrow();
  });

  it("tracks recorded usage", () => {
    const zone = new Zone({ name: "tools", targetPercent: 0.2 });
    zone.record(50);
    zone.record(25);
    expect(zone.used).toBe(75);
  });
});
