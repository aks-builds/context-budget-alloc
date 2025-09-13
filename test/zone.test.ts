import { describe, expect, it } from "vitest";
import { Zone } from "../src/zone.js";

describe("Zone", () => {
  it("computes cap tokens from targetPercent", () => {
    const zone = new Zone({ name: "history", targetPercent: 0.4 });
    expect(zone.capTokens(1000)).toBe(400);
  });

  it("computes cap tokens from hardCapTokens regardless of total", () => {
    const zone = new Zone({ name: "system", hardCapTokens: 500 });
    expect(zone.capTokens(1000)).toBe(500);
    expect(zone.capTokens(10)).toBe(500);
  });

  it("rejects zones with both targetPercent and hardCapTokens", () => {
    expect(() => new Zone({ name: "bad", targetPercent: 0.1, hardCapTokens: 10 })).toThrow();
  });

  it("rejects zones with neither cap kind set", () => {
    expect(() => new Zone({ name: "bad" })).toThrow();
  });

  it("tracks recorded usage", () => {
    const zone = new Zone({ name: "tools", targetPercent: 0.2 });
    zone.record(50);
    zone.record(25);
    expect(zone.used).toBe(75);
  });

  it("computes remaining capacity including borrowed tokens", () => {
    const zone = new Zone({ name: "buffer", targetPercent: 0.1 });
    zone.record(5);
    expect(zone.remaining(100)).toBe(5);
    zone.borrow(10);
    expect(zone.remaining(100)).toBe(15);
  });

  it("defaults lendable to true", () => {
    const zone = new Zone({ name: "history", targetPercent: 0.4 });
    expect(zone.lendable).toBe(true);
  });

  it("respects lendable: false", () => {
    const zone = new Zone({ name: "system", targetPercent: 0.1, lendable: false });
    expect(zone.lendable).toBe(false);
  });
});
