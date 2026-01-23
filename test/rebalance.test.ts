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

  it("flags an overflowing zone for compression when nothing can lend", () => {
    const zone = new Zone({ name: "a", targetPercent: 0.2 });
    zone.record(30);
    const result = rebalance([zone], 100);
    expect(result.resolved).toBe(false);
    expect(result.actions).toEqual([{ type: "compress", zone: "a", amount: 10 }]);
  });

  it("borrows spare capacity from an underused zone", () => {
    const a = new Zone({ name: "a", targetPercent: 0.2 });
    const b = new Zone({ name: "b", targetPercent: 0.8 });
    a.record(30);
    b.record(10);

    const result = rebalance([a, b], 100);
    expect(result.resolved).toBe(true);
    expect(result.actions).toEqual([{ type: "borrow", zone: "a", amount: 10, from: "b" }]);
  });

  it("skips zones marked non-lendable", () => {
    const a = new Zone({ name: "a", targetPercent: 0.2 });
    const system = new Zone({ name: "system", targetPercent: 0.8, lendable: false });
    a.record(30);

    const result = rebalance([a, system], 100);
    expect(result.resolved).toBe(false);
    expect(result.actions).toEqual([{ type: "compress", zone: "a", amount: 10 }]);
  });

  it("prefers borrowing from lower priority zones first", () => {
    const a = new Zone({ name: "a", targetPercent: 0.2, priority: 5 });
    const low = new Zone({ name: "low", targetPercent: 0.4, priority: 0 });
    const high = new Zone({ name: "high", targetPercent: 0.4, priority: 10 });
    a.record(30);

    const result = rebalance([a, low, high], 100);
    expect(result.actions[0]).toMatchObject({ from: "low" });
  });

  it("does not re-borrow on a second call with no new usage", () => {
    const a = new Zone({ name: "a", targetPercent: 0.2 });
    const b = new Zone({ name: "b", targetPercent: 0.8 });
    a.record(30);
    b.record(10);

    rebalance([a, b], 100);
    const second = rebalance([a, b], 100);
    expect(second.actions).toEqual([]);
  });
});
