import { describe, expect, it } from "vitest";
import { Zone } from "../src/zone.js";
import { rebalance } from "../src/rebalance.js";

describe("rebalance", () => {
  it("does nothing when no zone overflows", () => {
    const zones = [new Zone({ name: "a", targetPercent: 0.5 }), new Zone({ name: "b", targetPercent: 0.5 })];
    const result = rebalance(zones, 100);
    expect(result.actions).toEqual([]);
    expect(result.resolved).toBe(true);
  });

  it("flags an overflowing zone for compression", () => {
    const zone = new Zone({ name: "a", targetPercent: 0.2 });
    zone.record(30);
    const result = rebalance([zone], 100);
    expect(result.resolved).toBe(false);
    expect(result.actions).toEqual([{ type: "compress", zone: "a", amount: 10 }]);
  });
});
