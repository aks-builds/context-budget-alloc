import { describe, expect, it } from "vitest";
import { ContextBudget } from "../src/budget.js";

function makeBudget() {
  return new ContextBudget({
    totalTokens: 1000,
    zones: [
      { name: "system", targetPercent: 0.1 },
      { name: "tools", targetPercent: 0.2 },
    ],
  });
}

describe("ContextBudget", () => {
  it("records usage per zone", () => {
    const budget = makeBudget();
    budget.recordUsage("tools", 50);
    expect(budget.remaining("tools")).toBe(150);
  });

  it("throws for unknown zones", () => {
    const budget = makeBudget();
    expect(() => budget.recordUsage("nope", 1)).toThrow();
  });

  it("rejects duplicate zone names", () => {
    const budget = makeBudget();
    expect(() => budget.addZone({ name: "tools", targetPercent: 0.1 })).toThrow();
  });

  it("computes per-zone utilization", () => {
    const budget = makeBudget();
    budget.recordUsage("system", 50);
    expect(budget.utilization("system")).toBe(0.5);
  });

  it("computes overall utilization across zones", () => {
    const budget = makeBudget();
    budget.recordUsage("system", 50);
    budget.recordUsage("tools", 50);
    expect(budget.overallUtilization()).toBe(0.1);
  });
});
