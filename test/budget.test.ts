import { describe, expect, it } from "vitest";
import { ContextBudget, createBudget } from "../src/budget.js";

function makeBudget() {
  return createBudget({
    totalTokens: 1000,
    zones: [
      { name: "system", targetPercent: 0.1, lendable: false },
      { name: "tools", targetPercent: 0.2 },
      { name: "history", targetPercent: 0.3 },
    ],
  });
}

describe("ContextBudget", () => {
  it("records usage per zone", () => {
    const budget = makeBudget();
    budget.recordUsage("tools", 50);
    expect(budget.remaining("tools")).toBe(150);
  });

  it("estimates and records text usage", () => {
    const budget = makeBudget();
    const tokens = budget.recordText("history", "a".repeat(40));
    expect(tokens).toBe(10);
    expect(budget.remaining("history")).toBe(290);
  });

  it("throws for unknown zones", () => {
    const budget = makeBudget();
    expect(() => budget.recordUsage("nope", 1)).toThrow();
  });

  it("rejects duplicate zone names", () => {
    const budget = makeBudget();
    expect(() => budget.addZone({ name: "tools", targetPercent: 0.1 })).toThrow();
  });

  it("rejects a non-positive totalTokens", () => {
    expect(() => new ContextBudget({ totalTokens: 0, zones: [{ name: "a", targetPercent: 1 }] })).toThrow();
  });

  it("computes per-zone utilization", () => {
    const budget = makeBudget();
    budget.recordUsage("system", 50);
    expect(budget.utilization("system")).toBe(0.5);
  });

  it("reports 0 utilization for a zone with zero cap and no usage", () => {
    const budget = new ContextBudget({ totalTokens: 100, zones: [{ name: "a", hardCapTokens: 0 }] });
    expect(budget.utilization("a")).toBe(0);
  });

  it("computes overall utilization across zones", () => {
    const budget = makeBudget();
    budget.recordUsage("system", 50);
    budget.recordUsage("tools", 50);
    expect(budget.overallUtilization()).toBe(0.1);
  });

  it("rebalances overflowing zones by borrowing", () => {
    const budget = makeBudget();
    budget.recordUsage("tools", 250);
    const result = budget.rebalance();
    expect(result.actions.some((a) => a.zone === "tools" && a.type === "borrow")).toBe(true);
  });

  it("supports a custom rebalance strategy", () => {
    const budget = new ContextBudget(
      { totalTokens: 100, zones: [{ name: "a", targetPercent: 1 }] },
      () => ({ actions: [], resolved: true })
    );
    expect(budget.rebalance()).toEqual({ actions: [], resolved: true });
  });

  it("creates budgets via the createBudget() factory", () => {
    const budget = createBudget({ totalTokens: 10, zones: [{ name: "a", targetPercent: 1 }] });
    expect(budget).toBeInstanceOf(ContextBudget);
  });

  it("resets all zones", () => {
    const budget = makeBudget();
    budget.recordUsage("tools", 100);
    budget.reset();
    expect(budget.remaining("tools")).toBe(200);
  });

  it("rounds snapshot utilization to avoid floating point noise", () => {
    const budget = createBudget({ totalTokens: 3, zones: [{ name: "a", targetPercent: 1 }] });
    budget.recordUsage("a", 1);
    const snapshot = budget.snapshot();
    expect(snapshot.zones[0].utilization).toBe(0.3333);
  });
});
