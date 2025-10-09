import { describe, expect, it } from "vitest";
import { parseBudgetConfig } from "../src/config.js";

describe("parseBudgetConfig", () => {
  it("accepts a well-formed config", () => {
    const config = parseBudgetConfig({ totalTokens: 100, zones: [{ name: "system", targetPercent: 0.1 }] });
    expect(config.totalTokens).toBe(100);
  });

  it("rejects a missing totalTokens", () => {
    expect(() => parseBudgetConfig({ zones: [] })).toThrow();
  });

  it("rejects an empty zones array", () => {
    expect(() => parseBudgetConfig({ totalTokens: 100, zones: [] })).toThrow();
  });

  it("rejects a zone without a name", () => {
    expect(() => parseBudgetConfig({ totalTokens: 100, zones: [{ targetPercent: 0.1 }] })).toThrow();
  });
});
